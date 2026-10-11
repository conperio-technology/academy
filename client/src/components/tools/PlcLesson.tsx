import { useState } from "react";
import { openLesson } from "../../api";
import { withInlineCode } from "../../inlineCode";
import { PLC_EXERCISE_BY_ID } from "../../plc/exercises";
import type { LessonBlock, PlcLessonData } from "../../plc/lessons";
import { loadPlcProgress } from "../../practiceHistory";
import { PlcLadder } from "./PlcLadder";
import { StCode } from "./PlcShared";
import { PlcSimulator } from "./PlcSimulator";

// Renders one PLC programming lesson's interactive content (src/plc/lessons.ts).

export function PlcLesson({ lesson }: { lesson: PlcLessonData }) {
  return (
    <div className="plc-lesson">
      {lesson.blocks.map((b, i) => (
        <Block key={i} block={b} />
      ))}
    </div>
  );
}

export function Block({ block }: { block: LessonBlock }) {
  switch (block.kind) {
    case "h":
      return <h3 className="plc-h">{block.text}</h3>;
    case "p":
      return <p className="plc-p">{withInlineCode(block.text)}</p>;
    case "list": {
      const items = block.items.map((t, i) => <li key={i}>{withInlineCode(t)}</li>);
      return block.ordered ? <ol className="plc-list">{items}</ol> : <ul className="plc-list">{items}</ul>;
    }
    case "table":
      return (
        <div className="table-scroll plc-table-wrap">
          <table className="plc-table">
            <thead>
              <tr>
                {block.head.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j}>{j === 0 && /^-[|(]/.test(c) ? <code className="plc-sym">{c}</code> : withInlineCode(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "pair":
      return (
        <div className="plc-pair-block">
          <div className="plc-pair-title">{block.title}</div>
          <div className="plc-pair">
            <div className="plc-pane">
              <div className="plc-code-label">Ladder Diagram</div>
              <PlcLadder rungs={block.ladder} />
            </div>
            <div className="plc-pane">
              <StCode code={block.st} />
            </div>
          </div>
          {block.note && <p className="gate-note plc-pair-note">{withInlineCode(block.note)}</p>}
        </div>
      );
    case "code":
      return (
        <div className="plc-code-block">
          <StCode code={block.code} label={block.title} />
        </div>
      );
    case "sim":
      return <PlcSimulator title={block.title} intro={block.intro} source={block.source} io={block.io} scanMs={block.scanMs} plant={block.plant} ladder={block.ladder} trend={block.trend} />;
    case "quiz":
      return <Quiz block={block} />;
    case "callout":
      return <div className={`plc-callout plc-callout-${block.tone}`}>{withInlineCode(block.text)}</div>;
    case "practice":
      return <Practice ids={block.ids} />;
    case "links":
      return (
        <div className="plc-links">
          <span className="plc-links-label">Related lessons</span>
          <ul>
            {block.items.map(([id, label]) => (
              <li key={id}>
                <button className="link-button" onClick={() => openLesson(id)}>
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      );
    case "diagram":
      return block.which === "fbd-seal-in" ? <FbdSealIn /> : <SfcTank />;
  }
}

function Quiz({ block }: { block: Extract<LessonBlock, { kind: "quiz" }> }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="plc-quiz">
      <div className="plc-quiz-label">Quick check</div>
      <p className="plc-p">{withInlineCode(block.q)}</p>
      {block.code && <StCode code={block.code} label="" />}
      <div className="drill-options">
        {block.options.map((o, i) => {
          const cls = picked === null ? "" : i === block.answer ? "correct" : i === picked ? "wrong" : "dim";
          return (
            <button key={i} className={`drill-option ${cls}`} disabled={picked !== null} onClick={() => setPicked(i)}>
              {withInlineCode(o)}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <p className={picked === block.answer ? "constraint-ok" : "constraint-fail"}>
          {picked === block.answer ? "Right. " : "Not quite. "}
          <span className="plc-quiz-why">{withInlineCode(block.why)}</span>{" "}
          <button className="link-button" onClick={() => setPicked(null)}>
            Try again
          </button>
        </p>
      )}
    </div>
  );
}

function Practice({ ids }: { ids: string[] }) {
  const progress = loadPlcProgress();
  return (
    <div className="plc-practice">
      <div className="plc-practice-label">Practice</div>
      <ul>
        {ids.map((id) => {
          const ex = PLC_EXERCISE_BY_ID[id];
          const p = progress[id];
          return (
            <li key={id}>
              <button className="link-button" onClick={() => openLesson(id)}>
                {ex?.title ?? id}
              </button>{" "}
              <span className="plc-practice-status">{p?.passedAt ? "✓ passed" : p?.attempts ? `${p.attempts} attempt${p.attempts === 1 ? "" : "s"}` : "not tried yet"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---- Static diagrams ----

function FbdSealIn() {
  return (
    <div className="plc-diagram">
      <svg viewBox="0 0 520 170" role="img" aria-label="Function block diagram: Start and Motor into an OR block, its output and Stop_NC into an AND block, whose output is Motor">
        <text x="10" y="48" className="fbd-var">Start</text>
        <text x="10" y="88" className="fbd-var">Motor</text>
        <line x1="62" y1="44" x2="140" y2="44" className="fbd-wire" />
        <line x1="62" y1="84" x2="140" y2="84" className="fbd-wire" />
        <rect x="140" y="26" width="70" height="76" rx="3" className="fbd-block" />
        <text x="175" y="20" className="fbd-name">OR</text>
        <text x="175" y="70" className="fbd-op">≥1</text>
        <line x1="210" y1="64" x2="290" y2="64" className="fbd-wire" />
        <text x="190" y="140" className="fbd-var">Stop_NC</text>
        <polyline points="258,136 270,136 270,104 290,104" className="fbd-wire" fill="none" />
        <rect x="290" y="46" width="70" height="76" rx="3" className="fbd-block" />
        <text x="325" y="40" className="fbd-name">AND</text>
        <text x="325" y="90" className="fbd-op">&amp;</text>
        <line x1="360" y1="84" x2="420" y2="84" className="fbd-wire" />
        <text x="428" y="88" className="fbd-var">Motor</text>
        <polyline points="400,84 400,158 104,158 104,84" className="fbd-wire fbd-feedback" fill="none" />
        <text x="250" y="154" className="fbd-note">feedback: the output feeds back into the OR</text>
      </svg>
    </div>
  );
}

function SfcTank() {
  const steps: [string, string, boolean][] = [
    ["0 Idle", "everything off", true],
    ["10 Fill", "InletValve", false],
    ["20 Mix", "Mixer, MixTimer", false],
    ["30 Drain", "DrainValve", false],
  ];
  const trans = ["Start", "Level >= 80.0", "MixTimer.Q", "Level <= 2.0"];
  const STEP_H = 34;
  const GAP = 34;
  const y0 = 10;
  const yOf = (i: number) => y0 + i * (STEP_H + GAP);
  const h = yOf(steps.length) + 10;
  return (
    <div className="plc-diagram">
      <svg viewBox={`0 0 460 ${h}`} role="img" aria-label="Sequential function chart: Idle, Fill, Mix, Drain, and back to Idle">
        {steps.map(([name, action, initial], i) => {
          const y = yOf(i);
          return (
            <g key={name}>
              <rect x="60" y={y} width="110" height={STEP_H} className="sfc-step" />
              {initial && <rect x="64" y={y + 4} width="102" height={STEP_H - 8} className="sfc-step" />}
              <text x="115" y={y + STEP_H / 2 + 5} className="sfc-text">{name}</text>
              <line x1="170" y1={y + STEP_H / 2} x2="200" y2={y + STEP_H / 2} className="sfc-line" />
              <rect x="200" y={y + 4} width="170" height={STEP_H - 8} className="sfc-action" />
              <text x="285" y={y + STEP_H / 2 + 4} className="sfc-action-text">{action}</text>
              <line x1="115" y1={y + STEP_H} x2="115" y2={y + STEP_H + GAP} className="sfc-line" />
              <line x1="100" y1={y + STEP_H + GAP / 2} x2="130" y2={y + STEP_H + GAP / 2} className="sfc-trans" />
              <text x="138" y={y + STEP_H + GAP / 2 + 4} className="sfc-cond">{trans[i]}</text>
            </g>
          );
        })}
        <polyline points={`115,${yOf(steps.length)} 115,${yOf(steps.length) + 4} 30,${yOf(steps.length) + 4} 30,${y0 - 6} 115,${y0 - 6} 115,${y0}`} className="sfc-line" fill="none" />
      </svg>
    </div>
  );
}
