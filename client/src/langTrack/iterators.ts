import { src, type LangLessonData } from "./types.ts";

export const iterators: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "What a foreach or for loop really does",
      csharp: src`
var parts = new List<string> { "bolt", "nut" };

IEnumerator<string> e = parts.GetEnumerator();   // what foreach does behind the scenes
while (e.MoveNext())                             // false when there's nothing left
    Console.WriteLine(e.Current);
// bolt
// nut
`,
      python: src`
parts = ["bolt", "nut"]

it = iter(parts)          # what a for loop does behind the scenes
print(next(it))           # bolt
print(next(it))           # nut
try:
    next(it)
except StopIteration:
    print("done")         # the signal that ends a for loop
`,
      notes: [
        "Anything you can loop over is iterable: lists, strings, dictionaries, files, ranges. Looping asks the iterable for an iterator, an object that hands out one item at a time and remembers where it is. In C# the iterable is an `IEnumerable<T>` and the iterator an `IEnumerator<T>`, with `MoveNext()` (step forward, false at the end) and `Current` (the item). In Python, `iter(x)` gets the iterator and `next(it)` the next item, until it raises StopIteration.",
        "You rarely call these by hand, but knowing they exist explains a lot: why LINQ works on any collection, why a Python file can be looped over line by line, and why some things (generators) can only be looped over once.",
      ],
    },
    {
      kind: "code",
      title: "yield: write an iterator as a simple function",
      csharp: src`
foreach (var n in CountDown(3))
    Console.Write($"{n} ");                    // 3 2 1
Console.WriteLine();
Console.WriteLine(string.Join(",", Evens(10)));   // 0,2,4,6,8

static IEnumerable<int> CountDown(int from)
{
    for (int i = from; i > 0; i--)
        yield return i;                         // hand back one value, pause here
}

static IEnumerable<int> Evens(int limit)
{
    for (int i = 0; ; i += 2)
    {
        if (i >= limit) yield break;            // finish early
        yield return i;
    }
}
`,
      python: src`
def count_down(start):
    for i in range(start, 0, -1):
        yield i               # hand back one value, pause here


def evens(limit):
    i = 0
    while True:
        if i >= limit:
            return            # finishes the generator
        yield i
        i += 2


for n in count_down(3):
    print(n, end=" ")         # 3 2 1
print()
print(list(evens(10)))        # [0, 2, 4, 6, 8]
`,
      notes: [
        "Writing an iterator class by hand is fiddly. A method containing `yield return` (C#) or a function containing `yield` (Python) becomes one automatically: each `yield` hands one value to the loop and pauses the function right there, with its local variables kept. When the loop asks for the next item, the function carries on from where it paused. In Python such a function is called a generator.",
        "`yield break` (C#) or a plain `return` (Python) ends the sequence. The C# method's return type must be `IEnumerable<T>` (or `IEnumerator<T>`).",
      ],
    },
    {
      kind: "code",
      title: "Lazy: the body runs only when you ask for the next item",
      csharp: src`
foreach (var x in Numbers().Take(2))
    Console.WriteLine($"got {x}");
// start / got 1 / after 1 / got 2

static IEnumerable<int> Numbers()
{
    Console.WriteLine("start");
    yield return 1;
    Console.WriteLine("after 1");
    yield return 2;
    Console.WriteLine("after 2");    // never printed: Take(2) stopped asking
    yield return 3;
}
`,
      python: src`
from itertools import islice


def numbers():
    print("start")
    yield 1
    print("after 1")
    yield 2
    print("after 2")    # never printed: islice stopped asking
    yield 3


gen = numbers()
print("created")        # the body hasn't started yet
for x in islice(gen, 2):
    print("got", x)
# created / start / got 1 / after 1 / got 2
`,
      notes: [
        "Calling a generator function doesn't run any of its body: it just returns a generator object. Code runs only as items are requested, and stops for good if nobody asks for more. That's lazy evaluation, the same idea as LINQ's deferred execution and Python's generator expressions from the previous lessons.",
        "`Take(n)` and `itertools.islice(it, n)` take the first n items of any sequence, including one that never ends.",
      ],
    },
    {
      kind: "code",
      title: "Endless sequences and pipelines",
      csharp: src`
var bigSquares = Naturals().Select(n => n * n).Where(sq => sq > 50).Take(3);
Console.WriteLine(string.Join(" ", bigSquares));    // 64 81 100

var underTwenty = Naturals().Select(n => n * n).TakeWhile(sq => sq < 20);
Console.WriteLine(string.Join(" ", underTwenty));   // 1 4 9 16

static IEnumerable<int> Naturals()
{
    int n = 1;
    while (true) yield return n++;     // endless, and that's fine
}
`,
      python: src`
from itertools import count, islice, takewhile

squares = (n * n for n in count(1))         # count(1): 1, 2, 3, ... forever
big = (sq for sq in squares if sq > 50)
print(list(islice(big, 3)))                 # [64, 81, 100]

under_twenty = takewhile(lambda sq: sq < 20, (n * n for n in count(1)))
print(list(under_twenty))                   # [1, 4, 9, 16]
`,
      notes: [
        "Because each stage only pulls one item at a time from the stage before, a pipeline of lazy steps works on an endless source, and uses the same small amount of memory however many items flow through it. Reading a huge log file line by line, filtering and taking the first ten matches is exactly this shape.",
        "Just don't end an endless pipeline with something that wants everything, like `ToList()`, `Count()`, `sum()` or `list()`, without a `Take` or `islice` first: it will run until memory runs out.",
      ],
    },
    {
      kind: "code",
      title: "Making your own class loopable",
      csharp: src`
var shift = new Shift("Ana", "Ben", "Cy");
foreach (var name in shift)
    Console.Write(name + " ");           // Ana Ben Cy
Console.WriteLine();
Console.WriteLine(shift.Count());        // 3: LINQ works on any IEnumerable

class Shift : IEnumerable<string>
{
    private readonly string[] _people;
    public Shift(params string[] people) => _people = people;

    public IEnumerator<string> GetEnumerator()
    {
        foreach (var p in _people) yield return p;
    }

    // The older, non-generic version of the same method, required by the interface.
    System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator() => GetEnumerator();
}
`,
      python: src`
class Shift:
    def __init__(self, *people):
        self._people = list(people)

    def __iter__(self):              # makes the object iterable
        yield from self._people      # yield each item of another iterable


shift = Shift("Ana", "Ben", "Cy")
for name in shift:
    print(name, end=" ")             # Ana Ben Cy
print()
print(len(list(shift)))              # 3
`,
      notes: [
        "Implement `IEnumerable<T>` in C#, or a `__iter__` method in Python, and your class works with `foreach` / `for`, LINQ, `list(...)`, `sum`, `in` and everything else that loops. Writing that method with `yield` keeps it to a line or two. `yield from other` in Python yields every item of another iterable in turn.",
      ],
    },
  ],
  predict: [
    {
      lang: "csharp",
      code: src`
foreach (var x in Gen())
    Console.Write(x);
Console.WriteLine();

static IEnumerable<string> Gen()
{
    yield return "a";
    Console.Write("-");
    yield return "b";
}
`,
      output: "a-b",
      distractors: ["-ab", "ab-", "ab"],
      why: "The loop prints \"a\" before asking for the next item; only then does `Gen` carry on, print the dash and yield \"b\".",
    },
    {
      lang: "python",
      code: src`
def g():
    print("running")
    yield 1

x = g()
print("made")
print(next(x))
`,
      output: "made\nrunning\n1",
      distractors: ["running\nmade\n1", "made\n1", "running\n1\nmade"],
      why: "Calling `g()` only creates the generator; none of its body runs until the first `next`.",
    },
    {
      lang: "csharp",
      code: src`
int runs = 0;
var seq = Make();
Console.WriteLine(seq.Count() + seq.Sum());
Console.WriteLine(runs);

IEnumerable<int> Make()
{
    runs++;
    yield return 5;
    yield return 6;
}
`,
      output: "13\n2",
      distractors: ["13\n1", "11\n1", "13\n0"],
      why: "`Count()` is 2 and `Sum()` is 11. Each of them loops over `seq` separately, and each loop runs the iterator from the top, so `runs` goes up twice. `ToList()` once would run it once.",
    },
    {
      lang: "python",
      code: src`
def squares(n):
    for i in range(n):
        yield i * i

s = squares(4)
print(list(s))
print(list(s))
print(list(squares(4))[-1])
`,
      output: "[0, 1, 4, 9]\n[]\n9",
      distractors: ["[0, 1, 4, 9]\n[0, 1, 4, 9]\n9", "[1, 4, 9, 16]\n[]\n16", "[0, 1, 4, 9]\n[]\n16"],
      why: "A generator object can be used once; the second `list(s)` finds it finished. Calling `squares(4)` again makes a fresh one. `range(4)` is 0 to 3, so the last square is 9.",
    },
    {
      lang: "python",
      code: src`
def first_two(items):
    for i, x in enumerate(items):
        if i == 2:
            return
        yield x

print(list(first_two("abcd")))
`,
      output: "['a', 'b']",
      distractors: ["['a', 'b', 'c']", "None", "['a', 'b', 'c', 'd']"],
      why: "`return` inside a generator ends the sequence. It's reached at index 2, before 'c' is yielded.",
    },
    {
      lang: "csharp",
      code: src`
Console.WriteLine(string.Join(",", Until([3, 8, -1, 4])));

static IEnumerable<int> Until(int[] xs)
{
    foreach (var x in xs)
    {
        if (x < 0) yield break;
        yield return x * 2;
    }
}
`,
      output: "6,16",
      distractors: ["6,16,8", "6,16,-2,8", "3,8"],
      why: "Each value is doubled until the first negative one, where `yield break` ends the sequence; the 4 after it is never reached.",
    },
    {
      lang: "python",
      code: src`
def flatten(rows):
    for row in rows:
        yield from row

print(sum(flatten([[1, 2], [3], [], [4]])))
`,
      output: "10",
      distractors: ["4", "TypeError", "6"],
      why: "`yield from row` yields every item of each inner list, so `sum` sees 1, 2, 3 and 4. The empty list contributes nothing.",
    },
    {
      lang: "csharp",
      code: src`
var log = new List<string>();
var q = new[] { 1, 2, 3, 4 }.Select(x => { log.Add($"s{x}"); return x * 10; }).Take(2);
Console.WriteLine(log.Count);
Console.WriteLine(string.Join(",", q));
Console.WriteLine(string.Join(",", log));
`,
      output: "0\n10,20\ns1,s2",
      distractors: ["4\n10,20\ns1,s2,s3,s4", "2\n10,20\ns1,s2", "0\n10,20\ns1,s2,s3,s4"],
      why: "Building the query runs nothing, so the log starts empty. Reading it runs `Select` only for the two items `Take(2)` asks for.",
    },
    {
      lang: "python",
      code: src`
it = iter([10, 20])
print(next(it), next(it), next(it, "end"))
`,
      output: "10 20 end",
      distractors: ["10 20 None", "StopIteration", "10 10 10"],
      why: "Each `next` moves the iterator on. The third finds nothing left and returns the default given as its second argument instead of raising StopIteration.",
    },
  ],
  pitfalls: [
    "Looping over a Python generator twice and getting nothing the second time. Make a list, or call the generator function again.",
    "Enumerating a C# iterator or LINQ query several times (`Count()` and then `foreach`), repeating all its work each time.",
    "Calling `list()`, `ToList()`, `Count()` or `sum()` on an endless sequence.",
    "Expecting code at the top of a generator to run when you call it. It runs at the first `next` or loop step, so errors (like a bad argument) show up later than you'd think.",
    "Changing a collection while iterating over it.",
  ],
  next: [
    { id: "inter-chunk-list", label: "Exercise: Split into Chunks with yield" },
    { id: "inter-fibonacci-generator", label: "Exercise: An Endless Fibonacci Generator" },
    { id: "lang-records", label: "Records, Dataclasses and Equality" },
  ],
};
