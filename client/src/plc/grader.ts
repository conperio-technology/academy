// Grades an exercise's ST against a scripted input sequence over simulated time,
// checking the outputs on every scan. Runs the same ScanSim as the simulator.

import { formatValue, type StError, type Value } from "./st.ts";
import { buildSim, type IoDef, type Plant, type TraceRow } from "./sim.ts";

export type Expected = Value | { approx: number; tol: number };
export type Expect = Record<string, Expected>;

export interface TestStep {
  label: string; // what happens in this step, in plain words
  set?: Record<string, Value>; // physical inputs changed at the start of the step
  ms: number; // how long the step runs (whole scans)
  hold?: Expect; // must be true on every scan of the step
  end?: Expect; // must be true on the step's last scan
  check?: (rows: TraceRow[]) => string | null; // custom check over this step's scans
  why?: string; // the requirement behind the check, shown when it fails
}

export interface StepResult {
  label: string;
  ok: boolean;
  message?: string;
  why?: string;
}

export interface GradeResult {
  ok: boolean;
  errors: StError[];
  fault?: { message: string; line: number; t: number };
  steps: StepResult[];
  trace: TraceRow[];
  failAt?: number; // ms
  totalMs: number;
}

function matches(actual: Value, want: Expected): boolean {
  if (typeof want === "object") return typeof actual === "number" && Math.abs(actual - want.approx) <= want.tol;
  return actual === want;
}

function show(want: Expected, io: IoDef | undefined): string {
  if (typeof want === "object") return `${formatValue(want.approx, "REAL")} (within ${want.tol})`;
  return formatValue(want, io?.type ?? (typeof want === "boolean" ? "BOOL" : "INT"));
}

export function seconds(ms: number) {
  return `${(ms / 1000).toFixed(ms % 10 === 0 ? 2 : 3)} s`;
}

export function grade(source: string, io: IoDef[], scanMs: number, steps: TestStep[], opts: { plant?: Plant; extra?: string[] } = {}): GradeResult {
  const totalMs = steps.reduce((n, s) => n + s.ms, 0);
  const built = buildSim(source, io, scanMs, { ...opts, traceLimit: 100000 });
  if (!built.sim) return { ok: false, errors: built.errors, steps: [], trace: [], totalMs };
  const sim = built.sim;
  const byName = new Map(io.map((d) => [d.name, d]));
  const results: StepResult[] = [];
  for (const step of steps) {
    for (const [k, v] of Object.entries(step.set ?? {})) sim.setInput(k, v);
    const n = Math.max(1, Math.round(step.ms / scanMs));
    const rows: TraceRow[] = [];
    let message: string | undefined;
    for (let i = 0; i < n && !message; i++) {
      sim.stepScan();
      if (sim.fault) {
        return { ok: false, errors: [], fault: sim.fault, steps: [...results, { label: step.label, ok: false, message: sim.fault.message }], trace: sim.trace, failAt: sim.fault.t, totalMs };
      }
      const row = sim.trace[sim.trace.length - 1];
      rows.push(row);
      const checks: [Expect | undefined, boolean][] = [[step.hold, true], [step.end, i === n - 1]];
      for (const [exp, active] of checks) {
        if (!exp || !active || message) continue;
        for (const [name, want] of Object.entries(exp)) {
          const got = row.values[name];
          if (!matches(got, want)) {
            const d = byName.get(name);
            message = `At ${seconds(row.t)} (scan ${row.scan + 1}): expected ${name} = ${show(want, d)}, but it was ${formatValue(got, d?.type ?? "BOOL")}.`;
            break;
          }
        }
      }
    }
    if (!message && step.check) {
      const m = step.check(rows);
      if (m) message = m;
    }
    if (message) {
      results.push({ label: step.label, ok: false, message, why: step.why });
      const last = sim.trace[sim.trace.length - 1];
      return { ok: false, errors: [], steps: results, trace: sim.trace, failAt: last?.t, totalMs };
    }
    results.push({ label: step.label, ok: true });
  }
  return { ok: true, errors: [], steps: results, trace: sim.trace, totalMs };
}

// ---- Helpers for custom checks ----

// Runs of a BOOL signal within some rows: [{ value, start, end }] where end is the time
// the value changed (or the last row's time plus one scan).
export function runsOf(rows: TraceRow[], name: string, scanMs: number) {
  const out: { value: boolean; start: number; end: number }[] = [];
  for (const r of rows) {
    const v = r.values[name] as boolean;
    const last = out[out.length - 1];
    if (last && last.value === v) last.end = r.t + scanMs;
    else out.push({ value: v, start: r.t, end: r.t + scanMs });
  }
  return out;
}
