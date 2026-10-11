import { useMemo, useState } from "react";

// Part 1: a call tree drawn from the actual recursion (not canned), with the recursion
// tree method's per-level table under it. Part 2: a Master theorem calculator.
// Part 3: a cheat sheet of the recurrences interviews actually use.

interface CallNode {
  label: string;
  work: number; // cost of this call apart from its children
  hit?: boolean; // memo cache hit: returns at once
  children: CallNode[];
}

interface FnSpec {
  id: string;
  name: string;
  code: string;
  min: number;
  max: number;
  start: number;
  recurrence: string;
  time: string;
  space: string;
  why: string;
  build: (n: number) => CallNode;
}

function fibTree(k: number): CallNode {
  return { label: `fib(${k})`, work: 1, children: k > 1 ? [fibTree(k - 1), fibTree(k - 2)] : [] };
}

function fibMemoTree(n: number): CallNode {
  const memo = new Set<number>();
  const go = (k: number): CallNode => {
    if (k <= 1) return { label: `fib(${k})`, work: 1, children: [] };
    if (memo.has(k)) return { label: `fib(${k})`, work: 1, hit: true, children: [] };
    const node = { label: `fib(${k})`, work: 1, children: [go(k - 1), go(k - 2)] };
    memo.add(k);
    return node;
  };
  return go(n);
}

function halvesTree(name: string, n: number, workIsSize: boolean): CallNode {
  const children = n > 1 ? [halvesTree(name, Math.ceil(n / 2), workIsSize), halvesTree(name, Math.floor(n / 2), workIsSize)] : [];
  return { label: `${name}(${n})`, work: workIsSize ? n : 1, children };
}

function searchTree(n: number): CallNode {
  return { label: `search(${n})`, work: 1, children: n > 1 ? [searchTree(Math.floor(n / 2))] : [] };
}

function chainTree(n: number): CallNode {
  return { label: `f(${n})`, work: n, children: n > 1 ? [chainTree(n - 1)] : [] };
}

const FUNCTIONS: FnSpec[] = [
  {
    id: "fib",
    name: "Naive Fibonacci",
    code: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)`,
    min: 1,
    max: 7,
    start: 5,
    recurrence: "T(n) = T(n - 1) + T(n - 2) + O(1)",
    time: "O(2ⁿ)",
    space: "O(n)",
    why: "Two calls per call and a depth of n: the level counts roughly double (1, 2, 4, 8 ... until the shorter fib(n - 2) branches run out). Not a divide and conquer recurrence, so the Master theorem does not apply; count the tree. The exact growth is about 1.618ⁿ, and O(2ⁿ) is the accepted upper bound. Space is only the deepest path, n frames.",
    build: fibTree,
  },
  {
    id: "memo",
    name: "Memoized Fibonacci",
    code: `@lru_cache(maxsize=None)
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)`,
    min: 1,
    max: 12,
    start: 7,
    recurrence: "n distinct subproblems × O(1) each",
    time: "O(n)",
    space: "O(n)",
    why: "The left branch computes fib(n - 1) all the way down first, so every right branch above the base cases is a cache hit (dashed) that returns at once. The tree collapses to a spine with one short branch hanging off each node: about 2n calls. Memoization's rule: time = number of distinct states × work per state. Space is the cache plus the n-deep spine.",
    build: fibMemoTree,
  },
  {
    id: "search",
    name: "Binary search",
    code: `def search(a, lo, hi, x):
    if lo > hi: return -1
    mid = (lo + hi) // 2
    if a[mid] == x: return mid
    if a[mid] < x: return search(a, mid + 1, hi, x)
    return search(a, lo, mid - 1, x)`,
    min: 1,
    max: 64,
    start: 32,
    recurrence: "T(n) = T(n/2) + O(1)",
    time: "O(log n)",
    space: "O(log n)",
    why: "One call per call on half the range: a chain log₂ n long. Master theorem: a = 1, b = 2, d = 0, log₂ 1 = 0 = d, so O(n⁰ log n) = O(log n). The recursive version keeps the chain on the stack; the loop version is O(1) space.",
    build: searchTree,
  },
  {
    id: "merge",
    name: "Merge sort",
    code: `def sort(a):
    if len(a) <= 1: return a
    mid = len(a) // 2
    left, right = sort(a[:mid]), sort(a[mid:])
    return merge(left, right)    # O(len(a))`,
    min: 1,
    max: 16,
    start: 8,
    recurrence: "T(n) = 2T(n/2) + O(n)",
    time: "O(n log n)",
    space: "O(n)",
    why: "Look at the work column: every level adds up to n, because the ranges at one level partition the array. There are log₂ n + 1 levels. n per level × log n levels = O(n log n). Master theorem: a = 2, b = 2, d = 1, log₂ 2 = 1 = d, the balanced case.",
    build: (n) => halvesTree("sort", n, true),
  },
  {
    id: "halves",
    name: "Two halves, O(1) each",
    code: `def biggest(a, lo, hi):
    if lo == hi: return a[lo]
    mid = (lo + hi) // 2
    return max(biggest(a, lo, mid),
               biggest(a, mid + 1, hi))`,
    min: 1,
    max: 16,
    start: 8,
    recurrence: "T(n) = 2T(n/2) + O(1)",
    time: "O(n)",
    space: "O(log n)",
    why: "Same tree shape as merge sort, but each call does O(1), so the work column is the call count: 1, 2, 4 ... n. That sum is about 2n: the leaves dominate. Master theorem: a = 2, b = 2, d = 0, log₂ 2 = 1 > 0, so O(n¹). Divide and conquer is not automatically n log n.",
    build: (n) => halvesTree("max", n, false),
  },
  {
    id: "chain",
    name: "Shrink by one, scan each time",
    code: `def f(a, n):
    if n == 0: return 0
    best = max(a[:n])          # O(n)
    return best + f(a, n - 1)`,
    min: 1,
    max: 12,
    start: 6,
    recurrence: "T(n) = T(n - 1) + O(n)",
    time: "O(n²)",
    space: "O(n)",
    why: "A chain of n calls whose work shrinks by one: n + (n - 1) + ... + 1 = n(n + 1) / 2. The Master theorem only handles n / b, so unroll it instead. Same total as selection sort and insertion sort's worst case. The stack is n deep.",
    build: chainTree,
  },
];

interface Placed {
  node: CallNode;
  x: number;
  depth: number;
  parent: Placed | null;
}

function layout(root: CallNode): { placed: Placed[]; leaves: number; depth: number } {
  const placed: Placed[] = [];
  let leaf = 0;
  let maxDepth = 0;
  const visit = (node: CallNode, depth: number, parent: Placed | null): Placed => {
    const p: Placed = { node, x: 0, depth, parent };
    placed.push(p);
    maxDepth = Math.max(maxDepth, depth);
    if (node.children.length === 0) p.x = leaf++;
    else {
      const kids = node.children.map((c) => visit(c, depth + 1, p));
      p.x = (kids[0].x + kids[kids.length - 1].x) / 2;
    }
    return p;
  };
  visit(root, 0, null);
  return { placed, leaves: leaf, depth: maxDepth };
}

const NODE_H = 24;
const ROW_H = 54;

function CallTree({ spec }: { spec: FnSpec }) {
  const [n, setN] = useState(spec.start);
  const [level, setLevel] = useState<number | null>(null);
  const root = useMemo(() => spec.build(n), [spec, n]);
  const { placed, leaves, depth } = useMemo(() => layout(root), [root]);

  const levels = Array.from({ length: depth + 1 }, (_, d) => {
    const at = placed.filter((p) => p.depth === d);
    return { depth: d, calls: at.length, work: at.reduce((s, p) => s + p.node.work, 0), hits: at.filter((p) => p.node.hit).length };
  });
  const totalCalls = placed.length;
  const totalWork = levels.reduce((s, l) => s + l.work, 0);
  // Box width follows the longest label (11px monospace is about 7px per character).
  const NODE_W = Math.max(44, Math.max(...placed.map((p) => p.node.label.length)) * 7 + 12);
  const COL_W = NODE_W + 6;
  const width = Math.max(leaves * COL_W, COL_W);
  const height = (depth + 1) * ROW_H;
  const cx = (p: Placed) => p.x * COL_W + COL_W / 2;
  const cy = (p: Placed) => p.depth * ROW_H + NODE_H / 2 + 4;

  return (
    <div className="cr-tree-block">
      <label className="cr-slider">
        n = <strong>{n}</strong>
        <input type="range" min={spec.min} max={spec.max} value={n} onChange={(e) => setN(Number(e.target.value))} />
      </label>
      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">Calls</span>
          <span className="readout-value">{totalCalls}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Total work</span>
          <span className="readout-value">{totalWork}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Deepest stack</span>
          <span className="readout-value">{depth + 1} frames</span>
        </div>
      </div>
      <div className="cr-scroll">
        <svg className="cr-svg" width={width} height={height} role="img" aria-label={`Call tree of ${spec.name} for n = ${n}`}>
          {placed
            .filter((p) => p.parent)
            .map((p, i) => (
              <line key={`e${i}`} className="cr-edge" x1={cx(p.parent!)} y1={cy(p.parent!) + NODE_H / 2} x2={cx(p)} y2={cy(p) - NODE_H / 2} />
            ))}
          {placed.map((p, i) => (
            <g key={i} className={`cr-node ${p.node.hit ? "cr-hit" : ""} ${level === p.depth ? "cr-on" : ""}`}>
              <rect x={cx(p) - NODE_W / 2} y={cy(p) - NODE_H / 2} width={NODE_W} height={NODE_H} rx={5} />
              <text x={cx(p)} y={cy(p) + 4} textAnchor="middle">
                {p.node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <p className="gate-note">
        The recursion tree method: add up the work level by level, then add the levels. Tap a row to highlight that level.
        {levels.some((l) => l.hits > 0) && " Dashed boxes are cache hits that return at once."}
      </p>
      <div className="cg-table-wrap">
        <table className="bigo-table cr-levels">
          <thead>
            <tr>
              <th>Level</th>
              <th>Calls</th>
              <th>Work at this level</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((l) => (
              <tr key={l.depth} className={level === l.depth ? "cm-row-on" : ""} onClick={() => setLevel(level === l.depth ? null : l.depth)}>
                <td className="mono">{l.depth}</td>
                <td className="mono">
                  {l.calls}
                  {l.hits > 0 ? ` (${l.hits} hit${l.hits > 1 ? "s" : ""})` : ""}
                </td>
                <td className="mono">{l.work}</td>
              </tr>
            ))}
            <tr>
              <td>Total</td>
              <td className="mono">{totalCalls}</td>
              <td className="mono">{totalWork}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- Master theorem ----

const SUP: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };

function nPow(e: number): string {
  if (Math.abs(e) < 1e-9) return "1";
  if (Math.abs(e - 1) < 1e-9) return "n";
  if (Math.abs(e - Math.round(e)) < 1e-9) return `n${String(Math.round(e)).replace(/\d/g, (d) => SUP[d])}`;
  return `n^${e.toFixed(2)}`;
}

const PRESETS = [
  { label: "Binary search", a: 1, b: 2, d: 0 },
  { label: "Merge sort", a: 2, b: 2, d: 1 },
  { label: "Tree traversal by halves", a: 2, b: 2, d: 0 },
  { label: "Karatsuba", a: 3, b: 2, d: 1 },
  { label: "Strassen", a: 7, b: 2, d: 2 },
  { label: "Quadratic combine", a: 2, b: 2, d: 2 },
];

function MasterTheorem() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(2);
  const [d, setD] = useState(1);
  const c = Math.log(a) / Math.log(b);
  const eq = Math.abs(c - d) < 1e-9;
  const result = eq ? (d === 0 ? "O(log n)" : `O(${nPow(d)} log n)`) : c > d ? `O(${nPow(c)})` : `O(${nPow(d)})`;
  const caseText = eq
    ? `log_${b} ${a} = ${d}: every level does the same work, ${nPow(d)}, and there are log n levels. Multiply them.`
    : c > d
      ? `log_${b} ${a} ≈ ${c.toFixed(2)} > ${d}: the number of calls grows faster than the work per call shrinks, so the LEAVES dominate. There are ${a} to the log_${b} n = ${nPow(c)} leaves.`
      : `log_${b} ${a} ≈ ${c.toFixed(2)} < ${d}: the work per level shrinks as you go down, so the TOP call dominates: ${nPow(d)}.`;

  const field = (label: string, value: number, set: (v: number) => void, min: number, max: number) => (
    <label>
      {label}
      <input type="number" min={min} max={max} value={value} onChange={(e) => set(Math.min(max, Math.max(min, Number(e.target.value) || min)))} />
    </label>
  );

  return (
    <div className="cr-master">
      <p className="drill-statement cr-formula">
        T(n) = <strong>{a}</strong> T(n / <strong>{b}</strong>) + O({nPow(d)})
      </p>
      <div className="tool-inputs cr-inputs">
        {field("a: calls per call", a, setA, 1, 8)}
        {field("b: shrink factor", b, setB, 2, 4)}
        {field("d: work exponent", d, setD, 0, 3)}
      </div>
      <div className="sql-presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            className={p.a === a && p.b === b && p.d === d ? "active" : ""}
            onClick={() => {
              setA(p.a);
              setB(p.b);
              setD(p.d);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="drill-feedback">
        <p>
          <strong>{result}</strong>
        </p>
        <p>{caseText}</p>
      </div>
    </div>
  );
}

const CHEAT: [string, string, string][] = [
  ["T(n) = T(n/2) + O(1)", "O(log n)", "binary search"],
  ["T(n) = T(n/2) + O(n)", "O(n)", "quickselect (average), halving with a scan"],
  ["T(n) = 2T(n/2) + O(1)", "O(n)", "tree traversal, max by halves"],
  ["T(n) = 2T(n/2) + O(n)", "O(n log n)", "merge sort, quicksort (average)"],
  ["T(n) = T(n - 1) + O(1)", "O(n)", "linear recursion, factorial"],
  ["T(n) = T(n - 1) + O(n)", "O(n²)", "selection sort, quicksort (worst)"],
  ["T(n) = 2T(n - 1) + O(1)", "O(2ⁿ)", "Towers of Hanoi, subsets"],
  ["T(n) = T(n - 1) + T(n - 2) + O(1)", "O(2ⁿ) (about 1.618ⁿ)", "naive Fibonacci"],
  ["T(n) = n · T(n - 1) + O(1)", "O(n!)", "permutations"],
];

export function ComplexityRecursion() {
  const [fnId, setFnId] = useState(FUNCTIONS[0].id);
  const spec = FUNCTIONS.find((f) => f.id === fnId)!;

  return (
    <div className="tool-widget cr-widget">
      <h3>Call tree visualizer</h3>
      <div className="sql-presets">
        {FUNCTIONS.map((f) => (
          <button key={f.id} className={f.id === fnId ? "active" : ""} onClick={() => setFnId(f.id)}>
            {f.name}
          </button>
        ))}
      </div>
      <pre className="algo-code">{spec.code}</pre>
      <CallTree key={spec.id} spec={spec} />
      <div className="drill-feedback">
        <p>
          <strong>{spec.recurrence}</strong>: time {spec.time}, space {spec.space}.
        </p>
        <p>{spec.why}</p>
      </div>

      <h3 className="cr-heading">Master theorem</h3>
      <p className="gate-note">
        For T(n) = a T(n / b) + O(n^d): a subproblems, each 1 / b the size, plus n^d work to split and combine. Compare log_b a
        with d.
      </p>
      <MasterTheorem />

      <h3 className="cr-heading">Recurrences worth memorizing</h3>
      <div className="cg-table-wrap">
        <table className="bigo-table">
          <thead>
            <tr>
              <th>Recurrence</th>
              <th>Solves to</th>
              <th>Where you see it</th>
            </tr>
          </thead>
          <tbody>
            {CHEAT.map(([r, s, w]) => (
              <tr key={r}>
                <td className="mono">{r}</td>
                <td className="mono">{s}</td>
                <td>{w}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="gate-note">
        Rule of thumb for recursion: time is (number of calls) × (work per call), or branches to the power of depth when every
        call branches the same way. Space is depth × (memory per frame), plus anything that outlives the calls, like a memo
        table.
      </p>
    </div>
  );
}
