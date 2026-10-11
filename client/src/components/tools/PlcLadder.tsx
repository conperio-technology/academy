import type { ReactNode } from "react";
import { nodeSize, seriesSize, type LdCoil, type LdNode, type Rung } from "../../plc/ladder";
import type { Value } from "../../plc/st";
import { FB_DEFS, type FbType } from "../../plc/stdFbs";

// Draws ladder rungs (IEC symbols) between two power rails. With `get`, the diagram is
// live: contacts whose condition is TRUE are highlighted, and wires carry "power" as
// far as the conducting path reaches. `evalCmp` evaluates comparison boxes.

const CW = 64; // cell width
const RH = 54; // row height
const RAIL_L = 14;
const PAD = 10; // gap between left rail and first element
const COIL_W = 84;
const COMMENT_H = 16;

interface Props {
  rungs: Rung[];
  get?: (name: string) => Value | undefined;
  evalCmp?: (expr: string) => boolean | undefined;
  label?: string;
}

interface Ctx {
  live: boolean;
  get: (name: string) => boolean;
  cmp: (expr: string) => boolean;
  out: ReactNode[];
  key: number;
}

function wire(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, on: boolean) {
  ctx.out.push(<line key={ctx.key++} x1={x1} y1={y1} x2={x2} y2={y2} className={`ld-wire${ctx.live && on ? " live" : ""}`} />);
}

function text(ctx: Ctx, x: number, y: number, s: string, cls: string, anchor: "start" | "middle" | "end" = "middle") {
  ctx.out.push(
    <text key={ctx.key++} x={x} y={y} className={cls} textAnchor={anchor}>
      {s}
    </text>,
  );
}

function short(s: string, n: number) {
  if (s.length <= n) return s;
  // Vendor I/O names share a long prefix (Micro800: _IO_EM_DI_00); keep the distinctive end.
  if (s.startsWith("_IO_")) return `…${s.slice(-(n - 1))}`;
  return `${s.slice(0, n - 1)}…`;
}

// Draws one node with its left edge at x and its wire at cy; returns the power leaving it.
function drawNode(ctx: Ctx, n: LdNode, x: number, top: number, pin: boolean): boolean {
  const cy = top + RH / 2;
  const { w } = nodeSize(n);
  const right = x + w * CW;
  switch (n.k) {
    case "no":
    case "nc":
    case "p":
    case "n": {
      const cx = x + CW / 2;
      const cond = n.k === "no" ? ctx.get(n.v) : n.k === "nc" ? !ctx.get(n.v) : ctx.get((n as { q: string }).q);
      const out = pin && cond;
      wire(ctx, x, cy, cx - 8, cy, pin);
      wire(ctx, cx + 8, cy, right, cy, out);
      const cls = `ld-contact${ctx.live && cond ? " closed" : ""}`;
      ctx.out.push(<line key={ctx.key++} x1={cx - 8} y1={cy - 11} x2={cx - 8} y2={cy + 11} className={cls} />);
      ctx.out.push(<line key={ctx.key++} x1={cx + 8} y1={cy - 11} x2={cx + 8} y2={cy + 11} className={cls} />);
      if (n.k === "nc") ctx.out.push(<line key={ctx.key++} x1={cx - 6} y1={cy + 9} x2={cx + 6} y2={cy - 9} className={cls} />);
      if (n.k === "p" || n.k === "n") text(ctx, cx, cy + 4, n.k.toUpperCase(), "ld-sym");
      text(ctx, cx, cy - 16, short(n.v, 10), "ld-name");
      return out;
    }
    case "cmp": {
      const cond = ctx.cmp(n.expr);
      const out = pin && cond;
      wire(ctx, x, cy, x + 6, cy, pin);
      wire(ctx, right - 6, cy, right, cy, out);
      ctx.out.push(<rect key={ctx.key++} x={x + 6} y={cy - 13} width={w * CW - 12} height={26} rx={3} className={`ld-box${ctx.live && cond ? " closed" : ""}`} />);
      text(ctx, x + (w * CW) / 2, cy + 4, short(n.expr, 18), "ld-box-text");
      return out;
    }
    case "fb": {
      const q = ctx.get(`${n.inst}.${n.out ?? "Q"}`);
      wire(ctx, x, cy, x + 8, cy, pin);
      wire(ctx, right - 8, cy, right, cy, q);
      const h = RH * 2 - 18;
      ctx.out.push(<rect key={ctx.key++} x={x + 8} y={cy - 14} width={w * CW - 16} height={h} rx={3} className={`ld-box${ctx.live && q ? " closed" : ""}`} />);
      text(ctx, x + (w * CW) / 2, cy - 18, short(n.inst, 16), "ld-name");
      text(ctx, x + (w * CW) / 2, cy + 4, n.type, "ld-fb-type");
      text(ctx, x + 12, cy + 4, FB_DEFS[n.type as FbType]?.inputs[0][0] ?? "", "ld-pin", "start");
      text(ctx, right - 12, cy + 4, n.out ?? "Q", "ld-pin", "end");
      n.pins.slice(0, 3).forEach(([pinName, val], i) => text(ctx, x + 12, cy + 20 + i * 12, `${pinName} ${short(val, 9)}`, "ld-pin", "start"));
      return q;
    }
    case "par": {
      const sizes = n.branches.map(seriesSize);
      let y = top;
      let any = false;
      let lastCy = cy;
      n.branches.forEach((b, i) => {
        const bcy = y + RH / 2;
        const out = drawSeries(ctx, b, x, y, pin);
        const endX = x + sizes[i].w * CW;
        if (endX < right) wire(ctx, endX, bcy, right, bcy, out);
        any = any || out;
        lastCy = bcy;
        y += sizes[i].h * RH;
      });
      wire(ctx, x, cy, x, lastCy, pin);
      wire(ctx, right, cy, right, lastCy, any);
      return any;
    }
  }
}

function drawSeries(ctx: Ctx, nodes: LdNode[], x: number, top: number, pin: boolean): boolean {
  let p = pin;
  let cx = x;
  for (const n of nodes) {
    p = drawNode(ctx, n, cx, top, p);
    cx += nodeSize(n).w * CW;
  }
  return p;
}

function drawCoil(ctx: Ctx, c: LdCoil, x: number, cy: number, pin: boolean, railR: number) {
  const cx = x + COIL_W / 2;
  const on = ctx.get(c.v);
  wire(ctx, x, cy, cx - 11, cy, pin);
  wire(ctx, cx + 11, cy, railR, cy, pin);
  const cls = `ld-coil${ctx.live && on ? " on" : ""}`;
  ctx.out.push(<path key={ctx.key++} d={`M${cx - 6},${cy - 12} Q${cx - 14},${cy} ${cx - 6},${cy + 12}`} className={cls} />);
  ctx.out.push(<path key={ctx.key++} d={`M${cx + 6},${cy - 12} Q${cx + 14},${cy} ${cx + 6},${cy + 12}`} className={cls} />);
  const sym = c.k === "set" ? "S" : c.k === "reset" ? "R" : c.k === "neg" ? "/" : "";
  if (sym) text(ctx, cx, cy + 4, sym, "ld-sym");
  text(ctx, cx, cy - 17, short(c.v, 12), "ld-name");
}

export function PlcLadder({ rungs, get, evalCmp, label = "Ladder diagram" }: Props) {
  const live = !!get;
  const ctx: Ctx = {
    live,
    get: (name) => !!get?.(name),
    cmp: (e) => !!evalCmp?.(e),
    out: [],
    key: 0,
  };
  // Wide enough for the widest rung, and for its comment text (about 5.6 px a character).
  const commentW = Math.max(0, ...rungs.map((r) => (r.comment ? r.comment.length * 5.6 + 16 : 0)));
  const contentW = Math.max(2 * CW, ...rungs.map((r) => seriesSize(r.nodes).w * CW), commentW - PAD - COIL_W - 8);
  const coilX = RAIL_L + PAD + contentW;
  const railR = coilX + COIL_W + 8;
  const width = railR + 14;

  let y = 6;
  for (const r of rungs) {
    if (r.comment) {
      text(ctx, RAIL_L + 8, y + 11, r.comment, "ld-comment", "start");
      y += COMMENT_H;
    }
    const size = seriesSize(r.nodes);
    const rows = Math.max(size.h, r.coils.length);
    const cy = y + RH / 2;
    const contentEnd = RAIL_L + PAD + size.w * CW;
    wire(ctx, RAIL_L, cy, RAIL_L + PAD, cy, true);
    const power = drawSeries(ctx, r.nodes, RAIL_L + PAD, y, true);
    if (r.coils.length === 0) {
      // A rung ending in a box (a timer with nothing on its output) has no coil.
    } else {
      wire(ctx, contentEnd, cy, coilX, cy, power);
      r.coils.forEach((c, i) => {
        const ccy = cy + i * RH;
        if (i > 0) wire(ctx, coilX - 6, cy, coilX - 6, ccy, power);
        if (i > 0) wire(ctx, coilX - 6, ccy, coilX, ccy, power);
        drawCoil(ctx, c, coilX, ccy, power, railR);
      });
    }
    y += rows * RH + 6;
  }
  const height = y + 4;

  return (
    <div className="plc-ladder" role="img" aria-label={label}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: `${width}px` }}>
        <line x1={RAIL_L} y1={2} x2={RAIL_L} y2={height - 2} className="ld-rail" />
        <line x1={railR} y1={2} x2={railR} y2={height - 2} className="ld-rail" />
        {ctx.out}
      </svg>
    </div>
  );
}
