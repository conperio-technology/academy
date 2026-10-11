import { useState } from "react";
import { openLesson } from "../../api";
import {
  clampInt,
  fmtVal,
  MarkLegend,
  parseNums,
  rangeLabel,
  SegTreeSvg,
  Stepper,
  type Mark,
  type SegFrame,
} from "./rangeQueryShared";

// Range queries explainer: total work for prefix sums vs segment tree vs Fenwick tree over a
// workload, a segment tree stepped node by node through build, point update and range query
// (sum, min or max), and a Fenwick tree stepped through its i & -i jumps. Everything is computed
// here from the learner's own array.

// ---------- 1. cost comparison ----------

const SIZES = [1_000, 100_000, 1_000_000];
const MIXES = [
  { label: "Mostly queries", u: 100, q: 100_000 },
  { label: "Half and half", u: 50_000, q: 50_000 },
  { label: "Mostly updates", u: 100_000, q: 100 },
];

function words(x: number): string {
  if (x >= 1e12) return `${(x / 1e12).toFixed(1)} trillion`;
  if (x >= 1e9) return `${(x / 1e9).toFixed(1)} billion`;
  if (x >= 1e6) return `${(x / 1e6).toFixed(1)} million`;
  return Math.round(x).toLocaleString("en-US");
}

function seconds(x: number): string {
  const s = x / 1e8; // roughly 10^8 simple steps per second
  if (s < 0.001) return "under a millisecond";
  if (s < 1) return `about ${Math.round(s * 1000)} ms`;
  if (s < 120) return `about ${s.toFixed(s < 10 ? 1 : 0)} s`;
  if (s < 7200) return `about ${Math.round(s / 60)} minutes`;
  return `about ${Math.round(s / 3600)} hours`;
}

function CostCompare() {
  const [ni, setNi] = useState(1);
  const [mi, setMi] = useState(1);
  const n = SIZES[ni];
  const { u, q } = MIXES[mi];
  const lg = Math.ceil(Math.log2(n));
  const rows = [
    { name: "Plain array", build: 0, update: 1, query: n, note: "update O(1), query O(n): re-add the range every time" },
    { name: "Prefix sums", build: n, update: n, query: 1, note: "query O(1), update O(n): every later prefix shifts" },
    { name: "Segment tree", build: 2 * n, update: lg + 1, query: 4 * lg, note: "O(log n) both; any associative operation" },
    { name: "Fenwick tree", build: n, update: lg + 1, query: 2 * (lg + 1), note: "O(log n) both; sums and counts only" },
  ].map((r) => ({ ...r, total: r.build + u * r.update + q * r.query }));
  const maxLog = Math.max(...rows.map((r) => Math.log10(r.total + 1)));
  const best = Math.min(...rows.map((r) => r.total));

  return (
    <div className="crypto-section">
      <h3>1. What a mix of updates and queries costs</h3>
      <p className="gate-note">
        Worst-case steps for the whole workload: building once, then {u.toLocaleString("en-US")} point updates and{" "}
        {q.toLocaleString("en-US")} range-sum queries on {n.toLocaleString("en-US")} elements. Bars use a log scale, so each
        notch is ten times more work.
      </p>
      <div className="sql-presets" role="group" aria-label="Array size">
        {SIZES.map((s, i) => (
          <button key={s} className={i === ni ? "active" : ""} onClick={() => setNi(i)}>
            n = {s.toLocaleString("en-US")}
          </button>
        ))}
      </div>
      <div className="sql-presets" role="group" aria-label="Workload">
        {MIXES.map((m, i) => (
          <button key={m.label} className={i === mi ? "active" : ""} onClick={() => setMi(i)}>
            {m.label}
          </button>
        ))}
      </div>
      <div className="rq-bars">
        {rows.map((r) => (
          <div key={r.name} className="rq-bar-row">
            <div className="rq-bar-head">
              <strong>{r.name}</strong>
              <span className="mono">
                {words(r.total)} steps, {seconds(r.total)}
              </span>
            </div>
            <div className="rq-bar-track">
              <div
                className={`rq-bar ${r.total === best ? "rq-bar-best" : ""}`}
                style={{ width: `${Math.max(2, (Math.log10(r.total + 1) / maxLog) * 100)}%` }}
              />
            </div>
            <div className="rq-bar-note">{r.note}</div>
          </div>
        ))}
      </div>
      <p className="gate-note">
        Only a workload with almost no updates favours prefix sums, and almost no queries favours the plain array. As soon as
        both happen often, the O(log n) trees win by orders of magnitude: log2 of a million is only 20.
      </p>
    </div>
  );
}

// ---------- 2. segment tree stepper ----------

type Combine = "sum" | "min" | "max";
const IDENTITY: Record<Combine, number> = { sum: 0, min: Infinity, max: -Infinity };
const combineOf = (c: Combine) => (a: number, b: number) => (c === "sum" ? a + b : c === "min" ? Math.min(a, b) : Math.max(a, b));
const OP_SYMBOL: Record<Combine, string> = { sum: "+", min: "min", max: "max" };

function fullTree(nums: number[], c: Combine): Record<number, number> {
  const f = combineOf(c);
  const vals: Record<number, number> = {};
  const go = (k: number, lo: number, hi: number): number => {
    if (lo === hi) return (vals[k] = nums[lo]);
    const mid = (lo + hi) >> 1;
    return (vals[k] = f(go(2 * k, lo, mid), go(2 * k + 1, mid + 1, hi)));
  };
  go(1, 0, nums.length - 1);
  return vals;
}

function traceBuild(nums: number[], c: Combine): SegFrame[] {
  const f = combineOf(c);
  const levels: { k: number; lo: number; hi: number }[][] = [];
  const collect = (k: number, lo: number, hi: number, d: number) => {
    (levels[d] ??= []).push({ k, lo, hi });
    if (lo === hi) return;
    const mid = (lo + hi) >> 1;
    collect(2 * k, lo, mid, d + 1);
    collect(2 * k + 1, mid + 1, hi, d + 1);
  };
  collect(1, 0, nums.length - 1, 0);
  const values: Record<number, number | undefined> = {};
  const frames: SegFrame[] = [
    { values: { ...values }, marks: {}, message: `build: each node will hold the ${c} of its range. Start from the leaves.` },
  ];
  // Leaves can sit on two levels when n is not a power of two, so fill bottom-up by level but
  // compute a node only once both its children are known (they always are, one level down).
  for (let d = levels.length - 1; d >= 0; d--) {
    const marks: Record<number, Mark> = {};
    const parts: string[] = [];
    for (const nd of levels[d]) {
      values[nd.k] = nd.lo === nd.hi ? nums[nd.lo] : f(values[2 * nd.k]!, values[2 * nd.k + 1]!);
      marks[nd.k] = "changed";
      parts.push(`${rangeLabel(nd.lo, nd.hi)} = ${values[nd.k]}`);
    }
    frames.push({
      values: { ...values },
      marks,
      message:
        d === 0
          ? `Root: ${parts.join(", ")}. Every node was computed once from its two children, so the build is O(n).`
          : `Depth ${d}: ${levels[d].some((x) => x.lo !== x.hi) ? `parents combine their children with ${OP_SYMBOL[c]}; ` : ""}${parts.join(", ")}.`,
    });
  }
  return frames;
}

function traceUpdate(nums: number[], c: Combine, index: number, val: number): SegFrame[] {
  const f = combineOf(c);
  const values: Record<number, number | undefined> = fullTree(nums, c);
  const frames: SegFrame[] = [];
  const marks: Record<number, Mark> = {};
  const path: { k: number; lo: number; hi: number }[] = [];
  let k = 1;
  let lo = 0;
  let hi = nums.length - 1;
  for (;;) {
    path.push({ k, lo, hi });
    marks[k] = "visit";
    if (lo === hi) break;
    const mid = (lo + hi) >> 1;
    const left = index <= mid;
    frames.push({
      values: { ...values },
      marks: { ...marks },
      current: k,
      message: `update(${index}, ${val}): at ${rangeLabel(lo, hi)}, mid = ${mid}. ${index} ${left ? "<=" : ">"} ${mid}, so go ${left ? "left" : "right"}.`,
    });
    if (left) {
      k = 2 * k;
      hi = mid;
    } else {
      k = 2 * k + 1;
      lo = mid + 1;
    }
  }
  for (let i = path.length - 1; i >= 0; i--) {
    const p = path[i];
    const old = values[p.k];
    values[p.k] = p.lo === p.hi ? val : f(values[2 * p.k]!, values[2 * p.k + 1]!);
    marks[p.k] = "changed";
    frames.push({
      values: { ...values },
      marks: { ...marks },
      current: p.k,
      message:
        p.lo === p.hi
          ? `Reached the leaf ${rangeLabel(p.lo, p.hi)}: ${old} becomes ${val}.`
          : `Back up at ${rangeLabel(p.lo, p.hi)}: recompute ${values[2 * p.k]} ${OP_SYMBOL[c]} ${values[2 * p.k + 1]} = ${values[p.k]}${old === values[p.k] ? " (unchanged)" : ` (was ${old})`}.`,
    });
  }
  frames.push({
    values: { ...values },
    marks: { ...marks },
    message: `Done: ${path.length} nodes touched, one per level, so O(log n). Nothing off this path can have changed.`,
  });
  return frames;
}

function traceQuery(nums: number[], c: Combine, l: number, r: number): SegFrame[] {
  const f = combineOf(c);
  const values = fullTree(nums, c);
  const marks: Record<number, Mark> = {};
  const frames: SegFrame[] = [];
  const used: string[] = [];
  let visited = 0;
  const name = c === "sum" ? "sum" : c;
  const go = (k: number, lo: number, hi: number): number => {
    visited++;
    if (r < lo || hi < l) {
      marks[k] = "outside";
      frames.push({
        values,
        marks: { ...marks },
        current: k,
        message: `${rangeLabel(lo, hi)} is completely outside [${l}..${r}]: return the identity ${fmtVal(IDENTITY[c])}, the value that changes nothing.`,
      });
      return IDENTITY[c];
    }
    if (l <= lo && hi <= r) {
      marks[k] = "inside";
      used.push(String(values[k]));
      frames.push({
        values,
        marks: { ...marks },
        current: k,
        message: `${rangeLabel(lo, hi)} is completely inside [${l}..${r}]: use its stored ${values[k]} and don't go deeper.`,
      });
      return values[k];
    }
    marks[k] = "visit";
    frames.push({
      values,
      marks: { ...marks },
      current: k,
      message: `${rangeLabel(lo, hi)} only partly overlaps [${l}..${r}]: ask both children.`,
    });
    const mid = (lo + hi) >> 1;
    return f(go(2 * k, lo, mid), go(2 * k + 1, mid + 1, hi));
  };
  const result = go(1, 0, nums.length - 1);
  frames.unshift({ values, marks: {}, message: `${name}(${l}, ${r}): start at the root.` });
  frames.push({
    values,
    marks: { ...marks },
    message: `${name}(${l}, ${r}) = ${c === "sum" ? used.join(" + ") : `${c}(${used.join(", ")})`} = ${fmtVal(result)}. Visited ${visited} of ${2 * nums.length - 1} nodes; a plain loop would read ${r - l + 1} elements.`,
  });
  return frames;
}

function SegmentTreeStepper() {
  const [text, setText] = useState("2, 1, 5, 3, 4, 2, 6, 1");
  const [combine, setCombine] = useState<Combine>("sum");
  const nums = parseNums(text, 8, [2, 1, 5, 3, 4, 2, 6, 1]);
  const n = nums.length;
  const [ui, setUi] = useState("2");
  const [uv, setUv] = useState("0");
  const [ql, setQl] = useState("1");
  const [qr, setQr] = useState("5");
  const [trace, setTrace] = useState<{ label: string; frames: SegFrame[] }>(() => ({
    label: "build",
    frames: traceBuild(nums, "sum"),
  }));
  const [step, setStep] = useState(0);
  const s = Math.min(step, trace.frames.length - 1);
  const frame = trace.frames[s];

  const start = (label: string, frames: SegFrame[]) => {
    setTrace({ label, frames });
    setStep(0);
  };
  const rebuild = (arr: number[], c: Combine) => start("build", traceBuild(arr, c));

  const runUpdate = () => {
    const i = clampInt(ui, 0, n - 1, 0);
    const v = clampInt(uv, -999, 999, 0);
    const frames = traceUpdate(nums, combine, i, v);
    const next = [...nums];
    next[i] = v;
    setText(next.join(", "));
    start(`update(${i}, ${v})`, frames);
  };
  const runQuery = () => {
    let l = clampInt(ql, 0, n - 1, 0);
    let r = clampInt(qr, 0, n - 1, n - 1);
    if (l > r) [l, r] = [r, l];
    start(`${combine}(${l}, ${r})`, traceQuery(nums, combine, l, r));
  };

  return (
    <div className="crypto-section">
      <h3>2. Step through a segment tree</h3>
      <div className="tool-inputs ai-inputs">
        <label>
          Array (up to 8 numbers)
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              rebuild(parseNums(e.target.value, 8, [2, 1, 5, 3, 4, 2, 6, 1]), combine);
            }}
            aria-label="Array for the segment tree"
          />
        </label>
      </div>
      <div className="sql-presets" role="group" aria-label="Combine operation">
        {(["sum", "min", "max"] as Combine[]).map((c) => (
          <button
            key={c}
            className={c === combine ? "active" : ""}
            onClick={() => {
              setCombine(c);
              rebuild(nums, c);
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="rq-ops">
        <div className="rq-op">
          <button onClick={() => rebuild(nums, combine)}>Build</button>
        </div>
        <div className="rq-op">
          <button onClick={runUpdate}>Update</button>
          <label>
            index
            <input className="rq-num" value={ui} onChange={(e) => setUi(e.target.value)} aria-label="Update index" inputMode="numeric" />
          </label>
          <label>
            value
            <input className="rq-num" value={uv} onChange={(e) => setUv(e.target.value)} aria-label="Update value" inputMode="numeric" />
          </label>
        </div>
        <div className="rq-op">
          <button onClick={runQuery}>Query</button>
          <label>
            left
            <input className="rq-num" value={ql} onChange={(e) => setQl(e.target.value)} aria-label="Query left" inputMode="numeric" />
          </label>
          <label>
            right
            <input className="rq-num" value={qr} onChange={(e) => setQr(e.target.value)} aria-label="Query right" inputMode="numeric" />
          </label>
        </div>
      </div>
      <p className="rq-running">
        Running: <strong className="mono">{trace.label}</strong> on [{nums.join(", ")}]
      </p>
      <SegTreeSvg n={n} frame={frame} />
      <MarkLegend
        items={[
          { mark: "current", label: "current node" },
          { mark: "visit", label: "visited, split further" },
          { mark: "inside", label: "fully inside: value used" },
          { mark: "outside", label: "outside: identity" },
          { mark: "changed", label: "written" },
        ]}
      />
      <p className="rq-message" aria-live="polite">
        {frame.message}
      </p>
      <Stepper index={s} total={trace.frames.length} onIndex={setStep} />
      <p className="gate-note">
        Try a query that covers the whole array (only the root is used), a single index (one path down), and the same query
        with min: the shape of the walk is identical, only the combine and the identity change. Graded:{" "}
        <button className="link-button" onClick={() => openLesson("segment-tree-range-sum-mutable")}>
          Range Sum Query, Mutable
        </button>{" "}
        and{" "}
        <button className="link-button" onClick={() => openLesson("segment-tree-range-min")}>
          Range Minimum Query
        </button>
        .
      </p>
    </div>
  );
}

// ---------- 3. Fenwick tree stepper ----------

const lowbit = (i: number) => i & -i;
const bin = (i: number) => i.toString(2);

interface FenFrame {
  tree: number[]; // 1-based, tree[0] unused
  touched: number[];
  current?: number;
  message: string;
}

function fenBuild(nums: number[]): number[] {
  const t = [0, ...nums];
  for (let i = 1; i < t.length; i++) {
    const p = i + lowbit(i);
    if (p < t.length) t[p] += t[i];
  }
  return t;
}

function traceFenBuild(nums: number[]): FenFrame[] {
  const t = [0, ...nums];
  const n = nums.length;
  const frames: FenFrame[] = [
    {
      tree: [...t],
      touched: [],
      message: "O(n) build: start with tree[i] = the element at position i. Then each cell passes its total up to its parent i + lowbit(i), once.",
    },
  ];
  for (let i = 1; i <= n; i++) {
    const p = i + lowbit(i);
    if (p <= n) {
      t[p] += t[i];
      frames.push({
        tree: [...t],
        touched: [i, p],
        current: p,
        message: `i = ${i} (${bin(i)}), lowbit = ${lowbit(i)}: parent is ${i} + ${lowbit(i)} = ${p}. tree[${p}] += tree[${i}] = ${t[p]}; it now covers ${p - lowbit(p) + 1}..${p}.`,
      });
    } else {
      frames.push({
        tree: [...t],
        touched: [i],
        current: i,
        message: `i = ${i} (${bin(i)}): parent ${p} is past n = ${n}, so nothing to pass up.`,
      });
    }
  }
  frames.push({ tree: [...t], touched: [], message: "Built. Every cell now holds the sum of the lowbit(i) positions ending at i." });
  return frames;
}

function traceFenPrefix(t: number[], i0: number, label = `prefix(${i0})`): { frames: FenFrame[]; sum: number } {
  const frames: FenFrame[] = [];
  const touched: number[] = [];
  let sum = 0;
  if (i0 === 0) {
    frames.push({ tree: t, touched: [], message: `${label}: i = 0, the empty sum. Nothing to add.` });
    return { frames, sum };
  }
  frames.push({ tree: t, touched: [], message: `${label}: start at i = ${i0} (${bin(i0)}) and walk down, clearing the lowest set bit each time.` });
  for (let i = i0; i > 0; i -= lowbit(i)) {
    sum += t[i];
    touched.push(i);
    const next = i - lowbit(i);
    frames.push({
      tree: t,
      touched: [...touched],
      current: i,
      message: `i = ${i} (${bin(i)}), lowbit = ${lowbit(i)}: tree[${i}] covers ${i - lowbit(i) + 1}..${i}, add ${t[i]} so sum = ${sum}. Next i = ${i} - ${lowbit(i)} = ${next}${next ? ` (${bin(next)})` : ", stop"}.`,
    });
  }
  return { frames, sum };
}

function traceFenAdd(t0: number[], i0: number, delta: number): { frames: FenFrame[]; tree: number[] } {
  const t = [...t0];
  const n = t.length - 1;
  const frames: FenFrame[] = [
    {
      tree: [...t],
      touched: [],
      message: `add(${i0}, ${delta >= 0 ? "+" : ""}${delta}): start at i = ${i0} (${bin(i0)}) and walk up, adding the lowest set bit each time, to every cell whose range covers position ${i0}.`,
    },
  ];
  const touched: number[] = [];
  for (let i = i0; i <= n; i += lowbit(i)) {
    t[i] += delta;
    touched.push(i);
    const next = i + lowbit(i);
    frames.push({
      tree: [...t],
      touched: [...touched],
      current: i,
      message: `i = ${i} (${bin(i)}): tree[${i}] covers ${i - lowbit(i) + 1}..${i}, which includes ${i0}, so it becomes ${t[i]}. Next i = ${i} + ${lowbit(i)} = ${next} (${bin(next)})${next > n ? `, past n = ${n}: stop` : ""}.`,
    });
  }
  frames.push({ tree: [...t], touched, message: `Done: ${touched.length} cells updated, at most one per bit of n, so O(log n).` });
  return { frames, tree: t };
}

function FenwickGrid({ frame, nums }: { frame: FenFrame; nums: number[] }) {
  const n = nums.length;
  const levels = Math.floor(Math.log2(n)) + 1;
  const touched = new Set(frame.touched);
  const cols = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
  return (
    <div className="rq-fen" aria-label="Fenwick tree">
      <div className="rq-fen-row" style={cols}>
        {nums.map((_, j) => (
          <div key={j} className="rq-fen-pos">
            <span>{j + 1}</span>
            <span className="rq-fen-bin">{bin(j + 1)}</span>
          </div>
        ))}
      </div>
      <div className="rq-fen-row" style={cols}>
        {nums.map((v, j) => (
          <div key={j} className="rq-fen-num">
            {v}
          </div>
        ))}
      </div>
      <div className="rq-fen-tree" style={{ ...cols, gridTemplateRows: `repeat(${levels}, auto)` }}>
        {frame.tree.slice(1).map((v, j) => {
          const i = j + 1;
          const lb = lowbit(i);
          const level = Math.log2(lb);
          const cls = `rq-fen-cell ${touched.has(i) ? "rq-fen-touched" : ""} ${frame.current === i ? "rq-fen-current" : ""}`;
          return (
            <div
              key={i}
              className={cls}
              style={{ gridColumn: `${i - lb + 1} / ${i + 1}`, gridRow: levels - level }}
              title={`tree[${i}] covers ${i - lb + 1}..${i}`}
            >
              <span className="rq-fen-label">t[{i}]</span>
              <span>{v}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FenwickStepper() {
  const fallback = [3, 2, -1, 6, 5, 4, -3, 3, 7, 2, 3, 1];
  const [text, setText] = useState(fallback.join(", "));
  const nums = parseNums(text, 16, fallback);
  const n = nums.length;
  const [pi, setPi] = useState("11");
  const [ai, setAi] = useState("5");
  const [ad, setAd] = useState("2");
  const [rl, setRl] = useState("3");
  const [rr, setRr] = useState("10");
  const [trace, setTrace] = useState<{ label: string; frames: FenFrame[] }>(() => ({
    label: "build",
    frames: traceFenBuild(fallback),
  }));
  const [step, setStep] = useState(0);
  const s = Math.min(step, trace.frames.length - 1);
  const frame = trace.frames[s];
  const tree = fenBuild(nums);

  const start = (label: string, frames: FenFrame[]) => {
    setTrace({ label, frames });
    setStep(0);
  };

  const runPrefix = () => {
    const i = clampInt(pi, 0, n, n);
    const { frames, sum } = traceFenPrefix(tree, i);
    const direct = nums.slice(0, i).reduce((a, b) => a + b, 0);
    frames.push({ tree, touched: frames[frames.length - 1].touched, message: `prefix(${i}) = ${sum}. Check: adding positions 1..${i} directly also gives ${direct}, but takes ${i} additions instead of ${frames.length - 1}.` });
    start(`prefix(${i})`, frames);
  };
  const runAdd = () => {
    const i = clampInt(ai, 1, n, 1);
    const d = clampInt(ad, -999, 999, 1);
    const { frames } = traceFenAdd(tree, i, d);
    const next = [...nums];
    next[i - 1] += d;
    setText(next.join(", "));
    start(`add(${i}, ${d})`, frames);
  };
  const runRange = () => {
    let l = clampInt(rl, 1, n, 1);
    let r = clampInt(rr, 1, n, n);
    if (l > r) [l, r] = [r, l];
    const a = traceFenPrefix(tree, r, `sum(${l}..${r}) needs prefix(${r})`);
    const b = traceFenPrefix(tree, l - 1, `then prefix(${l - 1})`);
    const frames = [...a.frames, ...b.frames];
    frames.push({
      tree,
      touched: [],
      message: `sum(${l}..${r}) = prefix(${r}) - prefix(${l - 1}) = ${a.sum} - ${b.sum} = ${a.sum - b.sum}. This subtraction is why Fenwick range queries need an operation you can undo: it works for sums, not for min or max.`,
    });
    start(`sum(${l}..${r})`, frames);
  };

  return (
    <div className="crypto-section">
      <h3>3. Step through a Fenwick tree</h3>
      <p className="gate-note">
        Positions are 1-based here, as inside every Fenwick tree (an array index i is position i + 1). Each bar is one cell
        tree[i]; it ends at column i and is lowbit(i) = i &amp; -i columns wide.
      </p>
      <div className="tool-inputs ai-inputs">
        <label>
          Array (up to 16 numbers)
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              start("build", traceFenBuild(parseNums(e.target.value, 16, fallback)));
            }}
            aria-label="Array for the Fenwick tree"
          />
        </label>
      </div>
      <div className="rq-ops">
        <div className="rq-op">
          <button onClick={() => start("build", traceFenBuild(nums))}>Build</button>
        </div>
        <div className="rq-op">
          <button onClick={runPrefix}>Prefix sum</button>
          <label>
            i
            <input className="rq-num" value={pi} onChange={(e) => setPi(e.target.value)} aria-label="Prefix up to position" inputMode="numeric" />
          </label>
        </div>
        <div className="rq-op">
          <button onClick={runAdd}>Add</button>
          <label>
            i
            <input className="rq-num" value={ai} onChange={(e) => setAi(e.target.value)} aria-label="Add at position" inputMode="numeric" />
          </label>
          <label>
            delta
            <input className="rq-num" value={ad} onChange={(e) => setAd(e.target.value)} aria-label="Delta to add" inputMode="numeric" />
          </label>
        </div>
        <div className="rq-op">
          <button onClick={runRange}>Range sum</button>
          <label>
            l
            <input className="rq-num" value={rl} onChange={(e) => setRl(e.target.value)} aria-label="Range left position" inputMode="numeric" />
          </label>
          <label>
            r
            <input className="rq-num" value={rr} onChange={(e) => setRr(e.target.value)} aria-label="Range right position" inputMode="numeric" />
          </label>
        </div>
      </div>
      <p className="rq-running">
        Running: <strong className="mono">{trace.label}</strong>
        {frame.touched.length > 0 && (
          <span className="rq-jumps mono"> path: {frame.touched.map((i) => `${i} (${bin(i)})`).join(" → ")}</span>
        )}
      </p>
      <FenwickGrid frame={frame} nums={nums} />
      <MarkLegend
        items={[
          { mark: "current", label: "current cell" },
          { mark: "visit", label: "touched in this operation" },
        ]}
      />
      <p className="rq-message" aria-live="polite">
        {frame.message}
      </p>
      <Stepper index={s} total={trace.frames.length} onIndex={setStep} />
      <p className="gate-note">
        Watch the binary: going down (prefix) clears the lowest 1 each step, so the number of steps is the number of 1 bits;
        going up (add) carries into higher bits until it passes n. Both are at most about log2(n) + 1 steps. Graded:{" "}
        <button className="link-button" onClick={() => openLesson("fenwick-range-add-point-query")}>
          Range Add, Point Query
        </button>
        ,{" "}
        <button className="link-button" onClick={() => openLesson("fenwick-count-smaller-after-self")}>
          Count of Smaller Numbers After Self
        </button>{" "}
        and{" "}
        <button className="link-button" onClick={() => openLesson("fenwick-count-inversions")}>
          Count Inversions
        </button>
        . The lowbit trick itself is in the{" "}
        <button className="link-button" onClick={() => openLesson("bit-manipulation-toolkit")}>
          Bit Manipulation Toolkit
        </button>
        .
      </p>
    </div>
  );
}

// ---------- 4. side-by-side ----------

const TABLE = [
  { s: "Prefix sums", build: "O(n)", update: "O(n)", query: "O(1)", space: "n + 1", ops: "sum, count, xor (anything invertible)" },
  { s: "Segment tree", build: "O(n)", update: "O(log n)", query: "O(log n)", space: "4n", ops: "any associative: sum, min, max, gcd, ..." },
  { s: "Fenwick tree", build: "O(n)", update: "O(log n)", query: "O(log n)", space: "n + 1", ops: "invertible: sum, count, xor" },
  { s: "Sparse table", build: "O(n log n)", update: "rebuild", query: "O(1)", space: "n log n", ops: "min, max, gcd (overlap-safe)" },
];

export function RangeQueries() {
  return (
    <div className="tool-widget">
      <CostCompare />
      <SegmentTreeStepper />
      <FenwickStepper />
      <div className="crypto-section">
        <h3>4. Side by side</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Structure</th>
                <th>Build</th>
                <th>Point update</th>
                <th>Range query</th>
                <th>Space</th>
                <th>Works for</th>
              </tr>
            </thead>
            <tbody>
              {TABLE.map((r) => (
                <tr key={r.s}>
                  <td>{r.s}</td>
                  <td className="mono">{r.build}</td>
                  <td className="mono">{r.update}</td>
                  <td className="mono">{r.query}</td>
                  <td className="mono">{r.space}</td>
                  <td>{r.ops}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          Range updates (add x to a whole slice) need one more idea, lazy propagation; that and a &quot;which structure?&quot;
          quiz are in{" "}
          <button className="link-button" onClick={() => openLesson("segment-tree-lazy-propagation")}>
            Lazy Propagation, and Choosing a Range-Query Structure
          </button>
          .
        </p>
      </div>
    </div>
  );
}
