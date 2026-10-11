import { useState } from "react";
import { openLesson } from "../../api";

// Part 1: the seven-step template for saying a complexity out loud. Part 2: weak answers to
// six real problems; tick which steps each one skipped, check, then read the strong answer.
// Part 3: phrases that help and phrases that hurt.

const STEPS: { name: string; say: string }[] = [
  { name: "Name n (and every other variable)", say: "\"Let n be the number of intervals.\" or \"n rows, m columns.\"" },
  { name: "Count the dominant work", say: "\"The loop runs n times.\" or \"Two calls per call, depth n, so about 2ⁿ calls.\"" },
  { name: "Multiply nested costs (price each trip)", say: "\"Each trip does a heap push, O(log k), so n log k.\"" },
  { name: "Add sequential costs", say: "\"Sorting first is O(n log n), then the pass is O(n).\"" },
  { name: "Drop constants and lower terms", say: "\"n log n + n is O(n log n).\"" },
  { name: "State space separately, including the stack", say: "\"Space is O(n) for the map, and the recursion is O(log n) deep.\"" },
  { name: "Say best, average and worst when they differ", say: "\"O(1) average for the hash lookups, O(n²) worst case for quicksort.\"" },
];

interface Example {
  id: string;
  title: string;
  lang: "C#" | "Python";
  code: string;
  weak: string;
  missing: number[]; // indexes into STEPS
  strong: string;
}

const EXAMPLES: Example[] = [
  {
    id: "two-sum",
    title: "Two Sum with a hash map",
    lang: "Python",
    code: `def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []`,
    weak: "\"It's O(n) because there's one loop.\"",
    missing: [0, 2, 5, 6],
    strong:
      "Let n be the length of nums. It's one pass, n trips. Each trip does a dictionary lookup and maybe an insert, both O(1) on average, so the time is O(n) average. (With pathological collisions a hash map degrades, but that's not the expected case.) Space is O(n): in the worst case the dictionary holds every element before we find the pair.",
  },
  {
    id: "merge-intervals",
    title: "Merge intervals",
    lang: "C#",
    code: `int[][] Merge(int[][] intervals)
{
    Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));
    var merged = new List<int[]>();
    foreach (var iv in intervals)
    {
        if (merged.Count > 0 && merged[^1][1] >= iv[0])
            merged[^1][1] = Math.Max(merged[^1][1], iv[1]);
        else
            merged.Add(iv);
    }
    return merged.ToArray();
}`,
    weak: "\"Sorting is n log n and the loop is n, so O(n log n + n).\"",
    missing: [0, 4, 5],
    strong:
      "n is the number of intervals. Sorting is O(n log n). Then one pass that either extends the last merged interval or appends, O(1) each, so O(n). They run one after the other, so they add: O(n log n + n), which is O(n log n). Space: the output can hold all n intervals, so O(n); Array.Sort itself adds O(log n) of recursion.",
  },
  {
    id: "islands",
    title: "Number of islands",
    lang: "Python",
    code: `def num_islands(grid):
    rows, cols = len(grid), len(grid[0])
    def sink(r, c):
        if 0 <= r < rows and 0 <= c < cols and grid[r][c] == "1":
            grid[r][c] = "0"
            sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1)
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                count += 1
                sink(r, c)
    return count`,
    weak: "\"Two nested loops, so O(n²), and O(1) space because we modify the grid.\"",
    missing: [0, 1, 5],
    strong:
      "Let the grid have r rows and c columns. The double loop visits r · c cells. Every land cell is sunk at most once, because sinking overwrites it, so all the flood fills together are another O(r · c), not r · c each. Total O(r · c). Space: no visited set, since we mark in place, but the recursion can go as deep as the biggest island, up to r · c cells for a snake-shaped one, so O(r · c) worst case.",
  },
  {
    id: "top-k",
    title: "Top k frequent elements",
    lang: "C#",
    code: `int[] TopKFrequent(int[] nums, int k)
{
    var count = new Dictionary<int, int>();
    foreach (var x in nums) count[x] = count.GetValueOrDefault(x) + 1;
    var heap = new PriorityQueue<int, int>();     // min-heap by count
    foreach (var (value, c) in count)
    {
        heap.Enqueue(value, c);
        if (heap.Count > k) heap.Dequeue();
    }
    var result = new int[heap.Count];
    for (int i = 0; i < result.Length; i++) result[i] = heap.Dequeue();
    return result;
}`,
    weak: "\"Heap operations are log n, so it's O(n log n).\"",
    missing: [0, 2, 3, 5],
    strong:
      "n is the number of elements, u the number of distinct values, and k the answer size. Counting is one pass with O(1) average updates: O(n). Then for each of the u distinct values we push onto a min heap that never holds more than k + 1, so O(log k) each: O(u log k). Those add: O(n + u log k), at most O(n log k). Space is O(u) for the counts plus O(k) for the heap, so O(n) in the worst case.",
  },
  {
    id: "subsets",
    title: "All subsets",
    lang: "Python",
    code: `def subsets(nums):
    out, path = [], []
    def go(i):
        if i == len(nums):
            out.append(path[:])
            return
        path.append(nums[i]); go(i + 1); path.pop()
        go(i + 1)
    go(0)
    return out`,
    weak: "\"It's exponential.\"",
    missing: [0, 1, 2, 5],
    strong:
      "n is the number of elements. Each one is either in or out, so the recursion tree has 2ⁿ leaves, one per subset, and depth n. At every leaf we copy the current path, up to n items, so the time is O(n · 2ⁿ), which matches the size of the output, so we can't do better. Space: the recursion and the path are O(n); the output itself is O(n · 2ⁿ) if we count it.",
  },
  {
    id: "quicksort",
    title: "In-place quicksort",
    lang: "C#",
    code: `void QuickSort(int[] a, int lo, int hi)
{
    if (lo >= hi) return;
    int pivot = a[hi], i = lo;
    for (int j = lo; j < hi; j++)
        if (a[j] < pivot) { (a[i], a[j]) = (a[j], a[i]); i++; }
    (a[i], a[hi]) = (a[hi], a[i]);
    QuickSort(a, lo, i - 1);
    QuickSort(a, i + 1, hi);
}`,
    weak: "\"Quicksort is O(n log n) time and O(1) space.\"",
    missing: [1, 5, 6],
    strong:
      "n is the array length. Each partition is a linear pass over its range. With balanced splits the range halves, so there are about log n levels of O(n) work: O(n log n) on average. With the last element as pivot, an already sorted array splits n minus 1 and 0 every time: n levels, O(n²) worst case, which a random pivot makes unlikely. Space is the recursion depth: O(log n) on average and O(n) in the worst case, unless you recurse into the smaller side first and loop on the bigger one.",
  },
];

function ExampleCard({ ex }: { ex: Example }) {
  const [ticks, setTicks] = useState<boolean[]>(STEPS.map(() => false));
  const [checked, setChecked] = useState(false);
  const missing = new Set(ex.missing);
  const right = STEPS.filter((_, i) => ticks[i] === missing.has(i)).length;
  return (
    <div className="drill-card">
      <span className="cg-tag cg-lang">{ex.lang}</span>
      <pre className="algo-code">{ex.code}</pre>
      <p className="drill-statement">
        A weak answer: <em>{ex.weak}</em>
      </p>
      <p className="gate-note">Tick every step of the template this answer skipped or got wrong.</p>
      <div className="ce-steps">
        {STEPS.map((s, i) => {
          const state = !checked ? "" : missing.has(i) ? (ticks[i] ? "ce-hit" : "ce-missed") : ticks[i] ? "ce-extra" : "";
          return (
            <label key={s.name} className={`tool-checkbox ce-step ${state}`}>
              <input
                type="checkbox"
                checked={ticks[i]}
                disabled={checked}
                onChange={() => setTicks((t) => t.map((v, k) => (k === i ? !v : v)))}
              />
              <span>
                {i + 1}. {s.name}
                {checked && missing.has(i) && <strong> (skipped)</strong>}
              </span>
            </label>
          );
        })}
      </div>
      {!checked ? (
        <div className="darr-actions">
          <button onClick={() => setChecked(true)}>Check, then show the strong answer</button>
        </div>
      ) : (
        <div className="drill-feedback">
          <p>
            <strong>
              {right} of {STEPS.length} steps judged right.
            </strong>{" "}
            The weak answer skipped steps {ex.missing.map((i) => i + 1).join(", ")}.
          </p>
          <p>
            <strong>A strong answer:</strong> {ex.strong}
          </p>
          <div className="darr-actions">
            <button
              onClick={() => {
                setTicks(STEPS.map(() => false));
                setChecked(false);
              }}
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const HELPS = [
  "\"Let n be ...\" before any formula.",
  "\"The inner loop runs at most n times in total, because left only moves forward.\"",
  "\"O(1) average, since it's a hash lookup.\"",
  "\"Plus the recursion stack, which is O(h).\"",
  "\"Not counting the output, which is O(n · 2ⁿ).\"",
  "\"That's optimal here: we have to read every element at least once.\"",
];

const HURTS = [
  "\"It's O(n)\" with no n defined, for a problem with two inputs.",
  "\"Two loops, so n²\" without checking what the loops iterate over.",
  "\"Hash maps are O(1)\" with no \"average\", or with string keys of length L.",
  "\"O(1) space\" for a recursive function.",
  "\"It's exponential\" with no base and no reason.",
  "Correcting yourself silently. Say \"actually, that sort makes it n log n\", out loud.",
];

export function ComplexityExplaining() {
  const [id, setId] = useState(EXAMPLES[0].id);
  const ex = EXAMPLES.find((e) => e.id === id)!;
  return (
    <div className="tool-widget ce-widget">
      <h3>The template</h3>
      <ol className="ce-template">
        {STEPS.map((s) => (
          <li key={s.name}>
            <strong>{s.name}.</strong> <span className="ce-say">{s.say}</span>
          </li>
        ))}
      </ol>
      <p className="gate-note">
        Then stop. A complete answer is usually three or four sentences. Offer the next level of detail (worst case, a faster
        alternative) instead of reciting it.
      </p>

      <h3 className="cr-heading">Weak answer, strong answer</h3>
      <div className="sql-presets">
        {EXAMPLES.map((e) => (
          <button key={e.id} className={e.id === id ? "active" : ""} onClick={() => setId(e.id)}>
            {e.title}
          </button>
        ))}
      </div>
      <ExampleCard key={ex.id} ex={ex} />

      <h3 className="cr-heading">Phrases</h3>
      <div className="ch-pair">
        <div className="ch-col">
          <p>
            <strong>Help</strong>
          </p>
          <ul className="ca-say">
            {HELPS.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
        <div className="ch-col">
          <p>
            <strong>Hurt</strong>
          </p>
          <ul className="ca-say">
            {HURTS.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="gate-note">
        Now practise on new code:{" "}
        <button className="link-button" onClick={() => openLesson("complexity-gym")}>
          the Complexity Gym
        </button>{" "}
        has an Explain it mode that grades your written explanation against this template.
      </p>
    </div>
  );
}
