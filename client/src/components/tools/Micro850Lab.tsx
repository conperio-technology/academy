import { useState } from "react";
import { openLesson } from "../../api";
import { withInlineCode } from "../../inlineCode";
import { PLC_EXERCISE_BY_ID } from "../../plc/exercises";
import { MICRO850_LABS, type LabStep, type Micro850LabData } from "../../plc/micro850Labs";
import { loadMicro850Progress, loadPlcProgress, resetMicro850Checks, saveMicro850Checks } from "../../practiceHistory";
import { Block } from "./PlcLesson";
import { PlcLadder } from "./PlcLadder";
import { StCode } from "./PlcShared";

// Renders one Micro850 hands-on lab (src/plc/micro850Labs.ts): a step-by-step guide the
// learner follows on a real controller in CCW, with a "check yourself" list kept in
// localStorage.

export function Micro850Lab({ lab }: { lab: Micro850LabData }) {
  const index = MICRO850_LABS.findIndex((l) => l.id === lab.id);
  const next = MICRO850_LABS[index + 1];
  let n = 0;
  return (
    <div className="m850-lab">
      {lab.optional && <div className="m850-optional">Optional lab: needs extra hardware, see the parts list.</div>}

      <SimFirst lab={lab} />

      <h3 className="plc-h">Objectives</h3>
      <ul className="plc-list">
        {lab.objectives.map((o, i) => (
          <li key={i}>{withInlineCode(o)}</li>
        ))}
      </ul>

      <div className="plc-links">
        <span className="plc-links-label">Before you start</span>
        <ul>
          {lab.prereqs.map(([id, label]) => (
            <li key={id}>
              <button className="link-button" onClick={() => openLesson(id)}>
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <h3 className="plc-h">Parts</h3>
      <ul className="plc-list">
        {lab.parts.map((p, i) => (
          <li key={i}>{withInlineCode(p)}</li>
        ))}
      </ul>

      {lab.wiring && (
        <>
          <h3 className="plc-h">Wiring</h3>
          <div className="table-scroll plc-table-wrap">
            <table className="plc-table m850-wiring">
              <thead>
                <tr>
                  <th>Terminal</th>
                  <th>CCW variable</th>
                  <th>Device</th>
                </tr>
              </thead>
              <tbody>
                {lab.wiring.rows.map(([t, v, d]) => (
                  <tr key={t}>
                    <td className="m850-nowrap">{t}</td>
                    <td>
                      <code>{v}</code>
                    </td>
                    <td>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {lab.wiring.note && <p className="gate-note">{withInlineCode(lab.wiring.note)}</p>}
        </>
      )}

      {lab.safety && <div className="plc-callout plc-callout-warn">{withInlineCode(lab.safety)}</div>}

      {lab.sections.map((s) => {
        const start = n + 1;
        n += s.steps.length;
        return (
          <section key={s.title} className="m850-section">
            <h3 className="plc-h">{s.title}</h3>
            <ol className="m850-steps" start={start}>
              {s.steps.map((step, i) => (
                <Step key={i} step={step} />
              ))}
            </ol>
          </section>
        );
      })}

      {lab.reference?.map((b, i) => (
        <Block key={i} block={b} />
      ))}

      <Checklist key={lab.id} lab={lab} />

      <h3 className="plc-h">Common mistakes</h3>
      <ul className="plc-list">
        {lab.mistakes.map((m, i) => (
          <li key={i}>{withInlineCode(m)}</li>
        ))}
      </ul>

      <div className="plc-callout m850-stretch">
        <span className="plc-links-label">Stretch task</span>
        {withInlineCode(lab.stretch)}
      </div>

      <details className="m850-instructor">
        <summary>Instructor notes</summary>
        <ul className="plc-list">
          {lab.instructor.map((t, i) => (
            <li key={i}>{withInlineCode(t)}</li>
          ))}
        </ul>
      </details>

      {next && (
        <p className="m850-next">
          Next:{" "}
          <button className="link-button" onClick={() => openLesson(next.id)}>
            {next.short}
          </button>
        </p>
      )}
    </div>
  );
}

function Step({ step }: { step: LabStep }) {
  return (
    <li className="m850-step">
      <div className="plc-p m850-step-text">{withInlineCode(step.text)}</div>
      {step.ladder && (
        <div className="m850-ladder">
          <PlcLadder rungs={step.ladder} />
        </div>
      )}
      {step.code &&
        (step.codeLang && step.codeLang !== "st" ? (
          <div className="plc-code-wrap">
            <div className="plc-code-label">{step.codeLabel ?? ""}</div>
            <pre className="plc-code">{step.code.replace(/\n$/, "")}</pre>
          </div>
        ) : (
          <StCode code={step.code} label={step.codeLabel ?? "Structured Text (CCW)"} />
        ))}
      {step.expect && (
        <div className="m850-expect">
          <span className="m850-expect-label">Expected</span> {withInlineCode(step.expect)}
        </div>
      )}
    </li>
  );
}

function SimFirst({ lab }: { lab: Micro850LabData }) {
  const progress = loadPlcProgress();
  return (
    <div className="plc-callout m850-simfirst">
      <span className="plc-links-label">No unit free? Simulator first</span>
      <p className="m850-simfirst-text">{withInlineCode(lab.simFirst.text)}</p>
      <ul>
        {lab.simFirst.ids.map(([id, label]) => {
          const p = PLC_EXERCISE_BY_ID[id] ? progress[id] : undefined;
          return (
            <li key={id}>
              <button className="link-button" onClick={() => openLesson(id)}>
                {label}
              </button>
              {PLC_EXERCISE_BY_ID[id] && (
                <span className="plc-practice-status"> {p?.passedAt ? "✓ passed" : p?.attempts ? `${p.attempts} attempt${p.attempts === 1 ? "" : "s"}` : "not tried yet"}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Checklist({ lab }: { lab: Micro850LabData }) {
  const [state, setState] = useState(() => {
    const p = loadMicro850Progress()[lab.id];
    return { checked: new Set((p?.checked ?? []).filter((c) => lab.checklist.includes(c))), completedAt: p?.completedAt };
  });
  const done = lab.checklist.filter((c) => state.checked.has(c)).length;
  const all = done === lab.checklist.length;

  function toggle(item: string) {
    const checked = new Set(state.checked);
    if (checked.has(item)) checked.delete(item);
    else checked.add(item);
    const list = lab.checklist.filter((c) => checked.has(c));
    const saved = saveMicro850Checks(lab.id, list, list.length === lab.checklist.length);
    setState({ checked, completedAt: saved.completedAt });
  }

  function reset() {
    resetMicro850Checks(lab.id);
    setState({ checked: new Set(), completedAt: undefined });
  }

  return (
    <div className="m850-check">
      <div className="m850-check-head">
        <h3 className="plc-h">Check yourself</h3>
        <span className="plc-practice-status">
          {done} of {lab.checklist.length}
          {all && state.completedAt ? `, lab complete (${new Date(state.completedAt).toLocaleDateString()})` : ""}
        </span>
      </div>
      <ul className="m850-check-list">
        {lab.checklist.map((c) => (
          <li key={c}>
            <label className={state.checked.has(c) ? "m850-checked" : undefined}>
              <input type="checkbox" checked={state.checked.has(c)} onChange={() => toggle(c)} />
              <span>{withInlineCode(c)}</span>
            </label>
          </li>
        ))}
      </ul>
      {done > 0 && (
        <button className="link-button m850-check-reset" onClick={reset}>
          Clear my ticks for this lab
        </button>
      )}
      <p className="gate-note">Ticks are saved in this browser only.</p>
    </div>
  );
}
