import { Fragment, useRef, type KeyboardEvent, type ReactNode } from "react";
import { formatValue, type Value } from "../../plc/st";
import type { TraceRow } from "../../plc/sim";

// Pieces shared by the PLC programming lessons and exercises: a highlighted Structured
// Text view, a plain textarea editor with line numbers (works offline, unlike the CDN
// Monaco editor), and a timing chart of signals over simulated time.

const ST_KEYWORDS =
  /^(PROGRAM|END_PROGRAM|VAR|END_VAR|CONSTANT|RETAIN|IF|THEN|ELSIF|ELSE|END_IF|CASE|OF|END_CASE|FOR|TO|BY|DO|END_FOR|WHILE|END_WHILE|REPEAT|UNTIL|END_REPEAT|EXIT|RETURN|AND|OR|XOR|NOT|MOD|TRUE|FALSE|LD|ST|ANDN|ORN)$/i;
const ST_TYPES = /^(BOOL|INT|DINT|REAL|TIME|TON|TOF|TP|CTU|CTD|CTUD|R_TRIG|F_TRIG|SR|RS)$/i;

export function highlightSt(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\(\*[\s\S]*?\*\)|\/\/[^\n]*)|((?:T|TIME)#[0-9a-zA-Z_.]+)|(\b\d[\d_]*(?:#[0-9A-Fa-f_]+)?(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(<Fragment key={i++}>{code.slice(last, m.index)}</Fragment>);
    const [text, comment, time, num, word] = m;
    if (comment) out.push(<span key={i++} className="st-comment">{text}</span>);
    else if (time || num) out.push(<span key={i++} className="st-literal">{text}</span>);
    else if (word && ST_KEYWORDS.test(word)) out.push(<span key={i++} className="st-keyword">{text}</span>);
    else if (word && ST_TYPES.test(word)) out.push(<span key={i++} className="st-type">{text}</span>);
    else out.push(<Fragment key={i++}>{text}</Fragment>);
    last = m.index + text.length;
  }
  if (last < code.length) out.push(<Fragment key={i++}>{code.slice(last)}</Fragment>);
  return out;
}

export function StCode({ code, label = "Structured Text" }: { code: string; label?: string }) {
  return (
    <div className="plc-code-wrap">
      {label && <div className="plc-code-label">{label}</div>}
      <pre className="plc-code">{highlightSt(code.replace(/\n$/, ""))}</pre>
    </div>
  );
}

interface EditorProps {
  value: string;
  onChange: (v: string) => void;
  errorLines?: number[];
  label: string;
  minRows?: number;
}

// A monospace textarea with a line-number gutter. Tab inserts two spaces; lines with
// errors are marked in the gutter.
export function StEditor({ value, onChange, errorLines = [], label, minRows = 8 }: EditorProps) {
  const gutter = useRef<HTMLDivElement>(null);
  const lines = value.split("\n").length;
  const rows = Math.min(32, Math.max(minRows, lines + 1));
  const bad = new Set(errorLines);

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Tab" || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
    e.preventDefault();
    const ta = e.currentTarget;
    const { selectionStart: s, selectionEnd: end } = ta;
    const next = value.slice(0, s) + "  " + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = s + 2;
    });
  }

  return (
    <div className="st-editor">
      <div className="st-gutter" ref={gutter} aria-hidden="true">
        {Array.from({ length: Math.max(lines, rows) }, (_, i) => (
          <div key={i} className={bad.has(i + 1) ? "st-gutter-bad" : undefined}>
            {i < lines ? i + 1 : ""}
          </div>
        ))}
      </div>
      <textarea
        className="st-textarea"
        aria-label={label}
        value={value}
        rows={rows}
        wrap="off"
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onScroll={(e) => {
          if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop;
        }}
      />
    </div>
  );
}

// ---- Timing chart ----

interface TrendProps {
  rows: TraceRow[];
  signals: string[];
  scanMs: number;
  windowMs?: number; // show only the last windowMs (live view); default: everything
  failAt?: number;
  ranges?: Record<string, [number, number]>; // fixed scale for numeric signals
}

const LABEL_W = 92;
const CHART_W = 640;
const BOOL_H = 22;
const NUM_H = 46;

export function TrendChart({ rows, signals, scanMs, windowMs, failAt, ranges = {} }: TrendProps) {
  // Computed on every render: the simulator appends to `rows` in place, so memoizing on
  // the array would freeze the chart.
  const view = (() => {
    if (rows.length === 0) return null;
    const tEnd = rows[rows.length - 1].t + scanMs;
    const tStart = windowMs ? Math.max(0, tEnd - windowMs) : rows[0].t;
    const span = Math.max(windowMs ?? 0, tEnd - tStart, scanMs);
    const visible = rows.filter((r) => r.t + scanMs > tStart);
    return { tStart, tEnd, span, visible };
  })();

  if (!view) return <p className="gate-note">The chart fills in as the simulator runs.</p>;
  const { tStart, span, visible } = view;
  const plotW = CHART_W - LABEL_W - 8;
  const xOf = (t: number) => LABEL_W + ((t - tStart) / span) * plotW;

  let y = 4;
  const lanes = signals
    .filter((s) => visible.some((r) => r.values[s] !== undefined))
    .map((s) => {
      const isBool = typeof visible.find((r) => r.values[s] !== undefined)!.values[s] === "boolean";
      const h = isBool ? BOOL_H : NUM_H;
      const lane = { s, isBool, top: y, h };
      y += h + 6;
      return lane;
    });
  const height = y + 16;

  // Tick marks every 1, 2, 5 or 10 s depending on the span.
  const step = [500, 1000, 2000, 5000, 10000].find((t) => span / t <= 8) ?? 20000;
  const ticks: number[] = [];
  for (let t = Math.ceil(tStart / step) * step; t <= tStart + span; t += step) ticks.push(t);

  return (
    <div className="plc-trend">
      <svg viewBox={`0 0 ${CHART_W} ${height}`} role="img" aria-label={`Timing chart of ${signals.join(", ")}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={xOf(t)} x2={xOf(t)} y1={2} y2={height - 14} className="plc-trend-grid" />
            <text x={xOf(t)} y={height - 3} className="plc-trend-tick" textAnchor="middle">
              {(t / 1000).toFixed(step < 1000 ? 1 : 0)} s
            </text>
          </g>
        ))}
        {lanes.map(({ s, isBool, top, h }) => {
          const pts: string[] = [];
          let lo = 0;
          let hi = 1;
          if (!isBool) {
            const vals = visible.map((r) => r.values[s] as number);
            [lo, hi] = ranges[s] ?? [Math.min(...vals), Math.max(...vals)];
            if (hi - lo < 1e-6) {
              lo -= 1;
              hi += 1;
            }
          }
          const yOf = (v: Value) => (isBool ? (v ? top + 3 : top + h - 3) : top + h - 3 - (((v as number) - lo) / (hi - lo)) * (h - 6));
          let prev: Value | undefined;
          for (const r of visible) {
            const v = r.values[s];
            if (v === undefined) continue;
            const x0 = xOf(Math.max(r.t, tStart));
            if (prev === undefined) pts.push(`M${x0.toFixed(1)},${yOf(v).toFixed(1)}`);
            else if (v !== prev) pts.push(isBool ? `L${x0.toFixed(1)},${yOf(prev).toFixed(1)} L${x0.toFixed(1)},${yOf(v).toFixed(1)}` : `L${x0.toFixed(1)},${yOf(v).toFixed(1)}`);
            prev = v;
          }
          const last = visible[visible.length - 1];
          if (prev !== undefined) pts.push(`L${xOf(last.t + scanMs).toFixed(1)},${yOf(prev).toFixed(1)}`);
          return (
            <g key={s}>
              <text x={4} y={top + h / 2 + 4} className="plc-trend-label">
                {s.length > 12 ? `${s.slice(0, 11)}…` : s}
              </text>
              <line x1={LABEL_W} x2={CHART_W - 8} y1={top + h - 3} y2={top + h - 3} className="plc-trend-base" />
              <path d={pts.join(" ")} className={isBool ? "plc-trend-bool" : "plc-trend-num"} />
              {!isBool && (
                <>
                  <text x={LABEL_W - 4} y={top + 9} className="plc-trend-scale" textAnchor="end">
                    {formatValue(hi, "REAL")}
                  </text>
                  <text x={LABEL_W - 4} y={top + h - 2} className="plc-trend-scale" textAnchor="end">
                    {formatValue(lo, "REAL")}
                  </text>
                </>
              )}
            </g>
          );
        })}
        {failAt !== undefined && failAt >= tStart && (
          <g>
            <line x1={xOf(failAt)} x2={xOf(failAt)} y1={0} y2={height - 14} className="plc-trend-fail" />
          </g>
        )}
      </svg>
    </div>
  );
}
