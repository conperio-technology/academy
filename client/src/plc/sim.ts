// The scan-cycle engine behind the PLC simulator and the exercise grader.
//
// A scan has four phases, run in order forever:
//   0 read inputs   copy every physical input into the input image (the program's inputs)
//   1 execute       run the ST program once, top to bottom, at the scan's clock time
//   2 write outputs copy the program's output variables to the physical outputs
//   3 housekeeping  advance the simulated clock by one scan time; plant model runs here
// The clock is simulated (a fixed scanMs per scan), so timers are deterministic.

import { compile, Runtime, StError, StRuntimeError, type ElemType, type IoDecl, type Program, type Value } from "./st.ts";

export type IoWidget = "button" | "nc-button" | "switch" | "slider" | "lamp" | "motor" | "value";

export interface IoDef {
  name: string;
  type: "BOOL" | "INT" | "REAL";
  dir: "in" | "out";
  label: string;
  widget: IoWidget;
  init?: Value; // physical input's starting value (an NC button defaults to TRUE)
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  color?: "red" | "yellow" | "green" | "amber" | "white" | "blue";
  breakable?: boolean; // show a "cut the wire" control: a cut wire reads FALSE (or 0)
}

// A tiny model of the machine, run in housekeeping: it reads the physical outputs and
// updates the physical inputs it drives (a tank level rising while the pump runs, say).
export interface Plant {
  drives: string[];
  init: () => Record<string, Value>;
  step: (inputs: Record<string, Value>, outputs: Record<string, Value>, dtMs: number) => void;
  note?: string;
}

export const PHASES = ["Read inputs", "Execute program", "Write outputs", "Housekeeping"] as const;

export interface TraceRow {
  scan: number;
  t: number; // scan start time, ms
  values: Record<string, Value>; // inputs as the program saw them, outputs as written, plus extra signals
}

export interface Fault {
  message: string;
  line: number;
  t: number;
}

export function ioDecls(io: IoDef[]): IoDecl[] {
  return io.map((d) => ({ name: d.name, type: d.type as ElemType, dir: d.dir, init: d.type === "BOOL" ? false : 0 }));
}

function physicalDefault(d: IoDef): Value {
  if (d.init !== undefined) return d.init;
  if (d.widget === "nc-button") return true;
  return d.type === "BOOL" ? false : 0;
}

export class ScanSim {
  io: IoDef[];
  prog: Program;
  rt: Runtime;
  scanMs: number;
  plant?: Plant;
  extra: string[]; // additional signals to record (like "t1.Q")
  phase = 0;
  clock = 0;
  scans = 0;
  fault: Fault | null = null;
  inputs: Record<string, Value> = {}; // physical (field) inputs
  outputs: Record<string, Value> = {}; // physical outputs
  trace: TraceRow[] = [];
  traceLimit: number;

  constructor(prog: Program, io: IoDef[], scanMs: number, opts: { plant?: Plant; extra?: string[]; traceLimit?: number } = {}) {
    this.prog = prog;
    this.io = io;
    this.scanMs = scanMs;
    this.plant = opts.plant;
    this.extra = opts.extra ?? [];
    this.traceLimit = opts.traceLimit ?? 4000;
    this.rt = new Runtime(prog);
    this.powerCycle();
  }

  // Back to power-up: variables to their initial values, clock to zero.
  powerCycle() {
    this.rt.reset();
    this.phase = 0;
    this.clock = 0;
    this.scans = 0;
    this.fault = null;
    this.trace = [];
    this.inputs = {};
    this.outputs = {};
    for (const d of this.io) {
      if (d.dir === "in") this.inputs[d.name] = physicalDefault(d);
      else this.outputs[d.name] = d.type === "BOOL" ? false : 0;
    }
    if (this.plant) Object.assign(this.inputs, this.plant.init());
  }

  setInput(name: string, v: Value) {
    this.inputs[name] = v;
  }

  stepPhase() {
    if (this.fault) return;
    switch (this.phase) {
      case 0:
        for (const d of this.io) if (d.dir === "in") this.rt.set(d.name, d.type === "REAL" ? Math.fround(this.inputs[d.name] as number) : this.inputs[d.name]);
        break;
      case 1:
        try {
          this.rt.scan(this.clock);
        } catch (e) {
          if (e instanceof StRuntimeError) {
            this.fault = { message: e.message, line: e.line, t: this.clock };
            for (const d of this.io) if (d.dir === "out") this.outputs[d.name] = d.type === "BOOL" ? false : 0;
            return;
          }
          throw e;
        }
        break;
      case 2: {
        for (const d of this.io) if (d.dir === "out") this.outputs[d.name] = this.rt.get(d.name)!;
        const values: Record<string, Value> = {};
        for (const d of this.io) values[d.name] = this.rt.get(d.name)!;
        for (const x of this.extra) {
          const v = this.rt.read(x);
          if (v !== undefined) values[x] = v;
        }
        this.trace.push({ scan: this.scans, t: this.clock, values });
        if (this.trace.length > this.traceLimit) this.trace.splice(0, this.trace.length - this.traceLimit);
        break;
      }
      case 3:
        if (this.plant) this.plant.step(this.inputs, this.outputs, this.scanMs);
        this.clock += this.scanMs;
        this.scans++;
        break;
    }
    this.phase = (this.phase + 1) % 4;
  }

  // Finishes the current scan (or runs one whole scan from the start).
  stepScan() {
    do this.stepPhase();
    while (this.phase !== 0 && !this.fault);
  }
}

export interface Built {
  sim?: ScanSim;
  errors: StError[];
}

export function buildSim(source: string, io: IoDef[], scanMs: number, opts: { plant?: Plant; extra?: string[]; traceLimit?: number } = {}): Built {
  const { program, errors } = compile(source, ioDecls(io));
  if (!program) return { errors };
  return { sim: new ScanSim(program, io, scanMs, opts), errors: [] };
}

// ---- Plant models ----

// A tank: the pump fills it, a drain (always open, or switched by an output) empties it.
// Level is a REAL input in percent.
export function tankPlant(opts: { level: string; pump: string; drain?: string; fillPerS: number; drainPerS: number; start: number }): Plant {
  return {
    drives: [opts.level],
    init: () => ({ [opts.level]: opts.start }),
    step: (inputs, outputs, dt) => {
      let lvl = inputs[opts.level] as number;
      if (outputs[opts.pump]) lvl += (opts.fillPerS * dt) / 1000;
      if (!opts.drain || outputs[opts.drain]) lvl -= (opts.drainPerS * dt) / 1000;
      inputs[opts.level] = Math.min(100, Math.max(0, Math.round(lvl * 1000) / 1000));
    },
    note: `The level is simulated: the pump adds ${opts.fillPerS} % per second${opts.drain ? `, the drain valve removes ${opts.drainPerS} % per second while open` : `, and ${opts.drainPerS} % per second always drains out`}.`,
  };
}
