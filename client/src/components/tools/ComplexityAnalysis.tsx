import { useState } from "react";

interface Snippet {
  ask: "time" | "space";
  title: string;
  code: string;
  options: string[];
  answer: string;
  structure: string;
  perStep: string;
  verdict: string;
}

const SNIPPETS: Snippet[] = [
  {
    ask: "time",
    title: "A single pass",
    code: `int Sum(int[] a)
{
    int total = 0;
    foreach (var x in a)
        total += x;
    return total;
}`,
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: "O(n)",
    structure: "One loop, and it runs once per element: n trips.",
    perStep: "The body is a single addition: O(1).",
    verdict: "n trips × O(1) each = O(n).",
  },
  {
    ask: "time",
    title: "Every pair",
    code: `bool HasPair(int[] a, int target)
{
    for (int i = 0; i < a.Length; i++)
        for (int j = 0; j < a.Length; j++)
            if (a[i] + a[j] == target) return true;
    return false;
}`,
    options: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
    answer: "O(n²)",
    structure: "A loop of n trips with another loop of n trips INSIDE it: loops that nest multiply, n × n.",
    perStep: "The innermost body is one addition and one comparison: O(1).",
    verdict: "n × n × O(1) = O(n²).",
  },
  {
    ask: "time",
    title: "The triangle",
    code: `int CountPairs(int[] a)
{
    int count = 0;
    for (int i = 0; i < a.Length; i++)
        for (int j = i + 1; j < a.Length; j++)
            count++;
    return count;
}`,
    options: ["O(n)", "O(n²)", "O(n log n)", "O(n³)"],
    answer: "O(n²)",
    structure: "The inner loop starts at i + 1, so it runs n-1, then n-2, then n-3 ... times: about n(n-1)/2 trips in total.",
    perStep: "count++ is O(1).",
    verdict: "n(n-1)/2 is n²/2 - n/2. Drop the constant factor and the lower-order term and you're left with O(n²). Starting the inner loop later does not change the growth rate.",
  },
  {
    ask: "time",
    title: "Halving",
    code: `int CountHalvings(int n)
{
    int steps = 0;
    while (n > 1)
    {
        n = n / 2;
        steps++;
    }
    return steps;
}`,
    options: ["O(1)", "O(log n)", "O(n)", "O(√n)"],
    answer: "O(log n)",
    structure: "The remaining range is cut in half every trip, so it takes log₂ n trips to reach 1 (1,000,000 → 20 trips).",
    perStep: "Divide and increment: O(1).",
    verdict: "log n × O(1) = O(log n). This is the same shape as binary search.",
  },
  {
    ask: "time",
    title: "Loops in a row",
    code: `void Process(int[] a)
{
    foreach (var x in a) Console.WriteLine(x);
    foreach (var x in a) Console.WriteLine(x * 2);
}`,
    options: ["O(n)", "O(n²)", "O(2n²)", "O(log n)"],
    answer: "O(n)",
    structure: "Two loops, one AFTER the other (not nested). Sequential work adds: n + n = 2n.",
    perStep: "Each print is O(1).",
    verdict: "2n drops its constant factor: O(n). Only NESTED loops multiply.",
  },
  {
    ask: "time",
    title: "A loop with a hidden loop",
    code: `bool HasPair(List<int> nums, int target)
{
    foreach (var x in nums)
        if (nums.Contains(target - x))
            return true;
    return false;
}`,
    options: ["O(n)", "O(n log n)", "O(n²)", "O(1)"],
    answer: "O(n²)",
    structure: "One visible loop: n trips.",
    perStep: "List.Contains scans the list from the front -- that's a loop you can't see, up to n steps.",
    verdict: "n trips × O(n) per Contains = O(n²). It looks like one loop, but the data structure inside it adds the second.",
  },
  {
    ask: "time",
    title: "The same loop with a different structure",
    code: `bool HasPair(int[] nums, int target)
{
    var seen = new HashSet<int>(nums);
    foreach (var x in nums)
        if (seen.Contains(target - x))
            return true;
    return false;
}`,
    options: ["O(n)", "O(n log n)", "O(n²)", "O(1)"],
    answer: "O(n)",
    structure: "Building the set is n inserts, then one loop of n trips.",
    perStep: "HashSet.Contains is O(1) on average, and each insert is O(1) on average.",
    verdict: "n + n × O(1) = O(n). Identical loop to the previous snippet; swapping List for HashSet is the whole difference between O(n²) and O(n).",
  },
  {
    ask: "time",
    title: "Sort first",
    code: `int FirstDuplicate(int[] a)
{
    Array.Sort(a);
    for (int i = 1; i < a.Length; i++)
        if (a[i] == a[i - 1]) return a[i];
    return -1;
}`,
    options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    answer: "O(n log n)",
    structure: "A sort, THEN one loop of n trips -- sequential, so the costs add.",
    perStep: "Sorting is O(n log n); each loop trip is O(1), so the loop is O(n).",
    verdict: "O(n log n) + O(n) = O(n log n): when you add, the bigger term wins and the smaller one disappears.",
  },
  {
    ask: "time",
    title: "A loop whose inner loop doubles",
    code: `void Work(int n)
{
    for (int i = 0; i < n; i++)
        for (int j = 1; j < n; j *= 2)
            DoSomething();
}`,
    options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    answer: "O(n log n)",
    structure: "The outer loop runs n trips. The inner loop's j doubles every trip (1, 2, 4, 8 ...), so it runs log n times -- not n.",
    perStep: "DoSomething is O(1).",
    verdict: "n × log n × O(1) = O(n log n). Nested doesn't always mean n²: check how each loop's counter actually moves.",
  },
  {
    ask: "time",
    title: "Two calls per call",
    code: `int Fib(int n)
{
    if (n <= 1) return n;
    return Fib(n - 1) + Fib(n - 2);
}`,
    options: ["O(n)", "O(n²)", "O(2ⁿ)", "O(log n)"],
    answer: "O(2ⁿ)",
    structure: "Every call makes TWO more calls, and the depth is about n, so the call tree roughly doubles at each level: about 2ⁿ calls.",
    perStep: "Each call does O(1) work besides recursing.",
    verdict: "About 2ⁿ calls × O(1) = O(2ⁿ). Memoizing collapses this to n distinct calls: see Dynamic Programming: Fibonacci with Memoization.",
  },
  {
    ask: "space",
    title: "Building a lookup table",
    code: `HashSet<int> Unique(int[] a)
{
    var seen = new HashSet<int>();
    foreach (var x in a) seen.Add(x);
    return seen;
}`,
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: "O(n)",
    structure: "The set can end up holding one entry per distinct input element: up to n.",
    perStep: "Space counts what you ALLOCATE and keep, not how many steps you take.",
    verdict: "A structure that grows with the input is O(n) space.",
  },
  {
    ask: "space",
    title: "Recursion with no allocations",
    code: `int CountDown(int n)
{
    if (n == 0) return 0;
    return 1 + CountDown(n - 1);
}`,
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: "O(n)",
    structure: "No arrays, no sets -- but each call waits for the next, so n frames sit on the call stack at the deepest point.",
    perStep: "One stack frame per level of recursion.",
    verdict: "Recursion depth n = O(n) space, even though nothing is explicitly allocated. This is also why very deep recursion can overflow the stack.",
  },
  {
    ask: "space",
    title: "Two pointers",
    code: `bool IsPalindrome(string s)
{
    int left = 0, right = s.Length - 1;
    while (left < right)
        if (s[left++] != s[right--]) return false;
    return true;
}`,
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: "O(1)",
    structure: "Two integer variables, regardless of how long the string is.",
    perStep: "Nothing grows with the input; the string itself is the input, not extra space.",
    verdict: "A fixed number of variables = O(1) space, even though time is O(n).",
  },
];

const CHEAT_SHEET: [string, string][] = [
  ["One loop over n items", "n trips"],
  ["Loop inside a loop (both over n)", "n × n = n²"],
  ["Loop after a loop", "n + n = n (add, then keep the bigger)"],
  ["Range halves each trip", "log n trips"],
  ["Recursion, 1 call per call", "depth trips (often n)"],
  ["Recursion, 2 calls per call", "about 2ⁿ trips, unless memoized"],
  ["Array index / hash lookup", "O(1) each"],
  ["List.Contains / scanning a list", "O(n) each"],
  ["Sorting", "O(n log n)"],
  ["Heap push / pop", "O(log n) each"],
];

export function ComplexityAnalysis() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [results, setResults] = useState<boolean[]>([]);

  const done = index >= SNIPPETS.length;
  const snippet = SNIPPETS[index];

  function choose(option: string) {
    if (picked !== null) return;
    setPicked(option);
    setResults((r) => [...r, option === snippet.answer]);
  }

  function next() {
    setPicked(null);
    setIndex((i) => i + 1);
  }

  function restart() {
    setIndex(0);
    setPicked(null);
    setResults([]);
  }

  const score = results.filter(Boolean).length;

  return (
    <div className="tool-widget">
      <table className="bigo-table">
        <thead>
          <tr>
            <th>Code shape</th>
            <th>How many trips (or cost)</th>
          </tr>
        </thead>
        <tbody>
          {CHEAT_SHEET.map(([shape, cost]) => (
            <tr key={shape}>
              <td>{shape}</td>
              <td className="mono">{cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="gate-note">Then multiply the trips by the cost of what happens inside each trip.</p>

      {!done && (
        <div className="drill-card">
          <div className="drill-progress">
            Snippet {index + 1} of {SNIPPETS.length} -- what is the <strong>{snippet.ask}</strong> complexity?
          </div>
          <h3>{snippet.title}</h3>
          <pre className="algo-code">{snippet.code}</pre>

          <div className="drill-options">
            {snippet.options.map((option) => {
              const state =
                picked === null ? "" : option === snippet.answer ? "correct" : option === picked ? "wrong" : "dim";
              return (
                <button key={option} className={`drill-option ${state}`} onClick={() => choose(option)} disabled={picked !== null}>
                  {option}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <div className="drill-feedback">
              <p>
                <strong>{picked === snippet.answer ? "Correct." : `Not quite -- it's ${snippet.answer}.`}</strong>
              </p>
              <ol>
                <li>
                  <strong>How many trips:</strong> {snippet.structure}
                </li>
                <li>
                  <strong>Cost per trip:</strong> {snippet.perStep}
                </li>
                <li>
                  <strong>Put together:</strong> {snippet.verdict}
                </li>
              </ol>
              <div className="darr-actions">
                <button onClick={next}>{index + 1 < SNIPPETS.length ? "Next snippet" : "See results"}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {done && (
        <div className="drill-card">
          <h3>
            Score: {score} / {SNIPPETS.length}
          </h3>
          <p className="gate-note">
            {SNIPPETS.filter((_, i) => !results[i]).length === 0
              ? "Perfect. Every lesson in this app now has a \"Name the complexity\" check under the editor -- try it after you solve one."
              : `Missed: ${SNIPPETS.filter((_, i) => !results[i])
                  .map((s) => s.title)
                  .join(", ")}.`}
          </p>
          <div className="darr-actions">
            <button onClick={restart}>Run it again</button>
          </div>
        </div>
      )}
    </div>
  );
}
