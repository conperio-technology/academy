import { useMemo, useState } from "react";
import { openLesson } from "../../api";

// Part 1: the cost of every single append under different growth policies, drawn as bars,
// so the rare expensive resizes and the flat average are both visible.
// Part 2: step-through tracers for two loops that look nested but are O(n) overall.

type Policy = "double" | "onePointFive" | "plusFour" | "hash";

const POLICIES: { id: Policy; label: string; note: string }[] = [
  {
    id: "double",
    label: "Double when full",
    note: "C# List<T> starts at 4 and doubles. Copies total 4 + 8 + 16 + ... < 2n, so the average stays below 3 per append however large n gets: amortized O(1).",
  },
  {
    id: "onePointFive",
    label: "Grow by 1.5×",
    note: "Any constant FACTOR works: resizes are rarer the bigger the array gets, and the copies still form a geometric series. The average stays below a constant (about 4 here). Python's list grows by roughly 1.125×, also a factor.",
  },
  {
    id: "plusFour",
    label: "Grow by +4",
    note: "Growing by a constant AMOUNT means a resize every 4 appends, each copying everything: 4 + 8 + 12 + ... + n is about n² / 8. The average per append keeps climbing with n: O(n) amortized, O(n²) total.",
  },
  {
    id: "hash",
    label: "Hash table, 75% load",
    note: "A hash table resizes when it is 75% full, doubling its buckets and reinserting every key. Same geometric series as the array, so inserts are amortized O(1) average.",
  },
];

function appendCosts(policy: Policy, n: number): number[] {
  const costs: number[] = [];
  let cap = policy === "hash" ? 8 : 4;
  for (let count = 0; count < n; count++) {
    let copied = 0;
    const full = policy === "hash" ? count + 1 > cap * 0.75 : count === cap;
    if (full) {
      copied = count;
      cap = policy === "double" || policy === "hash" ? cap * 2 : policy === "onePointFive" ? Math.ceil(cap * 1.5) : cap + 4;
    }
    costs.push(1 + copied);
  }
  return costs;
}

function GrowthChart() {
  const [policy, setPolicy] = useState<Policy>("double");
  const [n, setN] = useState(64);
  const costs = useMemo(() => appendCosts(policy, n), [policy, n]);
  const total = costs.reduce((a, b) => a + b, 0);
  const max = Math.max(...costs);
  const W = 600;
  const H = 150;
  const bw = W / n;
  const info = POLICIES.find((p) => p.id === policy)!;

  return (
    <div>
      <div className="sql-presets">
        {POLICIES.map((p) => (
          <button key={p.id} className={p.id === policy ? "active" : ""} onClick={() => setPolicy(p.id)}>
            {p.label}
          </button>
        ))}
      </div>
      <label className="cr-slider">
        n = <strong>{n}</strong> appends
        <input type="range" min={8} max={256} value={n} onChange={(e) => setN(Number(e.target.value))} />
      </label>
      <svg className="ca-chart" viewBox={`0 0 ${W} ${H + 18}`} role="img" aria-label={`Cost of each of ${n} appends`}>
        {costs.map((c, i) => {
          const h = Math.max(1, (c / max) * H);
          return <rect key={i} className={c > 1 ? "ca-bar ca-resize" : "ca-bar"} x={i * bw} y={H - h} width={Math.max(bw - 0.5, 0.5)} height={h} />;
        })}
        <text className="bigo-axis-label" x={0} y={H + 14}>
          append 1
        </text>
        <text className="bigo-axis-label" x={W} y={H + 14} textAnchor="end">
          append {n}
        </text>
      </svg>
      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">Total cost</span>
          <span className="readout-value">{total}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Average per append</span>
          <span className="readout-value">{(total / n).toFixed(2)}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Worst single append</span>
          <span className="readout-value">{max}</span>
        </div>
      </div>
      <p className="gate-note">
        Each bar is one append: 1 for the write, plus the number of items copied if it triggered a resize (highlighted). {info.note}
      </p>
    </div>
  );
}

// ---- Tracers ----

interface Step {
  focus: number; // index of the cell being processed
  marked: number[]; // cells inside the window or on the stack
  structure: string[];
  note: string;
  outer: number;
  inner: number;
}

const STACK_INPUT = [2, 7, 3, 1, 5, 4, 8, 6];

function stackSteps(): Step[] {
  const a = STACK_INPUT;
  const steps: Step[] = [];
  const stack: number[] = [];
  let outer = 0;
  let inner = 0;
  const snap = (focus: number, note: string) =>
    steps.push({ focus, marked: [...stack], structure: stack.map((i) => String(a[i])), note, outer, inner });
  snap(-1, "Start: empty stack. For each element, pop every smaller value (it just found its next greater element), then push.");
  for (let i = 0; i < a.length; i++) {
    outer++;
    while (stack.length > 0 && a[stack[stack.length - 1]] < a[i]) {
      const j = stack.pop()!;
      inner++;
      snap(i, `Pop ${a[j]}: its next greater element is ${a[i]}.`);
    }
    stack.push(i);
    snap(i, `Push ${a[i]}.`);
  }
  snap(-1, `Done. ${a.length} pushes and ${inner} pops: every element is pushed once and popped at most once, so the inner while ran ${inner} times in total, not up to ${a.length} per outer trip.`);
  return steps;
}

const WINDOW_INPUT = "abcbadcab";

function windowSteps(): Step[] {
  const s = WINDOW_INPUT;
  const steps: Step[] = [];
  const inWindow = new Set<string>();
  let left = 0;
  let outer = 0;
  let inner = 0;
  const range = (r: number) => Array.from({ length: r - left + 1 }, (_, k) => left + k);
  const snap = (focus: number, r: number, note: string) =>
    steps.push({ focus, marked: r >= left ? range(r) : [], structure: r >= left ? s.slice(left, r + 1).split("") : [], note, outer, inner });
  snap(-1, -1, "Longest substring without repeats. right moves forward every trip; left only moves forward when a repeat forces it.");
  for (let right = 0; right < s.length; right++) {
    outer++;
    while (inWindow.has(s[right])) {
      inWindow.delete(s[left]);
      left++;
      inner++;
      snap(right, right - 1, `"${s[right]}" is already in the window: drop "${s[left - 1]}" from the left.`);
    }
    inWindow.add(s[right]);
    snap(right, right, `Add "${s[right]}". Window is "${s.slice(left, right + 1)}".`);
  }
  snap(-1, s.length - 1, `Done. right moved ${s.length} times and left moved ${inner} times: at most 2n pointer moves, O(n), even though the code has a while inside a for.`);
  return steps;
}

function Tracer({ kind }: { kind: "stack" | "window" }) {
  const steps = useMemo(() => (kind === "stack" ? stackSteps() : windowSteps()), [kind]);
  const [i, setI] = useState(0);
  const step = steps[i];
  const cells = kind === "stack" ? STACK_INPUT.map(String) : WINDOW_INPUT.split("");
  const n = cells.length;
  return (
    <div className="ca-tracer">
      <div className="ca-cells">
        {cells.map((c, k) => (
          <span key={k} className={`ca-cell ${k === step.focus ? "ca-focus" : ""} ${step.marked.includes(k) ? "ca-marked" : ""}`}>
            {c}
          </span>
        ))}
      </div>
      <div className="ca-structure">
        <span className="readout-label">{kind === "stack" ? "Stack (bottom to top)" : "Window"}</span>
        <div className="ca-cells">
          {step.structure.length === 0 ? <span className="gate-note">empty</span> : step.structure.map((c, k) => <span key={k} className="ca-cell ca-marked">{c}</span>)}
        </div>
      </div>
      <p className="drill-statement ca-note">{step.note}</p>
      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">Outer trips</span>
          <span className="readout-value">{step.outer}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Inner trips, total</span>
          <span className="readout-value">{step.inner}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">n × n would be</span>
          <span className="readout-value">{n * n}</span>
        </div>
      </div>
      <div className="darr-actions">
        <button onClick={() => setI(0)} disabled={i === 0}>
          Reset
        </button>
        <button onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>
          Back
        </button>
        <button onClick={() => setI((x) => Math.min(steps.length - 1, x + 1))} disabled={i === steps.length - 1}>
          Step
        </button>
      </div>
    </div>
  );
}

const STACK_CODE = `int[] NextGreater(int[] a)
{
    var result = new int[a.Length];
    Array.Fill(result, -1);
    var stack = new Stack<int>();          // indexes
    for (int i = 0; i < a.Length; i++)
    {
        while (stack.Count > 0 && a[stack.Peek()] < a[i])
            result[stack.Pop()] = a[i];    // each index popped at most once
        stack.Push(i);                     // each index pushed exactly once
    }
    return result;
}`;

const WINDOW_CODE = `def longest_unique(s):
    seen, left, best = set(), 0, 0
    for right, ch in enumerate(s):
        while ch in seen:              # left never moves back
            seen.remove(s[left])
            left += 1
        seen.add(ch)
        best = max(best, right - left + 1)
    return best`;

export function ComplexityAmortized() {
  const [tracer, setTracer] = useState<"stack" | "window">("stack");
  return (
    <div className="tool-widget ca-widget">
      <h3>The cost of every append</h3>
      <GrowthChart />
      <p className="gate-note">
        Want to click through the resizes one push at a time?{" "}
        <button className="link-button" onClick={() => openLesson("dynamic-array-growth")}>
          Dynamic Arrays: How They Grow
        </button>{" "}
        has a step-by-step version, and{" "}
        <button className="link-button" onClick={() => openLesson("hash-table-internals")}>
          the hashing lesson
        </button>{" "}
        shows a resize from the inside.
      </p>

      <h3 className="cr-heading">Loops that look nested but are O(n)</h3>
      <div className="sql-presets">
        <button className={tracer === "stack" ? "active" : ""} onClick={() => setTracer("stack")}>
          Monotonic stack
        </button>
        <button className={tracer === "window" ? "active" : ""} onClick={() => setTracer("window")}>
          Sliding window
        </button>
      </div>
      <pre className="algo-code">{tracer === "stack" ? STACK_CODE : WINDOW_CODE}</pre>
      <Tracer key={tracer} kind={tracer} />

      <h3 className="cr-heading">How to say it</h3>
      <ul className="ca-say">
        <li>
          "Each element is pushed once and popped at most once, so across the whole run the inner loop does at most n pops. Total
          O(n), even though there is a while inside the for."
        </li>
        <li>
          "Both pointers only move forward and each moves at most n times, so the window does at most 2n steps: O(n)."
        </li>
        <li>
          "Append is amortized O(1): an individual append can cost O(n) when the array resizes, but doubling means n appends
          cost O(n) in total."
        </li>
      </ul>
    </div>
  );
}
