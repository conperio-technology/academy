import { useEffect, useMemo, useState } from "react";
import { fetchLesson, fetchLessons, openLesson, recordReveal } from "../../api";
import {
  BUILDING_BLOCKS,
  FLUENT_DAYS,
  blockStats,
  isCleanRep,
  isUnlocked,
  pickReps,
  planSteps,
  type BuildingBlock,
} from "../../buildingBlocksData";
import { loadBlockReps, recordBlockRep, type BlockRep } from "../../practiceHistory";
import type { ConceptDetail } from "../../types";
import { LanguageRunner } from "../LanguageRunner";

// Today's reps: a short session of building blocks (buildingBlocksData.ts), each written from a
// blank editor against the lesson's own tests, with a stopwatch. A rep is clean when it passes on
// the first run within the block's target time without opening the reference; clean reps on
// FLUENT_DAYS different days make a block fluent. Passes also count as the lesson's own progress
// (bare starter, so independent unless the reference was opened).

const SESSION_SIZES = [3, 5];

interface Slot {
  block: BuildingBlock;
  lesson: ConceptDetail;
  failedRuns: number;
  seconds: number | null; // set when the rep ends
  rep: BlockRep | null;
  language: string; // the language of the latest run
  plan: string[];
  sawReference: boolean;
  showReference: boolean;
}

function clock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function blockName(id: string) {
  return BUILDING_BLOCKS.find((b) => b.id === id)?.name ?? id;
}

// The task without the "how": an exercise's first explanation paragraph states it.
function taskText(lesson: ConceptDetail) {
  return lesson.explanation.split("\n\n")[0];
}

export function BlockReps() {
  const [reps, setReps] = useState<BlockRep[]>(loadBlockReps);
  const stats = useMemo(() => blockStats(reps), [reps]);
  const [size, setSize] = useState(SESSION_SIZES[0]);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  // Lesson titles for the glue problems, which are ordinary lessons elsewhere in the sidebar.
  const [titles, setTitles] = useState<Record<string, string>>({});
  useEffect(() => {
    fetchLessons()
      .then((items) => setTitles(Object.fromEntries(items.map((i) => [i.id, i.title]))))
      .catch(() => {
        // No titles: the glue list is left out.
      });
  }, []);

  const slot = slots && !finished ? slots[index] : null;
  const running = slot !== null && slot.seconds === null;
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running, index]);

  async function start(blocks: BuildingBlock[]) {
    setLoading(true);
    setLoadError(null);
    try {
      const lessons = await Promise.all(blocks.map((b) => fetchLesson(b.id)));
      setSlots(
        blocks.map((block, i) => ({
          block,
          lesson: lessons[i],
          failedRuns: 0,
          seconds: null,
          rep: null,
          language: "csharp",
          plan: [],
          sawReference: false,
          showReference: false,
        })),
      );
      setIndex(0);
      setElapsed(0);
      setFinished(false);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Couldn't load the blocks.");
    } finally {
      setLoading(false);
    }
  }

  function updateSlot(i: number, patch: Partial<Slot>) {
    setSlots((s) => s && s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  }

  function endRep(passed: boolean, language: string) {
    if (!slot || slot.seconds !== null) return;
    const rep: BlockRep = {
      at: new Date().toISOString(),
      blockId: slot.block.id,
      language,
      seconds: elapsed,
      failedRuns: slot.failedRuns,
      passed,
      sawReference: slot.sawReference,
      ...(slot.plan.length > 0 && { plan: slot.plan }),
    };
    recordBlockRep(rep);
    setReps(loadBlockReps());
    updateSlot(index, { seconds: elapsed, rep });
  }

  function handleRan(passed: boolean, language: string) {
    if (!slot || slot.seconds !== null) return;
    if (passed) endRep(true, language);
    else updateSlot(index, { failedRuns: slot.failedRuns + 1, language });
  }

  function revealReference() {
    if (!slot) return;
    if (slot.seconds === null && !slot.sawReference) {
      updateSlot(index, { sawReference: true, showReference: true });
      recordReveal(slot.lesson.id, slot.language).catch(() => {
        // Not recorded: a later pass may then count as independent. Nothing else depends on it.
      });
    } else updateSlot(index, { showReference: !slot.showReference });
  }

  function next() {
    if (!slots) return;
    if (index === slots.length - 1) setFinished(true);
    else {
      setIndex(index + 1);
      setElapsed(0);
    }
  }

  // ---- Overview: pick a session, see every block's state ----
  if (slots === null) {
    const fluent = BUILDING_BLOCKS.filter((b) => stats[b.id].fluent);
    const tier = (t: 1 | 2) => BUILDING_BLOCKS.filter((b) => b.tier === t);
    const glueReady = fluent.filter((b) => b.glue.some((id) => titles[id]));
    const planned = pickReps(stats, size);
    return (
      <div className="tool-widget">
        <h3>Today's reps</h3>
        <p className="drill-statement">
          {fluent.length} of {BUILDING_BLOCKS.length} blocks fluent: {tier(1).filter((b) => stats[b.id].fluent).length} of{" "}
          {tier(1).length} simple constructs, {tier(2).filter((b) => stats[b.id].fluent).length} of {tier(2).length} algorithm
          blocks.
        </p>
        <div className="sql-presets" role="radiogroup" aria-label="Session size">
          {SESSION_SIZES.map((n) => (
            <button key={n} role="radio" aria-checked={n === size} className={n === size ? "active" : ""} onClick={() => setSize(n)}>
              {n} reps
            </button>
          ))}
        </div>
        <p className="gate-note">Next up: {planned.map((b) => b.name).join(", ")}.</p>
        <button onClick={() => start(planned)} disabled={loading}>
          {loading ? "Loading…" : "Start today's reps"}
        </button>
        {loadError && <p className="constraint-fail">{loadError}</p>}

        <div className="cg-table-wrap">
          <table className="bigo-table block-table">
            <thead>
              <tr>
                <th>Block</th>
                <th>Reps</th>
                <th>Clean days</th>
                <th>Best / target</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {([1, 2] as const).map((t) => (
                <BlockRows key={t} tier={t} stats={stats} onDrill={(b) => start([b])} disabled={loading} />
              ))}
            </tbody>
          </table>
        </div>

        {glueReady.length > 0 && (
          <div className="drill-feedback">
            <p>
              <strong>Ready for glue problems.</strong> These lessons combine a block you're fluent in with another idea:
            </p>
            <ul>
              {glueReady.map((b) => (
                <li key={b.id}>
                  {b.name}:{" "}
                  {b.glue.filter((id) => titles[id]).map((id, i) => (
                    <span key={id}>
                      {i > 0 && ", "}
                      <button className="link-button" onClick={() => openLesson(id)}>
                        {titles[id]}
                      </button>
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // ---- Summary ----
  if (finished || !slot) {
    const done = slots.filter((s) => s.rep);
    const clean = done.filter((s) => s.rep && isCleanRep(s.rep, s.block)).length;
    return (
      <div className="tool-widget">
        <h3>Session done</h3>
        <p className="drill-statement">
          {clean} of {slots.length} reps clean.
        </p>
        <ul>
          {slots.map((s) => (
            <li key={s.block.id}>
              <strong>{s.block.name}</strong>: <RepResult slot={s} />
            </li>
          ))}
        </ul>
        <div className="darr-actions">
          <button onClick={() => start(pickReps(stats, size))}>Another session</button>
          <button onClick={() => setSlots(null)}>Back to the blocks</button>
        </div>
      </div>
    );
  }

  // ---- One rep ----
  const examples = slot.lesson.testCases.slice(0, 2);
  const language = slot.rep?.language ?? slot.language;
  const plan = planSteps(slot.lesson.starterCode[language] ?? slot.lesson.starterCode["csharp"] ?? "");
  const reference = slot.lesson.referenceSolutions[language];
  const ended = slot.seconds !== null;
  const shown = ended ? slot.seconds! : elapsed;
  return (
    <div className="tool-widget">
      <div className="interview-timer-row">
        <span className={`interview-timer ${shown > slot.block.targetSeconds ? "over" : ""}`}>{clock(shown)}</span>
        <span className="gate-note mixed-meta">
          Rep {index + 1} of {slots.length} · target {clock(slot.block.targetSeconds)}
          {slot.failedRuns > 0 && ` · ${slot.failedRuns} failed run${slot.failedRuns === 1 ? "" : "s"}`}
        </span>
        <button onClick={() => setFinished(true)}>End the session</button>
      </div>

      <h3>{slot.lesson.title}</h3>
      <p className="drill-statement">{taskText(slot.lesson)}</p>
      <div className="mixed-examples">
        {examples.map((t, i) => (
          <code key={i} className="sql-snippet">
            {t.inputDisplay} → {t.expectedJson}
          </code>
        ))}
      </div>

      <LanguageRunner
        key={`${slot.block.id}-${index}`}
        lesson={slot.lesson}
        hideReference
        fixedMode="bare"
        onPassed={() => {}}
        onRan={handleRan}
        onPlan={(plan) => updateSlot(index, { plan })}
      />

      {ended ? (
        <div className="drill-feedback">
          <p>
            <RepResult slot={slot} />
          </p>
          {plan.length > 0 && slot.plan.length === 0 && (
            <>
              <p>The block's plan, to compare with how you went about it:</p>
              <ol>
                {plan.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </>
          )}
          {slot.lesson.gotchas.length > 0 && (
            <p className="gate-note">Watch out for: {slot.lesson.gotchas.join(" ")}</p>
          )}
          <div className="darr-actions">
            <button onClick={next}>{index === slots.length - 1 ? "See the session" : "Next rep"}</button>
            {reference && (
              <button onClick={revealReference}>{slot.showReference ? "Hide the reference" : "Compare with the reference"}</button>
            )}
          </div>
        </div>
      ) : (
        <div className="darr-actions">
          <button onClick={() => endRep(false, language)}>Give up on this rep</button>
          {reference && !slot.sawReference && <button onClick={revealReference}>Stuck? Show the reference</button>}
        </div>
      )}
      {slot.showReference && reference && <pre className="sql-snippet block-reference">{reference}</pre>}
    </div>
  );
}

function RepResult({ slot }: { slot: Slot }) {
  const rep = slot.rep;
  if (!rep) return <>not attempted.</>;
  if (!rep.passed) return <>gave up after {clock(rep.seconds)}. Not counted toward fluency.</>;
  const time = `${clock(rep.seconds)} (target ${clock(slot.block.targetSeconds)})`;
  if (isCleanRep(rep, slot.block)) return <>clean rep in {time}.</>;
  const why = [
    rep.failedRuns > 0 && `${rep.failedRuns} failed run${rep.failedRuns === 1 ? "" : "s"} first`,
    rep.seconds > slot.block.targetSeconds && "over the target time",
    rep.sawReference && "the reference was open",
  ].filter(Boolean);
  return (
    <>
      passed in {time}, not clean: {why.join(", ")}.
    </>
  );
}

function BlockRows({
  tier,
  stats,
  onDrill,
  disabled,
}: {
  tier: 1 | 2;
  stats: ReturnType<typeof blockStats>;
  onDrill: (b: BuildingBlock) => void;
  disabled: boolean;
}) {
  return (
    <>
      <tr>
        <td colSpan={5}>
          <strong>{tier === 1 ? "Tier 1: simple constructs" : "Tier 2: algorithm blocks"}</strong>
        </td>
      </tr>
      {BUILDING_BLOCKS.filter((b) => b.tier === tier).map((b) => {
        const s = stats[b.id];
        const locked = !isUnlocked(b, stats);
        return (
          <tr key={b.id}>
            <td>
              <button className="link-button" onClick={() => openLesson(b.id)}>
                {b.name}
              </button>
              {locked && (
                <span className="gate-note block-locked"> after {b.uses.filter((u) => !stats[u]?.fluent).map(blockName).join(", ")}</span>
              )}
            </td>
            <td>{s.reps}</td>
            <td>{s.fluent ? "fluent" : `${s.cleanDays}/${FLUENT_DAYS}`}</td>
            <td>
              {s.bestSeconds !== null ? `${clock(s.bestSeconds)} / ` : ""}
              {clock(b.targetSeconds)}
            </td>
            <td>
              <button onClick={() => onDrill(b)} disabled={disabled}>
                Rep
              </button>
            </td>
          </tr>
        );
      })}
    </>
  );
}
