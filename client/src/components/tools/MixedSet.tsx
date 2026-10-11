import { useEffect, useState } from "react";
import { fetchLesson, openLesson } from "../../api";
import { MIXED_PROBLEMS, SET_FORMATS, stripComments, type MixedProblem, type SetFormat } from "../../mixedSetData";
import { recordMixedAttempts } from "../../practiceHistory";
import { TECHNIQUES, type Technique } from "../../patternDrillData";
import { shuffle } from "../../random";
import type { ConceptDetail } from "../../types";
import { LanguageRunner } from "../LanguageRunner";

// A timed set of graded problems picked at random, with the lesson's title, explanation,
// visualizer and hints all hidden, so you have to work out the technique yourself the
// way an interview asks you to. The code runs against the lesson's own tests, and a pass
// counts toward that lesson's progress like any other.

const RECENT_KEY = "mixed-set:recent";
const RECENT_LIMIT = 12;

type Guess = Technique | "unsure";

interface Slot {
  problem: MixedProblem;
  lesson: ConceptDetail;
  guess: Guess | null;
  solvedAt: number | null;
  revealed: boolean;
}

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(ids: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify([...ids, ...loadRecent().filter((id) => !ids.includes(id))].slice(0, RECENT_LIMIT)));
  } catch {
    // Blocked storage only means repeats are a bit more likely.
  }
}

// One problem per slot, never the same twice in a set, preferring problems you haven't
// drawn in your last few sets.
function pickProblems(format: SetFormat): MixedProblem[] {
  const recent = new Set(loadRecent());
  const chosen: MixedProblem[] = [];
  for (const allowed of format.difficulties) {
    const candidates = shuffle(MIXED_PROBLEMS.filter((p) => allowed.includes(p.difficulty) && !chosen.includes(p)));
    const fresh = candidates.filter((p) => !recent.has(p.lessonId));
    chosen.push((fresh.length > 0 ? fresh : candidates)[0]);
  }
  return chosen;
}

function blindLesson(problem: MixedProblem, lesson: ConceptDetail): ConceptDetail {
  const starterCode = Object.fromEntries(
    Object.entries(lesson.starterCode).map(([lang, code]) => [
      lang,
      problem.starter?.[lang as "csharp" | "python"] ?? stripComments(code, lang),
    ]),
  );
  return { ...lesson, starterCode, completed: false, attempts: 0 };
}

function clock(seconds: number) {
  const sign = seconds < 0 ? "-" : "";
  const abs = Math.abs(seconds);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

function goodCall(problem: MixedProblem, guess: Guess | null) {
  return guess !== null && guess !== "unsure" && (guess === problem.technique || (problem.alsoAccept ?? []).includes(guess));
}

export function MixedSet() {
  const [format, setFormat] = useState<SetFormat>(SET_FORMATS[0]);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [draftGuess, setDraftGuess] = useState<Guess | "">("");

  const running = slots !== null && !finished;
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  async function start() {
    setLoading(true);
    setLoadError(null);
    try {
      const problems = pickProblems(format);
      const lessons = await Promise.all(problems.map((p) => fetchLesson(p.lessonId)));
      saveRecent(problems.map((p) => p.lessonId));
      setSlots(
        problems.map((problem, i) => ({
          problem,
          lesson: blindLesson(problem, lessons[i]),
          guess: null,
          solvedAt: null,
          revealed: false,
        })),
      );
      setIndex(0);
      setElapsed(0);
      setFinished(false);
      setDraftGuess("");
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Couldn't load the problems.");
    } finally {
      setLoading(false);
    }
  }

  function updateSlot(i: number, patch: Partial<Slot>) {
    setSlots((s) => s && s.map((slot, j) => (j === i ? { ...slot, ...patch } : slot)));
  }

  if (slots === null) {
    return (
      <div className="tool-widget">
        <h3>Pick a format</h3>
        <div className="sql-presets">
          {SET_FORMATS.map((f) => (
            <button key={f.id} className={f.id === format.id ? "active" : ""} onClick={() => setFormat(f)}>
              {f.label} ({f.minutes} min)
            </button>
          ))}
        </div>
        <p className="gate-note">{format.blurb}</p>
        <p className="gate-note">
          Problems come from {MIXED_PROBLEMS.length} graded lessons. You'll see only the problem and its examples. Say which
          technique you'd use before the editor opens, then solve it. The clock keeps going past zero so you can finish, but
          the summary shows how far over you went.
        </p>
        <button onClick={start} disabled={loading}>
          {loading ? "Picking problems…" : "Start the set"}
        </button>
        {loadError && <p className="constraint-fail">{loadError}</p>}
      </div>
    );
  }

  const remaining = format.minutes * 60 - elapsed;

  if (finished) {
    const solved = slots.filter((s) => s.solvedAt !== null).length;
    const calls = slots.filter((s) => goodCall(s.problem, s.guess)).length;
    return (
      <div className="tool-widget">
        <h3>How it went</h3>
        <p className="drill-statement">
          Solved {solved} of {slots.length}, named the right technique for {calls} of {slots.length}, in {clock(elapsed)} of{" "}
          {format.minutes}:00{remaining < 0 ? ` (${clock(-remaining)} over)` : ""}.
        </p>
        <div className="mixed-summary">
          {slots.map((s, i) => (
            <div key={s.problem.lessonId} className="drill-feedback">
              <p>
                <strong>
                  Problem {i + 1}: {s.lesson.title}
                </strong>{" "}
                <span className="mixed-difficulty">{s.problem.difficulty}</span>
              </p>
              <p>
                {s.solvedAt !== null ? `Solved at ${clock(s.solvedAt)}. ` : "Not solved. "}
                {s.guess === "unsure" || s.guess === null ? (
                  <>You weren't sure of the technique; the lesson uses {s.problem.technique}.</>
                ) : (
                  <>
                    You called it <strong>{s.guess}</strong>
                    {goodCall(s.problem, s.guess) ? ", which works." : `; the lesson uses ${s.problem.technique}.`}
                  </>
                )}
              </p>
              <button className="link-button" onClick={() => openLesson(s.problem.lessonId)}>
                Open the full lesson
              </button>
            </div>
          ))}
        </div>
        <div className="darr-actions">
          <button onClick={start}>Another {format.label.toLowerCase()}</button>
          <button onClick={() => setSlots(null)}>Change format</button>
        </div>
      </div>
    );
  }

  // Problems you never got to (ending early) aren't recorded: there was no attempt.
  function finish() {
    if (!slots) return;
    recordMixedAttempts(
      slots
        .filter((s) => s.guess !== null)
        .map((s) => ({
          at: new Date().toISOString(),
          lessonId: s.problem.lessonId,
          technique: s.problem.technique,
          solved: s.solvedAt !== null,
          goodCall: goodCall(s.problem, s.guess),
        })),
    );
    setFinished(true);
  }

  const slot = slots[index];
  const last = index === slots.length - 1;
  const examples = slot.lesson.testCases.slice(0, 2);

  function commitGuess() {
    if (draftGuess === "") return;
    updateSlot(index, { guess: draftGuess });
  }

  function advance() {
    setDraftGuess("");
    if (last) finish();
    else setIndex(index + 1);
  }

  return (
    <div className="tool-widget">
      <div className="interview-timer-row">
        <span className={`interview-timer ${remaining < 0 ? "over" : ""}`}>{clock(remaining)}</span>
        <span className="gate-note mixed-meta">
          Problem {index + 1} of {slots.length} · <span className="mixed-difficulty">{slot.problem.difficulty}</span>
        </span>
        <button onClick={finish}>End the set</button>
      </div>

      <p className="drill-statement">{slot.problem.statement}</p>
      <div className="mixed-examples">
        {examples.map((t, i) => (
          <code key={i} className="sql-snippet">
            {t.inputDisplay} → {t.expectedJson}
          </code>
        ))}
      </div>

      {slot.guess === null ? (
        <div className="drill-feedback">
          <p>Before you code, say which technique you'd use. In an interview this is the part you say out loud.</p>
          <div className="complexity-selects">
            <label>
              Technique
              <select value={draftGuess} onChange={(e) => setDraftGuess(e.target.value as Guess | "")}>
                <option value="">Choose…</option>
                {TECHNIQUES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                <option value="unsure">Not sure yet</option>
              </select>
            </label>
            <button onClick={commitGuess} disabled={draftGuess === ""}>
              Lock it in and start coding
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="gate-note">
            You called it <strong>{slot.guess === "unsure" ? "not sure yet" : slot.guess}</strong>. The examples above are
            the first of {slot.lesson.testCases.length} tests.
          </p>
          <LanguageRunner
            key={slot.problem.lessonId}
            lesson={slot.lesson}
            hideReference
            fixedMode="timed"
            onPassed={() => slot.solvedAt === null && updateSlot(index, { solvedAt: elapsed, revealed: true })}
          />

          {slot.revealed ? (
            <div className="drill-feedback">
              <p>
                {slot.solvedAt !== null ? "All tests pass. " : ""}This was <strong>{slot.lesson.title}</strong>. The lesson's
                technique is <strong>{slot.problem.technique}</strong>
                {slot.problem.alsoAccept ? ` (${slot.problem.alsoAccept.join(" or ")} also works)` : ""}.
                {goodCall(slot.problem, slot.guess) ? " Your call was right." : " Your call didn't match."}
              </p>
              <button onClick={advance}>{last ? "See how it went" : "Next problem"}</button>
            </div>
          ) : (
            <div className="darr-actions">
              <button onClick={() => updateSlot(index, { revealed: true })}>Give up and reveal</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
