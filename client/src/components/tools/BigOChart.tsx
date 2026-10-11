import { useMemo, useState } from "react";

interface Complexity {
  key: string;
  label: string;
  color: string;
  fn: (n: number) => number;
}

const MAX_N = 20;

const COMPLEXITIES: Complexity[] = [
  { key: "o1", label: "O(1)", color: "#7dd3a8", fn: () => 1 },
  { key: "ologn", label: "O(log n)", color: "#60a5fa", fn: (n) => Math.log2(n) },
  { key: "on", label: "O(n)", color: "#facc15", fn: (n) => n },
  { key: "onlogn", label: "O(n log n)", color: "#fb923c", fn: (n) => n * Math.log2(n) },
  { key: "on2", label: "O(n²)", color: "#f87171", fn: (n) => n * n },
  { key: "o2n", label: "O(2ⁿ)", color: "#c084fc", fn: (n) => 2 ** n },
];

interface DataStructureRow {
  structure: string;
  access: string;
  search: string;
  insert: string;
  delete: string;
  space: string;
}

// The classic "data structure Big O cheat sheet" table. Footnoted rows (†, ‡) call out
// the two things people most often get wrong reading a table like this at a glance.
const DATA_STRUCTURE_OPS: DataStructureRow[] = [
  { structure: "Array", access: "O(1)", search: "O(n)", insert: "O(n)†", delete: "O(n)†", space: "O(n)" },
  { structure: "Linked List", access: "O(n)", search: "O(n)", insert: "O(1)‡", delete: "O(1)‡", space: "O(n)" },
  { structure: "Stack / Queue", access: "O(n)", search: "O(n)", insert: "O(1)", delete: "O(1)", space: "O(n)" },
  { structure: "Hash Map", access: "—", search: "O(1) avg", insert: "O(1) avg", delete: "O(1) avg", space: "O(n)" },
  { structure: "Binary Search Tree (balanced)", access: "O(log n)", search: "O(log n)", insert: "O(log n)", delete: "O(log n)", space: "O(n)" },
  { structure: "Heap", access: "—", search: "O(n)", insert: "O(log n)", delete: "O(log n)", space: "O(n)" },
];

interface SortRow {
  algorithm: string;
  best: string;
  average: string;
  worst: string;
  space: string;
}

const SORTING_ALGORITHMS: SortRow[] = [
  { algorithm: "Bubble Sort", best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  { algorithm: "Insertion Sort", best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  { algorithm: "Selection Sort", best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  { algorithm: "Merge Sort", best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)" },
  { algorithm: "Quick Sort", best: "O(n log n)", average: "O(n log n)", worst: "O(n²)", space: "O(log n)" },
  { algorithm: "Heap Sort", best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(1)" },
];

const WIDTH = 640;
const HEIGHT = 260;
const PAD = 34;

export function BigOChart() {
  const [n, setN] = useState(10);

  const maxPlotValue = Math.max(...COMPLEXITIES.map((c) => c.fn(MAX_N)));

  const scaleX = (i: number) => PAD + (i / (MAX_N - 1)) * (WIDTH - PAD * 2);
  // Log-scaled y axis -- O(2^n) dwarfs everything else on a linear scale, so a linear
  // axis would flatten every other curve to the bottom. Values are floored at 1 before
  // taking the log (log(0) is undefined, and O(log n) at n=1 is legitimately 0).
  const scaleY = (v: number) => {
    const clamped = Math.max(v, 1);
    const t = Math.log(clamped) / Math.log(maxPlotValue);
    return HEIGHT - PAD - t * (HEIGHT - PAD * 2);
  };

  const series = useMemo(
    () =>
      COMPLEXITIES.map((c) => ({
        ...c,
        points: Array.from({ length: MAX_N }, (_, i) => {
          const x = i + 1;
          return `${scaleX(i)},${scaleY(c.fn(x))}`;
        }).join(" "),
      })),
    [maxPlotValue],
  );

  return (
    <div className="tool-widget">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="bigo-chart" role="img" aria-label="Big O growth curves">
        <line x1={PAD} y1={HEIGHT - PAD} x2={WIDTH - PAD} y2={HEIGHT - PAD} stroke="var(--border)" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={HEIGHT - PAD} stroke="var(--border)" />
        <text x={WIDTH / 2} y={HEIGHT - 6} textAnchor="middle" className="bigo-axis-label">
          n (input size)
        </text>
        <text
          x={14}
          y={HEIGHT / 2}
          textAnchor="middle"
          className="bigo-axis-label"
          transform={`rotate(-90, 14, ${HEIGHT / 2})`}
        >
          operations (log scale)
        </text>

        {series.map((s) => (
          <polyline key={s.key} points={s.points} fill="none" stroke={s.color} strokeWidth={2.5} />
        ))}

        <line x1={scaleX(n - 1)} y1={PAD} x2={scaleX(n - 1)} y2={HEIGHT - PAD} stroke="var(--text)" strokeDasharray="3 3" opacity={0.4} />
      </svg>

      <div className="bigo-legend">
        {COMPLEXITIES.map((c) => (
          <span key={c.key} className="bigo-legend-item">
            <span className="bigo-swatch" style={{ background: c.color }} />
            {c.label}
          </span>
        ))}
      </div>

      <label className="tool-single-input bigo-slider">
        n = {n}
        <input type="range" min={1} max={MAX_N} value={n} onChange={(e) => setN(Number(e.target.value))} />
      </label>

      <div className="tool-readout">
        {COMPLEXITIES.map((c) => (
          <div key={c.key} className="readout-cell">
            <span className="readout-label">{c.label}</span>
            <span className="readout-value">{Math.round(c.fn(n)).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <h4 className="bigo-table-heading">Data structure operations</h4>
      <table className="bigo-table">
        <thead>
          <tr>
            <th>Structure</th>
            <th>Access</th>
            <th>Search</th>
            <th>Insert</th>
            <th>Delete</th>
            <th>Space</th>
          </tr>
        </thead>
        <tbody>
          {DATA_STRUCTURE_OPS.map((row) => (
            <tr key={row.structure}>
              <td>{row.structure}</td>
              <td className="mono">{row.access}</td>
              <td className="mono">{row.search}</td>
              <td className="mono">{row.insert}</td>
              <td className="mono">{row.delete}</td>
              <td className="mono">{row.space}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="bigo-table-footnote">
        † Array insert/delete is O(1) at the end (amortized) but O(n) at an arbitrary position, since
        everything after it has to shift. ‡ Linked list insert/delete is O(1) ONLY if you already hold
        a reference to the spot -- finding that spot in the first place is O(n).
      </p>

      <h4 className="bigo-table-heading">Sorting algorithms</h4>
      <table className="bigo-table">
        <thead>
          <tr>
            <th>Algorithm</th>
            <th>Best</th>
            <th>Average</th>
            <th>Worst</th>
            <th>Space</th>
          </tr>
        </thead>
        <tbody>
          {SORTING_ALGORITHMS.map((row) => (
            <tr key={row.algorithm}>
              <td>{row.algorithm}</td>
              <td className="mono">{row.best}</td>
              <td className="mono">{row.average}</td>
              <td className="mono">{row.worst}</td>
              <td className="mono">{row.space}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
