import Editor from "@monaco-editor/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { recordProgress } from "../api";
import { attachCSharpCompletion } from "../csharpCompletion";
import { attachCSharpDiagnostics } from "../csharpDiagnostics";
import {
  browserCSharpEnabled,
  type CSharpWasmMetrics,
  CSharpWasmUnavailable,
  getCSharpRuntimeStatus,
  runCSharpInBrowser,
  subscribeCSharpRuntime,
  TEST_TIMEOUT_MS,
  warmCSharpRuntime,
} from "../csharpWasmRunner";
import type { ExerciseMode } from "../bareStarter";
import type { ExecuteResponse, TestCaseDisplay } from "../types";

interface Props {
  lessonId: string;
  starterCode: string;
  functionName: string;
  onPassed: () => void;
  onRan: (passed: boolean) => void;
  // Which starter this attempt began from, recorded with the result (see api.ts).
  mode?: ExerciseMode;
  // For grading (csharpWasmRunner.ts): what the code is wrapped in and how each test calls it.
  harnessPreamble?: string | null;
  callTemplate?: string | null;
  testCases?: TestCaseDisplay[];
}

declare global {
  interface Window {
    // Timings of the last in-browser run (for measuring; see wasm-csharp/PROTOTYPE-RESULTS.md).
    __csharpWasmMetrics?: CSharpWasmMetrics;
  }
}

// Shown when the in-browser runtime can't be used.
const UNAVAILABLE =
  "In-browser C# isn't available here, so C# can't be graded. " +
  "A current desktop browser with WebAssembly works, or solve it in Python where the lesson offers it.";

// C# is graded in this browser (Roslyn on .NET WebAssembly, in a worker; csharpWasmRunner.ts).
export function CSharpRunner({
  lessonId,
  starterCode,
  functionName,
  onPassed,
  onRan,
  mode = "guided",
  harnessPreamble = null,
  callTemplate = null,
  testCases = [],
}: Props) {
  const [code, setCode] = useState(starterCode);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecuteResponse | null>(null);
  const [loadingRuntime, setLoadingRuntime] = useState(false);
  // Timings of the last run, for the line under the buttons.
  const [ranOn, setRanOn] = useState<{ metrics: CSharpWasmMetrics | null } | null>(null);
  const runtime = useSyncExternalStore(subscribeCSharpRuntime, getCSharpRuntimeStatus);
  const canRunInBrowser = !!callTemplate;

  // Fetch and start the runtime as soon as a C# exercise opens.
  useEffect(() => {
    if (canRunInBrowser) warmCSharpRuntime();
  }, [canRunInBrowser]);

  async function runInBrowser(): Promise<ExecuteResponse> {
    setLoadingRuntime(getCSharpRuntimeStatus().state !== "ready");
    const { response, metrics } = await runCSharpInBrowser(code, harnessPreamble, callTemplate!, testCases, () =>
      setLoadingRuntime(false),
    );
    if (metrics) window.__csharpWasmMetrics = metrics;
    setRanOn({ metrics });
    await recordProgress(lessonId, "csharp", code, response.allPassed && response.compileError === null, mode);
    return response;
  }

  async function handleRun() {
    setRunning(true);
    setResult(null);
    setRanOn(null);
    try {
      let response: ExecuteResponse;
      try {
        if (!canRunInBrowser || !browserCSharpEnabled()) throw new CSharpWasmUnavailable(runtime.reason ?? "");
        response = await runInBrowser();
      } catch (err) {
        if (!(err instanceof CSharpWasmUnavailable)) throw err;
        throw new Error(`${UNAVAILABLE}${err.message ? ` (${err.message})` : ""}`);
      }
      setResult(response);
      onRan(response.allPassed);
      if (response.allPassed) onPassed();
    } catch (err) {
      setResult({
        allPassed: false,
        results: [],
        compileError: err instanceof Error ? err.message : "Unknown error while grading.",
      });
    } finally {
      setRunning(false);
      setLoadingRuntime(false);
    }
  }

  let runtimeNote: string | null = null;
  if (canRunInBrowser && runtime.state === "loading") runtimeNote = "Loading the C# compiler…";
  else if (!canRunInBrowser || runtime.state === "unavailable") runtimeNote = UNAVAILABLE;

  return (
    <div className="code-runner">
      <div className="editor-wrap">
        <Editor
          height="320px"
          language="csharp"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value ?? "")}
          onMount={(editor, monaco) => {
            attachCSharpCompletion(editor, monaco, harnessPreamble);
            // Live squiggles, compiled with the same calls a run makes.
            if (callTemplate) {
              const calls = testCases.map((t) => callTemplate.replace("{input}", t.inputDisplay));
              attachCSharpDiagnostics(editor, monaco, harnessPreamble, calls);
            }
          }}
          options={{ fontSize: 14, minimap: { enabled: false } }}
        />
      </div>

      <div className="code-runner-actions">
        <button onClick={handleRun} disabled={running}>
          {running ? (loadingRuntime ? "Loading C# compiler (first run only)…" : "Running…") : "▶ Run Tests"}
        </button>
        {runtimeNote && <span className="run-in-browser-status">{runtimeNote}</span>}
      </div>

      {ranOn && (
        <p className="run-in-browser-metrics">
          Ran in your browser
          {ranOn.metrics?.coldStart && ranOn.metrics.loadMs > 0 && ` · runtime load ${(ranOn.metrics.loadMs / 1000).toFixed(1)} s`}
          {ranOn.metrics?.compileMs != null && ` · compile ${Math.round(ranOn.metrics.compileMs)} ms`}
          {ranOn.metrics && ranOn.metrics.runMs.length > 0 &&
            ` · tests ${Math.round(ranOn.metrics.runMs.reduce((a, b) => a + b, 0))} ms`}
          {runtime.restarted &&
            ` · the run was stopped (a timeout, ${TEST_TIMEOUT_MS / 1000} s per test, or a crash) and the C# runtime restarted`}
        </p>
      )}

      {result && (
        <div className="results">
          {result.compileError && <pre className="compile-error">{result.compileError}</pre>}
          {result.results.map((r, i) => (
            <div key={i} className={`test-result ${r.passed ? "pass" : "fail"}`}>
              <span className="test-icon">{r.passed ? "✅" : "❌"}</span>
              <span>
                {functionName}({r.inputDisplay}) → expected <strong>{r.expectedJson}</strong>, got{" "}
                <strong>{r.actualJson ?? "—"}</strong>
                {r.error && <span className="test-error"> ({r.error})</span>}
              </span>
            </div>
          ))}
          {result.allPassed && <p className="all-passed">🎉 All tests passed — concept marked complete.</p>}
        </div>
      )}
    </div>
  );
}
