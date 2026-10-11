import { useState } from "react";
import { shuffle } from "../../random";

// Part 1: "what does this really cost?" for ten traps, the same code in C# and Python side
// by side, predict first, then the reason and the fix. Part 2: a reference table of what
// common library calls cost in both languages.

interface Trap {
  id: string;
  name: string;
  vars: string;
  csharp: string;
  python: string;
  answer: string;
  distractors: string[];
  why: string;
  csFix: string;
  pyFix: string;
  fixCost: string;
}

const TRAPS: Trap[] = [
  {
    id: "concat",
    name: "String concatenation in a loop",
    vars: "n = total characters produced",
    csharp: `string s = "";
foreach (var w in words)
    s += w;          // new string every time`,
    python: `s = ""
for w in words:
    s += w`,
    answer: "O(n²)",
    distractors: ["O(n)", "O(n log n)"],
    why: "Strings are immutable in both languages, so each += allocates a new string and copies everything built so far. CPython can sometimes grow the string in place when nothing else references it, but that is an implementation detail (it does not apply in PyPy, or once another name points at the string), so plan for O(n²).",
    csFix: `var sb = new StringBuilder();
foreach (var w in words) sb.Append(w);
string s = sb.ToString();   // or string.Concat(words)`,
    pyFix: `s = "".join(words)`,
    fixCost: "O(n)",
  },
  {
    id: "slicing",
    name: "Slicing in recursion",
    vars: "n = length of the list or string",
    csharp: `int Sum(int[] a) =>
    a.Length == 0 ? 0 : a[0] + Sum(a[1..]);   // a[1..] copies`,
    python: `def total(a):
    return 0 if not a else a[0] + total(a[1:])`,
    answer: "O(n²)",
    distractors: ["O(n)", "O(n log n)"],
    why: "A range or slice of an array, list or string makes a COPY: n minus 1 items, then n minus 2, and so on, n times. Every frame also keeps its copy alive, so space is O(n²) too.",
    csFix: `int Sum(ReadOnlySpan<int> a) =>
    a.Length == 0 ? 0 : a[0] + Sum(a[1..]);   // a span slice is O(1)
// or pass an index: Sum(a, i + 1)`,
    pyFix: `def total(a, i=0):
    return 0 if i == len(a) else a[i] + total(a, i + 1)`,
    fixCost: "O(n) time, O(n) stack",
  },
  {
    id: "membership",
    name: "Membership test on a list",
    vars: "n = len(a) = len(b)",
    csharp: `foreach (var x in a)
    if (b.Contains(x))      // b is a List<int>
        common.Add(x);`,
    python: `for x in a:
    if x in b:              # b is a list
        common.append(x)`,
    answer: "O(n²)",
    distractors: ["O(n)", "O(n log n)"],
    why: "List.Contains and in on a list scan from the front: O(n) per check, inside a loop of n.",
    csFix: `var inB = new HashSet<int>(b);
foreach (var x in a)
    if (inB.Contains(x)) common.Add(x);`,
    pyFix: `in_b = set(b)
for x in a:
    if x in in_b:
        common.append(x)`,
    fixCost: "O(n) average",
  },
  {
    id: "front",
    name: "Removing from the front",
    vars: "n = number of items in the queue",
    csharp: `while (list.Count > 0)
{
    var item = list[0];
    list.RemoveAt(0);       // shifts everything left
    Handle(item);
}`,
    python: `while queue:
    item = queue.pop(0)     # shifts everything left
    handle(item)`,
    answer: "O(n²)",
    distractors: ["O(n)", "O(n log n)"],
    why: "List<T> and Python lists are arrays. Removing or inserting at index 0 moves every other element: O(n) each. Inside a loop of n, O(n²). This is the classic slow BFS.",
    csFix: `var queue = new Queue<T>(list);
while (queue.Count > 0) Handle(queue.Dequeue());   // O(1)`,
    pyFix: `from collections import deque
queue = deque(queue)
while queue:
    handle(queue.popleft())                        # O(1)`,
    fixCost: "O(n)",
  },
  {
    id: "sort-in-loop",
    name: "Sorting inside a loop",
    vars: "n = items, q = queries",
    csharp: `foreach (var q in queries)
{
    var sorted = items.OrderBy(x => x).ToList();
    answers.Add(sorted.BinarySearch(q) >= 0);
}`,
    python: `for q in queries:
    s = sorted(items)
    answers.append(bisect_left(s, q) < len(s) and s[bisect_left(s, q)] == q)`,
    answer: "O(q · n log n)",
    distractors: ["O(n log n + q log n)", "O(q log n)"],
    why: "The binary search is O(log n), but the sort above it runs again for every query, and it does not change between queries.",
    csFix: `var sorted = items.OrderBy(x => x).ToList();   // once
foreach (var q in queries)
    answers.Add(sorted.BinarySearch(q) >= 0);`,
    pyFix: `s = sorted(items)                               # once
for q in queries:
    i = bisect_left(s, q)
    answers.append(i < len(s) and s[i] == q)`,
    fixCost: "O((n + q) log n)",
  },
  {
    id: "count-in-loop",
    name: "Counting inside a loop",
    vars: "n = len(nums)",
    csharp: `foreach (var x in nums)
    if (nums.Count(y => y == x) > 1)    // LINQ Count(predicate)
        dupes.Add(x);`,
    python: `for x in nums:
    if nums.count(x) > 1:               # list.count scans
        dupes.append(x)`,
    answer: "O(n²)",
    distractors: ["O(n)", "O(n log n)"],
    why: "Count(predicate) and list.count are full scans. (The Count PROPERTY of a List and len() are O(1); the METHOD with a predicate is a loop.) A lazy LINQ query enumerated again inside a loop has the same problem: every Count(), ElementAt or foreach reruns the whole pipeline.",
    csFix: `var counts = nums.GroupBy(x => x)
                 .ToDictionary(g => g.Key, g => g.Count());
foreach (var x in nums)
    if (counts[x] > 1) dupes.Add(x);`,
    pyFix: `from collections import Counter
counts = Counter(nums)
dupes = [x for x in nums if counts[x] > 1]`,
    fixCost: "O(n) average",
  },
  {
    id: "path-copies",
    name: "Copying the path at every step",
    vars: "n = length of the linked list",
    csharp: `void Walk(Node? node, List<int> path)
{
    if (node == null) { Save(path); return; }
    Walk(node.Next, new List<int>(path) { node.Val });
}`,
    python: `def walk(node, path):
    if node is None:
        save(path)
        return
    walk(node.next, path + [node.val])`,
    answer: "O(n²)",
    distractors: ["O(n)", "O(2ⁿ)"],
    why: "path + [x] and new List<int>(path) copy the whole path at every level: 1 + 2 + ... + n. All those copies are still referenced by the waiting frames, so space is O(n²) as well.",
    csFix: `void Walk(Node? node, List<int> path)
{
    if (node == null) { Save(path); return; }
    path.Add(node.Val);
    Walk(node.Next, path);
    path.RemoveAt(path.Count - 1);   // backtrack, O(1)
}`,
    pyFix: `def walk(node, path):
    if node is None:
        save(path)
        return
    path.append(node.val)
    walk(node.next, path)
    path.pop()                       # backtrack, O(1)`,
    fixCost: "O(n) time, O(n) space",
  },
  {
    id: "dict-index",
    name: "Indexing into a dictionary",
    vars: "n = number of entries",
    csharp: `for (int i = 0; i < dict.Count; i++)
{
    var (key, value) = dict.ElementAt(i);   // walks from the start
    Use(key, value);
}`,
    python: `for i in range(len(d)):
    key = list(d)[i]                        # builds a list each time
    use(key, d[key])`,
    answer: "O(n²)",
    distractors: ["O(n)", "O(n log n)"],
    why: "Dictionaries have no positions. ElementAt(i) enumerates i entries, and list(d) copies every key, on every trip.",
    csFix: `foreach (var (key, value) in dict)
    Use(key, value);`,
    pyFix: `for key, value in d.items():
    use(key, value)`,
    fixCost: "O(n)",
  },
  {
    id: "max-in-loop",
    name: "max() in the loop body",
    vars: "n = len(a)",
    csharp: `for (int i = 0; i < a.Length; i++)
    if (a[i] == a.Max())     // LINQ Max scans
        idx.Add(i);`,
    python: `for i in range(len(a)):
    if a[i] == max(a):       # scans every time
        idx.append(i)`,
    answer: "O(n²)",
    distractors: ["O(n)", "O(n log n)"],
    why: "max, min and sum (and LINQ Max, Min, Sum, Average) are loops. The value does not change between trips, so it is n wasted scans.",
    csFix: `int best = a.Max();          // hoisted
for (int i = 0; i < a.Length; i++)
    if (a[i] == best) idx.Add(i);`,
    pyFix: `best = max(a)                # hoisted
idx = [i for i, x in enumerate(a) if x == best]`,
    fixCost: "O(n)",
  },
  {
    id: "copy-in-loop",
    name: "Snapshot copies",
    vars: "n = number of steps, the list grows by one each step",
    csharp: `var items = new List<int>();
for (int i = 0; i < n; i++)
{
    items.Add(i);
    history.Add(items.ToList());     // copy of everything so far
}`,
    python: `items = []
for i in range(n):
    items.append(i)
    history.append(items[:])         # copy of everything so far`,
    answer: "O(n²)",
    distractors: ["O(n)", "O(n log n)"],
    why: "ToList(), ToArray(), list(a), a[:] and a.copy() all copy every element. Copying a list of size i on step i is 1 + 2 + ... + n. Here the copies are kept, so space is O(n²) too.",
    csFix: `// Store what changed instead of a full copy:
history.Add(i);   // and rebuild a snapshot only when asked`,
    pyFix: `# Store what changed instead of a full copy:
history.append(i)  # and rebuild a snapshot only when asked`,
    fixCost: "O(n)",
  },
];

const TABLE: [string, string, string, string][] = [
  ["Index into an array or list", "a[i]", "a[i]", "O(1)"],
  ["Append at the end", "List.Add", "list.append", "amortized O(1)"],
  ["Insert or remove at the front", "Insert(0, x), RemoveAt(0)", "insert(0, x), pop(0)", "O(n)"],
  ["Both ends of a queue", "Queue Enqueue / Dequeue, LinkedList AddFirst", "deque append / popleft / appendleft", "O(1)"],
  ["Membership in a list", "List.Contains, IndexOf", "x in lst, lst.index(x)", "O(n)"],
  ["Membership in a set or dict", "HashSet.Contains, ContainsKey", "x in s, x in d", "O(1) average"],
  ["Length", ".Count, .Length (properties)", "len(x)", "O(1)"],
  ["Count with a filter", "Count(predicate), Where(...).Count()", "sum(1 for ...), lst.count(x)", "O(n)"],
  ["Min, max, sum", "Min(), Max(), Sum()", "min, max, sum", "O(n)"],
  ["Copy or slice k items", "ToList, ToArray, Substring, a[i..j] on arrays and strings", "a[:], a[i:j], list(a), s[i:j]", "O(k)"],
  ["View without copying", "AsSpan(i, k), span[i..j]", "memoryview(b)[i:j] (bytes only)", "O(1)"],
  ["Sort", "Array.Sort, List.Sort (introsort, O(log n) extra); OrderBy (stable, O(n) buffer)", "sorted, list.sort (Timsort, stable, up to O(n) extra)", "O(n log n)"],
  ["Heap push and pop", "PriorityQueue Enqueue, Dequeue", "heapq.heappush, heappop", "O(log n)"],
  ["Build a heap from n items", "new PriorityQueue(items), EnqueueRange", "heapq.heapify", "O(n)"],
  ["Sorted insert", "SortedSet.Add, SortedDictionary[key] = v", "bisect.insort (binary search, then an O(n) shift)", "O(log n) in C#, O(n) for insort"],
  ["Compare or hash a string of length L", "==, Equals, GetHashCode", "==, hash()", "O(L)"],
  ["Concatenate in a loop", "s += x", "s += x", "O(total²) worst; use StringBuilder or join"],
  ["Positional access in a dict", "ElementAt(i)", "list(d)[i]", "O(n)"],
];

function TrapCard({ trap }: { trap: Trap }) {
  const [options] = useState(() => shuffle([trap.answer, ...trap.distractors]));
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="drill-card">
      <p className="gate-note">Variables: {trap.vars}</p>
      <div className="ch-pair">
        <div className="ch-col">
          <span className="cg-tag cg-lang">C#</span>
          <pre className="algo-code">{trap.csharp}</pre>
        </div>
        <div className="ch-col">
          <span className="cg-tag cg-lang">Python</span>
          <pre className="algo-code">{trap.python}</pre>
        </div>
      </div>
      <p className="drill-statement">What is the total time?</p>
      <div className="drill-options">
        {options.map((o) => {
          const state = picked === null ? "" : o === trap.answer ? "correct" : o === picked ? "wrong" : "dim";
          return (
            <button key={o} className={`drill-option ${state}`} onClick={() => setPicked(o)} disabled={picked !== null}>
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="drill-feedback">
          <p>
            <strong>{picked === trap.answer ? "Correct." : `It is ${trap.answer}.`}</strong> {trap.why}
          </p>
          <p>
            <strong>The fix ({trap.fixCost}):</strong>
          </p>
          <div className="ch-pair">
            <div className="ch-col">
              <span className="cg-tag cg-lang">C#</span>
              <pre className="algo-code">{trap.csFix}</pre>
            </div>
            <div className="ch-col">
              <span className="cg-tag cg-lang">Python</span>
              <pre className="algo-code">{trap.pyFix}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ComplexityHiddenCosts() {
  const [id, setId] = useState(TRAPS[0].id);
  const trap = TRAPS.find((t) => t.id === id)!;
  return (
    <div className="tool-widget ch-widget">
      <h3>Predict the cost, then see why</h3>
      <div className="sql-presets">
        {TRAPS.map((t) => (
          <button key={t.id} className={t.id === id ? "active" : ""} onClick={() => setId(t.id)}>
            {t.name}
          </button>
        ))}
      </div>
      <TrapCard key={trap.id} trap={trap} />

      <h3 className="cr-heading">What the library call really costs</h3>
      <div className="cg-table-wrap">
        <table className="bigo-table ch-table">
          <thead>
            <tr>
              <th>Operation</th>
              <th>C#</th>
              <th>Python</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {TABLE.map(([op, cs, py, cost]) => (
              <tr key={op}>
                <td className="ch-op">{op}</td>
                <td className="ch-code" data-label="C#">
                  {cs}
                </td>
                <td className="ch-code" data-label="Python">
                  {py}
                </td>
                <td className="mono" data-label="Cost">
                  {cost}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="gate-note">
        Hash operations assume a decent hash function; with every key colliding they degrade to O(n), which is why you say
        "average". n is the size of the collection the call works on.
      </p>
    </div>
  );
}
