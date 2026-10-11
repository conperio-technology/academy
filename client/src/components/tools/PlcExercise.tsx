import { useMemo, useState } from "react";
import { openLesson } from "../../api";
import { grade, seconds, type GradeResult } from "../../plc/grader";
import type { PlcExerciseData } from "../../plc/exercises";
import { loadPlcProgress, recordPlcAttempt, type PlcExerciseProgress } from "../../practiceHistory";
import { UNLOCK_AFTER_ATTEMPTS } from "../ReferenceSolution";
import { StCode, StEditor, TrendChart } from "./PlcShared";
import { PlcSimulator } from "./PlcSimulator";

// A graded Structured Text exercise: write ST in the editor, run the scripted test (input
// changes over simulated time, outputs checked every scan), see which step failed and why
// on a timing chart. Progress lives in this browser (practiceHistory.ts); the reference
// solution unlocks the same way as the coding lessons' (pass, or a few attempts).

const DIR_LABEL = { in: "input", out: "output" } as const;

function draftKey(id: string) {
  return `plc:draft:${id}`;
}

function loadDraft(ex: PlcExerciseData): string {
  try {
    return localStorage.getItem(draftKey(ex.id)) ?? ex.starter;
  } catch {
    return ex.starter;
  }
}

function saveDraft(id: string, code: string) {
  try {
    localStorage.setItem(draftKey(id), code);
  } catch {
    // Blocked storage: the draft just isn't kept.
  }
}

export function PlcExercise({ ex }: { ex: PlcExerciseData }) {
  const [code, setCode] = useState(() => loadDraft(ex));
  const [result, setResult] = useState<GradeResult | null>(null);
  const [progress, setProgress] = useState<PlcExerciseProgress>(() => loadPlcProgress()[ex.id] ?? { attempts: 0 });
  const [hints, setHints] = useState(0);
  const [trying, setTrying] = useState(false);
  const [simSource, setSimSource] = useState(code);
  const [forced, setForced] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  function change(v: string) {
    setCode(v);
    saveDraft(ex.id, v);
  }

  function run() {
    const r = grade(code, ex.io, ex.scanMs, ex.tests, { extra: ex.extra });
    setResult(r);
    setProgress(recordPlcAttempt(ex.id, r.ok));
  }

  const lesson = ex.lessonId;
  const unlocked = !!progress.passedAt || progress.attempts >= UNLOCK_AFTER_ATTEMPTS || forced;
  const remaining = Math.max(0, UNLOCK_AFTER_ATTEMPTS - progress.attempts);
  const errorLines = result?.errors.map((e) => e.line) ?? (result?.fault ? [result.fault.line] : []);
  const signals = useMemo(() => ex.trend, [ex.trend]);

  return (
    <div className="plc-exercise">
      <div className="plc-ex-status">
        {progress.passedAt ? (
          <span className="constraint-ok">✓ Passed on {new Date(progress.passedAt).toLocaleDateString()}</span>
        ) : (
          <span className="gate-note">{progress.attempts ? `${progress.attempts} run${progress.attempts === 1 ? "" : "s"} so far, not passed yet` : "Not attempted yet"}</span>
        )}
        <button className="link-button" onClick={() => openLesson(lesson)}>
          Back to the lesson
        </button>
      </div>

      <h3 className="plc-h">Requirements</h3>
      <ul className="plc-list">
        {ex.requirements.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>

      <h3 className="plc-h">Inputs and outputs (already declared)</h3>
      <div className="table-scroll plc-table-wrap">
        <table className="plc-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Direction</th>
              <th>Wired to</th>
            </tr>
          </thead>
          <tbody>
            {ex.io.map((d) => (
              <tr key={d.name}>
                <td>
                  <code>{d.name}</code>
                </td>
                <td>{d.type}</td>
                <td>{DIR_LABEL[d.dir]}</td>
                <td>
                  {d.label}
                  {d.unit ? ` (${d.unit})` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="gate-note">
        The grader scans your program every {ex.scanMs} ms of simulated time, changes the inputs step by step, and checks the outputs on every scan.
      </p>

      <StEditor value={code} onChange={change} errorLines={errorLines} label="Your Structured Text" minRows={10} />
      <div className="darr-actions">
        <button className="plc-run" onClick={run}>
          ▶ Run the tests
        </button>
        <button
          onClick={() => {
            setSimSource(code);
            setTrying((t) => !t || simSource !== code);
          }}
        >
          {trying && simSource === code ? "Hide the simulator" : "Try it in the simulator"}
        </button>
        <button
          onClick={() => {
            change(ex.starter);
            setResult(null);
          }}
        >
          Reset to the starter code
        </button>
      </div>

      {result && <Results result={result} ex={ex} signals={signals} />}

      {trying && (
        <PlcSimulator
          key={simSource}
          title="Your program in the simulator"
          intro="Drive the inputs yourself. Edits here don't change the code above; click Try it in the simulator again to reload it."
          source={simSource}
          io={ex.io}
          scanMs={ex.scanMs}
          plant={ex.plant}
          plantOptional
          trend={ex.trend}
        />
      )}

      {ex.hints.length > 0 && (
        <div className="plc-hints">
          {ex.hints.slice(0, hints).map((h, i) => (
            <p key={i} className="plc-hint">
              <strong>Hint {i + 1}.</strong> {h}
            </p>
          ))}
          {hints < ex.hints.length && (
            <button className="link-button" onClick={() => setHints((n) => n + 1)}>
              {hints === 0 ? "Show a hint" : "Another hint"}
            </button>
          )}
        </div>
      )}

      <div className="reference-solution">
        {!unlocked ? (
          <p className="gate-note">
            🔒 Reference solution unlocks once you pass, or after {remaining} more {remaining === 1 ? "run" : "runs"}.{" "}
            <button
              className="link-button"
              onClick={() => {
                setForced(true);
                setShowSolution(true);
              }}
            >
              Stuck? Show it anyway
            </button>
          </p>
        ) : (
          <>
            <button className="reference-toggle" onClick={() => setShowSolution((o) => !o)}>
              {showSolution ? "▾ Hide reference solution" : "▸ Show reference solution"}
            </button>
            {showSolution && (
              <div className="reference-body">
                <p className="gate-note">One standard way to solve it. Yours doesn't have to match: compare the approach, not the exact lines.</p>
                <StCode code={ex.solution} label="Reference solution" />
                {ex.afterword && <p className="plc-p">{ex.afterword}</p>}
                <div className="darr-actions">
                  <button onClick={() => change(ex.solution)}>Copy it into the editor</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Results({ result, ex, signals }: { result: GradeResult; ex: PlcExerciseData; signals: string[] }) {
  if (result.errors.length > 0)
    return (
      <div className="plc-results plc-results-bad" role="status">
        <p className="constraint-fail">The program doesn't compile, so no tests ran.</p>
        <ul className="plc-errors">
          {result.errors.map((e, i) => (
            <li key={i}>
              Line {e.line}: {e.message}
            </li>
          ))}
        </ul>
      </div>
    );
  const failed = result.steps.find((s) => !s.ok);
  const passedCount = result.steps.filter((s) => s.ok).length;
  return (
    <div className={`plc-results ${result.ok ? "plc-results-ok" : "plc-results-bad"}`} role="status">
      {result.ok ? (
        <p className="constraint-ok">
          ✓ All {result.steps.length} steps passed over {seconds(result.totalMs)} of simulated time.
        </p>
      ) : result.fault ? (
        <p className="constraint-fail">
          The PLC faulted at {seconds(result.fault.t)} (line {result.fault.line}): {result.fault.message}
        </p>
      ) : (
        <p className="constraint-fail">
          Step {passedCount + 1} of {ex.tests.length} failed: {failed?.label}.
        </p>
      )}
      {failed && !result.fault && (
        <div className="plc-fail-detail">
          <p>{failed.message}</p>
          {failed.why && <p className="gate-note">Requirement: {failed.why}</p>}
        </div>
      )}
      <ol className="plc-steps">
        {result.steps.map((s, i) => (
          <li key={i} className={s.ok ? "ok" : "bad"}>
            <span aria-hidden="true">{s.ok ? "✓" : "✗"}</span> {s.label}
          </li>
        ))}
        {!result.ok &&
          ex.tests.slice(result.steps.length).map((t, i) => (
            <li key={`n${i}`} className="skipped">
              <span aria-hidden="true">·</span> {t.label}
            </li>
          ))}
      </ol>
      {result.trace.length > 0 && (
        <details className="plc-sim-section" open={!result.ok}>
          <summary>Timing chart of this run{result.failAt !== undefined && !result.ok ? " (red line: where it failed)" : ""}</summary>
          <TrendChart rows={result.trace} signals={signals.filter((s) => result.trace[0].values[s] !== undefined)} scanMs={ex.scanMs} failAt={result.ok ? undefined : result.failAt} />
        </details>
      )}
    </div>
  );
}
