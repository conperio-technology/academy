import Editor from "@monaco-editor/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { executeCSharp, recordProgress } from "../api";
import { attachCSharpCompletion } from "../csharpCompletion";
import { attachCSharpDiagnostics } from "../csharpDiagnostics";
import {
  browserCSharpEnabled,
  type CSharpWasmMetrics,
  CSharpWasmUnavailable,
  getCSharpRuntimeStatus,
  runCSharpInBrowser,
  setCSharpRunMode,
  subscribeCSharpRuntime,
  TEST_TIMEOUT_MS,
  warmCSharpRuntime,
} from "../csharpWasmRunner";
import type { ExerciseMode } from "../bareStarter";
import { STATIC_MODE } from "../staticMode";
import type { ExecuteResponse, TestCaseDisplay } from "../types";

interface Props {
  lessonId: string;
  starterCode: string;
  functionName: string;
  onPassed: () => void;
  onRan: (passed: boolean) => void;
  // Which starter this attempt began from, recorded with the result (see api.ts).
  mode?: ExerciseMode;
  // For grading in the browser (csharpWasmRunner.ts): what the server would wrap the code in.
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

// Shown in static mode when the in-browser runtime can't be used: there is no server to fall back to.
const STATIC_UNAVAILABLE =
  "In-browser C# isn't available here, and this copy of the Academy has no server, so C# can't be graded. " +
  "A current desktop browser with WebAssembly works, or solve it in Python where the lesson offers it.";

// Where the last run was graded, for the line under the buttons.
type RanOn = { where: "browser"; metrics: CSharpWasmMetrics | null } | { where: "server"; fallbackReason: string | null };

// C# is graded in this browser by default (Roslyn on .NET WebAssembly, in a worker), with
// the server's runner as the fallback when the runtime can't load, or when the learner
// ticks "Run on server".
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
  const [ranOn, setRanOn] = useState<RanOn | null>(null);
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
    setRanOn({ where: "browser", metrics });
    // The server never saw this run, so record the outcome like the Python runner does.
    await recordProgress(lessonId, "csharp", code, response.allPassed && response.compileError === null, mode);
    return response;
  }

  async function runOnServer(fallbackReason: string | null) {
    setLoadingRuntime(false);
    // The static site has no server: say why the browser couldn't grade it instead.
    if (STATIC_MODE) throw new Error(`${STATIC_UNAVAILABLE}${fallbackReason ? ` (${fallbackReason})` : ""}`);
    const response = await executeCSharp(lessonId, code, mode);
    setRanOn({ where: "server", fallbackReason });
    return response;
  }

  async function handleRun() {
    setRunning(true);
    setResult(null);
    setRanOn(null);
    try {
      let response: ExecuteResponse;
      if (canRunInBrowser && browserCSharpEnabled()) {
        try {
          response = await runInBrowser();
        } catch (err) {
          if (!(err instanceof CSharpWasmUnavailable)) throw err;
          response = await runOnServer(err.message);
        }
      } else {
        response = await runOnServer(runtime.mode === "browser" ? runtime.reason : null);
      }
      setResult(response);
      onRan(response.allPassed);
      if (response.allPassed) onPassed();
    } catch (err) {
      setResult({
        allPassed: false,
        results: [],
        compileError: err instanceof Error ? err.message : "Unknown error contacting the server.",
      });
    } finally {
      setRunning(false);
      setLoadingRuntime(false);
    }
  }

  const browserMode = canRunInBrowser && runtime.mode === "browser";
  let runtimeNote: string | null = null;
  if (browserMode && runtime.state === "loading") runtimeNote = "Loading the C# compiler…";
  else if (STATIC_MODE && (!canRunInBrowser || runtime.state === "unavailable")) runtimeNote = STATIC_UNAVAILABLE;
  else if (browserMode && runtime.state === "unavailable") runtimeNote = "In-browser C# isn't available here, so runs use the server.";

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
            // Live squiggles, compiled with the same calls a run makes (browser mode only).
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
        {canRunInBrowser && !STATIC_MODE && (
          <label
            className="run-in-browser-toggle"
            title="Grade on the server instead of compiling with .NET WebAssembly in this tab"
          >
            <input
              type="checkbox"
              checked={runtime.mode === "server"}
              disabled={running}
              onChange={(e) => setCSharpRunMode(e.target.checked ? "server" : "browser")}
            />
            Run on server
          </label>
        )}
        {runtimeNote && <span className="run-in-browser-status">{runtimeNote}</span>}
      </div>

      {ranOn && (
        <p className="run-in-browser-metrics">
          {ranOn.where === "browser" ? (
            <>
              Ran in your browser
              {ranOn.metrics?.coldStart && ranOn.metrics.loadMs > 0 && ` · runtime load ${(ranOn.metrics.loadMs / 1000).toFixed(1)} s`}
              {ranOn.metrics?.compileMs != null && ` · compile ${Math.round(ranOn.metrics.compileMs)} ms`}
              {ranOn.metrics && ranOn.metrics.runMs.length > 0 &&
                ` · tests ${Math.round(ranOn.metrics.runMs.reduce((a, b) => a + b, 0))} ms`}
              {runtime.restarted &&
                ` · the run was stopped (a timeout, ${TEST_TIMEOUT_MS / 1000} s per test, or a crash) and the C# runtime restarted`}
            </>
          ) : (
            <>Ran on the server{ranOn.fallbackReason && ` (in-browser C# unavailable: ${ranOn.fallbackReason})`}</>
          )}
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
