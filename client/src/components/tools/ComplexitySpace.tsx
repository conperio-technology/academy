import { useMemo, useState } from "react";

// Part 1: DFS (the call stack) versus BFS (the queue) on three tree shapes, stepped one
// event at a time, with the live and peak size of the stack or queue. Part 2: auxiliary
// versus output space for common functions. Part 3: where space hides.

type Shape = "balanced" | "chain" | "broad";
type Walk = "dfs" | "bfs";

const SHAPES: { id: Shape; label: string; children: number[][] }[] = [
  {
    id: "balanced",
    label: "Balanced (15 nodes)",
    children: Array.from({ length: 15 }, (_, i) => (i < 7 ? [2 * i + 1, 2 * i + 2] : [])),
  },
  {
    id: "chain",
    label: "Chain (8 nodes)",
    children: Array.from({ length: 8 }, (_, i) => (i < 7 ? [i + 1] : [])),
  },
  {
    id: "broad",
    label: "Broad (15 nodes)",
    children: Array.from({ length: 15 }, (_, i) => (i === 0 ? [1, 2, 3, 4, 5, 6, 7] : i <= 7 ? [i + 7] : [])),
  },
];

interface Step {
  current: number;
  container: number[];
  done: Set<number>;
  note: string;
}

function dfsSteps(children: number[][]): Step[] {
  const steps: Step[] = [];
  const stack: number[] = [];
  const done = new Set<number>();
  const go = (u: number) => {
    stack.push(u);
    steps.push({ current: u, container: [...stack], done: new Set(done), note: `Call visit(${u + 1}): ${stack.length} frame${stack.length > 1 ? "s" : ""} on the stack.` });
    for (const v of children[u]) go(v);
    done.add(u);
    stack.pop();
    steps.push({ current: u, container: [...stack], done: new Set(done), note: `visit(${u + 1}) returns: its frame is popped.` });
  };
  go(0);
  return steps;
}

function bfsSteps(children: number[][]): Step[] {
  const steps: Step[] = [];
  const queue: number[] = [0];
  const done = new Set<number>();
  steps.push({ current: -1, container: [...queue], done: new Set(done), note: "Enqueue the root." });
  while (queue.length > 0) {
    const u = queue.shift()!;
    queue.push(...children[u]);
    done.add(u);
    steps.push({
      current: u,
      container: [...queue],
      done: new Set(done),
      note: `Dequeue ${u + 1}${children[u].length ? `, enqueue its ${children[u].length} child${children[u].length > 1 ? "ren" : ""}` : ""}: ${queue.length} waiting.`,
    });
  }
  return steps;
}

function layout(children: number[][]) {
  const x: number[] = [];
  const depth: number[] = [];
  let leaf = 0;
  const visit = (u: number, d: number) => {
    depth[u] = d;
    if (children[u].length === 0) x[u] = leaf++;
    else {
      children[u].forEach((v) => visit(v, d + 1));
      const kids = children[u];
      x[u] = (x[kids[0]] + x[kids[kids.length - 1]]) / 2;
    }
  };
  visit(0, 0);
  return { x, depth, leaves: leaf, maxDepth: Math.max(...depth) };
}

function Traversal() {
  const [shapeId, setShapeId] = useState<Shape>("balanced");
  const [walk, setWalk] = useState<Walk>("dfs");
  const [i, setI] = useState(0);
  const shape = SHAPES.find((s) => s.id === shapeId)!;
  const steps = useMemo(() => (walk === "dfs" ? dfsSteps(shape.children) : bfsSteps(shape.children)), [walk, shape]);
  const geo = useMemo(() => layout(shape.children), [shape]);
  const step = steps[Math.min(i, steps.length - 1)];
  const peak = Math.max(...steps.slice(0, i + 1).map((s) => s.container.length));
  const finalPeak = Math.max(...steps.map((s) => s.container.length));
  const COL = 40;
  const ROW = 46;
  const width = geo.leaves * COL;
  const height = (geo.maxDepth + 1) * ROW;
  const cx = (u: number) => geo.x[u] * COL + COL / 2;
  const cy = (u: number) => geo.depth[u] * ROW + 18;
  const inContainer = new Set(step.container);

  const reset = (fn: () => void) => {
    fn();
    setI(0);
  };

  return (
    <div>
      <div className="sql-presets">
        {SHAPES.map((s) => (
          <button key={s.id} className={s.id === shapeId ? "active" : ""} onClick={() => reset(() => setShapeId(s.id))}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="sql-presets">
        <button className={walk === "dfs" ? "active" : ""} onClick={() => reset(() => setWalk("dfs"))}>
          DFS (recursion: the call stack)
        </button>
        <button className={walk === "bfs" ? "active" : ""} onClick={() => reset(() => setWalk("bfs"))}>
          BFS (a queue)
        </button>
      </div>
      <div className="cr-scroll">
        <svg className="cr-svg" width={width} height={height} role="img" aria-label={`${walk.toUpperCase()} on a ${shape.label} tree`}>
          {shape.children.flatMap((kids, u) =>
            kids.map((v) => <line key={`${u}-${v}`} className="cr-edge" x1={cx(u)} y1={cy(u)} x2={cx(v)} y2={cy(v)} />),
          )}
          {shape.children.map((_, u) => (
            <g
              key={u}
              className={`cs-node ${u === step.current ? "cs-current" : ""} ${inContainer.has(u) ? "cs-live" : ""} ${step.done.has(u) ? "cs-done" : ""}`}
            >
              <circle cx={cx(u)} cy={cy(u)} r={14} />
              <text x={cx(u)} y={cy(u) + 4} textAnchor="middle">
                {u + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="ca-structure">
        <span className="readout-label">{walk === "dfs" ? "Call stack (bottom to top)" : "Queue (front to back)"}</span>
        <div className="ca-cells">
          {step.container.length === 0 ? (
            <span className="gate-note">empty</span>
          ) : (
            step.container.map((u, k) => (
              <span key={k} className="ca-cell ca-marked">
                {u + 1}
              </span>
            ))
          )}
        </div>
      </div>
      <p className="drill-statement ca-note">{step.note}</p>
      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">Size now</span>
          <span className="readout-value">{step.container.length}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Peak so far</span>
          <span className="readout-value">{peak}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Tree height, widest level</span>
          <span className="readout-value">
            {geo.maxDepth + 1}, {Math.max(...Array.from({ length: geo.maxDepth + 1 }, (_, d) => geo.depth.filter((x) => x === d).length))}
          </span>
        </div>
      </div>
      <div className="darr-actions">
        <button onClick={() => setI(0)} disabled={i === 0}>
          Reset
        </button>
        <button onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>
          Back
        </button>
        <button onClick={() => setI((x) => Math.min(steps.length - 1, x + 1))} disabled={i >= steps.length - 1}>
          Step
        </button>
        <button onClick={() => setI(steps.length - 1)} disabled={i >= steps.length - 1}>
          End
        </button>
      </div>
      {i >= steps.length - 1 && (
        <p className="gate-note">
          Peak {walk === "dfs" ? "stack depth" : "queue length"}: {finalPeak}.{" "}
          {walk === "dfs"
            ? "DFS space is the HEIGHT of the tree: O(log n) when balanced, O(n) for a chain."
            : "BFS space is the WIDTH of the widest level: about n / 2 for a balanced tree, 1 for a chain."}
        </p>
      )}
    </div>
  );
}

const CLASSIFY: { fn: string; aux: string; output: string; note: string }[] = [
  { fn: "Reverse an array in place", aux: "O(1)", output: "none", note: "Two indexes. The input does not count." },
  { fn: "Python sorted(a)", aux: "O(n)", output: "O(n)", note: "Timsort's merge buffer is up to n / 2, and the result is a new list." },
  { fn: "C# Array.Sort(a)", aux: "O(log n)", output: "none", note: "In place; introsort's recursion is capped at about 2 log n." },
  { fn: "Recursive sum of a list by index", aux: "O(n)", output: "O(1)", note: "No allocations, but n frames on the stack." },
  { fn: "All subsets of n items", aux: "O(n)", output: "O(n · 2ⁿ)", note: "Path and stack are O(n); the answer itself is huge." },
  { fn: "Memoized grid paths, n by m", aux: "O(n · m)", output: "O(1)", note: "The cache dominates; the stack is only n + m deep." },
  { fn: "LCS with two rows", aux: "O(m)", output: "O(1)", note: "Only the previous row is ever read." },
  { fn: "BFS over a graph", aux: "O(V)", output: "O(V) if it returns distances", note: "Visited set plus queue; the adjacency list is input." },
];

function Classify() {
  const [open, setOpen] = useState<boolean[]>(CLASSIFY.map(() => false));
  return (
    <div className="cg-table-wrap">
      <table className="bigo-table cs-classify">
        <thead>
          <tr>
            <th>Function</th>
            <th>Auxiliary</th>
            <th>Output</th>
          </tr>
        </thead>
        <tbody>
          {CLASSIFY.map((c, i) => (
            <tr key={c.fn}>
              <td>
                {c.fn}
                {open[i] && <span className="cm-sub gate-note">{c.note}</span>}
              </td>
              {open[i] ? (
                <>
                  <td className="mono">{c.aux}</td>
                  <td className="mono">{c.output}</td>
                </>
              ) : (
                <td colSpan={2}>
                  <button onClick={() => setOpen((o) => o.map((v, k) => (k === i ? true : v)))}>Reveal</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const HIDES: [string, string][] = [
  ["The call stack", "Every recursive call that has not returned yet holds a frame. Space = max depth × memory per frame. Python stops near 1000 frames by default; C# overflows at somewhere around tens of thousands, depending on frame size."],
  ["Memo tables and DP tables", "One entry per distinct state. A 2D table is O(n · m) even if you only need the last row."],
  ["Copies", "Slices, Substring, ToList, path + [x], new strings from +=. Live copies count while something still references them."],
  ["The output", "A returned list of n items is O(n). Say whether you are counting it: \"O(1) extra space, O(n) for the output\"."],
  ["Queues and stacks you manage", "BFS holds a level (width); an explicit DFS stack holds a path plus pending siblings."],
  ["Library internals", "Sorting buffers (Timsort O(n), introsort O(log n)), OrderBy buffers, a HashSet built from the input."],
  ["Not space: the input", "By convention the input itself does not count, unless you copy it. Modifying it in place is often the trick to O(1), so ask if that is allowed."],
];

export function ComplexitySpace() {
  return (
    <div className="tool-widget cs-widget">
      <h3>Stack depth versus queue width</h3>
      <Traversal />

      <h3 className="cr-heading">Auxiliary versus output space</h3>
      <p className="gate-note">Say each one before you reveal it.</p>
      <Classify />

      <h3 className="cr-heading">Where space hides</h3>
      <div className="cg-table-wrap">
        <table className="bigo-table">
          <tbody>
            {HIDES.map(([a, b]) => (
              <tr key={a}>
                <td>
                  <strong>{a}</strong>
                </td>
                <td>{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
