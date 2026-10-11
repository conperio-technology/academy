// The IEC 61131-3 standard function blocks the ST interpreter supports, with the
// standard's semantics. Each instance keeps its own memory between calls, and inputs
// not given in a call keep their previous value (as in IEC).
//
// Timers read the simulated clock (`now`, in ms) passed in by the runtime: the scan's
// start time, so every timer called in one scan sees the same time and runs are
// perfectly repeatable.

export type FbType = "TON" | "TOF" | "TP" | "CTU" | "CTD" | "CTUD" | "R_TRIG" | "F_TRIG" | "SR" | "RS";
type PinType = "BOOL" | "INT" | "TIME";

export interface FbDef {
  inputs: [string, PinType][];
  outputs: [string, PinType][];
  summary: string;
}

export const FB_DEFS: Record<FbType, FbDef> = {
  TON: { inputs: [["IN", "BOOL"], ["PT", "TIME"]], outputs: [["Q", "BOOL"], ["ET", "TIME"]], summary: "On-delay timer" },
  TOF: { inputs: [["IN", "BOOL"], ["PT", "TIME"]], outputs: [["Q", "BOOL"], ["ET", "TIME"]], summary: "Off-delay timer" },
  TP: { inputs: [["IN", "BOOL"], ["PT", "TIME"]], outputs: [["Q", "BOOL"], ["ET", "TIME"]], summary: "Pulse timer" },
  CTU: { inputs: [["CU", "BOOL"], ["R", "BOOL"], ["PV", "INT"]], outputs: [["Q", "BOOL"], ["CV", "INT"]], summary: "Up counter" },
  CTD: { inputs: [["CD", "BOOL"], ["LD", "BOOL"], ["PV", "INT"]], outputs: [["Q", "BOOL"], ["CV", "INT"]], summary: "Down counter" },
  CTUD: {
    inputs: [["CU", "BOOL"], ["CD", "BOOL"], ["R", "BOOL"], ["LD", "BOOL"], ["PV", "INT"]],
    outputs: [["QU", "BOOL"], ["QD", "BOOL"], ["CV", "INT"]],
    summary: "Up/down counter",
  },
  R_TRIG: { inputs: [["CLK", "BOOL"]], outputs: [["Q", "BOOL"]], summary: "Rising edge detector" },
  F_TRIG: { inputs: [["CLK", "BOOL"]], outputs: [["Q", "BOOL"]], summary: "Falling edge detector" },
  SR: { inputs: [["S1", "BOOL"], ["R", "BOOL"]], outputs: [["Q1", "BOOL"]], summary: "Set-dominant bistable" },
  RS: { inputs: [["S", "BOOL"], ["R1", "BOOL"]], outputs: [["Q1", "BOOL"]], summary: "Reset-dominant bistable" },
};

export interface FbState {
  type: FbType;
  inputs: Record<string, boolean | number>;
  outputs: Record<string, boolean | number>;
  mem: { prev: boolean; prev2: boolean; running: boolean; start: number };
}

const PV_MAX = 32767;
const PV_MIN = -32768;

export function newFbState(type: FbType): FbState {
  const def = FB_DEFS[type];
  const zero = (t: PinType) => (t === "BOOL" ? false : 0);
  return {
    type,
    inputs: Object.fromEntries(def.inputs.map(([n, t]) => [n, zero(t)])),
    outputs: Object.fromEntries(def.outputs.map(([n, t]) => [n, zero(t)])),
    // prev: the last CLK/IN/CU seen (edge memory); prev2: the last CD. Starting FALSE
    // means F_TRIG doesn't fire on the first scan (IEC writes its memory as M := NOT CLK
    // with M initially TRUE, which is the same thing).
    mem: { prev: false, prev2: false, running: false, start: 0 },
  };
}

export function runFb(fb: FbState, now: number) {
  const i = fb.inputs;
  const o = fb.outputs;
  const m = fb.mem;
  switch (fb.type) {
    case "TON": {
      // Q goes TRUE once IN has been TRUE continuously for PT. ET counts up from 0 while
      // IN is TRUE and stops at PT. IN going FALSE resets both Q and ET at once.
      const pt = Math.max(0, i.PT as number);
      if (i.IN) {
        if (!m.running) {
          m.running = true;
          m.start = now;
        }
        const et = Math.min(now - m.start, pt);
        o.ET = et;
        o.Q = et >= pt;
      } else {
        m.running = false;
        o.ET = 0;
        o.Q = false;
      }
      return;
    }
    case "TOF": {
      // Q is TRUE while IN is TRUE and stays TRUE for PT after IN goes FALSE. ET counts
      // from the falling edge and holds at PT once Q has dropped, until IN returns.
      const pt = Math.max(0, i.PT as number);
      if (i.IN) {
        m.running = false;
        o.Q = true;
        o.ET = 0;
      } else {
        if (m.prev) {
          m.running = true;
          m.start = now;
        }
        if (m.running) {
          const et = Math.min(now - m.start, pt);
          o.ET = et;
          if (et >= pt) {
            o.Q = false;
            m.running = false;
          } else o.Q = true;
        } else o.Q = false;
      }
      m.prev = i.IN as boolean;
      return;
    }
    case "TP": {
      // A rising edge on IN starts a pulse of exactly PT. While the pulse runs, IN is
      // ignored (no retrigger). After the pulse, ET holds at PT until IN is FALSE.
      const pt = Math.max(0, i.PT as number);
      if (!m.running && i.IN && !m.prev && pt > 0) {
        m.running = true;
        m.start = now;
      }
      if (m.running) {
        const et = Math.min(now - m.start, pt);
        o.ET = et;
        if (et >= pt) {
          m.running = false;
          o.Q = false;
        } else o.Q = true;
      }
      if (!m.running) {
        o.Q = false;
        if (!i.IN) o.ET = 0;
      }
      m.prev = i.IN as boolean;
      return;
    }
    case "CTU": {
      // R resets CV to 0 (and wins). Otherwise each rising edge of CU adds 1, up to
      // the INT maximum. Q = CV >= PV.
      const edge = (i.CU as boolean) && !m.prev;
      m.prev = i.CU as boolean;
      if (i.R) o.CV = 0;
      else if (edge && (o.CV as number) < PV_MAX) o.CV = (o.CV as number) + 1;
      o.Q = (o.CV as number) >= (i.PV as number);
      return;
    }
    case "CTD": {
      // LD loads CV with PV (and wins). Otherwise each rising edge of CD subtracts 1,
      // down to the INT minimum. Q = CV <= 0.
      const edge = (i.CD as boolean) && !m.prev;
      m.prev = i.CD as boolean;
      if (i.LD) o.CV = i.PV as number;
      else if (edge && (o.CV as number) > PV_MIN) o.CV = (o.CV as number) - 1;
      o.Q = (o.CV as number) <= 0;
      return;
    }
    case "CTUD": {
      // R wins over LD, LD over counting. Simultaneous CU and CD edges cancel out.
      const up = (i.CU as boolean) && !m.prev;
      const down = (i.CD as boolean) && !m.prev2;
      m.prev = i.CU as boolean;
      m.prev2 = i.CD as boolean;
      if (i.R) o.CV = 0;
      else if (i.LD) o.CV = i.PV as number;
      else if (!(up && down)) {
        if (up && (o.CV as number) < PV_MAX) o.CV = (o.CV as number) + 1;
        else if (down && (o.CV as number) > PV_MIN) o.CV = (o.CV as number) - 1;
      }
      o.QU = (o.CV as number) >= (i.PV as number);
      o.QD = (o.CV as number) <= 0;
      return;
    }
    case "R_TRIG":
      // Q is TRUE for exactly one call when CLK goes FALSE -> TRUE. The memory starts
      // FALSE, so a CLK that is already TRUE on the very first scan counts as an edge.
      o.Q = (i.CLK as boolean) && !m.prev;
      m.prev = i.CLK as boolean;
      return;
    case "F_TRIG":
      // Q is TRUE for exactly one call when CLK goes TRUE -> FALSE.
      o.Q = !i.CLK && m.prev;
      m.prev = i.CLK as boolean;
      return;
    case "SR":
      // Set dominant: Q1 := S1 OR (NOT R AND Q1)
      o.Q1 = (i.S1 as boolean) || (!i.R && (o.Q1 as boolean));
      return;
    case "RS":
      // Reset dominant: Q1 := NOT R1 AND (S OR Q1)
      o.Q1 = !i.R1 && ((i.S as boolean) || (o.Q1 as boolean));
      return;
  }
}
