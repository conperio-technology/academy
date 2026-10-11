import { useState } from "react";

// Part 1: two sizes on sliders and what each formula gives. Part 2: "name the variables"
// cards to say out loud before revealing. Part 3: input value versus input size
// (pseudo-polynomial). Part 4: output-sensitive bounds.

function fmt(x: number): string {
  if (x < 1e12) return Math.round(x).toLocaleString("en-US");
  const e = Math.floor(Math.log10(x));
  return `${(x / 10 ** e).toFixed(1)} × 10^${e}`;
}

function duration(ops: number): string {
  const s = ops / 1e9; // about a billion simple steps per second
  if (s < 1e-3) return "under a millisecond";
  if (s < 1) return `${Math.round(s * 1000)} ms`;
  if (s < 120) return `${s.toFixed(1)} s`;
  if (s < 7200) return `${Math.round(s / 60)} minutes`;
  if (s < 172800) return `${Math.round(s / 3600)} hours`;
  if (s < 3.15e7 * 2) return `${Math.round(s / 86400)} days`;
  return `${fmt(s / 3.15e7)} years`;
}

const FORMULAS: { label: string; f: (n: number, m: number) => number }[] = [
  { label: "O(n + m)", f: (n, m) => n + m },
  { label: "O(n log m)", f: (n, m) => n * Math.max(1, Math.log2(m)) },
  { label: "O(m log n)", f: (n, m) => m * Math.max(1, Math.log2(n)) },
  { label: "O((n + m) log(n + m))", f: (n, m) => (n + m) * Math.log2(n + m) },
  { label: "O(n · m)", f: (n, m) => n * m },
  { label: "O(n²)", f: (n) => n * n },
];

function TwoSizes() {
  const [ne, setNe] = useState(5);
  const [me, setMe] = useState(2);
  const n = 10 ** ne;
  const m = 10 ** me;
  const values = FORMULAS.map((x) => x.f(n, m));
  const maxLog = Math.log10(Math.max(...values));
  return (
    <div>
      <div className="cv-sliders">
        <label className="cr-slider">
          n = <strong>{fmt(n)}</strong>
          <input type="range" min={1} max={7} value={ne} onChange={(e) => setNe(Number(e.target.value))} />
        </label>
        <label className="cr-slider">
          m = <strong>{fmt(m)}</strong>
          <input type="range" min={1} max={7} value={me} onChange={(e) => setMe(Number(e.target.value))} />
        </label>
      </div>
      <div className="cv-bars">
        {FORMULAS.map((x, i) => (
          <div key={x.label} className="cv-bar-row">
            <span className="cv-bar-label mono">{x.label}</span>
            <span className="cv-bar-track">
              <span className="cv-bar" style={{ width: `${Math.max(2, (100 * Math.log10(Math.max(values[i], 1))) / maxLog)}%` }} />
            </span>
            <span className="cv-bar-value mono">
              {fmt(values[i])} <span className="cv-dim">({duration(values[i])})</span>
            </span>
          </div>
        ))}
      </div>
      <p className="gate-note">
        Bars are on a log scale; times assume about a billion simple steps per second. With n = 100,000 and m = 100, O(n · m)
        is ten million steps and finishes in milliseconds, but calling it O(n²) would predict ten billion. Two inputs, two
        letters.
      </p>
    </div>
  );
}

interface Scenario {
  prompt: string;
  vars: string;
  answer: string;
  trap: string;
}

const SCENARIOS: Scenario[] = [
  {
    prompt: "Merge two sorted lists.",
    vars: "n and m, the two lengths.",
    answer: "O(n + m) time, O(n + m) for the merged output.",
    trap: "Saying O(n) assumes the lists are the same size. Saying O(n · m) means you think it is nested; it is one pass with two pointers.",
  },
  {
    prompt: "Group a list of words into anagram groups.",
    vars: "n words, L the length of the longest word.",
    answer: "Sorting each word as its key: O(n · L log L). Counting letters as the key: O(n · L). Space O(n · L).",
    trap: "O(n log n) treats each word as one item and ignores the per-word work, which is where all the time goes.",
  },
  {
    prompt: "Return the k most frequent elements.",
    vars: "n elements, u distinct values (u ≤ n), k to return.",
    answer: "Count with a hash map O(n), then a size-k heap over the u counts: O(n + u log k), usually written O(n log k). Bucket sort by count: O(n).",
    trap: "Sorting all counts gives O(n log n). Fine as a first answer, but name k: the heap is what makes small k cheap.",
  },
  {
    prompt: "BFS on a graph, and BFS on an n by m grid.",
    vars: "Graph: V vertices, E edges. Grid: n rows, m columns.",
    answer: "Graph: O(V + E). Grid: V = n · m cells and E ≤ 4 · n · m, so O(n · m).",
    trap: "On a grid, n is ambiguous. Say \"rows times columns\" or \"the number of cells\".",
  },
  {
    prompt: "Look up a word in a trie that holds N words.",
    vars: "L, the length of the word being looked up (N does not appear).",
    answer: "O(L) time, O(1) extra space.",
    trap: "O(log N) is what a balanced BST of words would cost (and that is O(L log N) once you count string comparisons).",
  },
  {
    prompt: "0/1 knapsack with n items and capacity W.",
    vars: "n items, and W, a NUMBER (the capacity), not a length.",
    answer: "O(n · W) time, O(W) space with one row (O(n · W) for the full table).",
    trap: "Calling it polynomial. W can be 10¹⁸ while taking 19 digits to write: this is pseudo-polynomial.",
  },
  {
    prompt: "Sort n strings.",
    vars: "n strings, L the maximum length.",
    answer: "O(L · n log n): n log n comparisons, each up to L characters.",
    trap: "\"Sorting is n log n\" counts comparisons, which are only O(1) for fixed-size keys.",
  },
  {
    prompt: "Edit distance between two strings.",
    vars: "n and m, the two lengths.",
    answer: "O(n · m) time, O(n · m) space, or O(min(n, m)) with two rows.",
    trap: "O(n²) when the strings have different lengths.",
  },
  {
    prompt: "Search a grid for a word (each cell used once per path).",
    vars: "n rows, m columns, L the word length.",
    answer: "O(n · m · 3ᴸ) time (4ᴸ is an accepted looser bound), O(L) stack.",
    trap: "Forgetting that the exponent is the WORD length, not the grid size.",
  },
  {
    prompt: "Dijkstra with a binary heap.",
    vars: "V vertices, E edges.",
    answer: "O((V + E) log V) time, O(V + E) space (lazy heap entries).",
    trap: "O(V log V) forgets the edge relaxations, each of which can push onto the heap.",
  },
];

function ScenarioCards() {
  const [open, setOpen] = useState<boolean[]>(SCENARIOS.map(() => false));
  return (
    <div className="cv-cards">
      {SCENARIOS.map((s, i) => (
        <div key={s.prompt} className="cv-card">
          <p className="cv-prompt">{s.prompt}</p>
          {!open[i] ? (
            <button onClick={() => setOpen((o) => o.map((v, k) => (k === i ? true : v)))}>Say the variables and the answer, then reveal</button>
          ) : (
            <div className="cv-reveal">
              <p>
                <strong>Variables:</strong> {s.vars}
              </p>
              <p>
                <strong>Answer:</strong> {s.answer}
              </p>
              <p className="gate-note">
                <strong>Trap:</strong> {s.trap}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PseudoPolynomial() {
  const [digits, setDigits] = useState(12);
  const value = 10 ** digits;
  const trial = Math.sqrt(value);
  const knap = 100 * value;
  const bits = Math.ceil(digits * Math.log2(10));
  return (
    <div>
      <label className="cr-slider">
        The input number has <strong>{digits}</strong> digits ({bits} bits)
        <input type="range" min={1} max={30} value={digits} onChange={(e) => setDigits(Number(e.target.value))} />
      </label>
      <div className="cg-table-wrap">
        <table className="bigo-table cv-pseudo">
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>In the value</th>
              <th>Steps</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Primality by trial division up to √x</td>
              <td className="mono">O(√x)</td>
              <td className="mono">{fmt(trial)}</td>
              <td>{duration(trial)}</td>
            </tr>
            <tr>
              <td>Knapsack, 100 items, capacity W = x</td>
              <td className="mono">O(n · W)</td>
              <td className="mono">{fmt(knap)}</td>
              <td>{duration(knap)}</td>
            </tr>
            <tr>
              <td>Counting the digits of x</td>
              <td className="mono">O(log x)</td>
              <td className="mono">{digits}</td>
              <td>{duration(digits)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="gate-note">
        Each extra digit multiplies x by 10, so O(√x) is 10 to the D / 2 in the number of digits D: exponential in the size of the
        input. That is why "O(√n) primality" and "O(n · W) knapsack" are called pseudo-polynomial. In an interview, say which
        one you mean: "O(√x) where x is the value".
      </p>
    </div>
  );
}

const OUTPUT_SENSITIVE: [string, string][] = [
  ["All subsets of n items", "O(n · 2ⁿ): the output alone has 2ⁿ subsets of average size n / 2, so no algorithm can be faster."],
  ["All pairs in a sorted list with sum at most T", "O(n log n + k) where k is the number of pairs reported. k can be n², so name it."],
  ["Every key in a BST between lo and hi", "O(h + k): walk down once (h), then visit the k keys in range."],
  ["Every occurrence of a pattern (KMP)", "O(n + m) to find them, whatever the count, because matches are reported as the scan passes."],
  ["Print all n² cells of a grid", "O(n²) is optimal: the output is the cost. Not a sign the algorithm is slow."],
];

export function ComplexityVariables() {
  return (
    <div className="tool-widget cv-widget">
      <h3>Two sizes, six formulas</h3>
      <TwoSizes />

      <h3 className="cr-heading">Name the variables first</h3>
      <p className="gate-note">Read the problem, say the letters out loud and what each one stands for, then the bound.</p>
      <ScenarioCards />

      <h3 className="cr-heading">Input value versus input size</h3>
      <PseudoPolynomial />

      <h3 className="cr-heading">Output-sensitive bounds</h3>
      <div className="cg-table-wrap">
        <table className="bigo-table">
          <tbody>
            {OUTPUT_SENSITIVE.map(([a, b]) => (
              <tr key={a}>
                <td>{a}</td>
                <td>{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
