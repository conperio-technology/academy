import { src, type LangLessonData } from "./types.ts";

export const profiling: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Measure, don't guess: timing two approaches",
      csharp: src`
using System.Diagnostics;

var ids = Enumerable.Range(0, 20_000).ToList();
var idSet = ids.ToHashSet();
int[] lookups = Enumerable.Range(0, 20_000).Select(i => i * 3).ToArray();

int Count(Func<int, bool> contains) => lookups.Count(contains);
Count(ids.Contains); Count(idSet.Contains);          // warm-up: let the JIT compile both

var sw = Stopwatch.StartNew();
int a = Count(ids.Contains);                         // List.Contains: a linear scan, O(n)
long listMs = sw.ElapsedMilliseconds;
sw.Restart();
int b = Count(idSet.Contains);                       // HashSet.Contains: O(1) average
long setMs = sw.ElapsedMilliseconds;

Console.WriteLine($"{a} {b}");                       // 6667 6667
Console.WriteLine(setMs < listMs ? "the set was faster" : "no difference");   // the set was faster
`,
      python: src`
import timeit

ids = list(range(20_000))
id_set = set(ids)
lookups = [i * 3 for i in range(2_000)]

list_time = timeit.timeit(lambda: sum(x in ids for x in lookups), number=3)
set_time = timeit.timeit(lambda: sum(x in id_set for x in lookups), number=3)
print(sum(x in id_set for x in lookups))                       # 2000
print("the set was faster" if set_time < list_time else "no difference")   # the set was faster
print(f"{list_time / set_time:.0f}x" if set_time else "")      # roughly a few hundred x
`,
      notes: [
        "Performance intuition is often wrong, so measure before and after any change made for speed. `Stopwatch` (C#) and `time.perf_counter` (Python) are high-resolution timers for timing a block; `timeit` runs a small piece of code many times and returns the total, which smooths out noise. Always check the faster version still gives the same answer.",
        "Timing in .NET has a trap: the first call to a method includes JIT compilation (and tiered compilation recompiles hot methods later with more optimizations), so warm up by calling the code before timing it, and build in Release mode (`dotnet run -c Release`). Debug builds can be several times slower. Python has no JIT warm-up in CPython 3.13, but the first run can still pay for imports and cache misses.",
        "Here the Big O difference is so large that a rough timing shows it clearly. For smaller differences, rough timings mislead: use a benchmarking tool.",
      ],
    },
    {
      kind: "code",
      title: "Benchmarking properly: BenchmarkDotNet and timeit",
      csharp: src`
// dotnet new console -n Bench && cd Bench && dotnet add package BenchmarkDotNet
// Run with: dotnet run -c Release
using System.Text;
using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Running;

BenchmarkRunner.Run<JoinBenchmarks>();

[MemoryDiagnoser]                       // adds allocation columns to the report
public class JoinBenchmarks
{
    private readonly string[] _parts = Enumerable.Range(0, 1000).Select(i => i.ToString()).ToArray();

    [Benchmark(Baseline = true)]
    public string Concat()
    {
        string s = "";
        foreach (var p in _parts) s += p + ",";      // a new string every time: O(n²) copying
        return s;
    }

    [Benchmark]
    public string Builder()
    {
        var sb = new StringBuilder();
        foreach (var p in _parts) sb.Append(p).Append(',');
        return sb.ToString();
    }

    [Benchmark]
    public string Join() => string.Join(",", _parts) + ",";
}
// The report is a table with Mean, Error, StdDev, Ratio, Gen0 and Allocated
// columns per method; expect Concat to be far slower and to allocate megabytes.
`,
      python: src`
import timeit

parts = [str(i) for i in range(1000)]


def concat():
    s = ""
    for p in parts:
        s += p + ","
    return s


def join():
    return ",".join(parts) + ","


assert concat() == join()
for f in (concat, join):
    best = min(timeit.repeat(f, number=200, repeat=5))   # best of 5 runs of 200 calls
    print(f.__name__, f"{best * 1000:.1f} ms" if best else "")
# concat 13.2 ms   (illustrative: your numbers will differ)
# join 1.6 ms
`,
      fragment: { csharp: true },
      notes: [
        "A benchmark harness handles what hand-made timing gets wrong: warm-up, enough repetitions for a stable figure, statistics on the noise, and preventing the compiler from optimizing away work whose result is never used. BenchmarkDotNet is the standard for .NET: mark methods `[Benchmark]`, add `[MemoryDiagnoser]` to see bytes allocated per call, and run in Release. It reports the mean time, the spread, and allocations, including how many garbage collections the code caused.",
        "In Python, `timeit.repeat` gives several measurements; take the minimum, which is the run least disturbed by other activity on the machine. From a terminal, `python -m timeit -s \"setup\" \"statement\"` does the same, and `pytest-benchmark` adds benchmarks to a test suite. CPython optimizes `s += p` for strings in some cases, so string concatenation in a loop is less disastrous there than in C#, but `join` is still the reliable choice.",
        "Benchmarks measure small pieces in isolation; they tell you which of two implementations is faster, not where your program spends its time. For that you need a profiler.",
      ],
    },
    {
      kind: "code",
      title: "Profiling: where does the time actually go?",
      csharp: src`
// Command-line tools (install once with: dotnet tool install -g dotnet-trace, etc.)
// dotnet-counters monitor --process-id 1234      live CPU, GC, allocation rate, exceptions
// dotnet-trace collect --process-id 1234         record a trace for PerfView or Speedscope
// dotnet-dump collect --process-id 1234          a memory dump to find what's holding memory
//
// Visual Studio and JetBrains Rider have built-in CPU and memory profilers:
// run the app under the profiler, then look at the "hot path", the chain of calls
// with the highest inclusive (cumulative) time.
`,
      python: src`
import cProfile
import pstats


def build(n):
    return list(range(n))


def slow_lookup(items, targets):
    found = 0
    for t in targets:
        if t in items:            # O(n) scan for each target
            found += 1
    return found


def main():
    items = build(5_000)
    return slow_lookup(items, range(0, 10_000, 2))


profiler = cProfile.Profile()
print(profiler.runcall(main))                   # 2500
stats = pstats.Stats(profiler).sort_stats("tottime")
print(stats.fcn_list[0][2])                     # slow_lookup: the most time in its own code
# stats.print_stats(5) prints the full table: ncalls, tottime, percall, cumtime, file:line(function)
# From a terminal: python -m cProfile -s cumtime script.py
`,
      fragment: { csharp: true },
      notes: [
        "A profiler records where a running program spends its time (CPU profiling) or memory (allocation profiling), across all the functions it calls. The two numbers to know: self or total time (`tottime`), spent in the function's own code, and inclusive or cumulative time (`cumtime`), which includes everything it calls. Start from the largest cumulative time near the top and follow it down to the function with large self time: that's the hot spot.",
        "`cProfile` ships with Python; for a lighter, sampling view of a live process `py-spy` is popular, and `tracemalloc` (from the memory lesson) finds allocation hot spots. In .NET, `dotnet-counters` gives a live dashboard (is the GC busy? is the allocation rate high?), and `dotnet-trace` records CPU samples for a viewer.",
        "Profile with realistic data and in Release mode. A profiler adds its own overhead, so it's good for finding where time goes but not for exact timings.",
      ],
    },
    {
      kind: "code",
      title: "Common performance traps",
      csharp: src`
int evaluated = 0;
IEnumerable<int> evens = Enumerable.Range(1, 10).Where(x => { evaluated++; return x % 2 == 0; });
Console.WriteLine(evens.Count() + evens.Sum());   // 35
Console.WriteLine(evaluated);                     // 20: the query ran twice

evaluated = 0;
var list = evens.ToList();                        // run it once, keep the results
Console.WriteLine(list.Count + list.Sum());       // 35
Console.WriteLine(evaluated);                     // 10

var queue = new Queue<int>(Enumerable.Range(0, 5));
Console.WriteLine(queue.Dequeue());               // 0: O(1); List.RemoveAt(0) shifts everything
Console.WriteLine(list.Any());                    // True: stops at the first item, unlike Count() > 0
`,
      python: src`
from collections import deque

evaluated = 0


def is_even(x):
    global evaluated
    evaluated += 1
    return x % 2 == 0


evens = (x for x in range(1, 11) if is_even(x))
print(len(list(evens)), sum(evens))     # 5 0: a generator can only be used once
print(evaluated)                        # 10

jobs = deque(range(5))
print(jobs.popleft())                   # 0: O(1); list.pop(0) shifts everything

words = ["pump"] * 3
print(", ".join(words))                 # pump, pump, pump: one allocation, not one per +
`,
      notes: [
        "The classic traps, all about doing work more often than you think: calling a lazy LINQ query twice (each `Count()`, `Sum()` or `foreach` runs it again from the start; call `ToList()` once if you need it several times); `List.Contains` or `x in list` inside a loop (use a HashSet or set); removing from the front of a list (use a `Queue` or `deque`); building strings with `+` in a loop (use `StringBuilder` or `join`); `Count() > 0` instead of `Any()`; and throwing exceptions for routine outcomes.",
        "Python generators are the mirror image of LINQ's re-running: they run once and are then empty, so the second use silently sees nothing.",
        "For heavy number crunching in Python, the big win is vectorising: replacing a Python loop with one call that loops in C, such as `sum`, `sorted`, `str.join`, or NumPy, where `(readings * 1.8 + 32).mean()` processes a whole array in one step, often 10 to 100 times faster than a loop. .NET's equivalents are `System.Numerics.Vector<T>` and `TensorPrimitives`, which use the CPU's SIMD instructions (one instruction working on several numbers at once).",
      ],
    },
    {
      kind: "table",
      title: "Tools side by side",
      head: ["Question", "C# / .NET", "Python"],
      rows: [
        ["How long did this block take?", "`Stopwatch`", "`time.perf_counter()`"],
        ["Which version is faster?", "BenchmarkDotNet (`[Benchmark]`, Release)", "`timeit`, `python -m timeit`, pytest-benchmark"],
        ["How much does it allocate?", "`[MemoryDiagnoser]`, `GC.GetAllocatedBytesForCurrentThread()`", "`tracemalloc`"],
        ["Where does the time go?", "Visual Studio or Rider profiler, `dotnet-trace`", "`cProfile` + `pstats`, `py-spy`"],
        ["Live health of a running app", "`dotnet-counters`", "`py-spy top`"],
        ["What's holding memory?", "`dotnet-dump`, memory profilers", "`tracemalloc` snapshots, `objgraph`"],
        ["Loop over numbers fast", "`Span<T>`, `Vector<T>`, `TensorPrimitives`", "NumPy, built-ins that loop in C"],
      ],
      notes: [
        "In interviews, \"how would you find out why this endpoint is slow?\" has a standard answer: reproduce it with realistic data, measure (logs, metrics, a profiler) to find the hot spot rather than guessing, check the algorithm's Big O and the number of database or network calls first, fix the biggest cost, and measure again.",
      ],
    },
    {
      kind: "terms",
      title: "Words from this lesson",
      terms: [
        { term: "Benchmark", meaning: "A repeatable measurement of how fast a piece of code runs, usually comparing alternatives." },
        { term: "Profiler", meaning: "A tool that records where a running program spends its time or allocates memory, function by function." },
        { term: "Hot path", meaning: "The code that runs most often or takes the most time; the only place optimization pays off." },
        { term: "Self time and cumulative time", meaning: "Time in a function's own code, versus including everything it calls (`tottime` and `cumtime`)." },
        { term: "Warm-up", meaning: "Running code before timing it, so one-off costs such as JIT compilation aren't measured." },
        { term: "Vectorising", meaning: "Replacing a loop over items with one operation on a whole array, run in fast native code or SIMD instructions." },
        { term: "Multiple enumeration", meaning: "Iterating a lazy query more than once, which repeats all its work each time." },
      ],
    },
  ],
  predict: [
    {
      lang: "csharp",
      code: src`
int calls = 0;
var query = new[] { 1, 2, 3 }.Select(x => { calls++; return x * 2; });
var first = query.First();
var total = query.Sum();
Console.WriteLine($"{first} {total} {calls}");
`,
      output: "2 12 4",
      distractors: ["2 12 3", "2 12 6", "2 6 4"],
      why: "`First()` runs the lazy query only until it has one item (1 call); `Sum()` runs it again from the start over all three (3 calls).",
    },
    {
      lang: "csharp",
      code: src`
int calls = 0;
var list = new[] { 1, 2, 3 }.Select(x => { calls++; return x * 2; }).ToList();
var first = list.First();
var total = list.Sum();
Console.WriteLine($"{first} {total} {calls}");
`,
      output: "2 12 3",
      distractors: ["2 12 4", "2 12 6", "2 12 0"],
      why: "`ToList()` runs the query once and stores the results; `First` and `Sum` then read the list without running the lambda again.",
    },
    {
      lang: "csharp",
      code: src`
int checks = 0;
var items = Enumerable.Range(1, 1000).Where(x => { checks++; return x > 0; });
Console.WriteLine($"{items.Any()} {checks}");
checks = 0;
Console.WriteLine($"{items.Count() > 0} {checks}");
`,
      output: "True 1\nTrue 1000",
      distractors: ["True 1000\nTrue 1000", "True 1\nTrue 1", "True 0\nTrue 1000"],
      why: "`Any()` stops at the first matching item; `Count()` has to walk the whole sequence just to compare with zero.",
    },
    {
      lang: "python",
      code: src`
squares = (x * x for x in range(4))
print(sum(squares))
print(sum(squares))
print(max([x * x for x in range(4)]))
`,
      output: "14\n0\n9",
      distractors: ["14\n14\n9", "14\n0\n16", "6\n0\n9"],
      why: "A generator produces its values once; the second `sum` finds it exhausted and adds nothing. The list comprehension builds a real list: 0, 1, 4, 9.",
    },
    {
      lang: "python",
      code: src`
import timeit

n = timeit.timeit("x = 1 + 1", number=1000)
print(type(n).__name__, n > 0)
print(len(timeit.repeat("pass", number=10, repeat=4)))
`,
      output: "float True\n4",
      distractors: ["int True\n4", "float True\n10", "float True\n40"],
      why: "`timeit` returns the total seconds for all runs as a float. `repeat` returns one total per repetition: 4 measurements of 10 runs each.",
    },
    {
      lang: "python",
      code: src`
from collections import deque

items = list(range(5))
q = deque(items)
items.pop(0)
q.popleft()
q.append(5)
print(items, list(q))
`,
      output: "[1, 2, 3, 4] [1, 2, 3, 4, 5]",
      distractors: ["[0, 1, 2, 3] [1, 2, 3, 4, 5]", "[1, 2, 3, 4] [5, 1, 2, 3, 4]", "[0, 1, 2, 3] [0, 1, 2, 3, 5]"],
      why: "Both remove from the front and give the same contents; the difference is cost. `list.pop(0)` shifts every remaining element (O(n)), while `deque.popleft()` is O(1).",
    },
    {
      lang: "python",
      code: src`
import cProfile
import pstats

def helper():
    return sum(range(100))

def work():
    return [helper() for _ in range(3)]

profiler = cProfile.Profile()
profiler.runcall(work)
stats = pstats.Stats(profiler)
print({name: info[1] for (file, line, name), info in stats.stats.items() if name == "helper"})
`,
      output: "{'helper': 3}",
      distractors: ["{'helper': 1}", "{'helper': 100}", "{}"],
      why: "Each entry in `stats.stats` holds call counts and times for one function; the second value is the number of calls, and `helper` was called 3 times.",
    },
    {
      lang: "csharp",
      code: src`
var sb = new System.Text.StringBuilder();
for (int i = 0; i < 3; i++) sb.Append(i).Append('-');
sb.Length--;
Console.WriteLine($"{sb} {sb.Length}");
`,
      output: "0-1-2 5",
      distractors: ["0-1-2- 6", "012 3", "0-1-2- 5"],
      why: "The builder grows one buffer instead of making a new string per step. Decreasing `Length` by one drops the trailing dash, leaving 5 characters.",
    },
  ],
  pitfalls: [
    "Optimizing without measuring, or measuring a Debug build.",
    "Timing code once, cold, and trusting the number. Warm up, repeat, and take the best or the median.",
    "Running a lazy LINQ query several times without noticing, or reusing an exhausted Python generator.",
    "Fixing micro-costs while the real cost is an O(n²) loop or one database query per item (the N+1 problem).",
    "Trusting a micro-benchmark whose result is never used: the compiler may remove the work entirely. BenchmarkDotNet guards against that; hand-made loops don't.",
  ],
  next: [
    { id: "adv-fast-active-orders", label: "Exercise: Make the Slow Report Fast" },
    { id: "big-o-notation", label: "Big O Notation: Time & Space Complexity" },
    { id: "lang-packaging", label: "Packaging and Project Structure" },
  ],
};
