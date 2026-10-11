import { src, type LangLessonData } from "./types.ts";

export const generics: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "One function, many types, still checked",
      csharp: src`
var ints = new List<int> { 3, 1, 2 };
// ints.Add("four");     // compile error CS1503: a string is not an int

Console.WriteLine(FirstOr(ints, -1));                     // 3
Console.WriteLine(FirstOr(new List<string>(), "none"));   // none
Console.WriteLine(FirstOr<double>([], 0.5));              // 0.5: T given explicitly

static T FirstOr<T>(List<T> items, T fallback) => items.Count > 0 ? items[0] : fallback;
`,
      python: src`
def first_or[T](items: list[T], fallback: T) -> T:     # Python 3.12+ syntax
    return items[0] if items else fallback


print(first_or([3, 1, 2], -1))       # 3
print(first_or([], "none"))          # none
print(first_or(["a"], 0))            # a: hints aren't checked when the code runs
`,
      notes: [
        "Generics let you write code once with a placeholder for a type, here `T`, and have it work for any type while keeping the type checking. `T` is a type parameter; when you call `FirstOr(ints, -1)`, C# works out that T is int (type inference) and checks that `fallback` is an int too. You've used generics since the first collection: `List<int>` is the generic `List<T>` with T set to int.",
        "Python's annotations, the `: list[T]` and `-> T` parts, are type hints: notes about the intended types. Python itself ignores them when running, which is why `first_or([\"a\"], 0)` runs happily. A static type checker such as mypy or Pyright (built into many editors) reads them and reports mistakes before the code runs. The `[T]` after the function name declares the type parameter; code that must run on Python 3.11 or older uses `T = TypeVar(\"T\")` instead, shown in the questions.",
      ],
    },
    {
      kind: "code",
      title: "A generic class",
      csharp: src`
var latest = new Latest<double>(3);
foreach (var r in new[] { 1.5, 2.0, 2.5, 3.0 })
    latest.Add(r);
Console.WriteLine(string.Join(" ", latest.Items));    // 2 2.5 3

var names = new Latest<string>(2);
names.Add("Ana");
names.Add("Ben");
names.Add("Cy");
Console.WriteLine(string.Join(" ", names.Items));     // Ben Cy

// Keeps only the most recent few items of any type.
class Latest<T>
{
    private readonly Queue<T> _items = new();
    private readonly int _capacity;

    public Latest(int capacity) => _capacity = capacity;

    public void Add(T item)
    {
        _items.Enqueue(item);
        if (_items.Count > _capacity) _items.Dequeue();
    }

    public IEnumerable<T> Items => _items;
}
`,
      python: src`
from collections import deque


# Keeps only the most recent few items of any type.
class Latest[T]:
    def __init__(self, capacity: int) -> None:
        self._items: deque[T] = deque(maxlen=capacity)   # drops the oldest itself

    def add(self, item: T) -> None:
        self._items.append(item)

    @property
    def items(self) -> list[T]:
        return list(self._items)


latest: Latest[float] = Latest(3)
for r in [1.5, 2.0, 2.5, 3.0]:
    latest.add(r)
print(latest.items)          # [2.0, 2.5, 3.0]

names: Latest[str] = Latest(2)
for n in ["Ana", "Ben", "Cy"]:
    names.add(n)
print(names.items)           # ['Ben', 'Cy']
`,
      notes: [
        "A class can take type parameters too. `Latest<double>` and `Latest<string>` are separate, fully checked types built from one definition: adding a string to `latest` is a compile error. In Python, `Latest[float]` in the annotation tells the type checker what goes in; at run time it's one ordinary class.",
        "Without generics you'd write the class for `object` (C#) and cast everything coming out, losing the checks, or copy the class once per type.",
      ],
    },
    {
      kind: "code",
      title: "Constraints: what T must be able to do",
      csharp: src`
Console.WriteLine(Largest([4, 9, 2]));              // 9
Console.WriteLine(Largest(["pear", "apple"]));      // pear

static T Largest<T>(T[] items) where T : IComparable<T>
{
    T best = items[0];
    foreach (var x in items)
        if (x.CompareTo(best) > 0) best = x;
    return best;
}
`,
      python: src`
from typing import Protocol


class Comparable(Protocol):
    def __lt__(self, other, /) -> bool: ...


def largest[T: Comparable](items: list[T]) -> T:    # T must support <
    best = items[0]
    for x in items:
        if best < x:
            best = x
    return best


print(largest([4, 9, 2]))             # 9
print(largest(["pear", "apple"]))     # pear
`,
      notes: [
        "Inside `Largest`, C# only lets you do with a `T` what every possible T can do, which is almost nothing. A constraint, `where T : IComparable<T>`, says T must implement that interface, and in return you may call `CompareTo` on it. Other common constraints are `where T : class` (any reference type), `where T : struct` (any value type) and `where T : new()` (has a parameterless constructor).",
        "Python's equivalent is a bound, `[T: Comparable]`, written with the Protocol idea from the previous lesson: any type with a `<` operator (the `__lt__` method) qualifies. Again only a type checker enforces it; at run time Python simply tries `best < x`.",
      ],
    },
    {
      kind: "code",
      title: "Maybe a value: nullable and optional types",
      csharp: src`
string[] tags = ["FT-1", "PT-2"];
int? at = FindIndex(tags, "PT-2");
int? missing = FindIndex(tags, "LT-9");
Console.WriteLine(at);                  // 1
Console.WriteLine(missing.HasValue);    // False
Console.WriteLine(missing ?? -1);       // -1

static int? FindIndex(string[] items, string target)
{
    for (int i = 0; i < items.Length; i++)
        if (items[i] == target) return i;
    return null;
}
`,
      python: src`
def find_index(items: list[str], target: str) -> int | None:
    for i, item in enumerate(items):
        if item == target:
            return i
    return None


tags = ["FT-1", "PT-2"]
at = find_index(tags, "PT-2")
missing = find_index(tags, "LT-9")
print(at)                                    # 1
print(missing is not None)                   # False
print(missing if missing is not None else -1)   # -1
`,
      notes: [
        "`int?` is shorthand for the generic type `Nullable<int>`: an int that may also be null. It's clearer than returning -1 for \"not found\", because the caller can't forget to check: `at + 1` gives another `int?`, and you have to decide what null means with `??` or `.HasValue`. For reference types, `string?` marks a variable that may be null, and the compiler warns when you use it without checking.",
        "In Python, `int | None` (older code writes `Optional[int]`) is only a hint, and any variable can be None. Test with `is None` / `is not None`, not `== None`, and don't use `or` for defaults when 0 is a valid value: `0 or -1` gives -1.",
      ],
    },
    {
      kind: "table",
      title: "Generic syntax side by side",
      head: ["", "C#", "Python 3.12+", "Older Python"],
      rows: [
        ["generic function", "`T First<T>(List<T> xs)`", "`def first[T](xs: list[T]) -> T`", "`T = TypeVar(\"T\")`, then `def first(xs: list[T]) -> T`"],
        ["generic class", "`class Box<T> { }`", "`class Box[T]: ...`", "`class Box(Generic[T]): ...`"],
        ["two type parameters", "`Dictionary<TKey, TValue>`", "`dict[K, V]`, `class Pair[K, V]`", "`Generic[K, V]`"],
        ["constraint or bound", "`where T : IComparable<T>`", "`[T: Comparable]`", "`TypeVar(\"T\", bound=Comparable)`"],
        ["one of a few types", "(no direct form)", "`[T: (int, str)]`", "`TypeVar(\"T\", int, str)`"],
        ["might be missing", "`int?`, `string?`", "`int | None`", "`Optional[int]`"],
        ["anything at all", "`object`", "`object` or `Any`", "`Any`"],
        ["a function", "`Func<int, string>`", "`Callable[[int], str]`", "same"],
      ],
      notes: [
        "`Any` switches type checking off for that value; `object` keeps it on and only allows what every object supports. Prefer `object` (or a proper type) when you mean \"anything\".",
      ],
    },
  ],
  predict: [
    {
      lang: "csharp",
      code: src`
var (a, b) = Swap(1, 2);
var (c, d) = Swap("x", "y");
Console.WriteLine($"{a}{b}{c}{d}");

static (T, T) Swap<T>(T x, T y) => (y, x);
`,
      output: "21yx",
      distractors: ["12xy", "21xy", "Compile error"],
      why: "One generic method, used with T = int and then T = string. Each call returns its two arguments in the other order.",
    },
    {
      lang: "python",
      code: src`
def double(x: int) -> int:
    return x * 2

print(double(4), double("ab"), double([0]))
`,
      output: "8 abab [0, 0]",
      distractors: ["TypeError", "8 None None", "8 ab [0]"],
      why: "Type hints are not checked when Python runs. `\"ab\" * 2` repeats the string and `[0] * 2` repeats the list. A type checker would flag the last two calls before you ran anything.",
    },
    {
      lang: "csharp",
      code: src`
Console.WriteLine(Default<int>());
Console.WriteLine(Default<bool>());
Console.WriteLine(Default<string>() is null);

static T Default<T>() => default!;
`,
      output: "0\nFalse\nTrue",
      distractors: ["null\nnull\nTrue", "0\nTrue\nTrue", "0\nFalse\nFalse"],
      why: "`default` is the zero value of whatever T is: 0 for int, false for bool and null for any reference type such as string. (`!` only silences the compiler's null warning.)",
    },
    {
      lang: "python",
      code: src`
class Box[T]:
    def __init__(self, item: T) -> None:
        self.item = item

b: Box[int] = Box("not an int")
print(b.item)
print(type(b).__name__)
`,
      output: "not an int\nBox",
      distractors: ["TypeError", "not an int\nBox[int]", "None\nBox"],
      why: "The `[int]` is for the type checker only. At run time there is one class, Box, and it stores whatever it's given.",
    },
    {
      lang: "csharp",
      code: src`
Counter<int>.Hit();
Counter<int>.Hit();
Counter<string>.Hit();
Console.WriteLine($"{Counter<int>.Hits} {Counter<string>.Hits}");

static class Counter<T>
{
    public static int Hits;
    public static void Hit() => Hits++;
}
`,
      output: "2 1",
      distractors: ["3 3", "2 2", "0 0"],
      why: "C# makes a separate type for each type argument, and each has its own static fields. `Counter<int>` and `Counter<string>` don't share `Hits`.",
    },
    {
      lang: "csharp",
      code: src`
Console.WriteLine(Max("10", "9"));
Console.WriteLine(Max(10, 9));

static T Max<T>(T a, T b) where T : IComparable<T> => a.CompareTo(b) >= 0 ? a : b;
`,
      output: "9\n10",
      distractors: ["10\n10", "9\n9", "10\n9"],
      why: "The same generic code compares strings as text and ints as numbers, because each type brings its own `CompareTo`. As text, \"10\" comes before \"9\", since '1' sorts before '9'.",
    },
    {
      lang: "python",
      code: src`
def parse_port(text: str) -> int | None:
    return int(text) if text.isdigit() else None

ports = [parse_port(t) for t in ["80", "x", "443"]]
print(ports)
print(sum(p for p in ports if p is not None))
`,
      output: "[80, None, 443]\n523",
      distractors: ["[80, 443]\n523", "[80, 0, 443]\n523", "TypeError"],
      why: "\"x\" isn't all digits, so it gives None, and the list keeps it. The sum skips the None values explicitly; adding None to an int would raise TypeError.",
    },
    {
      lang: "csharp",
      code: src`
int? a = null;
int? b = 5;
Console.WriteLine(a + b == null);
Console.WriteLine((a ?? 0) + b);
Console.WriteLine(b.GetValueOrDefault() * 2);
`,
      output: "True\n5\n10",
      distractors: ["False\n5\n10", "True\n0\n10", "InvalidOperationException"],
      why: "Arithmetic with a null `int?` gives null rather than throwing, so `a + b` is null. `a ?? 0` swaps the null for 0 first, and `GetValueOrDefault()` returns 5.",
    },
    {
      lang: "python",
      code: src`
from typing import TypeVar

T = TypeVar("T")

def last(items: list[T]) -> T:
    return items[-1]

print(last([1, 2, 3]), last("xyz"))
`,
      output: "3 z",
      distractors: ["3 xyz", "TypeError", "3 None"],
      why: "The older TypeVar spelling of a generic function. A string isn't a list, but indexing works on it, and hints aren't enforced, so `last(\"xyz\")` gives the last character. (A type checker would complain.)",
    },
  ],
  pitfalls: [
    "Believing Python type hints protect you at run time. They don't; run a type checker (mypy, Pyright) or your editor's checks to get the benefit.",
    "Using `object` or `Any` everywhere to dodge type errors, which throws the checking away. Use a type parameter.",
    "Forgetting a constraint and then trying to compare or add T values: C# won't let you call methods T isn't guaranteed to have.",
    "Treating `default` as \"null\". For value types it's 0, false or an all-zero struct.",
    "Testing for None with `==` or truthiness when 0, \"\" or an empty list are valid values. Use `is None`.",
  ],
  next: [
    { id: "inter-min-max", label: "Exercise: Generic Min and Max" },
    { id: "inter-generic-stack", label: "Exercise: A Generic Stack Class" },
    { id: "lang-iterators", label: "Iterators and Generators" },
  ],
};
