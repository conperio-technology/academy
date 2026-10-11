// Shared pieces for the range-query tools (RangeQueries and LazyPropagation): number parsing,
// the segment tree layout and an SVG that draws one frame of a stepped operation. Nodes use the
// usual 1-based heap numbering: root 1, node k's children 2k and 2k + 1.

export function parseNums(text: string, max: number, fallback: number[]): number[] {
  const vals = text
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number)
    .filter((v) => Number.isFinite(v))
    .map((v) => Math.max(-999, Math.min(999, Math.trunc(v))))
    .slice(0, max);
  return vals.length ? vals : fallback;
}

export function clampInt(text: string, lo: number, hi: number, fallback: number): number {
  const v = Math.trunc(Number(text));
  if (!Number.isFinite(v) || text.trim() === "") return fallback;
  return Math.max(lo, Math.min(hi, v));
}

export interface SegNode {
  k: number;
  lo: number;
  hi: number;
  depth: number;
}

export function segLayout(n: number): SegNode[] {
  const out: SegNode[] = [];
  const go = (k: number, lo: number, hi: number, depth: number) => {
    out.push({ k, lo, hi, depth });
    if (lo === hi) return;
    const mid = (lo + hi) >> 1;
    go(2 * k, lo, mid, depth + 1);
    go(2 * k + 1, mid + 1, hi, depth + 1);
  };
  go(1, 0, n - 1, 0);
  return out;
}

export const rangeLabel = (lo: number, hi: number) => (lo === hi ? `[${lo}]` : `[${lo}..${hi}]`);

export type Mark = "visit" | "inside" | "outside" | "changed" | "push";

export interface SegFrame {
  values: Record<number, number | undefined>;
  tags?: Record<number, number>;
  marks: Record<number, Mark>;
  current?: number;
  message: string;
}

export const fmtVal = (v: number | undefined) =>
  v === undefined ? "?" : v === Infinity ? "+inf" : v === -Infinity ? "-inf" : String(v);

export function SegTreeSvg({ n, frame, showTags }: { n: number; frame: SegFrame; showTags?: boolean }) {
  const nodes = segLayout(n);
  const byK = new Map(nodes.map((nd) => [nd.k, nd]));
  const depthMax = Math.max(...nodes.map((x) => x.depth));
  const slot = 56;
  const W = Math.max(n * slot, 200);
  const offset = (W - n * slot) / 2;
  const rowH = showTags ? 72 : 64;
  const H = (depthMax + 1) * rowH + 8;
  const bw = slot - 8;
  const bh = 42;
  const cx = (nd: SegNode) => offset + ((nd.lo + nd.hi + 1) / 2) * slot;
  const cy = (nd: SegNode) => (showTags ? 14 : 6) + nd.depth * rowH + bh / 2;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="rq-svg"
      style={{ maxWidth: `${Math.round(W * 1.25)}px` }}
      role="img"
      aria-label="Segment tree"
    >
      {nodes
        .filter((nd) => nd.lo !== nd.hi)
        .flatMap((nd) =>
          [2 * nd.k, 2 * nd.k + 1].map((c) => {
            const ch = byK.get(c)!;
            return <line key={`${nd.k}-${c}`} x1={cx(nd)} y1={cy(nd) + bh / 2} x2={cx(ch)} y2={cy(ch) - bh / 2} className="rq-edge" />;
          }),
        )}
      {nodes.map((nd) => {
        const mark = frame.marks[nd.k];
        const cls = `rq-node ${mark ? `rq-${mark}` : ""} ${frame.current === nd.k ? "rq-current" : ""}`;
        const tag = frame.tags?.[nd.k];
        return (
          <g key={nd.k} className={cls}>
            <rect x={cx(nd) - bw / 2} y={cy(nd) - bh / 2} width={bw} height={bh} rx={7} />
            <text x={cx(nd)} y={cy(nd) - 4} textAnchor="middle" className="rq-val">
              {fmtVal(frame.values[nd.k])}
            </text>
            <text x={cx(nd)} y={cy(nd) + 13} textAnchor="middle" className="rq-range">
              {rangeLabel(nd.lo, nd.hi)}
            </text>
            {showTags && tag ? (
              <text x={cx(nd) + bw / 2} y={cy(nd) - bh / 2 - 3} textAnchor="end" className="rq-tag">
                {tag > 0 ? `+${tag}` : tag}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export function MarkLegend({ items }: { items: { mark: Mark | "current"; label: string }[] }) {
  return (
    <div className="rq-legend">
      {items.map((it) => (
        <span key={it.mark} className="rq-legend-item">
          <span className={`rq-swatch rq-sw-${it.mark}`} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

export function Stepper({
  index,
  total,
  onIndex,
}: {
  index: number;
  total: number;
  onIndex: (i: number) => void;
}) {
  return (
    <div className="cm-actions rq-stepper">
      <button onClick={() => onIndex(0)} disabled={index === 0}>
        Reset
      </button>
      <button onClick={() => onIndex(index - 1)} disabled={index === 0}>
        Prev
      </button>
      <button onClick={() => onIndex(index + 1)} disabled={index >= total - 1}>
        Next step
      </button>
      <button onClick={() => onIndex(total - 1)} disabled={index >= total - 1}>
        Finish
      </button>
      <span className="rq-count">
        Step {index + 1} of {total}
      </span>
    </div>
  );
}
