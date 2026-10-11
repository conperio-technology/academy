import { useState } from "react";
import { openLesson } from "../../api";
import {
  clampInt,
  MarkLegend,
  parseNums,
  rangeLabel,
  SegTreeSvg,
  Stepper,
  type Mark,
  type SegFrame,
} from "./rangeQueryShared";

// Lazy propagation explainer: a sum segment tree with range add and range sum, stepped node by
// node so the learner sees tags being left on fully covered nodes and pushed down later, with a
// count of nodes touched versus doing each element as a point update. Then a "which structure?"
// quiz. The tree state (sums and pending tags) persists between operations, which is the point.

interface LazyState {
  sum: Record<number, number>;
  tag: Record<number, number>;
}

function buildLazy(nums: number[]): LazyState {
  const sum: Record<number, number> = {};
  const go = (k: number, lo: number, hi: number): number => {
    if (lo === hi) return (sum[k] = nums[lo]);
    const mid = (lo + hi) >> 1;
    return (sum[k] = go(2 * k, lo, mid) + go(2 * k + 1, mid + 1, hi));
  };
  go(1, 0, nums.length - 1);
  return { sum, tag: {} };
}

type Op = { kind: "add"; l: number; r: number; d: number } | { kind: "sum"; l: number; r: number };

function runLazy(n: number, st0: LazyState, op: Op): { frames: SegFrame[]; state: LazyState; visited: number; result?: number } {
  const sum = { ...st0.sum };
  const tag = { ...st0.tag };
  const frames: SegFrame[] = [];
  const marks: Record<number, Mark> = {};
  let visited = 0;
  const snap = (current: number | undefined, message: string) =>
    frames.push({ values: { ...sum }, tags: { ...tag }, marks: { ...marks }, current, message });

  const applyTag = (k: number, lo: number, hi: number, d: number) => {
    sum[k] += d * (hi - lo + 1);
    if (lo !== hi) tag[k] = (tag[k] ?? 0) + d;
  };
  const push = (k: number, lo: number, hi: number) => {
    const t = tag[k];
    if (!t) return;
    const mid = (lo + hi) >> 1;
    applyTag(2 * k, lo, mid, t);
    applyTag(2 * k + 1, mid + 1, hi, t);
    delete tag[k];
    marks[2 * k] = "push";
    marks[2 * k + 1] = "push";
    snap(
      k,
      `Push down: ${rangeLabel(lo, hi)} carried a tag of ${t > 0 ? "+" : ""}${t}, and we need to go below it. Each child gets sum += ${t} × its length and inherits the tag; the parent's tag is cleared.`,
    );
  };

  const opName = op.kind === "add" ? `add(${op.l}, ${op.r}, ${op.d > 0 ? "+" : ""}${op.d})` : `sum(${op.l}, ${op.r})`;
  snap(undefined, `${opName}: start at the root. Small numbers above a node are its pending lazy tags.`);

  const add = (k: number, lo: number, hi: number, l: number, r: number, d: number) => {
    visited++;
    if (r < lo || hi < l) {
      marks[k] = "outside";
      snap(k, `${rangeLabel(lo, hi)} is outside [${l}..${r}]: nothing to do.`);
      return;
    }
    if (l <= lo && hi <= r) {
      applyTag(k, lo, hi, d);
      marks[k] = "inside";
      snap(
        k,
        lo === hi
          ? `${rangeLabel(lo, hi)} is a single covered element: sum += ${d}.`
          : `${rangeLabel(lo, hi)} is fully covered: sum += ${d} × ${hi - lo + 1} = ${sum[k]}, and leave the tag ${tag[k] > 0 ? "+" : ""}${tag[k]} for its children instead of visiting them.`,
      );
      return;
    }
    marks[k] = "visit";
    snap(k, `${rangeLabel(lo, hi)} partly overlaps: push any tag down, then visit both children.`);
    push(k, lo, hi);
    const mid = (lo + hi) >> 1;
    add(2 * k, lo, mid, l, r, d);
    add(2 * k + 1, mid + 1, hi, l, r, d);
    sum[k] = sum[2 * k] + sum[2 * k + 1];
    marks[k] = "changed";
    snap(k, `Back at ${rangeLabel(lo, hi)}: recompute from the children, ${sum[2 * k]} + ${sum[2 * k + 1]} = ${sum[k]}.`);
  };

  const query = (k: number, lo: number, hi: number, l: number, r: number): number => {
    visited++;
    if (r < lo || hi < l) {
      marks[k] = "outside";
      snap(k, `${rangeLabel(lo, hi)} is outside [${l}..${r}]: contributes 0.`);
      return 0;
    }
    if (l <= lo && hi <= r) {
      marks[k] = "inside";
      snap(
        k,
        `${rangeLabel(lo, hi)} is fully inside: its sum ${sum[k]} is already correct${tag[k] ? `, even with a pending tag (the tag is only for its children)` : ""}. Use it, no push needed.`,
      );
      return sum[k];
    }
    marks[k] = "visit";
    snap(k, `${rangeLabel(lo, hi)} partly overlaps: push any tag down so the children are correct, then ask both.`);
    push(k, lo, hi);
    const mid = (lo + hi) >> 1;
    return query(2 * k, lo, mid, l, r) + query(2 * k + 1, mid + 1, hi, l, r);
  };

  let result: number | undefined;
  if (op.kind === "add") add(1, 0, n - 1, op.l, op.r, op.d);
  else result = query(1, 0, n - 1, op.l, op.r);

  const eager = op.kind === "add" ? (op.r - op.l + 1) * (Math.ceil(Math.log2(n)) + 1) : visited;
  snap(
    undefined,
    op.kind === "add"
      ? `Done: visited ${visited} nodes. Doing the ${op.r - op.l + 1} elements as separate point updates would touch about ${eager}. Tags left behind are paid off only if a later operation needs to go below them.`
      : `${opName} = ${result}, after visiting ${visited} nodes.`,
  );
  return { frames, state: { sum, tag }, visited, result };
}

const DEFAULT_NUMS = [5, 3, 7, 9, 2, 4, 6, 1];

function LazyStepper() {
  const [text, setText] = useState(DEFAULT_NUMS.join(", "));
  const nums = parseNums(text, 8, DEFAULT_NUMS);
  const n = nums.length;
  const [state, setState] = useState<LazyState>(() => buildLazy(DEFAULT_NUMS));
  const [al, setAl] = useState("1");
  const [ar, setAr] = useState("6");
  const [ad, setAd] = useState("3");
  const [ql, setQl] = useState("3");
  const [qr, setQr] = useState("4");
  const [log, setLog] = useState<string[]>([]);
  const initialFrame: SegFrame = {
    values: state.sum,
    tags: state.tag,
    marks: {},
    message: "A sum segment tree over the array. Run a range add, then a query that has to go below a tagged node.",
  };
  const [trace, setTrace] = useState<{ label: string; frames: SegFrame[] }>({ label: "built", frames: [initialFrame] });
  const [step, setStep] = useState(0);
  const s = Math.min(step, trace.frames.length - 1);
  const frame = trace.frames[s];

  const reset = (arr: number[]) => {
    const st = buildLazy(arr);
    setState(st);
    setLog([]);
    setTrace({
      label: "built",
      frames: [{ values: st.sum, tags: st.tag, marks: {}, message: "Rebuilt: no pending tags. Every node's sum is exact." }],
    });
    setStep(0);
  };

  const run = (op: Op) => {
    const out = runLazy(n, state, op);
    setState(out.state);
    const label = op.kind === "add" ? `add(${op.l}, ${op.r}, ${op.d > 0 ? "+" : ""}${op.d})` : `sum(${op.l}, ${op.r})`;
    setLog((g) => [...g, op.kind === "add" ? `${label}: ${out.visited} nodes` : `${label} = ${out.result}: ${out.visited} nodes`].slice(-6));
    setTrace({ label, frames: out.frames });
    setStep(0);
  };
  const bounds = (a: string, b: string): [number, number] => {
    let l = clampInt(a, 0, n - 1, 0);
    let r = clampInt(b, 0, n - 1, n - 1);
    if (l > r) [l, r] = [r, l];
    return [l, r];
  };

  return (
    <div className="crypto-section">
      <h3>1. Step through lazy propagation</h3>
      <div className="tool-inputs ai-inputs">
        <label>
          Array (up to 8 numbers)
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              reset(parseNums(e.target.value, 8, DEFAULT_NUMS));
            }}
            aria-label="Array for the lazy segment tree"
          />
        </label>
      </div>
      <div className="rq-ops">
        <div className="rq-op">
          <button onClick={() => run({ kind: "add", ...rangeOf(bounds(al, ar)), d: clampInt(ad, -99, 99, 1) })}>Range add</button>
          <label>
            left
            <input className="rq-num" value={al} onChange={(e) => setAl(e.target.value)} aria-label="Add from" inputMode="numeric" />
          </label>
          <label>
            right
            <input className="rq-num" value={ar} onChange={(e) => setAr(e.target.value)} aria-label="Add to" inputMode="numeric" />
          </label>
          <label>
            delta
            <input className="rq-num" value={ad} onChange={(e) => setAd(e.target.value)} aria-label="Delta" inputMode="numeric" />
          </label>
        </div>
        <div className="rq-op">
          <button onClick={() => run({ kind: "sum", ...rangeOf(bounds(ql, qr)) })}>Range sum</button>
          <label>
            left
            <input className="rq-num" value={ql} onChange={(e) => setQl(e.target.value)} aria-label="Sum from" inputMode="numeric" />
          </label>
          <label>
            right
            <input className="rq-num" value={qr} onChange={(e) => setQr(e.target.value)} aria-label="Sum to" inputMode="numeric" />
          </label>
        </div>
        <div className="rq-op">
          <button onClick={() => reset(nums)}>Rebuild</button>
        </div>
      </div>
      <p className="rq-running">
        Running: <strong className="mono">{trace.label}</strong>
      </p>
      <SegTreeSvg n={n} frame={frame} showTags />
      <MarkLegend
        items={[
          { mark: "current", label: "current node" },
          { mark: "visit", label: "partly overlaps" },
          { mark: "inside", label: "fully covered" },
          { mark: "push", label: "received a pushed tag" },
          { mark: "outside", label: "outside" },
          { mark: "changed", label: "recomputed" },
        ]}
      />
      <p className="rq-message" aria-live="polite">
        {frame.message}
      </p>
      <Stepper index={s} total={trace.frames.length} onIndex={setStep} />
      {log.length > 0 && (
        <p className="gate-note mono">History: {log.join(" | ")}</p>
      )}
      <p className="gate-note">
        Suggested run: add(1, 6, +3) leaves tags on [2..3] and [4..5]; then sum(3, 4) has to go inside both, so you see each
        tag pushed down exactly when it is needed. A query that stops at a tagged node never pushes, because that node&apos;s
        own sum already includes the add.
      </p>
    </div>
  );
}

const rangeOf = ([l, r]: [number, number]) => ({ l, r });

// ---------- 2. which structure? ----------

const CHOICES = ["Prefix sums", "Difference array", "Sparse table", "Fenwick tree", "Segment tree", "Lazy segment tree"] as const;
type Choice = (typeof CHOICES)[number];

const SCENARIOS: { text: string; answer: Choice; also?: Choice[]; why: string }[] = [
  {
    text: "A fixed list of daily sales. Answer 100,000 questions of the form \"total sales from day l to day r\".",
    answer: "Prefix sums",
    why: "Nothing changes, and sums can be subtracted, so one O(n) pass and O(1) per query is unbeatable.",
  },
  {
    text: "1,000,000 bookings each add one guest to every night from l to r. After all of them are in, report the busiest night.",
    answer: "Difference array",
    why: "Every update comes before every query (offline), so +1 at l and -1 at r + 1, then one prefix pass: O(n + q), no tree needed.",
  },
  {
    text: "A fixed array of temperatures. Answer millions of \"coldest reading between l and r\" queries as fast as possible.",
    answer: "Sparse table",
    also: ["Segment tree"],
    why: "Static data and min: a sparse table answers in O(1) after O(n log n) preprocessing, because overlapping windows don't hurt a min. A segment tree also works at O(log n) per query.",
  },
  {
    text: "Stock levels per warehouse change one at a time, and you are asked the total stock across warehouses l to r, interleaved.",
    answer: "Fenwick tree",
    also: ["Segment tree"],
    why: "Point updates and range sums: a Fenwick tree is the shortest correct answer, O(log n) each. A segment tree is also fine.",
  },
  {
    text: "Prices change one at a time, and you are asked the highest price in positions l to r, interleaved.",
    answer: "Segment tree",
    why: "Max can't be subtracted out, so a Fenwick tree's prefix(r) - prefix(l - 1) doesn't work. A segment tree handles any associative operation.",
  },
  {
    text: "Operations \"add x to every element in [l, r]\" and \"sum of [l, r]\" arrive mixed together.",
    answer: "Lazy segment tree",
    why: "Range updates AND range queries, interleaved: lazy propagation keeps both at O(log n). (Two Fenwick trees can also do range add plus range sum, a known trick.)",
  },
  {
    text: "For each element of an array, count how many later elements are smaller.",
    answer: "Fenwick tree",
    also: ["Segment tree"],
    why: "Scan from the right, keeping counts by value (after coordinate compression) in a Fenwick tree: prefix(rank - 1) per element. Merge sort also works.",
  },
  {
    text: "Operations \"add x to every element in [l, r]\" and \"what is element i now?\" arrive mixed together.",
    answer: "Fenwick tree",
    also: ["Lazy segment tree", "Segment tree"],
    why: "A difference array stored in a Fenwick tree: two point adds per range update, one prefix sum per read. No lazy tags needed.",
  },
];

function WhichStructure() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Choice | null>(null);
  const [score, setScore] = useState({ right: 0, done: 0 });
  const sc = SCENARIOS[i];
  const ok = (c: Choice) => c === sc.answer || (sc.also ?? []).includes(c);
  const finished = picked !== null && i === SCENARIOS.length - 1;

  return (
    <div className="crypto-section">
      <h3>2. Which structure?</h3>
      <p className="drill-progress">
        Scenario {i + 1} of {SCENARIOS.length} · {score.right} / {score.done} right
      </p>
      <p className="drill-statement">{sc.text}</p>
      <div className="drill-options">
        {CHOICES.map((c) => {
          const cls = picked === null ? "" : c === sc.answer ? "correct" : c === picked && !ok(c) ? "wrong" : ok(c) ? "correct" : "dim";
          return (
            <button
              key={c}
              className={`drill-option ${cls}`}
              disabled={picked !== null}
              onClick={() => {
                setPicked(c);
                setScore((s) => ({ right: s.right + (ok(c) ? 1 : 0), done: s.done + 1 }));
              }}
            >
              {c}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="drill-feedback">
          <p>
            <strong>{ok(picked) ? "Right." : `Best fit: ${sc.answer}.`}</strong>{" "}
            {sc.also && sc.also.length > 0 && `Also acceptable: ${sc.also.join(", ")}. `}
            {sc.why}
          </p>
          {finished ? (
            <p>
              Done: {score.right} of {SCENARIOS.length}.{" "}
              <button
                className="link-button"
                onClick={() => {
                  setI(0);
                  setPicked(null);
                  setScore({ right: 0, done: 0 });
                }}
              >
                Start again
              </button>
            </p>
          ) : (
            <button
              onClick={() => {
                setI((x) => Math.min(x + 1, SCENARIOS.length - 1));
                setPicked(null);
              }}
            >
              Next scenario
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- 3. decision table ----------

const GUIDE = [
  { need: "Static array, range sums", pick: "Prefix sums", cost: "O(n) build, O(1) query" },
  { need: "All range updates first, then reads (offline)", pick: "Difference array", cost: "O(n + q)" },
  { need: "Static array, range min / max / gcd", pick: "Sparse table", cost: "O(n log n) build, O(1) query" },
  { need: "Point updates + range sums or counts", pick: "Fenwick tree", cost: "O(log n) each" },
  { need: "Range add + point reads, interleaved", pick: "Fenwick over differences", cost: "O(log n) each" },
  { need: "Point updates + range min / max / any associative op", pick: "Segment tree", cost: "O(log n) each" },
  { need: "Range updates + range queries, interleaved", pick: "Segment tree with lazy propagation", cost: "O(log n) each" },
  { need: "Count smaller / larger before or after each element", pick: "Fenwick over compressed values, or merge sort", cost: "O(n log n)" },
];

export function LazyPropagation() {
  return (
    <div className="tool-widget">
      <LazyStepper />
      <WhichStructure />
      <div className="crypto-section">
        <h3>3. The decision table</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>You need</th>
                <th>Reach for</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {GUIDE.map((g) => (
                <tr key={g.need}>
                  <td>{g.need}</td>
                  <td>{g.pick}</td>
                  <td className="mono bt-wrap">{g.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          In an interview, say the simplest structure that fits and why the simpler ones fail (&quot;prefix sums would make every
          update O(n)&quot;). Back to the basics in{" "}
          <button className="link-button" onClick={() => openLesson("range-query-structures")}>
            Range Queries: Prefix Sums vs Segment Trees vs Fenwick Trees
          </button>
          , or practise with{" "}
          <button className="link-button" onClick={() => openLesson("fenwick-range-add-point-query")}>
            Range Add, Point Query
          </button>
          .
        </p>
      </div>
    </div>
  );
}
