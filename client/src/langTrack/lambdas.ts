import { src, type LangLessonData } from "./types.ts";

export const lambdas: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Functions are values: store them, pass them, return them",
      csharp: src`
Func<int, int> twice = x => x * 2;            // a lambda stored in a variable
Func<int, int, int> add = (a, b) => a + b;    // two inputs, then the result type
Action<string> shout = s => Console.WriteLine(s.ToUpper() + "!");
Func<bool> ready = () => true;                // no inputs

Console.WriteLine(twice(21));     // 42
Console.WriteLine(add(2, 3));     // 5
shout("start");                   // START!
Console.WriteLine(ready());       // True

Func<int, int> f = Square;        // a named method works too: no parentheses
Console.WriteLine(f(7));          // 49

static int Square(int n) => n * n;
`,
      python: src`
twice = lambda x: x * 2          # a lambda stored in a variable
add = lambda a, b: a + b
ready = lambda: True             # no inputs


def shout(s):
    print(s.upper() + "!")


print(twice(21))     # 42
print(add(2, 3))     # 5
shout("start")       # START!
print(ready())       # True


def square(n):
    return n * n


f = square           # no parentheses: the function itself, not a call
print(f(7))          # 49
`,
      notes: [
        "A lambda is a small function written inline, without a name: `x => x * 2` in C#, `lambda x: x * 2` in Python. Read both as \"given x, give back x times 2\". Because a function is a value like any other, you can keep it in a variable, put it in a list, pass it to another function or return it from one.",
        "C# needs to know the function's type. `Func<int, int>` is \"takes an int, returns an int\": the last type in the angle brackets is always the result. `Action<string>` takes a string and returns nothing. These are delegate types; a delegate is C#'s name for a value that holds a function. With `var` you can let C# infer the type if you give the parameter one: `var twice = (int x) => x * 2;`.",
        "A Python lambda can only hold one expression, with no statements and no `return` (the expression's value is returned). For anything longer, use `def`. Python's style guide also prefers `def` over assigning a lambda to a name, as done above for comparison; lambdas are at their best written straight into a call, as in the next sample.",
      ],
    },
    {
      kind: "code",
      title: "Passing functions in: higher-order functions",
      csharp: src`
int[] readings = [12, 7, 30, 4, 18];

Console.WriteLine(CountWhere(readings, r => r > 10));       // 3
Console.WriteLine(CountWhere(readings, r => r % 2 == 0));   // 4

var sorted = readings.OrderByDescending(r => r).ToList();   // r => r: sort by the value itself
Console.WriteLine(string.Join(", ", sorted));               // 30, 18, 12, 7, 4

string[] tags = ["valve", "PT-101", "fan"];
Array.Sort(tags, (a, b) => a.Length.CompareTo(b.Length));   // compare two items
Console.WriteLine(string.Join(", ", tags));                 // fan, valve, PT-101
Console.WriteLine(tags.MaxBy(t => t.Length));               // PT-101

static int CountWhere(int[] items, Func<int, bool> test)
{
    int n = 0;
    foreach (var item in items)
        if (test(item)) n++;
    return n;
}
`,
      python: src`
readings = [12, 7, 30, 4, 18]


def count_where(items, test):
    n = 0
    for item in items:
        if test(item):
            n += 1
    return n


print(count_where(readings, lambda r: r > 10))       # 3
print(count_where(readings, lambda r: r % 2 == 0))   # 4
print(sorted(readings, reverse=True))                # [30, 18, 12, 7, 4]

tags = ["valve", "PT-101", "fan"]
tags.sort(key=len)                         # key: what to sort each item by
print(tags)                                # ['fan', 'valve', 'PT-101']
print(max(tags, key=len))                  # PT-101
print(list(map(str.upper, tags)))          # ['FAN', 'VALVE', 'PT-101']
print(list(filter(lambda t: "-" in t, tags)))   # ['PT-101']
`,
      notes: [
        "A higher-order function is one that takes a function as an argument or returns one. `CountWhere` doesn't know what makes an item count; the caller says so with a lambda. That one idea is behind sorting, searching, filtering, event handlers and most of LINQ.",
        "Sorting shows the two styles. C#'s `Array.Sort` and `List.Sort` can take a comparison: a function of two items that returns a negative number, zero or a positive number, and `CompareTo` produces exactly that. LINQ's `OrderBy`, `MaxBy` and Python's `sort`, `sorted`, `max` and `min` take a key function instead: given one item, return the thing to sort by. Key functions are shorter and harder to get wrong.",
        "Python's `map(f, items)` calls `f` on every item and `filter(test, items)` keeps the items where `test` is true. Both are lazy (they produce results only as you read them), which is why the sample wraps them in `list(...)`. Most Python code uses comprehensions instead, covered in the next lesson.",
      ],
    },
    {
      kind: "code",
      title: "Returning functions, and closures",
      csharp: src`
var toMm = Scale(25.4);
var half = Scale(0.5);
Console.WriteLine(toMm(2));      // 50.8
Console.WriteLine(half(10));     // 5

var next = MakeCounter();
next();
next();
Console.WriteLine(next());       // 3
var other = MakeCounter();
Console.WriteLine(other());      // 1: a separate count

static Func<double, double> Scale(double factor) => x => x * factor;

static Func<int> MakeCounter()
{
    int count = 0;               // captured: lives on after MakeCounter returns
    return () => ++count;
}
`,
      python: src`
def scale(factor):
    return lambda x: x * factor


def make_counter():
    count = 0

    def next_value():
        nonlocal count           # assign to the enclosing function's variable
        count += 1
        return count

    return next_value


to_mm = scale(25.4)
half = scale(0.5)
print(to_mm(2))      # 50.8
print(half(10))      # 5.0

nxt = make_counter()
nxt()
nxt()
print(nxt())         # 3
other = make_counter()
print(other())       # 1: a separate count
`,
      notes: [
        "`Scale(25.4)` returns a new function that remembers `factor`. A function together with the variables it uses from the place it was created is called a closure, and those variables are said to be captured. Each call to `MakeCounter` creates a fresh `count`, so `next` and `other` count separately.",
        "In Python, a nested function can read the enclosing function's variables freely, but assigning to one (`count += 1`) would create a new local variable instead, unless you declare it `nonlocal`. C# has no such keyword: a lambda can read and change any variable it can see.",
      ],
    },
    {
      kind: "code",
      title: "The loop-variable trap: closures capture variables, not values",
      csharp: src`
var actions = new List<Func<int>>();
for (int i = 0; i < 3; i++)
    actions.Add(() => i);                  // every lambda shares the one i
Console.WriteLine(string.Join(" ", actions.Select(a => a())));   // 3 3 3

var fixedActions = new List<Func<int>>();
foreach (var n in new[] { 0, 1, 2 })
    fixedActions.Add(() => n);             // foreach makes a new n each time round
Console.WriteLine(string.Join(" ", fixedActions.Select(a => a())));   // 0 1 2
`,
      python: src`
actions = [lambda: i for i in range(3)]       # every lambda shares the one i
print([a() for a in actions])                 # [2, 2, 2]

fixed = [lambda i=i: i for i in range(3)]     # a default value is stored now
print([a() for a in fixed])                   # [0, 1, 2]
`,
      notes: [
        "A closure keeps a link to the variable itself, and looks up its value only when it runs. By the time these lambdas run, the loop has finished. C#'s `for` loop has a single `i` that ends at 3 (the value that stopped the loop); Python's ends at 2, the last value `range(3)` produced.",
        "The fixes: in C#, `foreach` gives each pass its own variable, or copy the value into a new local inside the loop (`int copy = i;`). In Python, default parameter values are worked out when the function is created, so `lambda i=i: i` freezes the current value. This bug shows up for real when you create buttons, timers or tasks in a loop.",
      ],
    },
    {
      kind: "table",
      title: "Function types side by side",
      head: ["Meaning", "C# type", "Python type hint", "Example lambda"],
      rows: [
        ["takes an int, returns an int", "`Func<int, int>`", "`Callable[[int], int]`", "`x => x + 1` / `lambda x: x + 1`"],
        ["two ints in, an int out", "`Func<int, int, int>`", "`Callable[[int, int], int]`", "`(a, b) => a * b` / `lambda a, b: a * b`"],
        ["takes a string, returns nothing", "`Action<string>`", "`Callable[[str], None]`", "`s => Console.WriteLine(s)` / `print`"],
        ["no inputs, returns a bool", "`Func<bool>`", "`Callable[[], bool]`", "`() => true` / `lambda: True`"],
        ["a yes or no test of one item", "`Func<T, bool>` or `Predicate<T>`", "`Callable[[T], bool]`", "`t => t > 0` / `lambda t: t > 0`"],
        ["compare two items", "`Comparison<T>`", "(use a key function)", "`(a, b) => a.CompareTo(b)`"],
      ],
      notes: [
        "Python doesn't need the types to run; `Callable` (from `collections.abc`) is a type hint, covered in the Generics and Type Hints lesson.",
      ],
    },
    {
      kind: "terms",
      title: "Words from this lesson",
      terms: [
        { term: "Lambda", meaning: "A small function written inline without a name, such as `x => x * 2` or `lambda x: x * 2`." },
        { term: "Delegate", meaning: "In C#, a value that holds a function. `Func<...>` and `Action<...>` are the ready-made delegate types." },
        { term: "Higher-order function", meaning: "A function that takes another function as an argument or returns one: `sorted` with `key=`, LINQ's `Where`, `CountWhere` above." },
        { term: "Closure", meaning: "A function plus the variables it captured from where it was created. The variables live as long as the function does." },
        { term: "Key function", meaning: "A function that turns an item into the value to sort or compare by, such as `len` or `w => w.Length`." },
      ],
    },
  ],
  predict: [
    {
      lang: "csharp",
      code: src`
Func<int, int> inc = x => x + 1;
Func<int, int> dbl = x => x * 2;
Console.WriteLine(dbl(inc(3)));
Console.WriteLine(inc(dbl(3)));
`,
      output: "8\n7",
      distractors: ["7\n8", "8\n8", "7\n7"],
      why: "Calls run inside out. `dbl(inc(3))` is `dbl(4)`, which is 8; `inc(dbl(3))` is `inc(6)`, which is 7. Order matters when you chain functions.",
    },
    {
      lang: "python",
      code: src`
def make_adder(n):
    return lambda x: x + n

add5 = make_adder(5)
add10 = make_adder(10)
print(add5(1), add10(1), make_adder(2)(3))
`,
      output: "6 11 5",
      distractors: ["6 6 5", "11 11 5", "6 11 TypeError"],
      why: "Each call to `make_adder` makes a new closure with its own `n`. `make_adder(2)(3)` builds an adder and calls it straight away: 3 + 2.",
    },
    {
      lang: "python",
      code: src`
fs = []
for k in range(1, 4):
    fs.append(lambda: k * 10)
print([f() for f in fs])
`,
      output: "[30, 30, 30]",
      distractors: ["[10, 20, 30]", "[0, 10, 20]", "[40, 40, 40]"],
      why: "The lambdas capture the variable `k`, not its value at the time. They all run after the loop, when `k` is 3. `lambda k=k: k * 10` would give `[10, 20, 30]`.",
    },
    {
      lang: "csharp",
      code: src`
var fs = new List<Func<int>>();
for (int k = 1; k <= 3; k++) fs.Add(() => k * 10);
Console.WriteLine(string.Join(",", fs.Select(f => f())));
`,
      output: "40,40,40",
      distractors: ["10,20,30", "30,30,30", "0,0,0"],
      why: "A C# `for` loop has one `k` shared by every lambda. The loop stops when `k <= 3` is false, so `k` ends at 4, and every lambda reads 4. Python's version ends at 3 because `range` never produces the stopping value.",
    },
    {
      lang: "python",
      code: src`
words = ["kiwi", "Fig", "apple", "date"]
print(sorted(words))
print(sorted(words, key=str.lower))
print(sorted(words, key=len))
`,
      output: "['Fig', 'apple', 'date', 'kiwi']\n['apple', 'date', 'Fig', 'kiwi']\n['Fig', 'kiwi', 'date', 'apple']",
      distractors: [
        "['apple', 'date', 'Fig', 'kiwi']\n['apple', 'date', 'Fig', 'kiwi']\n['Fig', 'kiwi', 'date', 'apple']",
        "['Fig', 'apple', 'date', 'kiwi']\n['apple', 'date', 'Fig', 'kiwi']\n['Fig', 'date', 'kiwi', 'apple']",
        "['Fig', 'apple', 'date', 'kiwi']\n['Fig', 'apple', 'date', 'kiwi']\n['Fig', 'kiwi', 'date', 'apple']",
      ],
      why: "Plain sorting compares character codes, and every capital letter comes before every lowercase one, so 'Fig' is first. `key=str.lower` compares lowercase copies. `key=len` sorts by length, and Python's sort is stable: 'kiwi' and 'date' are both 4 long, so they keep their original order.",
    },
    {
      lang: "csharp",
      code: src`
int calls = 0;
Func<int, int> sq = x => { calls++; return x * x; };
var total = sq(2) + sq(3);
Console.WriteLine($"{total} {calls}");
`,
      output: "13 2",
      distractors: ["13 0", "25 2", "13 1"],
      why: "A lambda with a block body (braces) can run several statements, and it can change variables it captured: `calls` is the same variable outside and inside. 4 + 9 = 13, from two calls.",
    },
    {
      lang: "python",
      code: src`
def make_counter():
    count = 0
    def step():
        count += 1
        return count
    return step

try:
    print(make_counter()())
except UnboundLocalError:
    print("UnboundLocalError")
`,
      output: "UnboundLocalError",
      distractors: ["1", "0", "NameError"],
      why: "Assigning to `count` inside `step` makes `count` local to `step`, so `count += 1` reads a local that has no value yet. `nonlocal count` at the top of `step` fixes it.",
    },
    {
      lang: "python",
      code: src`
nums = [1, 2, 3]
doubled = map(lambda n: n * 2, nums)
print(list(doubled))
print(list(doubled))
`,
      output: "[2, 4, 6]\n[]",
      distractors: ["[2, 4, 6]\n[2, 4, 6]", "<map object>\n[2, 4, 6]", "[2, 4, 6]\n[4, 8, 12]"],
      why: "`map` returns a lazy iterator that hands out each result once. The first `list` reads them all; the second finds nothing left. Keep a list (`list(map(...))`) if you need the results twice.",
    },
    {
      lang: "csharp",
      code: src`
string[] raw = [" 42", "7 ", " 13 "];
var total = raw.Select(s => s.Trim()).Select(int.Parse).Sum();
Console.WriteLine(total);
`,
      output: "62",
      distractors: ["42713", "FormatException", "0"],
      why: "`Select(int.Parse)` passes the method itself where a lambda would go (a method group), the same as `Select(s => int.Parse(s))`. The trimmed texts become 42, 7 and 13.",
    },
  ],
  pitfalls: [
    "Writing `Sort(Compare())` or `key=len()`: that calls the function. Pass the function itself: `key=len`, `Select(int.Parse)`.",
    "Capturing a loop variable in a lambda and expecting each lambda to see its own value. Copy it first (C#) or use a default argument (Python).",
    "Assigning to an outer variable from a nested Python function without `nonlocal` (or `global`), which gives UnboundLocalError.",
    "Long, clever lambdas. If it needs a comment or doesn't fit on a line, give it a name with a normal function.",
    "Reading a `map` or `filter` result twice in Python: the second read is empty.",
  ],
  next: [
    { id: "lang-linq", label: "LINQ and Comprehensions" },
    { id: "inter-compose-functions", label: "Exercise: Compose Functions" },
    { id: "inter-sort-by-length", label: "Exercise: Sort by Length, Then Alphabetically" },
    { id: "lang-cheat-translate", label: "C# vs Python Translation Table" },
  ],
};
