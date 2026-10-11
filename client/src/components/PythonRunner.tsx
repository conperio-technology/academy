import Editor from "@monaco-editor/react";
import { useState } from "react";
import { recordProgress } from "../api";
import { jsonEquals } from "../jsonEquals";
import type { PythonRunRequest, PythonWorkerMessage } from "../pythonWorker";
import type { ExerciseMode } from "../bareStarter";
import type { TestCaseDisplay } from "../types";

interface Props {
  lessonId: string;
  starterCode: string;
  functionName: string;
  harnessPreamble: string | null;
  callTemplate: string;
  testCases: TestCaseDisplay[];
  onPassed: () => void;
  onRan: (passed: boolean) => void;
  // Which starter this attempt began from, recorded with the result (see api.ts).
  mode?: ExerciseMode;
}

interface RunResult {
  inputDisplay: string;
  expectedJson: string;
  actualJson: string | null;
  passed: boolean;
  error: string | null;
}

// Same per-test limit as the C# runner. Loading the runtime doesn't count against it.
const TEST_TIMEOUT_MS = 5000;

type CallOutput = { actualJson: string | null; error: string | null };

// One shared worker (so Pyodide loads once per session), replaced after a timeout.
let worker: Worker | null = null;
let cancelActive: (() => void) | null = null;

// Runs the calls in the worker. Resolves with one output per call that finished; after a
// timeout the last output is the timeout and the worker is terminated.
function runInWorker(request: PythonRunRequest, onReady: () => void): Promise<CallOutput[]> {
  cancelActive?.();
  worker ??= new Worker(new URL("../pythonWorker.ts", import.meta.url), { type: "module" });
  const w = worker;
  return new Promise((resolve, reject) => {
    const outputs: CallOutput[] = [];
    let timer: number | undefined;
    const finish = (kill: boolean) => {
      clearTimeout(timer);
      w.onmessage = w.onerror = null;
      cancelActive = null;
      if (kill) {
        w.terminate();
        if (worker === w) worker = null;
      }
    };
    const arm = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        finish(true);
        outputs.push({ actualJson: null, error: "Timed out (infinite loop?)" });
        resolve(outputs);
      }, TEST_TIMEOUT_MS);
    };
    cancelActive = () => {
      finish(true);
      reject(new Error("Run cancelled."));
    };
    w.onerror = (e) => {
      finish(true);
      reject(new Error(e.message || "The Python worker failed to start."));
    };
    w.onmessage = (e: MessageEvent<PythonWorkerMessage>) => {
      const m = e.data;
      if (m.type === "ready") {
        onReady();
        arm();
      } else if (m.type === "result") {
        outputs.push({ actualJson: m.actualJson, error: m.error });
        arm();
      } else if (m.type === "done") {
        finish(false);
        resolve(outputs);
      } else {
        finish(true);
        reject(new Error(m.error));
      }
    };
    w.postMessage(request);
  });
}

// Runs Python entirely in the browser via Pyodide, in a Web Worker -- no server round
// trip, so this is the one runner that talks to /api/progress/record instead of
// /api/execute/*, since the server never sees the code run, only the already-computed
// pass/fail.
export function PythonRunner({
  lessonId,
  starterCode,
  functionName,
  harnessPreamble,
  callTemplate,
  testCases,
  onPassed,
  onRan,
  mode = "guided",
}: Props) {
  const [code, setCode] = useState(starterCode);
  const [running, setRunning] = useState(false);
  const [loadingRuntime, setLoadingRuntime] = useState(false);
  const [results, setResults] = useState<RunResult[] | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);

  async function handleRun() {
    setRunning(true);
    setResults(null);
    setFatalError(null);

    try {
      setLoadingRuntime(true);
      const preamble = harnessPreamble ? harnessPreamble + "\n" : "";
      // inputDisplay looks like "[1, 2, 3]" -- valid Python list syntax as-is.
      const calls = testCases.map((test) => callTemplate.replace("{input}", test.inputDisplay));
      const outputs = await runInWorker({ preamble, code, calls }, () => setLoadingRuntime(false));

      const runResults: RunResult[] = testCases.map((test, i) => {
        const output = outputs[i];
        return {
          inputDisplay: test.inputDisplay,
          expectedJson: test.expectedJson,
          actualJson: output?.actualJson ?? null,
          passed: output?.actualJson != null && jsonEquals(output.actualJson, test.expectedJson),
          error: output ? output.error : "Skipped -- an earlier test didn't finish",
        };
      });

      const allPassed = runResults.length > 0 && runResults.every((r) => r.passed);
      setResults(runResults);
      await recordProgress(lessonId, "python", code, allPassed, mode);
      onRan(allPassed);
      if (allPassed) onPassed();
    } catch (err) {
      setFatalError(err instanceof Error ? err.message : "Failed to run Python.");
    } finally {
      setRunning(false);
      setLoadingRuntime(false);
    }
  }

  return (
    <div className="code-runner">
      <div className="editor-wrap">
        <Editor
          height="320px"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value ?? "")}
          options={{ fontSize: 14, minimap: { enabled: false } }}
        />
      </div>

      <div className="code-runner-actions">
        <button onClick={handleRun} disabled={running}>
          {running ? (loadingRuntime ? "Loading Python runtime (first run only)…" : "Running…") : "▶ Run Tests"}
        </button>
      </div>

      {fatalError && <pre className="compile-error">{fatalError}</pre>}

      {results && (
        <div className="results">
          {results.map((r, i) => (
            <div key={i} className={`test-result ${r.passed ? "pass" : "fail"}`}>
              <span className="test-icon">{r.passed ? "✅" : "❌"}</span>
              <span>
                {functionName}({r.inputDisplay}) → expected <strong>{r.expectedJson}</strong>, got{" "}
                <strong>{r.actualJson ?? "—"}</strong>
                {r.error && <span className="test-error"> ({r.error})</span>}
              </span>
            </div>
          ))}
          {results.every((r) => r.passed) && (
            <p className="all-passed">🎉 All tests passed — concept marked complete.</p>
          )}
        </div>
      )}
    </div>
  );
}
