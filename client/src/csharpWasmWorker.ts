// Compiles and runs learner C# in this Web Worker with Roslyn on the .NET WebAssembly
// runtime (wasm-csharp/, see its README). The runtime is published by wasm-csharp/build.sh
// into client/public/csharp-wasm/ (gitignored) and loaded from there at runtime, not
// bundled by Vite. Like pythonWorker.ts, it runs off the page's thread so the page
// (csharpWasmRunner.ts) can stop a runaway loop by terminating it.
//
// Messages are handled one at a time, in order: a "run" sent while "warm" is still
// compiling waits for it, and so do "complete" and "diagnose". (Each is synchronous once
// the runtime is up, so a message is handled as soon as it arrives; the page keeps stale
// diagnose requests from being sent at all, see csharpDiagnostics.ts.)

export type CSharpWasmRequest =
  // Load the runtime and compile a trivial snippet, so Roslyn is warm before the first run.
  | { type: "warm" }
  | { type: "run"; code: string; calls: string[] }
  // Autocomplete at `position` (a character offset into `code`).
  | { type: "complete"; id: number; code: string; position: number }
  // Live diagnostics for the editor: compile `prefix + code` with `calls` exactly as a run
  // would, without emitting or running it. Offsets in the answer are into `code`.
  | { type: "diagnose"; id: number; prefix: string; code: string; calls: string[] };

export interface CSharpDiagnostic {
  severity: "error" | "warning";
  id: string;
  message: string;
  start: number;
  end: number;
}

export interface CSharpCompletion {
  label: string;
  kind: string;
  detail: string;
}

// For a run: "ready" once the runtime is up, "compiled" after Roslyn (a compile error or
// policy violation ends the run there), then one "result" per call in order, then "done".
// "unavailable" means the runtime couldn't be loaded at all (not built, no WebAssembly...),
// and the page says C# can't be graded here.
export type CSharpWasmWorkerMessage =
  | { type: "loaded"; loadMs: number }
  | { type: "warmed"; compileMs: number }
  | { type: "unavailable"; error: string }
  | { type: "ready"; loadMs: number }
  | { type: "compiled"; compileError: string | null; compileMs: number }
  | { type: "result"; actualJson: string | null; error: string | null; runMs: number }
  | { type: "done"; managedHeapBytes: number; wasmMemoryBytes: number | null }
  | { type: "failed"; error: string }
  | { type: "completions"; id: number; items: CSharpCompletion[] }
  | { type: "diagnostics"; id: number; items: CSharpDiagnostic[]; ms: number };

interface RunLine {
  compileError: string | null;
  actualJson: string | null;
  error: string | null;
}

interface RunnerExports {
  Compile: (code: string, calls: string[]) => string;
  RunTest: (index: number) => string;
  Complete: (code: string, position: number) => string;
  Diagnose: (prefix: string, code: string, calls: string[]) => string;
  ManagedHeapBytes: () => number;
}

interface DotnetRuntime {
  getAssemblyExports: (name: string) => Promise<{ DsaAcademy: { CSharpWasm: { Runner: RunnerExports } } }>;
  Module?: { HEAPU8?: Uint8Array };
}

interface DotnetHostBuilder {
  withConfig: (config: Record<string, unknown>) => DotnetHostBuilder;
  create: () => Promise<DotnetRuntime>;
}

interface DotnetModule {
  dotnet: DotnetHostBuilder;
}

// Under the site's base path (e.g. /academy/ on a static host). A relative base ("./", the
// static build's default) resolves against this worker's own script, which Vite puts in
// assets/ (and serves from src/ in dev), one level below the site root either way.
const BASE = import.meta.env.BASE_URL;
const FRAMEWORK_URL = (
  BASE.startsWith("/")
    ? new URL(`${BASE}csharp-wasm/_framework/dotnet.js`, self.location.origin)
    : new URL("../csharp-wasm/_framework/dotnet.js", self.location.href)
).href;

let runtimePromise: Promise<{ runtime: DotnetRuntime; runner: RunnerExports }> | null = null;
let loadMs = 0;

function getRunner() {
  // dotnet.js treats any worker as one of its own multithreading helper threads (and
  // waits forever for a main thread that never talks to it) unless this is set: it
  // marks the runtime as running *in* a worker, which is what we want.
  (self as unknown as { dotnetSidecar: boolean }).dotnetSidecar = true;
  if (runtimePromise) return runtimePromise;
  const start = performance.now();
  if (typeof WebAssembly !== "object") {
    return (runtimePromise = Promise.reject(new Error("This browser doesn't support WebAssembly.")));
  }
  runtimePromise = (import(/* @vite-ignore */ FRAMEWORK_URL) as Promise<DotnetModule>)
    .catch(() => {
      throw new Error("The in-browser C# runtime isn't deployed here (run wasm-csharp/build.sh before building the client).");
    })
    .then(async (mod) => {
      // The runtime's files are fingerprinted, so let the browser's HTTP cache answer for
      // them instead of the loader's default of revalidating every file (cache: "no-cache").
      const runtime = await mod.dotnet.withConfig({ disableNoCacheFetch: true }).create();
      const exports = await runtime.getAssemblyExports("CSharpWasm");
      loadMs = performance.now() - start;
      post({ type: "loaded", loadMs });
      return { runtime, runner: exports.DsaAcademy.CSharpWasm.Runner };
    });
  return runtimePromise;
}

function post(message: CSharpWasmWorkerMessage) {
  self.postMessage(message);
}

let warmed = false;

async function handle(request: CSharpWasmRequest) {
  let loaded: Awaited<ReturnType<typeof getRunner>>;
  try {
    loaded = await getRunner();
  } catch (err) {
    post({ type: "unavailable", error: err instanceof Error ? err.message : "The in-browser C# runtime failed to load." });
    return;
  }
  const { runtime, runner } = loaded;

  if (request.type === "warm") {
    if (warmed) return;
    warmed = true;
    const start = performance.now();
    runner.Compile("int Warm(int[] a) => a.Where(x => x > 0).Sum();", ["Warm(new[] { 1, 2 })"]);
    post({ type: "warmed", compileMs: performance.now() - start });
    return;
  }

  if (request.type === "diagnose") {
    const start = performance.now();
    let items: CSharpDiagnostic[] = [];
    try {
      items = JSON.parse(runner.Diagnose(request.prefix, request.code, request.calls)) as CSharpDiagnostic[];
    } catch {
      // No squiggles rather than an error.
    }
    post({ type: "diagnostics", id: request.id, items, ms: performance.now() - start });
    return;
  }

  if (request.type === "complete") {
    let items: CSharpCompletion[] = [];
    try {
      items = JSON.parse(runner.Complete(request.code, request.position)) as CSharpCompletion[];
    } catch {
      // An empty list: the editor falls back to nothing rather than an error.
    }
    post({ type: "completions", id: request.id, items });
    return;
  }

  try {
    post({ type: "ready", loadMs });
    const compileStart = performance.now();
    const compiled = JSON.parse(runner.Compile(request.code, request.calls)) as RunLine;
    post({ type: "compiled", compileError: compiled.compileError, compileMs: performance.now() - compileStart });
    if (compiled.compileError === null) {
      for (let i = 0; i < request.calls.length; i++) {
        const start = performance.now();
        const line = JSON.parse(runner.RunTest(i)) as RunLine;
        post({ type: "result", actualJson: line.actualJson, error: line.error, runMs: performance.now() - start });
      }
    }
    post({
      type: "done",
      managedHeapBytes: runner.ManagedHeapBytes(),
      wasmMemoryBytes: runtime.Module?.HEAPU8?.length ?? null,
    });
  } catch (err) {
    post({ type: "failed", error: err instanceof Error ? err.message : "Failed to run C# in the browser." });
  }
}

let queue: Promise<void> = Promise.resolve();
self.onmessage = (event: MessageEvent<CSharpWasmRequest>) => {
  const request = event.data;
  queue = queue.then(() => handle(request));
};
