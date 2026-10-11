// A small ladder diagram model for showing rungs next to their Structured Text. The
// diagrams are drawn, not executed: the ST program is what runs, and a diagram reads
// its variables to light up the conducting path. scripts/check-plc-st.mjs checks every
// variable a diagram names exists in its program.

export type LdNode =
  | { k: "no" | "nc"; v: string } // normally open / normally closed contact on a BOOL (or FB output like "t1.Q")
  | { k: "p" | "n"; v: string; q: string } // rising / falling transition contact; q = the R_TRIG/F_TRIG output that is TRUE for that one scan
  | { k: "cmp"; expr: string } // comparison box, e.g. "Level >= 80.0"
  | { k: "fb"; inst: string; type: string; pins: [string, string][]; out?: string } // FB box: power enters its first input; `out` (default Q) continues the rung
  | { k: "par"; branches: LdNode[][] }; // parallel branches (OR)

export interface LdCoil {
  k: "coil" | "neg" | "set" | "reset";
  v: string;
}

export interface Rung {
  comment?: string;
  nodes: LdNode[];
  coils: LdCoil[];
}

// Every variable or FB member a diagram reads, for the consistency check.
export function ladderVars(rungs: Rung[]): string[] {
  const out: string[] = [];
  const walk = (nodes: LdNode[]) => {
    for (const n of nodes) {
      if (n.k === "no" || n.k === "nc") out.push(n.v);
      else if (n.k === "p" || n.k === "n") out.push(n.v, n.q);
      else if (n.k === "fb") out.push(`${n.inst}.${n.out ?? "Q"}`);
      else if (n.k === "par") n.branches.forEach(walk);
    }
  };
  for (const r of rungs) {
    walk(r.nodes);
    for (const c of r.coils) out.push(c.v);
  }
  return out;
}

// Size of a node in grid cells (w) and rows (h).
export function nodeSize(n: LdNode): { w: number; h: number } {
  switch (n.k) {
    case "no":
    case "nc":
    case "p":
    case "n":
      return { w: 1, h: 1 };
    case "cmp":
      return { w: 2, h: 1 };
    case "fb":
      return { w: 2, h: 2 };
    case "par": {
      const sizes = n.branches.map(seriesSize);
      return { w: Math.max(...sizes.map((s) => s.w)), h: sizes.reduce((a, s) => a + s.h, 0) };
    }
  }
}

export function seriesSize(nodes: LdNode[]): { w: number; h: number } {
  let w = 0;
  let h = 1;
  for (const n of nodes) {
    const s = nodeSize(n);
    w += s.w;
    h = Math.max(h, s.h);
  }
  return { w, h };
}
