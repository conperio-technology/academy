import { src, type LangLessonData } from "./types.ts";

export const functional: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Pure functions and data that doesn't change",
      csharp: src`
using System.Collections.Immutable;

int[] readings = [3, 9, 4];
Console.WriteLine(string.Join(",", Scaled(readings, 10)));   // 30,90,40
Console.WriteLine(string.Join(",", readings));               // 3,9,4: input untouched

var setpoint = new Setpoint("TIC-1", 72.0);
var raised = setpoint with { Value = 75.0 };                 // a changed copy
Console.WriteLine($"{setpoint.Value} {raised.Value}");       // 72 75

ImmutableList<string> tags = ["FT-1"];
var more = tags.Add("PT-2");                                 // returns a new list
Console.WriteLine($"{tags.Count} {more.Count}");             // 1 2

static int[] Scaled(int[] values, int factor) => values.Select(v => v * factor).ToArray();

record Setpoint(string Loop, double Value);
`,
      python: src`
from dataclasses import dataclass, replace


def scaled(values, factor):          # pure: builds a new list, changes nothing
    return [v * factor for v in values]


readings = [3, 9, 4]
print(scaled(readings, 10))          # [30, 90, 40]
print(readings)                      # [3, 9, 4]: input untouched


@dataclass(frozen=True)
class Setpoint:
    loop: str
    value: float


setpoint = Setpoint("TIC-1", 72.0)
raised = replace(setpoint, value=75.0)       # a changed copy
print(setpoint.value, raised.value)          # 72.0 75.0

tags = ("FT-1",)                             # tuples and frozensets can't change
more = tags + ("PT-2",)
print(len(tags), len(more))                  # 1 2
`,
      notes: [
        "A pure function's result depends only on its arguments, and calling it changes nothing else: no modified inputs, no global state, no printing or file writing. Pure functions are easy to test (no setup, no mocks), safe to call from several threads at once, safe to cache, and easy to reason about because nothing they do is hidden. Functional style means building most of a program from pure functions and keeping the impure parts (input and output, the clock, the database) at the edges.",
        "The companion habit is immutability: instead of changing an object, make a changed copy. C# records with `with`, `ImmutableList<T>` and the other `System.Collections.Immutable` types, and Python's tuples, frozensets, frozen dataclasses and `dataclasses.replace` all support it. Immutable collections share most of their internal structure between versions, so `Add` doesn't copy the whole list.",
        "Functional style isn't all or nothing. A loop with a local list inside a function is fine as long as the function as a whole is pure.",
      ],
    },
    {
      kind: "code",
      title: "Pipelines: LINQ and generator chains",
      csharp: src`
string[] log = ["PT-1:4.2", "bad", "PT-2:5.0", "FT-1:12.5", "PT-1:3.8", "FT-1:x"];

var averages = log
    .Select(line => line.Split(':'))
    .Where(parts => parts.Length == 2 && double.TryParse(parts[1], out _))
    .Select(parts => (Tag: parts[0], Value: double.Parse(parts[1])))
    .GroupBy(r => r.Tag[..2])                        // by instrument type
    .OrderBy(g => g.Key)
    .Select(g => $"{g.Key}={g.Average(r => r.Value):0.00}");

Console.WriteLine(string.Join(" ", averages));      // FT=12.50 PT=4.33

int product = new[] { 1, 2, 3, 4 }.Aggregate(1, (acc, x) => acc * x);
Console.WriteLine(product);                         // 24
`,
      python: src`
from functools import reduce
from itertools import groupby
from statistics import mean

log = ["PT-1:4.2", "bad", "PT-2:5.0", "FT-1:12.5", "PT-1:3.8", "FT-1:x"]


def parse(line):
    tag, sep, value = line.partition(":")
    try:
        return tag, float(value)
    except ValueError:
        return None


readings = (parse(line) for line in log)                  # lazy, like LINQ
valid = (r for r in readings if r is not None)
by_type = sorted(valid, key=lambda r: r[0][:2])           # groupby needs sorted input
averages = [f"{kind}={mean(v for _, v in group):.2f}"
            for kind, group in groupby(by_type, key=lambda r: r[0][:2])]
print(" ".join(averages))                                 # FT=12.50 PT=4.33

print(reduce(lambda acc, x: acc * x, [1, 2, 3, 4], 1))    # 24
`,
      notes: [
        "A pipeline is a series of small steps, each taking a sequence and producing a new one: parse, filter, transform, group, summarise. LINQ methods chain naturally; in Python, generator expressions feed each other lazily, and comprehensions finish the job. Each step is a pure function of the previous one, so you can test and reorder them independently. (The C# parsing and `0.00` formatting follow the current culture; for data files pass `CultureInfo.InvariantCulture`, as the files lesson shows.)",
        "`Aggregate` and `functools.reduce` fold a sequence into one value by applying a function to an accumulator and each item. They're powerful but often less readable than `Sum`, `sum`, `max`, `math.prod` or a plain loop; reach for them when no named function fits.",
        "Watch out for one difference: LINQ's `GroupBy` collects all items with equal keys wherever they are, while `itertools.groupby` only groups runs of equal keys that are next to each other, so sort first (or use a dict) unless runs are what you want.",
      ],
    },
    {
      kind: "code",
      title: "The itertools toolbox, and the LINQ equivalents",
      csharp: src`
int[] xs = [1, 2, 3, 4, 5];
Console.WriteLine(string.Join(",", xs.Zip(xs.Skip(1), (a, b) => b - a)));           // 1,1,1,1: pairwise
Console.WriteLine(string.Join(",", Running(xs)));                                     // 1,3,6,10,15
Console.WriteLine(string.Join("|", xs.Chunk(2).Select(c => string.Join(",", c))));    // 1,2|3,4|5
Console.WriteLine(string.Join(",", xs.TakeWhile(x => x < 3)));                        // 1,2
Console.WriteLine(string.Join(",", xs.SkipWhile(x => x < 3)));                        // 3,4,5
Console.WriteLine(string.Join(",", new[] { new[] { 1, 2 }, [3] }.SelectMany(a => a)));  // 1,2,3
var pairs = from a in "AB" from b in "12" select $"{a}{b}";
Console.WriteLine(string.Join(",", pairs));                                           // A1,A2,B1,B2

static IEnumerable<int> Running(IEnumerable<int> source)
{
    int total = 0;
    foreach (var x in source) yield return total += x;
}
`,
      python: src`
from itertools import (accumulate, batched, chain, combinations, count, islice,
                       pairwise, product, takewhile, dropwhile)

xs = [1, 2, 3, 4, 5]
print([b - a for a, b in pairwise(xs)])               # [1, 1, 1, 1]
print(list(accumulate(xs)))                           # [1, 3, 6, 10, 15]
print(list(batched(xs, 2)))                           # [(1, 2), (3, 4), (5,)]
print(list(takewhile(lambda x: x < 3, xs)))           # [1, 2]
print(list(dropwhile(lambda x: x < 3, xs)))           # [3, 4, 5]
print(list(chain.from_iterable([[1, 2], [3]])))       # [1, 2, 3]
print(["".join(p) for p in product("AB", "12")])      # ['A1', 'A2', 'B1', 'B2']
print(list(combinations("ABC", 2)))                   # [('A', 'B'), ('A', 'C'), ('B', 'C')]
print(list(islice(count(10, 5), 3)))                  # [10, 15, 20]: from an endless count
`,
      notes: [
        "`itertools` is Python's library of lazy building blocks, and most have a LINQ counterpart: `chain` is `Concat` or `SelectMany`, `islice` is `Skip` plus `Take`, `batched` (3.12+) is `Chunk`, `takewhile`/`dropwhile` are `TakeWhile`/`SkipWhile`, and `product` is a query with two `from` clauses. `accumulate` (running totals) and `pairwise` have no direct LINQ method; a short iterator or `Zip` with `Skip(1)` does it. `combinations` and `permutations` come up constantly in interviews and have no LINQ version.",
        "All of these are lazy, so they work on endless inputs like `count()` as long as something downstream stops, and they don't build lists unless you ask for one.",
      ],
    },
    {
      kind: "code",
      title: "Partial application, key functions and composition",
      csharp: src`
Func<double, double, double> scale = (factor, x) => factor * x;
Func<double, double> toPercent = x => scale(100, x);      // fix the first argument
Console.WriteLine(toPercent(0.25));                       // 25

var people = new[] { ("ana", 31), ("ben", 25), ("cai", 31) };
var ordered = people.OrderByDescending(p => p.Item2).ThenBy(p => p.Item1);
Console.WriteLine(string.Join(" ", ordered.Select(p => p.Item1)));   // ana cai ben

Func<string, string> trim = s => s.Trim();
Func<string, string> upper = s => s.ToUpperInvariant();
Func<string, string> clean = s => upper(trim(s));        // compose by hand
Console.WriteLine($"[{clean("  pt-101 ")}]");            // [PT-101]
`,
      python: src`
from functools import partial, reduce
from operator import itemgetter


def scale(factor, x):
    return factor * x


to_percent = partial(scale, 100)              # fix the first argument
print(to_percent(0.25))                       # 25.0

people = [("ana", 31), ("ben", 25), ("cai", 31)]
ordered = sorted(people, key=lambda p: (-p[1], p[0]))
print(" ".join(map(itemgetter(0), ordered)))  # ana cai ben


def compose(*funcs):
    return lambda x: reduce(lambda acc, f: f(acc), funcs, x)


clean = compose(str.strip, str.upper)
print(f"[{clean('  pt-101 ')}]")              # [PT-101]
`,
      notes: [
        "Partial application fixes some of a function's arguments and gives back a function of the rest: `functools.partial`, or a lambda in either language. Python's `operator` module (`itemgetter`, `attrgetter`, `add`, `mul`) provides ready-made small functions for keys and folds.",
        "Sorting by several keys shows two styles: C# chains `OrderBy` and `ThenBy`, and Python sorts by a tuple key, negating numbers for descending order. Both sorts are stable, meaning items with equal keys keep their original order.",
      ],
    },
    {
      kind: "table",
      title: "LINQ, built-ins, itertools and functools",
      head: ["Task", "C# LINQ", "Python"],
      rows: [
        ["Transform each", "`Select`", "comprehension, `map`"],
        ["Keep some", "`Where`", "comprehension with `if`, `filter`"],
        ["Fold into one value", "`Aggregate`", "`functools.reduce`"],
        ["Running totals", "an iterator with `yield`", "`itertools.accumulate`"],
        ["Flatten", "`SelectMany`", "`itertools.chain.from_iterable`, nested comprehension"],
        ["Adjacent pairs", "`xs.Zip(xs.Skip(1))`", "`itertools.pairwise`"],
        ["Fixed-size groups", "`Chunk(n)`", "`itertools.batched(xs, n)` (3.12+)"],
        ["Group by key", "`GroupBy` (all equal keys)", "`itertools.groupby` (adjacent runs only), or a dict"],
        ["First n / skip n", "`Take`, `Skip`", "`itertools.islice`"],
        ["Every combination", "nested `from` clauses", "`itertools.product`, `combinations`, `permutations`"],
        ["Fix some arguments", "a lambda", "`functools.partial`"],
        ["Cache a pure function", "a closure over a Dictionary", "`functools.cache`"],
        ["Immutable collections", "`ImmutableList<T>`, `ImmutableDictionary<K, V>`, `FrozenSet<T>`", "`tuple`, `frozenset`, `types.MappingProxyType`"],
      ],
    },
    {
      kind: "terms",
      title: "Words from this lesson",
      terms: [
        { term: "Pure function", meaning: "A function whose result depends only on its arguments and that changes nothing outside itself." },
        { term: "Side effect", meaning: "Anything a function does besides returning a value: changing an argument or global, printing, writing files, calling a service." },
        { term: "Fold (reduce)", meaning: "Combining a sequence into one value by repeatedly applying a function to an accumulator and the next item." },
        { term: "Partial application", meaning: "Fixing some of a function's arguments to make a new function of the remaining ones." },
        { term: "Function composition", meaning: "Combining functions so the output of one is the input of the next: `clean = compose(strip, upper)`." },
      ],
    },
  ],
  predict: [
    {
      lang: "python",
      code: src`
from itertools import groupby

statuses = ["ok", "ok", "fault", "ok"]
print([(k, len(list(g))) for k, g in groupby(statuses)])
`,
      output: "[('ok', 2), ('fault', 1), ('ok', 1)]",
      distractors: ["[('ok', 3), ('fault', 1)]", "[('fault', 1), ('ok', 3)]", "[('ok', 2), ('fault', 1)]"],
      why: "`groupby` groups only adjacent equal items, so the final \"ok\" starts a new group. That's run-length encoding; for totals per key, sort first or use a Counter.",
    },
    {
      lang: "python",
      code: src`
from itertools import accumulate
import operator

print(list(accumulate([3, 1, 4, 1, 5], max)))
print(list(accumulate([1, 2, 3, 4], operator.mul)))
`,
      output: "[3, 3, 4, 4, 5]\n[1, 2, 6, 24]",
      distractors: ["[3, 1, 4, 1, 5]\n[1, 2, 6, 24]", "[5]\n[24]", "[3, 3, 4, 4, 5]\n[1, 3, 6, 10]"],
      why: "`accumulate` yields every intermediate result of the fold: the running maximum, then the running product.",
    },
    {
      lang: "python",
      code: src`
from functools import reduce

words = ["plc", "hmi", "scada"]
print(reduce(lambda acc, w: acc + len(w), words, 0))
print(reduce(lambda a, b: a if len(a) >= len(b) else b, words))
`,
      output: "11\nscada",
      distractors: ["3\nscada", "11\nplc", "plchmiscada\nscada"],
      why: "The first fold starts at 0 and adds each word's length: 3 + 3 + 5. The second has no start value, so it begins with \"plc\" and keeps the longer word each time.",
    },
    {
      lang: "python",
      code: src`
from functools import partial

def clamp(low, high, x):
    return max(low, min(high, x))

percent = partial(clamp, 0, 100)
print([percent(v) for v in (-5, 50, 120)])
`,
      output: "[0, 50, 100]",
      distractors: ["[-5, 50, 120]", "[0, 50, 120]", "TypeError"],
      why: "`partial` fixes low = 0 and high = 100, so `percent(v)` is `clamp(0, 100, v)`.",
    },
    {
      lang: "python",
      code: src`
def add_tag(tags, tag):
    tags.append(tag)
    return tags

base = ["FT-1"]
a = add_tag(base, "PT-2")
b = add_tag(base, "LT-3")
print(len(a), len(b), a is b)
`,
      output: "3 3 True",
      distractors: ["2 2 False", "2 3 False", "2 2 True"],
      why: "`add_tag` isn't pure: it changes the list passed in and returns that same list. Both calls modify `base`, and `a` and `b` are both `base`, holding 3 tags. A pure version would return `tags + [tag]`.",
    },
    {
      lang: "csharp",
      code: src`
var r = new Reading("PT-1", 4.0);
var s = r with { Value = 5.0 };
Console.WriteLine($"{r.Value} {s.Value} {r == s} {ReferenceEquals(r, s)}");

record Reading(string Tag, double Value);
`,
      output: "4 5 False False",
      distractors: ["5 5 True True", "4 5 False True", "4.0 5.0 False False"],
      why: "`with` makes a new record with one property changed, so `r` keeps 4. The values differ, so `==` is False, and they're separate objects. Doubles print without a trailing .0 in C#.",
    },
    {
      lang: "csharp",
      code: src`
var groups = new[] { "ok", "ok", "fault", "ok" }
    .GroupBy(s => s)
    .Select(g => $"{g.Key}:{g.Count()}");
Console.WriteLine(string.Join(" ", groups));
`,
      output: "ok:3 fault:1",
      distractors: ["ok:2 fault:1 ok:1", "fault:1 ok:3", "ok:2 fault:1"],
      why: "LINQ's `GroupBy` collects every item with the same key, wherever it is, and orders the groups by first appearance. Contrast Python's `itertools.groupby`.",
    },
    {
      lang: "csharp",
      code: src`
int[] xs = [5, 1, 4];
var sorted = xs.Order().ToArray();
Array.Sort(xs);
Console.WriteLine($"{string.Join(",", sorted)} {ReferenceEquals(sorted, xs)}");
`,
      output: "1,4,5 False",
      distractors: ["1,4,5 True", "5,1,4 False", "5,4,1 False"],
      why: "LINQ's `Order` returns a new sorted sequence and leaves `xs` alone (`ToArray` makes a new array); `Array.Sort` then sorts `xs` in place. Same contents, two different arrays.",
    },
    {
      lang: "csharp",
      code: src`
var running = new[] { 2, 3, 5 }.Aggregate(
    new List<int>(),
    (acc, x) => { acc.Add((acc.Count == 0 ? 0 : acc[^1]) + x); return acc; });
Console.WriteLine(string.Join(",", running));
`,
      output: "2,5,10",
      distractors: ["10", "2,3,5", "0,2,5"],
      why: "The fold's accumulator is a list; each step appends the previous total plus the new item. It works, but a small `yield` iterator is clearer, which is why the table suggests one for running totals.",
    },
  ],
  pitfalls: [
    "Using `itertools.groupby` on unsorted data and expecting one group per key.",
    "Writing a \"pure\" helper that quietly mutates its argument (`append`, `Add`, `Sort`) and returns it.",
    "Forcing everything into `reduce` / `Aggregate`. A named function (`sum`, `max`, `Count`) or a loop is often clearer.",
    "Consuming a generator or a `groupby` group twice: the second pass finds it empty.",
    "Copying a whole large collection on every change in a hot loop. Immutable collections share structure; plain copies don't.",
  ],
  next: [
    { id: "adv-run-length", label: "Exercise: Run-Length Encode a Status Log" },
    { id: "lang-linq", label: "LINQ and Comprehensions (recap)" },
    { id: "lang-error-patterns", label: "Error Handling Patterns: Exceptions, Results and Retries" },
  ],
};
