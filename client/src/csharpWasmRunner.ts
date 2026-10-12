// The page side of csharpWasmWorker.ts: grades C# in this browser and shapes the outcome as
// an ExecuteResponse for CSharpRunner.tsx. Mirrors PythonRunner.tsx's worker handling. If the
// runtime can't load (not built, no WebAssembly, worker fails to start), runCSharpInBrowser
// throws CSharpWasmUnavailable and the page says C# can't be graded here.
import type { CSharpCompletion, CSharpDiagnostic, CSharpWasmRequest, CSharpWasmWorkerMessage } from "./csharpWasmWorker";
import { jsonEquals } from "./jsonEquals";
import type { ExecuteResponse, TestCaseDisplay } from "./types";

// Per-test limit, the same as Python's. Loading the runtime doesn't count; compiling gets a
// bigger budget.
export const TEST_TIMEOUT_MS = 5000;
const COMPILE_TIMEOUT_MS = 60000;
// Longest submission accepted. (Results are capped inside the runtime at
// RunnerLimits.MaxResultChars, wasm-csharp/RunnerProtocol.cs.)
const MAX_CODE_LENGTH = 20_000;
const COMPLETION_TIMEOUT_MS = 3000;
const DIAGNOSE_TIMEOUT_MS = 10000;
// A runtime that hasn't started after this long is treated as unavailable.
const LOAD_TIMEOUT_MS = 120000;

export interface CSharpWasmMetrics {
  coldStart: boolean;
  loadMs: number;
  compileMs: number | null;
  runMs: number[];
  totalMs: number;
  managedHeapBytes: number | null;
  wasmMemoryBytes: number | null;
}

export class CSharpWasmUnavailable extends Error {}

// ---- Status (for the loading indicator) ----

export type CSharpRuntimeState = "idle" | "loading" | "ready" | "unavailable";

export interface CSharpRuntimeStatus {
  state: CSharpRuntimeState;
  // Why the browser path isn't available, when state is "unavailable".
  reason: string | null;
  // Set after a run was stopped (timeout or crash) and the runtime restarted.
  restarted: boolean;
}

function unsupportedReason(): string | null {
  if (typeof WebAssembly !== "object") return "This browser doesn't support WebAssembly.";
  if (typeof Worker !== "function") return "This browser doesn't support Web Workers.";
  return null;
}

let status: CSharpRuntimeStatus = {
  state: unsupportedReason() ? "unavailable" : "idle",
  reason: unsupportedReason(),
  restarted: false,
};
const listeners = new Set<() => void>();

function setStatus(patch: Partial<CSharpRuntimeStatus>) {
  status = { ...status, ...patch };
  listeners.forEach((l) => l());
}

export function subscribeCSharpRuntime(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCSharpRuntimeStatus() {
  return status;
}

// False once the runtime has failed to load in this tab (or can't run here at all).
export function browserCSharpEnabled() {
  return status.state !== "unavailable";
}

// ---- The worker ----

type RunHandler = (m: CSharpWasmWorkerMessage) => void;

// One shared worker (so the runtime loads once per tab), replaced after a timeout or crash.
let worker: Worker | null = null;
let activeRun: { onMessage: RunHandler; onWorkerError: (message: string) => void } | null = null;
let cancelActive: (() => void) | null = null;
let nextCompletionId = 1;
const pendingCompletions = new Map<number, (items: CSharpCompletion[]) => void>();
let nextDiagnoseId = 1;
const pendingDiagnoses = new Map<number, (items: CSharpDiagnostic[] | null) => void>();

function markUnavailable(reason: string) {
  worker?.terminate();
  worker = null;
  flushCompletions();
  setStatus({ state: "unavailable", reason });
}

function flushCompletions() {
  for (const resolve of pendingCompletions.values()) resolve([]);
  pendingCompletions.clear();
  for (const resolve of pendingDiagnoses.values()) resolve(null);
  pendingDiagnoses.clear();
}

function getWorker(): Worker {
  if (worker) return worker;
  let w: Worker;
  try {
    w = new Worker(new URL("./csharpWasmWorker.ts", import.meta.url), { type: "module" });
  } catch (err) {
    throw new CSharpWasmUnavailable(err instanceof Error ? err.message : "The C# worker couldn't start.");
  }
  worker = w;
  if (status.state !== "ready") setStatus({ state: "loading" });
  w.onmessage = (e: MessageEvent<CSharpWasmWorkerMessage>) => {
    if (worker !== w) return;
    const m = e.data;
    if (m.type === "warmed") setStatus({ state: "ready" });
    else if (m.type === "unavailable") {
      const run = activeRun;
      markUnavailable(m.error);
      run?.onMessage(m);
    } else if (m.type === "completions") {
      pendingCompletions.get(m.id)?.(m.items);
      pendingCompletions.delete(m.id);
    } else if (m.type === "diagnostics") {
      pendingDiagnoses.get(m.id)?.(m.items);
      pendingDiagnoses.delete(m.id);
    } else if (m.type !== "loaded") activeRun?.onMessage(m);
  };
  w.onerror = (e) => {
    if (worker !== w) return;
    const message = e.message || "The C# worker failed.";
    if (status.state === "loading") {
      // Never got the runtime up: the worker script itself failed to load.
      const run = activeRun;
      markUnavailable(message);
      run?.onWorkerError(message);
    } else {
      activeRun?.onWorkerError(message);
    }
  };
  post(w, { type: "warm" });
  return w;
}

function post(w: Worker, request: CSharpWasmRequest) {
  w.postMessage(request);
}

// Stops the worker (a runaway loop can only be stopped this way) and starts loading a
// fresh one right away, so the next run doesn't wait for it.
function restartWorker() {
  worker?.terminate();
  worker = null;
  flushCompletions();
  setStatus({ state: "idle", restarted: true });
  warmCSharpRuntime();
}

// Starts loading (and warming up) the runtime in the background, e.g. when a C# exercise
// opens, so the first run doesn't pay for the download and the first compile.
export function warmCSharpRuntime() {
  if (!browserCSharpEnabled()) return;
  try {
    getWorker();
  } catch (err) {
    markUnavailable(err instanceof Error ? err.message : "The C# worker couldn't start.");
  }
}

type CallOutput = { actualJson: string | null; error: string | null };

interface WorkerOutcome {
  compileError: string | null;
  outputs: CallOutput[];
  metrics: CSharpWasmMetrics;
}

function runInWorker(code: string, calls: string[], onReady: () => void): Promise<WorkerOutcome> {
  cancelActive?.();
  const coldStart = status.state !== "ready";
  const w = getWorker();
  const started = performance.now();
  const metrics: CSharpWasmMetrics = {
    coldStart,
    loadMs: 0,
    compileMs: null,
    runMs: [],
    totalMs: 0,
    managedHeapBytes: null,
    wasmMemoryBytes: null,
  };
  return new Promise((resolve, reject) => {
    const outputs: CallOutput[] = [];
    let ready = false;
    let compiled = false;
    let timer: number | undefined;
    const finish = (restart: boolean) => {
      clearTimeout(timer);
      activeRun = null;
      cancelActive = null;
      metrics.totalMs = performance.now() - started;
      if (restart && worker === w) restartWorker();
    };
    const arm = (ms: number) => {
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        finish(true);
        if (compiled) {
          outputs.push({ actualJson: null, error: `Timed out after ${ms / 1000} s (infinite loop?)` });
          resolve({ compileError: null, outputs, metrics });
        } else {
          resolve({ compileError: `Timed out after ${ms / 1000} s compiling in the browser.`, outputs, metrics });
        }
      }, ms);
    };
    cancelActive = () => {
      finish(true);
      reject(new Error("Run cancelled."));
    };
    const crashed = (message: string) => {
      if (!ready) {
        finish(false);
        reject(new CSharpWasmUnavailable(message));
      } else if (compiled) {
        // The runtime died mid-test (very deep recursion, out of memory).
        finish(true);
        outputs.push({ actualJson: null, error: "The run crashed (very deep recursion, or using too much memory?)" });
        resolve({ compileError: null, outputs, metrics });
      } else {
        finish(true);
        reject(new Error(message));
      }
    };
    activeRun = {
      onWorkerError: crashed,
      onMessage: (m) => {
        if (m.type === "unavailable") {
          finish(false);
          reject(new CSharpWasmUnavailable(m.error));
        } else if (m.type === "ready") {
          ready = true;
          metrics.loadMs = m.loadMs;
          onReady();
          arm(COMPILE_TIMEOUT_MS);
        } else if (m.type === "compiled") {
          metrics.compileMs = m.compileMs;
          if (m.compileError !== null) {
            finish(false);
            resolve({ compileError: m.compileError, outputs, metrics });
            return;
          }
          compiled = true;
          arm(TEST_TIMEOUT_MS);
        } else if (m.type === "result") {
          metrics.runMs.push(m.runMs);
          outputs.push({ actualJson: m.actualJson, error: m.error });
          arm(TEST_TIMEOUT_MS);
        } else if (m.type === "done") {
          metrics.managedHeapBytes = m.managedHeapBytes;
          metrics.wasmMemoryBytes = m.wasmMemoryBytes;
          finish(false);
          resolve({ compileError: null, outputs, metrics });
        } else if (m.type === "failed") {
          crashed(m.error);
        }
      },
    };
    setStatus({ restarted: false });
    timer = window.setTimeout(() => {
      finish(false);
      markUnavailable("The in-browser C# runtime took too long to load.");
      reject(new CSharpWasmUnavailable("The in-browser C# runtime took too long to load."));
    }, LOAD_TIMEOUT_MS);
    post(w, { type: "run", code, calls });
  });
}

// Grades one submission in the browser. Throws CSharpWasmUnavailable when the runtime
// can't be used here.
export async function runCSharpInBrowser(
  code: string,
  preamble: string | null,
  callTemplate: string,
  testCases: TestCaseDisplay[],
  onReady: () => void,
): Promise<{ response: ExecuteResponse; metrics: CSharpWasmMetrics | null }> {
  if (!browserCSharpEnabled()) throw new CSharpWasmUnavailable(status.reason ?? "In-browser C# is off.");
  if (code.length > MAX_CODE_LENGTH) {
    const compileError = `Code is too long (limit ${MAX_CODE_LENGTH.toLocaleString("en-US")} characters).`;
    return { response: { allPassed: false, results: [], compileError }, metrics: null };
  }
  // The lesson preamble, then the learner's code; one call per test.
  const fullCode = (preamble ? preamble + "\n" : "") + code;
  const calls = testCases.map((t) => callTemplate.replace("{input}", t.inputDisplay));
  const { compileError, outputs, metrics } = await runInWorker(fullCode, calls, onReady);
  if (compileError !== null) return { response: { allPassed: false, results: [], compileError }, metrics };

  const results = testCases.map((test, i) => {
    const output = outputs[i];
    return {
      inputDisplay: test.inputDisplay,
      expectedJson: test.expectedJson,
      actualJson: output?.actualJson ?? null,
      passed: output?.actualJson != null && jsonEquals(output.actualJson, test.expectedJson),
      error: output ? output.error : "Skipped -- an earlier test didn't finish",
    };
  });
  return { response: { allPassed: results.every((r) => r.passed), results, compileError: null }, metrics };
}

// ---- Autocomplete ----

// Completion items at `offset` in the learner's code (the lesson preamble is prepended,
// hidden, so its helpers show up too). Empty when the runtime isn't loaded or available;
// this never starts a download by itself beyond what warmCSharpRuntime does.
export function completeCSharp(preamble: string | null, code: string, offset: number): Promise<CSharpCompletion[]> {
  if (!browserCSharpEnabled() || !worker) return Promise.resolve([]);
  const w = worker;
  const prefix = preamble ? preamble + "\n" : "";
  const id = nextCompletionId++;
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      pendingCompletions.delete(id);
      resolve([]);
    }, COMPLETION_TIMEOUT_MS);
    pendingCompletions.set(id, (items) => {
      clearTimeout(timer);
      resolve(items);
    });
    post(w, { type: "complete", id, code: prefix + code, position: prefix.length + offset });
  });
}

// ---- Live diagnostics ----

// Compile errors, warnings and CodePolicy violations for the learner's code, compiled with
// the lesson preamble and the tests' calls exactly as a run would be (offsets are into
// `code`). Null when there's no answer right now: the runtime isn't loaded and warm, or
// a run is in progress (grading always goes first). Never
// starts the runtime by itself.
export function diagnoseCSharp(preamble: string | null, code: string, calls: string[]): Promise<CSharpDiagnostic[] | null> {
  if (!browserCSharpEnabled() || !worker || status.state !== "ready" || activeRun) return Promise.resolve(null);
  if (code.length > MAX_CODE_LENGTH) return Promise.resolve(null);
  const w = worker;
  const id = nextDiagnoseId++;
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      pendingDiagnoses.delete(id);
      resolve(null);
    }, DIAGNOSE_TIMEOUT_MS);
    pendingDiagnoses.set(id, (items) => {
      clearTimeout(timer);
      resolve(items);
    });
    post(w, { type: "diagnose", id, prefix: preamble ? preamble + "\n" : "", code, calls });
  });
}

export type { CSharpCompletion, CSharpDiagnostic };
