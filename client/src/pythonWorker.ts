// Runs learner Python off the page's main thread, so PythonRunner.tsx can stop a runaway
// loop by terminating this worker (and starting a fresh one for the next run).
import { getPyodide } from "./pyodideLoader";

export interface PythonRunRequest {
  preamble: string;
  code: string;
  calls: string[];
}

// "ready" once the runtime has loaded, then one "result" per call in order (like the C#
// runner's one line per test, so a timeout keeps the results before it), then "done".
export type PythonWorkerMessage =
  | { type: "ready" }
  | { type: "result"; actualJson: string | null; error: string | null }
  | { type: "done" }
  | { type: "failed"; error: string };

function post(message: PythonWorkerMessage) {
  self.postMessage(message);
}

self.onmessage = async (event: MessageEvent<PythonRunRequest>) => {
  const { preamble, code, calls } = event.data;
  try {
    const pyodide = await getPyodide();
    post({ type: "ready" });
    for (const call of calls) {
      // Fresh globals for every test, like C#'s fresh script per test: nothing defined by
      // an earlier test or run (a since-renamed function, say) can leak into this one.
      const globals = pyodide.globals.get("dict")();
      globals.set("__name__", "__main__");
      try {
        const actual = await pyodide.runPythonAsync(`${preamble}${code}\nimport json\njson.dumps(${call})`, { globals });
        post({ type: "result", actualJson: typeof actual === "string" ? actual : String(actual), error: null });
      } catch (err) {
        post({
          type: "result",
          actualJson: null,
          error: err instanceof Error ? err.message.split("\n").slice(-2).join(" ") : String(err),
        });
      } finally {
        globals.destroy();
      }
    }
    post({ type: "done" });
  } catch (err) {
    post({ type: "failed", error: err instanceof Error ? err.message : "Failed to load Python." });
  }
};
