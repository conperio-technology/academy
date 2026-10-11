import { useEffect, useState } from "react";
import { DESIGN_INTERVIEWS } from "../../systemDesignInterviews";
import type { DesignId, DesignStage, Diagram } from "../../systemDesignInterviews";

// A guided design interview (system design, or object-oriented design from oodInterviews.ts):
// the prompt, then one stage at a time in the usual 45-minute order. The learner writes their own answer first, then reveals the model answer
// and ticks off which "strong answer" points they covered. Notes and ticks are kept per
// design in this browser (localStorage) because they're practice scratch, not progress;
// everything still works if storage is blocked.

interface Saved {
  design: DesignId; // which design this state belongs to, so a save never lands under the wrong key
  step: number; // 0..stages.length-1 are stages; stages.length is the summary
  notes: Record<string, string>;
  ticks: Record<string, boolean[]>;
  revealed: Record<string, boolean>;
}

function storageKey(design: DesignId) {
  return `sd-interview:${design}`;
}

function emptyState(design: DesignId): Saved {
  return { design, step: 0, notes: {}, ticks: {}, revealed: {} };
}

function load(design: DesignId): Saved {
  try {
    const raw = localStorage.getItem(storageKey(design));
    if (!raw) return emptyState(design);
    const parsed = JSON.parse(raw) as Partial<Saved>;
    return {
      design,
      step: typeof parsed.step === "number" ? parsed.step : 0,
      notes: parsed.notes ?? {},
      ticks: parsed.ticks ?? {},
      revealed: parsed.revealed ?? {},
    };
  } catch {
    return emptyState(design);
  }
}

function save(state: Saved) {
  try {
    localStorage.setItem(storageKey(state.design), JSON.stringify(state));
  } catch {
    // Private window or blocked storage: the walk-through works, it just won't survive a reload.
  }
}

function coveredCount(stage: DesignStage, ticks: boolean[] | undefined) {
  return stage.points.filter((_, i) => ticks?.[i]).length;
}

// Model answer text: "- " lines become bullets (grouped into one list), lines between two
// ``` fence lines become one code block, others paragraphs.
function ModelAnswer({ lines }: { lines: string[] }) {
  const blocks: (string | string[] | { code: string[] })[] = [];
  let code: string[] | null = null;
  for (const line of lines) {
    if (line.startsWith("```")) {
      if (code) {
        blocks.push({ code });
        code = null;
      } else {
        code = [];
      }
    } else if (code) {
      code.push(line);
    } else if (line.startsWith("- ")) {
      const last = blocks[blocks.length - 1];
      if (Array.isArray(last)) last.push(line.slice(2));
      else blocks.push([line.slice(2)]);
    } else {
      blocks.push(line);
    }
  }
  if (code) blocks.push({ code }); // unclosed fence: still show the code
  return (
    <div className="sdi-model">
      {blocks.map((b, i) =>
        typeof b === "string" ? (
          <p key={i}>{b}</p>
        ) : Array.isArray(b) ? (
          <ul key={i}>
            {b.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ) : (
          <pre key={i} className="algo-code sdi-code">
            <code>{b.code.join("\n")}</code>
          </pre>
        ),
      )}
    </div>
  );
}

// Boxes laid out in columns left to right, arrows drawn centre to centre and clipped to the
// box edges. Fixed pixel size inside a scrolling container, so it stays legible on a phone.
const BOX_W = 138;
const BOX_H = 44;
const COL_GAP = 84;
const ROW_GAP = 26;
const PAD = 10;

function DiagramView({ diagram }: { diagram: Diagram }) {
  const cols = Math.max(...diagram.nodes.map((n) => n.col)) + 1;
  const byCol: string[][] = Array.from({ length: cols }, () => []);
  diagram.nodes.forEach((n) => byCol[n.col].push(n.id));
  const maxRows = Math.max(...byCol.map((c) => c.length));
  const height = PAD * 2 + maxRows * BOX_H + (maxRows - 1) * ROW_GAP;
  const width = PAD * 2 + cols * BOX_W + (cols - 1) * COL_GAP;

  // Centre of each box; each column's stack is centred vertically.
  const pos: Record<string, { x: number; y: number }> = {};
  byCol.forEach((ids, c) => {
    const stackH = ids.length * BOX_H + (ids.length - 1) * ROW_GAP;
    const top = (height - stackH) / 2;
    ids.forEach((id, r) => {
      pos[id] = { x: PAD + c * (BOX_W + COL_GAP) + BOX_W / 2, y: top + r * (BOX_H + ROW_GAP) + BOX_H / 2 };
    });
  });

  // Distance from a box centre to its border along direction (dx, dy).
  function edgeT(dx: number, dy: number) {
    const tx = dx === 0 ? Infinity : BOX_W / 2 / Math.abs(dx);
    const ty = dy === 0 ? Infinity : BOX_H / 2 / Math.abs(dy);
    return Math.min(tx, ty);
  }

  return (
    <div className="sdi-diagram-wrap">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sdi-diagram" role="img">
        <defs>
          <marker id="sdi-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="sdi-arrowhead" />
          </marker>
        </defs>
        {diagram.edges.map((e, i) => {
          const a = pos[e.from];
          const b = pos[e.to];
          if (!a || !b) return null;
          const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
          const dx = (b.x - a.x) / len;
          const dy = (b.y - a.y) / len;
          const t = edgeT(dx, dy);
          const x1 = a.x + dx * t;
          const y1 = a.y + dy * t;
          const x2 = b.x - dx * (t + 2);
          const y2 = b.y - dy * (t + 2);
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          const lw = e.label ? e.label.length * 5.6 + 8 : 0;
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} className="sdi-edge" markerEnd="url(#sdi-arrow)" />
              {e.label && (
                <g>
                  <rect x={mx - lw / 2} y={my - 8} width={lw} height={15} rx={3} className="sdi-edge-label-bg" />
                  <text x={mx} y={my + 3} textAnchor="middle" className="sdi-edge-label">
                    {e.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}
        {diagram.nodes.map((n) => {
          const p = pos[n.id];
          return (
            <g key={n.id}>
              <rect x={p.x - BOX_W / 2} y={p.y - BOX_H / 2} width={BOX_W} height={BOX_H} rx={6} className="sdi-box" />
              <text x={p.x} y={n.sub ? p.y - 3 : p.y + 4} textAnchor="middle" className="sdi-box-label">
                {n.label}
              </text>
              {n.sub && (
                <text x={p.x} y={p.y + 12} textAnchor="middle" className="sdi-box-sub">
                  {n.sub}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function DesignInterview({ design }: { design: DesignId }) {
  const interview = DESIGN_INTERVIEWS[design];
  const stages = interview.stages;
  const [state, setState] = useState<Saved>(() => load(design));

  // Switching designs loads that design's own notes.
  useEffect(() => {
    setState(load(design));
  }, [design]);

  useEffect(() => {
    save(state);
  }, [state]);

  const current = state.design === design ? state : emptyState(design);
  const step = Math.min(Math.max(current.step, 0), stages.length);
  const stage: DesignStage | undefined = stages[step];
  const totalMinutes = stages.reduce((s, st) => s + st.minutes, 0);

  function update(fn: (s: Saved) => Saved) {
    setState((s) => fn(s.design === design ? s : emptyState(design)));
  }
  const goTo = (n: number) => update((s) => ({ ...s, step: n }));

  function toggleTick(st: DesignStage, i: number) {
    update((s) => {
      const ticks = [...(s.ticks[st.id] ?? st.points.map(() => false))];
      ticks[i] = !ticks[i];
      return { ...s, ticks: { ...s.ticks, [st.id]: ticks } };
    });
  }

  // Two clicks to clear, so one stray tap doesn't wipe a full set of notes.
  const [confirming, setConfirming] = useState(false);
  function startOver() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    setState(emptyState(design));
  }

  const totals = stages.reduce(
    (acc, st) => ({ covered: acc.covered + coveredCount(st, current.ticks[st.id]), all: acc.all + st.points.length }),
    { covered: 0, all: 0 },
  );

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>The interviewer asks</h3>
        <p className="sdi-prompt">{interview.prompt}</p>
        <p className="gate-note">
          Work through the stages in order, as you would in a {totalMinutes}-minute round. Write your own answer in
          each box before you look at the model answer; then tick the points you actually covered.
        </p>
      </div>

      <div className="sql-presets sdi-stepper">
        {stages.map((st, i) => {
          const done = current.revealed[st.id];
          return (
            <button key={st.id} className={i === step ? "active" : ""} onClick={() => goTo(i)}>
              {i + 1}. {st.name}
              {done ? ` (${coveredCount(st, current.ticks[st.id])}/${st.points.length})` : ""}
            </button>
          );
        })}
        <button className={step === stages.length ? "active" : ""} onClick={() => goTo(stages.length)}>
          Summary
        </button>
      </div>

      {stage ? (
        <div className="crypto-section">
          <h3>
            {step + 1}. {stage.name} <span className="sdi-minutes">about {stage.minutes} min</span>
          </h3>
          <p className="gate-note">{stage.instruction}</p>
          <textarea
            className="sdi-notes"
            rows={7}
            placeholder="Write your answer here first, as you'd say it to the interviewer..."
            value={current.notes[stage.id] ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              update((s) => ({ ...s, notes: { ...s.notes, [stage.id]: v } }));
            }}
          />

          {!current.revealed[stage.id] ? (
            <div className="darr-actions">
              <button onClick={() => update((s) => ({ ...s, revealed: { ...s.revealed, [stage.id]: true } }))}>
                Compare with the model answer
              </button>
            </div>
          ) : (
            <>
              <h3 className="sdi-sub">Points a strong answer covers</h3>
              <ul className="sdi-points">
                {stage.points.map((p, i) => (
                  <li key={i}>
                    <label>
                      <input type="checkbox" checked={!!current.ticks[stage.id]?.[i]} onChange={() => toggleTick(stage, i)} />
                      <span>{p}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <p className={coveredCount(stage, current.ticks[stage.id]) * 2 >= stage.points.length ? "constraint-ok" : "constraint-fail"}>
                Covered {coveredCount(stage, current.ticks[stage.id])} of {stage.points.length}
              </p>
              <h3 className="sdi-sub">Model answer</h3>
              {stage.diagram && <DiagramView diagram={stage.diagram} />}
              <ModelAnswer lines={stage.model} />
            </>
          )}
        </div>
      ) : (
        <div className="crypto-section">
          <h3>Summary</h3>
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Time</th>
                <th>Covered</th>
              </tr>
            </thead>
            <tbody>
              {stages.map((st) => (
                <tr key={st.id}>
                  <td>{st.name}</td>
                  <td>{st.minutes} min</td>
                  <td className="mono">
                    {current.revealed[st.id]
                      ? `${coveredCount(st, current.ticks[st.id])} of ${st.points.length}`
                      : "not compared yet"}
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                  <strong>Overall</strong>
                </td>
                <td>{totalMinutes} min</td>
                <td className="mono">
                  {totals.covered} of {totals.all}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="gate-note">
            {totals.all === 0
              ? ""
              : totals.covered / totals.all >= 0.75
                ? "Strong coverage. Next time, practise saying the trade-offs out loud within the time limits."
                : (interview.reviewTip ??
                  "Look at the stages with the fewest ticks: those are the ones to rehearse. Most candidates lose points on numbers in the estimation stage and on comparing options in the deep dives.")}
          </p>
        </div>
      )}

      <div className="darr-actions sdi-nav">
        <button disabled={step === 0} onClick={() => goTo(step - 1)}>
          Back
        </button>
        <button disabled={step === stages.length} onClick={() => goTo(step + 1)}>
          {step === stages.length - 1 ? "Summary" : "Next"}
        </button>
        <button className="sdi-reset" onClick={startOver} onBlur={() => setConfirming(false)}>
          {confirming ? "Click again to clear your notes" : "Start over"}
        </button>
      </div>
    </div>
  );
}
