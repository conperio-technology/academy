import { src, type LangLessonData } from "./types.ts";

export const advancedGenerics: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Generic math: one method for every number type",
      csharp: src`
using System.Numerics;

Console.WriteLine(Total([1, 2, 3]));                          // 6
Console.WriteLine(Total([0.1m, 0.2m]));                       // 0.3: decimal is exact
Console.WriteLine(Total([0.1, 0.2]));                         // 0.30000000000000004
Console.WriteLine(Midpoint(2, 9));                            // 5: int division
Console.WriteLine(Midpoint(2.0, 9.0));                        // 5.5
Console.WriteLine(ParseAll<int>(["4", "5"]).Sum());           // 9

static T Total<T>(IEnumerable<T> items) where T : INumber<T>
{
    T sum = T.Zero;                 // a static member of the type parameter
    foreach (T x in items) sum += x;
    return sum;
}

static T Midpoint<T>(T a, T b) where T : INumber<T> => (a + b) / T.CreateChecked(2);

static List<T> ParseAll<T>(IEnumerable<string> texts) where T : IParsable<T> =>
    texts.Select(t => T.Parse(t, null)).ToList();
`,
      python: src`
from decimal import Decimal
from fractions import Fraction


def total[T: (int, float, Decimal, Fraction)](items: list[T]) -> T | int:
    result = 0                      # 0 + anything numeric works at run time
    for x in items:
        result = result + x
    return result


print(total([1, 2, 3]))                                  # 6
print(total([Decimal("0.1"), Decimal("0.2")]))           # 0.3
print(total([0.1, 0.2]))                                 # 0.30000000000000004
print(total([Fraction(1, 3), Fraction(1, 6)]))           # 1/2
`,
      notes: [
        "Before .NET 7 you couldn't write one `Sum<T>` for every number type: `+` isn't something an interface could promise, because operators are static. Static abstract interface members fixed that. An interface can now require static members, such as `T.Zero`, `T.Parse` or `operator +`, and a constraint like `where T : INumber<T>` lets the generic code call them on the type parameter. `INumber<T>` (in `System.Numerics`) is implemented by `int`, `long`, `double`, `decimal` and the rest; `IParsable<T>` by everything with a `Parse` method. This is called generic math.",
        "Python gets this for free at run time (anything with `+` works) and only needs typing for the checker. `[T: (int, float, Decimal, Fraction)]` is a constrained type variable: T must be exactly one of those types, unlike a bound (`[T: Comparable]`), which accepts any subtype of it.",
        "The decimal and float results differ for a reason: decimal stores base-10 digits exactly, while double is binary floating point, where 0.1 can't be stored exactly. Use `decimal` / `Decimal` for money.",
      ],
    },
    {
      kind: "code",
      title: "Variance: when a list of strings is a list of objects",
      csharp: src`
IEnumerable<string> tags = new List<string> { "FT-1", "PT-2" };
IEnumerable<object> things = tags;          // OK: IEnumerable<out T> is covariant
Console.WriteLine(things.Count());           // 2

// List<object> broken = new List<string>();   // CS0029: List<T> is invariant

Action<object> logAnything = o => Console.WriteLine($"log: {o}");
Action<string> logText = logAnything;        // OK: Action<in T> is contravariant
logText("pump started");                     // log: pump started

object[] boxes = new string[2];              // arrays are covariant (a 2002 design mistake)
try
{
    boxes[0] = 42;                           // compiles, fails at run time
}
catch (ArrayTypeMismatchException)
{
    Console.WriteLine("ArrayTypeMismatchException");
}
`,
      python: src`
from collections.abc import Callable, Sequence


def count_all(items: Sequence[object]) -> int:   # Sequence is covariant
    return len(items)


def add_default(items: list[object]) -> None:    # list is invariant
    items.append(42)


tags: list[str] = ["FT-1", "PT-2"]
print(count_all(tags))      # 2: fine for a type checker too
add_default(tags)           # runs, but a type checker rejects this call:
print(tags)                 # ['FT-1', 'PT-2', 42], no longer a list[str]


def log_anything(o: object) -> None:
    print(f"log: {o}")


handler: Callable[[str], None] = log_anything    # OK: parameters are contravariant
handler("pump started")                          # log: pump started
`,
      notes: [
        "Variance answers: if `string` is a kind of `object`, is a box of strings a kind of box of objects? It depends on what the box lets you do. A read-only sequence is safe to treat as a sequence of objects: everything you read out is an object. That's covariance, written `out T` in C# (`IEnumerable<out T>`, `IReadOnlyList<out T>`, `Func<out TResult>`). A list you can add to is not safe: someone could add 42 to your list of strings. So `List<T>` is invariant, accepting only exactly `List<string>`.",
        "Contravariance is the mirror image, for things that only take T in: something that can log any object can certainly log a string, so `Action<object>` can be used as an `Action<string>`. C# marks it `in T` (`Action<in T>`, `IComparer<in T>`). Arrays are covariant for historical reasons, so the mistake compiles and fails at run time with `ArrayTypeMismatchException`.",
        "Python's type checkers apply the same rules: `list[str]` is not a `list[object]`, but it is a `Sequence[object]`, and `Callable` is contravariant in its parameters. Accept the most general read-only type your function needs (`Sequence`, `Iterable`, `Mapping`) rather than `list` and `dict`, and callers can pass more types. At run time nothing is checked, which is why the bad call above runs.",
      ],
    },
    {
      kind: "code",
      title: "Typing decorators and dictionaries: ParamSpec, TypedDict and overloads",
      csharp: src`
Func<int, int, int> add = (a, b) => a + b;
var timedAdd = Timed(add);                 // same signature as add
Console.WriteLine(timedAdd(2, 3));         // add took a moment / 5

var cfg = new PlcConfig("10.0.0.5", 502);
Console.WriteLine(cfg with { Port = 503 });   // PlcConfig { Host = 10.0.0.5, Port = 503 }

static Func<T1, T2, TResult> Timed<T1, T2, TResult>(Func<T1, T2, TResult> f) => (a, b) =>
{
    Console.WriteLine("add took a moment");
    return f(a, b);
};

record PlcConfig(string Host, int Port);
`,
      python: src`
import functools
from collections.abc import Callable
from typing import TypedDict, overload


def timed[**P, R](func: Callable[P, R]) -> Callable[P, R]:   # P: the parameter list
    @functools.wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        print(f"{func.__name__} took a moment")
        return func(*args, **kwargs)
    return wrapper


@timed
def add(a: int, b: int) -> int:
    return a + b


print(add(2, 3))              # add took a moment / 5; add("2", 3) fails type checking


class PlcConfig(TypedDict):   # a dict with known keys and value types
    host: str
    port: int


cfg: PlcConfig = {"host": "10.0.0.5", "port": 502}
print(cfg["port"] + 1)        # 503


@overload
def scale(x: int) -> int: ...
@overload
def scale(x: str) -> str: ...
def scale(x):
    return x * 2


print(scale(4), scale("ab"))  # 8 abab
`,
      notes: [
        "A decorator that returns `Callable[..., Any]` erases the signature of every function it decorates, so the type checker stops catching wrong arguments. `ParamSpec` (`**P` in Python 3.12 syntax, `P = ParamSpec(\"P\")` before that) captures a function's whole parameter list so the wrapper can promise the same one. C# needs one overload of `Timed` per number of parameters, which is why `Func` and `Action` come in versions with up to 16.",
        "`TypedDict` describes a dictionary with fixed keys, as JSON from an API usually is, without changing the data at run time; in C# you'd deserialize into a record. `@overload` declares several signatures for one function so the checker knows `scale(4)` returns an int and `scale(\"ab\")` a str; C# has real overloading instead. Run a type checker (mypy or pyright) in CI so the hints are actually checked.",
      ],
    },
    {
      kind: "table",
      title: "Constraints and type variables side by side",
      head: ["Meaning", "C#", "Python (3.12+ syntax)"],
      rows: [
        ["Any type", "`<T>`", "`[T]`"],
        ["Must implement / subclass", "`where T : IComparable<T>`, `where T : Animal`", "bound: `[T: Comparable]`"],
        ["One of a fixed set of types", "(no direct form; overloads)", "constraints: `[T: (int, str)]`"],
        ["Reference or value type", "`where T : class`, `where T : struct`", "(no equivalent)"],
        ["Not null", "`where T : notnull`", "(omit `None` from the type)"],
        ["Can be created with new", "`where T : new()`", "pass a factory: `Callable[[], T]`"],
        ["Numeric operations", "`where T : INumber<T>` (generic math)", "a Protocol with `__add__`, or constraints"],
        ["Covariant (output only)", "`interface IReader<out T>`", "inferred from use with 3.12 syntax; `TypeVar(..., covariant=True)`"],
        ["Contravariant (input only)", "`interface IWriter<in T>`", "inferred; `TypeVar(..., contravariant=True)`"],
        ["A function's parameter list", "(one overload per arity)", "`[**P]`, `ParamSpec`"],
      ],
      notes: [
        "C# checks generics when compiling and keeps them at run time (a `List<int>` really stores ints, with no boxing). Python's type parameters exist only for type checkers and are erased at run time, so `isinstance(x, list[int])` is an error.",
      ],
    },
    {
      kind: "terms",
      title: "Words from this lesson",
      terms: [
        { term: "Generic math", meaning: "Writing numeric code once for every number type, using `INumber<T>` and static abstract interface members (.NET 7+)." },
        { term: "Static abstract member", meaning: "An interface member that implementing types provide as a static method or operator, callable on a type parameter (`T.Zero`)." },
        { term: "Variance", meaning: "Whether a generic type follows its type argument's subtyping: covariant (follows), contravariant (reverses) or invariant (neither)." },
        { term: "Covariance", meaning: "A producer of strings can be used as a producer of objects. `out T` in C#: `IEnumerable<string>` is an `IEnumerable<object>`." },
        { term: "Contravariance", meaning: "A consumer of objects can be used as a consumer of strings. `in T` in C#: `Action<object>` is an `Action<string>`." },
        { term: "ParamSpec", meaning: "A Python type variable for a whole parameter list, used to type decorators that keep the wrapped function's signature." },
        { term: "TypedDict", meaning: "A Python type describing a dictionary with fixed keys and a value type per key." },
      ],
    },
  ],
  predict: [
    {
      lang: "csharp",
      code: src`
using System.Numerics;

Console.WriteLine(Half(7));
Console.WriteLine(Half(7.0));
Console.WriteLine(Half(7m));

static T Half<T>(T x) where T : INumber<T> => x / T.CreateChecked(2);
`,
      output: "3\n3.5\n3.5",
      distractors: ["3.5\n3.5\n3.5", "3\n3\n3", "3\n3.5\n3"],
      why: "The same generic code uses each type's own division: integer division for `int` throws away the remainder, while `double` and `decimal` keep the half.",
    },
    {
      lang: "csharp",
      code: src`
object[] items = new string[] { "a", "b" };
try
{
    items[0] = "c";
    items[1] = 5;
}
catch (ArrayTypeMismatchException)
{
    Console.WriteLine("mismatch");
}
Console.WriteLine(items[0]);
`,
      output: "mismatch\nc",
      distractors: ["c", "mismatch\na", "5"],
      why: "Array covariance lets a `string[]` be used as an `object[]`, so every store is checked at run time. Storing \"c\" is fine; storing 5 throws, after the first change was already made.",
    },
    {
      lang: "csharp",
      code: src`
IEnumerable<string> names = ["pump", "fan"];
IEnumerable<object> objects = names;
Console.WriteLine(ReferenceEquals(names, objects));
Console.WriteLine(objects.First() is string);
`,
      output: "True\nTrue",
      distractors: ["False\nTrue", "False\nFalse", "True\nFalse"],
      why: "Covariant conversion doesn't copy or wrap anything; it's the same object seen through a more general type, and its items are still strings.",
    },
    {
      lang: "csharp",
      code: src`
Console.WriteLine(Make<Counter>().Value);
Console.WriteLine(Make<List<int>>().Count);

static T Make<T>() where T : new() => new T();

class Counter { public int Value = 10; }
`,
      output: "10\n0",
      distractors: ["0\n0", "10\nnull", "null\n0"],
      why: "The `new()` constraint allows `new T()`, which calls each type's parameterless constructor: a Counter with its field initialised to 10, and an empty list.",
    },
    {
      lang: "python",
      code: src`
def first[T](items: list[T]) -> T:
    return items[0]

print(first([3, 4]), first(["x"]), first.__type_params__[0].__name__)
`,
      output: "3 x T",
      distractors: ["TypeError", "3 x None", "3 x int"],
      why: "Type parameters don't affect running code: `first` works for any list. The function does remember its declared type parameter, named T, for tools that inspect it.",
    },
    {
      lang: "python",
      code: src`
from typing import TypedDict

class Point(TypedDict):
    x: int
    y: int

p: Point = {"x": 1, "y": 2}
p["z"] = 3
print(type(p).__name__, len(p))
`,
      output: "dict 3",
      distractors: ["Point 3", "Point 2", "KeyError"],
      why: "A TypedDict is an ordinary dict at run time. A type checker would reject the unknown key \"z\", but Python itself adds it without complaint.",
    },
    {
      lang: "python",
      code: src`
def describe[T: (int, str)](x: T) -> T:
    return x * 2

print(describe(3), describe("ab"), describe([1]))
`,
      output: "6 abab [1, 1]",
      distractors: ["TypeError", "6 abab TypeError", "6 abab"],
      why: "Constraints exist only for the type checker, which would flag `describe([1])`. At run time `[1] * 2` simply repeats the list.",
    },
    {
      lang: "python",
      code: src`
import functools

def logged(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@logged
def area(w: int, h: int) -> int:
    return w * h

print(area(3, h=4), area.__annotations__["return"].__name__)
`,
      output: "12 int",
      distractors: ["12 None", "KeyError", "7 int"],
      why: "`*args, **kwargs` passes the positional 3 and keyword `h=4` through unchanged. `functools.wraps` also copies the original's annotations, so the wrapper still reports an `int` return type.",
    },
  ],
  pitfalls: [
    "Expecting `List<Derived>` to convert to `List<Base>`. Accept `IEnumerable<Base>` or `IReadOnlyList<Base>` instead, which are covariant.",
    "Relying on array covariance in C#: it compiles and then throws `ArrayTypeMismatchException`.",
    "Typing Python parameters as `list` or `dict` when you only read them. `Sequence`, `Iterable` and `Mapping` accept more and promise not to mutate.",
    "Decorators typed as `Callable[..., Any]`, which silently switch off checking for every function they wrap. Use ParamSpec.",
    "Assuming Python type hints are checked at run time. They aren't; run mypy or pyright.",
  ],
  next: [
    { id: "adv-generic-total", label: "Exercise: Generic Total for Any Number Type" },
    { id: "lang-generics", label: "Generics and Type Hints (recap)" },
    { id: "lang-pattern-matching", label: "Pattern Matching in Depth" },
  ],
};
