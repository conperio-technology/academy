import { src, type LangLessonData } from "./types.ts";

export const linq: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Filter and transform: Where and Select versus a comprehension",
      csharp: src`
int[] temps = [18, 25, 31, 22, 35];

var hot = temps.Where(t => t > 24).Select(t => $"{t}C").ToList();
Console.WriteLine(string.Join(", ", hot));          // 25C, 31C, 35C

// Query syntax: the same query, written like SQL
var hot2 = (from t in temps where t > 24 select $"{t}C").ToList();
Console.WriteLine(hot2.Count);                      // 3

var squares = Enumerable.Range(1, 5).Select(n => n * n).ToArray();
Console.WriteLine(string.Join(" ", squares));       // 1 4 9 16 25

var lengths = new[] { "pump", "fan" }.ToDictionary(w => w, w => w.Length);
Console.WriteLine(lengths["pump"]);                 // 4
var lastDigits = temps.Select(t => t % 10).ToHashSet();
Console.WriteLine(string.Join(" ", lastDigits.Order()));   // 1 2 5 8
`,
      python: src`
temps = [18, 25, 31, 22, 35]

hot = [f"{t}C" for t in temps if t > 24]
print(hot)                          # ['25C', '31C', '35C']

squares = [n * n for n in range(1, 6)]
print(squares)                      # [1, 4, 9, 16, 25]

# dict and set comprehensions
lengths = {w: len(w) for w in ["pump", "fan"]}
print(lengths)                      # {'pump': 4, 'fan': 3}
last_digits = {t % 10 for t in temps}
print(sorted(last_digits))          # [1, 2, 5, 8]
`,
      notes: [
        "LINQ (Language Integrated Query) is a set of C# methods, such as `Where`, `Select`, `OrderBy` and `Sum`, that work on any sequence: arrays, lists, dictionaries, even database tables. Each takes a lambda saying what to do with one item, and they chain left to right. `Where` keeps the items that pass a test; `Select` turns each item into something else. `ToList()`, `ToArray()`, `ToDictionary()` and `ToHashSet()` collect the results.",
        "Python builds the same things with comprehensions: `[expression for item in items if condition]` reads as \"the expression, for each item, keeping those where the condition holds\". Curly braces make a dict (`{key: value for ...}`) or a set (`{value for ...}`). They're the most common way to build a collection from another in Python, and usually clearer than `map` and `filter`.",
        "The query syntax (`from ... where ... select`) compiles to the same method calls. Method syntax is more common in everyday C#, and some operations, like `Count` or `ToList`, only exist as methods.",
      ],
    },
    {
      kind: "code",
      title: "Asking questions of a sequence: count, sum, any, all, first",
      csharp: src`
int[] q = [4, 8, 15, 16, 23, 42];

Console.WriteLine(q.Count(x => x % 2 == 0));          // 4
Console.WriteLine(q.Sum());                           // 108
Console.WriteLine(q.Average());                       // 18
Console.WriteLine(q.Max());                           // 42
Console.WriteLine(q.Any(x => x > 40));                // True
Console.WriteLine(q.All(x => x > 0));                 // True
Console.WriteLine(q.First(x => x > 10));              // 15
Console.WriteLine(q.FirstOrDefault(x => x > 100));    // 0: the default for int
Console.WriteLine(string.Join(" ", q.Skip(1).Take(2)));   // 8 15
`,
      python: src`
q = [4, 8, 15, 16, 23, 42]

print(sum(1 for x in q if x % 2 == 0))        # 4
print(sum(q))                                 # 108
print(sum(q) / len(q))                        # 18.0
print(max(q))                                 # 42
print(any(x > 40 for x in q))                 # True
print(all(x > 0 for x in q))                  # True
print(next(x for x in q if x > 10))           # 15
print(next((x for x in q if x > 100), None))  # None: the default we gave
print(q[1:3])                                 # [8, 15]
`,
      notes: [
        "`(x for x in q if ...)`, with round brackets, is a generator expression: like a list comprehension, but it produces items one at a time without building a list. Inside a function call the extra brackets can be dropped, as in `sum(1 for x in q if x % 2 == 0)` and `any(x > 40 for x in q)`. `any` and `all` stop as soon as the answer is known.",
        "`First` throws InvalidOperationException when nothing matches; `FirstOrDefault` returns the type's default instead (0 for numbers, null for objects), which can hide a bug when 0 is a real value. Python's `next(...)` raises StopIteration when nothing matches, unless you pass a default as the second argument.",
      ],
    },
    {
      kind: "code",
      title: "Grouping and sorting by more than one thing",
      csharp: src`
var orders = new[]
{
    (Line: "L1", Part: "bolt", Qty: 40),
    (Line: "L2", Part: "nut", Qty: 25),
    (Line: "L1", Part: "nut", Qty: 10),
    (Line: "L2", Part: "bolt", Qty: 5),
};

var byLine = orders.GroupBy(o => o.Line)
                   .ToDictionary(g => g.Key, g => g.Sum(o => o.Qty));
foreach (var (line, total) in byLine)
    Console.WriteLine($"{line}: {total}");          // L1: 50, then L2: 30

var ranked = orders.OrderBy(o => o.Part).ThenByDescending(o => o.Qty);
Console.WriteLine(string.Join(", ", ranked.Select(o => $"{o.Part} {o.Qty}")));
// bolt 40, bolt 5, nut 25, nut 10

foreach (var g in orders.GroupBy(o => o.Part))
    Console.WriteLine($"{g.Key}: {string.Join(" ", g.Select(o => o.Line))}");
// bolt: L1 L2, then nut: L2 L1
`,
      python: src`
from collections import defaultdict
from itertools import groupby

orders = [
    ("L1", "bolt", 40),
    ("L2", "nut", 25),
    ("L1", "nut", 10),
    ("L2", "bolt", 5),
]

by_line = defaultdict(int)
for line, part, qty in orders:
    by_line[line] += qty
print(dict(by_line))                      # {'L1': 50, 'L2': 30}

ranked = sorted(orders, key=lambda o: (o[1], -o[2]))
print(", ".join(f"{part} {qty}" for _, part, qty in ranked))
# bolt 40, bolt 5, nut 25, nut 10

# itertools.groupby only groups items that are next to each other: sort first
by_part = sorted(orders, key=lambda o: o[1])
for part, group in groupby(by_part, key=lambda o: o[1]):
    print(f"{part}: {' '.join(o[0] for o in group)}")
# bolt: L1 L2, then nut: L2 L1
`,
      notes: [
        "`GroupBy` collects items that share a key; each group has a `Key` and can be queried like any sequence (`g.Sum(...)`, `g.Count()`). Python has no single built-in for this: the usual way is a `defaultdict`, a dictionary that creates a missing entry (here 0, from `int`) the first time you touch it. `itertools.groupby` also exists but only groups neighbours, so it needs a sort first.",
        "To sort by several things, C# chains `OrderBy` with `ThenBy` (or the `Descending` versions). Python returns a tuple from the key function: tuples compare item by item, so `(part, -qty)` sorts by part, then by quantity from largest to smallest. Negating only works for numbers; for text, sort twice (the less important key first), since Python's sort is stable.",
      ],
    },
    {
      kind: "code",
      title: "Deferred execution: a query runs when you read it",
      csharp: src`
var data = new List<int> { 1, 2, 3 };
var big = data.Where(x =>
{
    Console.WriteLine($"checking {x}");
    return x > 1;
});
Console.WriteLine("query built");    // nothing has been checked yet
data.Add(4);
Console.WriteLine(big.Count());      // runs now, and sees the 4: prints 3
Console.WriteLine(big.Count());      // runs the whole query again
`,
      python: src`
data = [1, 2, 3]


def check(x):
    print(f"checking {x}")
    return x > 1


big = (x for x in data if check(x))   # generator expression: nothing runs yet
print("query built")
data.append(4)
print(sum(1 for _ in big))            # runs now, and sees the 4: prints 3
print(sum(1 for _ in big))            # 0: a generator can only be read once
`,
      notes: [
        "Most LINQ methods don't do the work when you call them: they return a description of the query, and the work happens each time something reads the results (a `foreach`, `Count()`, `ToList()`). This is deferred execution, also called lazy evaluation. It lets you build a query step by step and saves work when you only need the first few results.",
        "The catch is that the query runs again every time you read it, against whatever the data is by then. If you'll read results more than once, or the source might change, call `ToList()` once and keep the list. Python's generator expressions are also lazy, but they are used up after one pass, so a second read gives nothing: make a list if you need it twice.",
      ],
    },
    {
      kind: "table",
      title: "LINQ and Python side by side",
      head: ["Task", "C# LINQ", "Python", "Cost"],
      rows: [
        ["keep matching items", "`xs.Where(x => x > 0)`", "`[x for x in xs if x > 0]`", "O(n)"],
        ["transform each item", "`xs.Select(x => x * 2)`", "`[x * 2 for x in xs]`", "O(n)"],
        ["flatten nested lists", "`rows.SelectMany(r => r)`", "`[x for r in rows for x in r]`", "O(total)"],
        ["sort by key, then another", "`OrderBy(a).ThenBy(b)`", "`sorted(xs, key=lambda x: (a, b))`", "O(n log n)"],
        ["group by key", "`xs.GroupBy(x => key)`", "`defaultdict(list)` loop", "O(n)"],
        ["remove duplicates, keep order", "`xs.Distinct()`", "`list(dict.fromkeys(xs))`", "O(n)"],
        ["first n, skip n", "`Take(n)`, `Skip(n)`", "`xs[:n]`, `xs[n:]`, `islice`", "O(n)"],
        ["pair up two lists", "`a.Zip(b)`", "`zip(a, b)`", "O(n)"],
        ["count, sum, min, max", "`Count()`, `Sum()`, `Min()`, `Max()`", "`len`, `sum`, `min`, `max`", "O(n), `len` O(1)"],
        ["any or all match", "`Any(p)`, `All(p)`", "`any(...)`, `all(...)`", "O(n), stops early"],
        ["first match or a default", "`FirstOrDefault(p)`", "`next((x for x in xs if p), None)`", "O(n), stops early"],
        ["build a dictionary", "`ToDictionary(k, v)`", "`{k: v for x in xs}`", "O(n)"],
        ["fold into one value", "`Aggregate(seed, f)`", "`functools.reduce(f, xs, seed)`", "O(n)"],
      ],
      notes: [
        "The Big O column is the time for n items. `ToList()` or a list comprehension also uses O(n) memory; a lazy query or generator holds only the item in hand.",
      ],
    },
  ],
  predict: [
    {
      lang: "python",
      code: src`
print([x * 10 for x in range(5) if x % 2])
`,
      output: "[10, 30]",
      distractors: ["[0, 20, 40]", "[10, 30, 50]", "[0, 10, 20, 30, 40]"],
      why: "`x % 2` is 1 (true) for odd numbers and 0 (false) for even ones, so the condition keeps 1 and 3, which become 10 and 30.",
    },
    {
      lang: "csharp",
      code: src`
var words = new[] { "pump", "valve", "fan", "motor" };
var firsts = words.Where(w => w.Length > 3).Select(w => w[0]).ToArray();
Console.WriteLine(new string(firsts));
`,
      output: "pvm",
      distractors: ["pvfm", "pump", "fvm"],
      why: "\"fan\" has 3 letters, so `Where` drops it. `Select` keeps the first character of the rest, and `new string(char[])` joins the characters.",
    },
    {
      lang: "python",
      code: src`
grid = [[1, 2], [3, 4], [5]]
print([x for row in grid for x in row if x != 3])
`,
      output: "[1, 2, 4, 5]",
      distractors: ["[[1, 2], [4], [5]]", "[1, 2, 3, 4, 5]", "[[1, 2], [5]]"],
      why: "The `for` clauses read in the same order as nested loops: for each row, for each x in it. The result is one flat list without the 3.",
    },
    {
      lang: "csharp",
      code: src`
var list = new List<int> { 1, 2, 3 };
var evens = list.Where(x => x % 2 == 0);
list.Add(4);
list.Add(6);
Console.WriteLine(evens.Count());
`,
      output: "3",
      distractors: ["1", "2", "5"],
      why: "`Where` doesn't run until `Count()` reads it, and by then the list holds 1, 2, 3, 4, 6. Three of those are even.",
    },
    {
      lang: "python",
      code: src`
gen = (n * n for n in [1, 2, 3])
print(sum(gen))
print(sum(gen))
`,
      output: "14\n0",
      distractors: ["14\n14", "6\n0", "14\nStopIteration"],
      why: "1 + 4 + 9 = 14. The generator is used up by the first `sum`, and `sum` of nothing is 0.",
    },
    {
      lang: "csharp",
      code: src`
int[] xs = [5, 9, 12];
Console.WriteLine(xs.FirstOrDefault(x => x > 20));
Console.WriteLine(xs.Where(x => x > 6).Sum());
`,
      output: "0\n21",
      distractors: ["null\n21", "InvalidOperationException", "0\n12"],
      why: "Nothing is above 20, so `FirstOrDefault` returns `default(int)`, which is 0, not null. 9 + 12 = 21.",
    },
    {
      lang: "python",
      code: src`
names = ["ann", "bob", "amy"]
print({n[0]: n for n in names})
`,
      output: "{'a': 'amy', 'b': 'bob'}",
      distractors: ["{'a': 'ann', 'b': 'bob'}", "{'a': ['ann', 'amy'], 'b': ['bob']}", "{'a': 'ann', 'b': 'bob', 'a': 'amy'}"],
      why: "A dictionary has one value per key. 'amy' comes later and overwrites 'ann' under 'a'; the key keeps its original position. To keep every name, group into lists instead.",
    },
    {
      lang: "csharp",
      code: src`
var codes = new[] { "E1", "W3", "E7", "E2", "W1" };
foreach (var g in codes.GroupBy(c => c[0]))
    Console.WriteLine($"{g.Key} {g.Count()}");
`,
      output: "E 3\nW 2",
      distractors: ["E 1\nW 1\nE 1\nE 1\nW 1", "W 2\nE 3", "E1 3\nW3 2"],
      why: "`GroupBy` collects every item with the same key, wherever it appears, and lists groups in the order their keys first appear. The key here is the first character.",
    },
    {
      lang: "csharp",
      code: src`
var items = new[] { "bb", "a", "ccc", "aa", "c" };
Console.WriteLine(string.Join(" ", items.OrderBy(s => s.Length).ThenBy(s => s)));
`,
      output: "a c aa bb ccc",
      distractors: ["a aa bb c ccc", "a c bb aa ccc", "ccc bb aa c a"],
      why: "Shortest first; among items of the same length, `ThenBy` sorts alphabetically.",
    },
    {
      lang: "python",
      code: src`
print(sorted(["b2", "a10", "a9"], key=lambda s: (s[0], int(s[1:]))))
`,
      output: "['a9', 'a10', 'b2']",
      distractors: ["['a10', 'a9', 'b2']", "['b2', 'a9', 'a10']", "['a9', 'b2', 'a10']"],
      why: "The key is a tuple: the letter first, then the number as an int. As text, 'a10' would come before 'a9' because '1' < '9'; as numbers, 9 < 10.",
    },
  ],
  pitfalls: [
    "Reading a lazy query twice: C# runs it again (slow, and the data may have changed); a Python generator gives nothing the second time. Use `ToList()` or `list(...)` when you need the results more than once.",
    "Using `FirstOrDefault` on numbers and treating 0 as \"not found\". Check with `Any` first, or use a nullable type.",
    "Expecting `itertools.groupby` to group the whole list. It only groups neighbours, so sort by the same key first, or use a `defaultdict(list)`.",
    "Comprehensions with three `for` clauses and two conditions. When it stops being readable, write the loop.",
    "Changing a collection while a query over it is being read, which throws InvalidOperationException in C#.",
  ],
  next: [
    { id: "inter-group-by-length", label: "Exercise: Group Words by Length" },
    { id: "inter-passing-names", label: "Exercise: Who Passed? Filter, Sort and Pick" },
    { id: "lang-interfaces", label: "Interfaces, Protocols and Abstract Classes" },
    { id: "lang-cheat-csharp", label: "Cheat sheets: LINQ and comprehensions" },
  ],
};
