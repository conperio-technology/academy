// Live error squiggles for the C# editors: a short pause after typing, the in-browser C#
// worker compiles the code exactly as a run would (lesson preamble + learner code + the
// tests' calls, see wasm-csharp/Program.cs Diagnose) and checks it with CodePolicy, and the
// errors and warnings become Monaco markers on the learner's own lines. Only while the
// runtime is warm; with no runtime it does nothing (and clears any markers). One request per editor is in flight at a time, edits
// made meanwhile are checked when it returns, and a run always goes before a check.
import type { Monaco, OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
import { diagnoseCSharp, getCSharpRuntimeStatus, subscribeCSharpRuntime } from "./csharpWasmRunner";

type Editor = Parameters<OnMount>[0];

const DEBOUNCE_MS = 600;
// After a check got no answer because a run was in progress.
const RETRY_MS = 1500;
const OWNER = "csharp-roslyn";

export function attachCSharpDiagnostics(editor: Editor, monaco: Monaco, preamble: string | null, calls: string[]) {
  const model = editor.getModel();
  if (!model) return;
  let timer: number | undefined;
  let inFlight = false;
  let checkedVersion = -1;
  let disposed = false;

  const enabled = () => {
    const s = getCSharpRuntimeStatus();
    return s.state !== "unavailable";
  };
  const schedule = (ms: number) => {
    clearTimeout(timer);
    timer = window.setTimeout(check, ms);
  };

  async function check() {
    if (disposed || model!.isDisposed()) return;
    if (!enabled()) {
      monaco.editor.setModelMarkers(model!, OWNER, []);
      checkedVersion = -1;
      return;
    }
    const version = model!.getVersionId();
    if (inFlight || version === checkedVersion) return;
    inFlight = true;
    const code = model!.getValue();
    const items = await diagnoseCSharp(preamble, code, calls);
    inFlight = false;
    if (disposed || model!.isDisposed()) return;
    if (items === null) {
      // Not loaded yet: the status subscription below tries again once it is ready.
      if (getCSharpRuntimeStatus().state === "ready") schedule(RETRY_MS);
      return;
    }
    if (model!.getVersionId() !== version) {
      schedule(DEBOUNCE_MS); // edited while compiling: these positions are stale
      return;
    }
    checkedVersion = version;
    const length = code.length;
    const markers: MonacoEditor.IMarkerData[] = items.map((d) => {
      // A zero-width span ("; expected") gets one character so the squiggle shows.
      let { start, end } = d;
      if (end <= start) {
        if (start < length) end = start + 1;
        else start = Math.max(0, length - 1);
      }
      const from = model!.getPositionAt(start);
      const to = model!.getPositionAt(end);
      return {
        severity: d.severity === "error" ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
        message: d.message,
        code: d.id === "policy" ? "CodePolicy" : d.id,
        startLineNumber: from.lineNumber,
        startColumn: from.column,
        endLineNumber: to.lineNumber,
        endColumn: to.column,
      };
    });
    monaco.editor.setModelMarkers(model!, OWNER, markers);
  }

  const changes = model.onDidChangeContent(() => schedule(DEBOUNCE_MS));
  const unsubscribe = subscribeCSharpRuntime(() => schedule(DEBOUNCE_MS));
  editor.onDidDispose(() => {
    disposed = true;
    clearTimeout(timer);
    changes.dispose();
    unsubscribe();
  });
  schedule(DEBOUNCE_MS);
}
