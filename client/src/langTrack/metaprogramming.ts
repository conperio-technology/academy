import { src, type LangLessonData } from "./types.ts";

export const metaprogramming: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Operator overloading: your types with + and ==",
      csharp: src`
var a = new Vec(1, 2);
var b = new Vec(3, 4);
Console.WriteLine(a + b);           // (4, 6)
Console.WriteLine(b - a);           // (2, 2)
Console.WriteLine(a * 3);           // (3, 6)
Console.WriteLine(3 * a);           // (3, 6)
Console.WriteLine(a == new Vec(1, 2));   // True: records compare values
Console.WriteLine(-a);              // (-1, -2)

readonly record struct Vec(int X, int Y)
{
    public static Vec operator +(Vec p, Vec q) => new(p.X + q.X, p.Y + q.Y);
    public static Vec operator -(Vec p, Vec q) => new(p.X - q.X, p.Y - q.Y);
    public static Vec operator -(Vec p) => new(-p.X, -p.Y);
    public static Vec operator *(Vec p, int k) => new(p.X * k, p.Y * k);
    public static Vec operator *(int k, Vec p) => p * k;
    public override string ToString() => $"({X}, {Y})";
}
`,
      python: src`
class Vec:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __add__(self, other):           # a + b
        if not isinstance(other, Vec):
            return NotImplemented       # "I don't know how": Python tries other options
        return Vec(self.x + other.x, self.y + other.y)

    def __sub__(self, other):           # a - b
        return Vec(self.x - other.x, self.y - other.y)

    def __neg__(self):                  # -a
        return Vec(-self.x, -self.y)

    def __mul__(self, k):               # a * 3
        return Vec(self.x * k, self.y * k)

    __rmul__ = __mul__                  # 3 * a: the right-hand version

    def __eq__(self, other):            # a == b
        return isinstance(other, Vec) and (self.x, self.y) == (other.x, other.y)

    def __hash__(self):                 # needed again once __eq__ is defined
        return hash((self.x, self.y))

    def __repr__(self):                 # how it prints
        return f"({self.x}, {self.y})"


a, b = Vec(1, 2), Vec(3, 4)
print(a + b, b - a, a * 3, 3 * a)       # (4, 6) (2, 2) (3, 6) (3, 6)
print(a == Vec(1, 2), -a)               # True (-1, -2)
`,
      notes: [
        "Operator overloading means defining what `+`, `-`, `*`, `==`, `<` and friends do for your own types. It suits mathematical and value-like types (vectors, money, durations, matrices) and is confusing anywhere else; nobody expects `order + customer` to mean anything.",
        "In C# an operator is a `public static` method named `operator +`, taking the operands as parameters. `3 * a` and `a * 3` are different signatures, so each needs its own method. Records already define `==` and `!=` with value equality; for a class you'd define both, plus `Equals` and `GetHashCode`, because the compiler insists they stay consistent.",
        "In Python, operators call specially named methods, the dunder methods (\"double underscore\": `__add__`, `__eq__`). For `a + b` Python calls `a.__add__(b)`; if that returns `NotImplemented` (a special value, not an exception), it tries `b.__radd__(a)`, which is how `3 * a` reaches `Vec.__rmul__`. Defining `__eq__` removes the default `__hash__`, so define `__hash__` too if the objects go in sets or dict keys, and only for immutable ones.",
      ],
    },
    {
      kind: "code",
      title: "Behaving like a built-in collection",
      csharp: src`
var week = new Shift(["ana", "ben", "cai"]);
Console.WriteLine(week[1]);              // ben: an indexer
Console.WriteLine(week.Count);           // 3
Console.WriteLine(week.Contains("cai")); // True
foreach (var name in week) Console.Write(name + " ");   // ana ben cai
Console.WriteLine();
Console.WriteLine(string.Join(",", week.Where(n => n != "ben")));   // ana,cai: LINQ works too

class Shift(string[] people) : IEnumerable<string>
{
    public string this[int i] => people[i];
    public int Count => people.Length;
    public bool Contains(string name) => people.Contains(name);
    public IEnumerator<string> GetEnumerator() => ((IEnumerable<string>)people).GetEnumerator();
    System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator() => GetEnumerator();
}
`,
      python: src`
class Shift:
    def __init__(self, people):
        self._people = list(people)

    def __getitem__(self, i):           # week[1], and slices too
        return self._people[i]

    def __len__(self):                  # len(week)
        return len(self._people)

    def __contains__(self, name):       # "cai" in week
        return name in self._people

    def __iter__(self):                 # for name in week
        return iter(self._people)

    def __call__(self, i):              # week(0): the object is callable
        return self._people[i].upper()


week = Shift(["ana", "ben", "cai"])
print(week[1], len(week), "cai" in week)    # ben 3 True
print(list(week), week[1:])                 # ['ana', 'ben', 'cai'] ['ben', 'cai']
print(week(0), bool(Shift([])))             # ANA False
`,
      notes: [
        "Python's built-in functions and syntax are hooks onto dunder methods: `len(x)` calls `x.__len__()`, `x[i]` calls `__getitem__`, `in` calls `__contains__`, `for` calls `__iter__`, `x()` calls `__call__`, and `bool(x)` uses `__bool__` or, failing that, `__len__`, which is why an empty `Shift` is falsy. Implement them and your type works everywhere a list would; this is duck typing from the intermediate track, at the level of syntax.",
        "C# gets the same effects from specific members: an indexer (`this[int i]`), a `Count` property, and `IEnumerable<T>` for `foreach` and LINQ. Implementing the generic interface also requires the old non-generic `GetEnumerator`, written as an explicit interface member as above.",
      ],
    },
    {
      kind: "code",
      title: "Properties and descriptors: code behind an attribute",
      csharp: src`
var pump = new Pump { Speed = 50 };
Console.WriteLine(pump.Speed);          // 50
try
{
    pump.Speed = 150;
}
catch (ArgumentOutOfRangeException e)
{
    Console.WriteLine(e.ParamName);     // value
}

class Pump
{
    private int _speed;
    public int Speed
    {
        get => _speed;
        set
        {
            ArgumentOutOfRangeException.ThrowIfGreaterThan(value, 100);
            _speed = value;
        }
    }
}
`,
      python: src`
class Percent:
    """A descriptor: one reusable rule for many attributes."""

    def __set_name__(self, owner, name):    # told its attribute name at class creation
        self.name = "_" + name

    def __get__(self, obj, objtype=None):
        return getattr(obj, self.name)

    def __set__(self, obj, value):
        if not 0 <= value <= 100:
            raise ValueError(f"{self.name[1:]} must be 0 to 100, got {value}")
        setattr(obj, self.name, value)


class Pump:
    speed = Percent()                       # both attributes share the rule
    valve = Percent()

    def __init__(self, speed, valve):
        self.speed = speed                  # goes through Percent.__set__
        self.valve = valve


pump = Pump(50, 20)
print(pump.speed, pump.valve)               # 50 20
try:
    pump.valve = 150
except ValueError as e:
    print(e)                                # valve must be 0 to 100, got 150
`,
      notes: [
        "Both languages let reading or writing what looks like a field run code: C# properties and Python's `@property` (from the classes lesson). Under the hood, `@property` is one example of a descriptor: an object stored on a class that has `__get__` (and optionally `__set__`), so that reading or writing the attribute on an instance calls those methods instead. Descriptors let you write a validation or conversion rule once and reuse it on many attributes, which is how ORMs such as SQLAlchemy and Django's models define their columns.",
        "You'll rarely write a descriptor, but knowing they exist explains a lot: methods, `@staticmethod`, `@classmethod` and `__slots__` are all descriptors. C# has no equivalent; you repeat the property or generate it with a source generator.",
      ],
    },
    {
      kind: "code",
      title: "Reflection: code that inspects code",
      csharp: src`
var reading = new Reading("FT-101", 42.5);
Type type = reading.GetType();
Console.WriteLine(type.Name);                              // Reading
foreach (var prop in type.GetProperties())
    Console.WriteLine($"{prop.Name} = {prop.GetValue(reading)}");
// Tag = FT-101
// Value = 42.5
Console.WriteLine(nameof(reading.Value));                  // Value: checked at compile time
var method = type.GetMethod("Describe")!;
Console.WriteLine(method.Invoke(reading, null));           // FT-101: 42.5

record Reading(string Tag, double Value)
{
    public string Describe() => $"{Tag}: {Value}";
}
`,
      python: src`
import inspect
from dataclasses import dataclass


@dataclass
class Reading:
    tag: str
    value: float

    def describe(self):
        return f"{self.tag}: {self.value}"


reading = Reading("FT-101", 42.5)
print(type(reading).__name__)                    # Reading
for name, value in vars(reading).items():        # the instance's attributes
    print(f"{name} = {value}")
# tag = FT-101
# value = 42.5
print(getattr(reading, "describe")())            # FT-101: 42.5
setattr(reading, "value", 50.0)
print(hasattr(reading, "unit"), reading.value)   # False 50.0
print(inspect.signature(Reading))                # (tag: str, value: float) -> None
`,
      notes: [
        "Reflection is a program examining its own types at run time: listing a class's properties, reading or setting them by name, calling a method chosen at run time, reading attributes. Serializers (`System.Text.Json`, `json`), test runners, dependency injection containers and ORMs all use it. In C# it starts from a `Type` object (`obj.GetType()` or `typeof(Reading)`) and `System.Reflection`. In Python everything is already an object you can look into: `type`, `vars`, `getattr`, `setattr`, `hasattr`, `dir` and the `inspect` module.",
        "Reflection is slow compared with ordinary calls, skips the compiler's checks (a typo in a name string fails only at run time) and is a security risk with untrusted names. Prefer `nameof` and ordinary code; modern .NET increasingly replaces reflection with source generators, which write the code at compile time instead. The exercise sandbox blocks reflection, so it's taught, not graded.",
      ],
    },
    {
      kind: "code",
      title: "Classes are objects too: type, __init_subclass__ and metaclasses",
      csharp: src`
// C# types are fixed at compile time. The closest relatives of Python's
// class-creation hooks are attributes plus reflection at startup, and
// source generators that write extra code while compiling.
var plugins = new Dictionary<string, Func<IPlugin>>
{
    ["csv"] = () => new CsvExport(),
    ["json"] = () => new JsonExport(),
};
Console.WriteLine(string.Join(", ", plugins.Keys));   // csv, json
Console.WriteLine(plugins["json"]().Run());           // exporting json

interface IPlugin { string Run(); }
class CsvExport : IPlugin { public string Run() => "exporting csv"; }
class JsonExport : IPlugin { public string Run() => "exporting json"; }
`,
      python: src`
class Plugin:
    registry = {}

    def __init_subclass__(cls, name, **kwargs):     # runs for each subclass
        super().__init_subclass__(**kwargs)
        Plugin.registry[name] = cls


class CsvExport(Plugin, name="csv"):
    def run(self):
        return "exporting csv"


class JsonExport(Plugin, name="json"):
    def run(self):
        return "exporting json"


print(list(Plugin.registry))                  # ['csv', 'json']
print(Plugin.registry["json"]().run())        # exporting json

Dynamic = type("Dynamic", (), {"answer": 42})  # make a class at run time
print(Dynamic.__name__, Dynamic().answer)      # Dynamic 42
print(type(Dynamic), type(type))               # <class 'type'> <class 'type'>
`,
      notes: [
        "In Python a class is an object, created at run time when the `class` statement runs. The class of a class is its metaclass, normally `type`: `type(name, bases, namespace)` builds a class directly, as `Dynamic` shows. A custom metaclass (`class Meta(type)`, used with `class X(metaclass=Meta)`) can change how classes are built; `ABCMeta` (abstract classes) and `Enum` use one. That's metaprogramming: code that writes or changes code.",
        "Metaclasses are rarely the right tool. `__init_subclass__` (shown) covers the usual need, reacting whenever someone subclasses your class, for example to register plugins, and class decorators such as `@dataclass` cover generating methods. In an interview, \"a metaclass is the class of a class; `type` is the default; I'd reach for `__init_subclass__` or a decorator first\" is the expected answer.",
      ],
    },
    {
      kind: "table",
      title: "Python's special methods and their C# counterparts",
      head: ["Python", "Triggered by", "C#"],
      rows: [
        ["`__init__`", "`Vec(1, 2)`", "constructor"],
        ["`__repr__`, `__str__`", "`repr(x)`, `print(x)`, f-strings", "`override ToString()`"],
        ["`__eq__`, `__hash__`", "`==`, sets and dict keys", "`Equals`, `GetHashCode`, `operator ==` (records do it for you)"],
        ["`__lt__`, `__le__`, ...", "`<`, `sorted`, `min`", "`IComparable<T>`, `operator <`"],
        ["`__add__`, `__radd__`, `__mul__`", "`a + b`, `3 * a`", "`static operator +`, `operator *`"],
        ["`__len__`", "`len(x)`", "`Count` or `Length` property"],
        ["`__getitem__`, `__setitem__`", "`x[i]`, `x[i] = v`", "indexer `this[int i]`"],
        ["`__contains__`", "`v in x`", "`Contains` method"],
        ["`__iter__`, `__next__`", "`for v in x`", "`IEnumerable<T>`, `IEnumerator<T>`"],
        ["`__call__`", "`x()`", "a delegate field, or `Invoke` method"],
        ["`__bool__`", "`if x:`", "`operator true`, or an `IsEmpty` property"],
        ["`__enter__`, `__exit__`", "`with x:`", "`IDisposable` and `using`"],
        ["`__get__`, `__set__`", "attribute access via a descriptor", "properties"],
      ],
    },
    {
      kind: "terms",
      title: "Words from this lesson",
      terms: [
        { term: "Operator overloading", meaning: "Defining what operators such as `+` and `==` do for your own types." },
        { term: "Dunder method", meaning: "A Python method with double underscores on both sides, like `__add__`, called by the language for operators and built-ins." },
        { term: "NotImplemented", meaning: "The value an operator method returns to say \"I can't handle this type\", so Python tries the other operand's method." },
        { term: "Indexer", meaning: "A C# member, `this[int i]`, that lets objects be used with square brackets." },
        { term: "Descriptor", meaning: "A Python object on a class with `__get__` / `__set__` that controls access to an attribute; `property` is one." },
        { term: "Reflection", meaning: "Inspecting and using types, properties and methods at run time by name, rather than in written code." },
        { term: "Metaclass", meaning: "The class of a class, which controls how classes are created. Python's default is `type`." },
        { term: "Source generator", meaning: "A .NET compiler add-on that writes extra C# code during the build, often replacing reflection." },
      ],
    },
  ],
  predict: [
    {
      lang: "python",
      code: src`
class Money:
    def __init__(self, cents):
        self.cents = cents
    def __add__(self, other):
        return Money(self.cents + other.cents)
    def __repr__(self):
        return f"{self.cents / 100:.2f}"

print(Money(150) + Money(275))
`,
      output: "4.25",
      distractors: ["425", "<__main__.Money object>", "Money(425)"],
      why: "`+` calls `__add__`, which adds the cents: 425. `print` then uses `__repr__` (there's no `__str__`), formatting 4.25 with two decimals.",
    },
    {
      lang: "python",
      code: src`
class Box:
    def __init__(self, n):
        self.n = n
    def __mul__(self, k):
        return Box(self.n * k)

b = Box(2) * 3
print(b.n)
try:
    3 * Box(2)
except TypeError:
    print("TypeError")
`,
      output: "6\nTypeError",
      distractors: ["6\n6", "TypeError", "6\nNone"],
      why: "`Box(2) * 3` calls `Box.__mul__`. `3 * Box(2)` first asks `int.__mul__`, which returns NotImplemented, then looks for `Box.__rmul__`, which doesn't exist, so Python raises TypeError.",
    },
    {
      lang: "python",
      code: src`
class Bag:
    def __init__(self, items):
        self.items = items
    def __len__(self):
        return len(self.items)

print(len(Bag([1, 2])), bool(Bag([])), bool(Bag([0])))
`,
      output: "2 False True",
      distractors: ["2 True True", "2 False False", "TypeError"],
      why: "With no `__bool__`, truthiness falls back to `__len__`: zero length is False. `Bag([0])` has length 1, so it's True even though its only item is falsy.",
    },
    {
      lang: "python",
      code: src`
class P:
    def __init__(self, x):
        self.x = x
    def __eq__(self, other):
        return self.x == other.x

print(P(1) == P(1))
try:
    print(len({P(1), P(1)}))
except TypeError as e:
    print("TypeError")
`,
      output: "True\nTypeError",
      distractors: ["True\n1", "True\n2", "False\n2"],
      why: "Defining `__eq__` without `__hash__` sets `__hash__` to None, so the objects are unhashable and can't go in a set.",
    },
    {
      lang: "csharp",
      code: src`
var a = new Temp(20);
var b = a + 5;
Console.WriteLine($"{a.C} {b.C} {a == new Temp(20)}");

record Temp(int C)
{
    public static Temp operator +(Temp t, int d) => new(t.C + d);
}
`,
      output: "20 25 True",
      distractors: ["25 25 True", "20 25 False", "25 25 False"],
      why: "The operator returns a new `Temp`, leaving `a` unchanged. Records compare by value, so a separate `Temp(20)` equals `a`.",
    },
    {
      lang: "csharp",
      code: src`
var a = new Point(1, 2);
var b = new Point(1, 2);
Console.WriteLine($"{a == b} {a.Equals(b)}");

class Point(int x, int y)
{
    public int X = x, Y = y;
    public override bool Equals(object? o) => o is Point p && p.X == X && p.Y == Y;
    public override int GetHashCode() => HashCode.Combine(X, Y);
}
`,
      output: "False True",
      distractors: ["True True", "False False", "True False"],
      why: "Overriding `Equals` doesn't change `==`: for a class without an `operator ==`, `==` still compares references, and these are two objects. Records (or defining `operator ==` yourself) keep the two in step.",
    },
    {
      lang: "csharp",
      code: src`
var grid = new Grid();
grid[1, 2] = 7;
Console.WriteLine(grid[1, 2] + grid[0, 0]);

class Grid
{
    private readonly int[,] _cells = new int[3, 3];
    public int this[int row, int col]
    {
        get => _cells[row, col];
        set => _cells[row, col] = value;
    }
}
`,
      output: "7",
      distractors: ["0", "IndexOutOfRangeException", "70"],
      why: "An indexer can take several parameters. The set stores 7 at row 1, column 2; the untouched cell (0, 0) is 0 by default.",
    },
    {
      lang: "python",
      code: src`
class Reading:
    def __init__(self):
        self.tag = "FT-1"
        self.value = 3

r = Reading()
print(getattr(r, "value") + 1, getattr(r, "unit", "none"), sorted(vars(r)))
`,
      output: "4 none ['tag', 'value']",
      distractors: ["4 None ['tag', 'value']", "AttributeError", "4 none ['value', 'tag']"],
      why: "`getattr` reads an attribute by name; its third argument is a default used when the attribute is missing, instead of raising AttributeError. `vars` returns the instance's attribute dictionary, and `sorted` gives its keys in order.",
    },
    {
      lang: "python",
      code: src`
class Base:
    names = []
    def __init_subclass__(cls):
        Base.names.append(cls.__name__)

class A(Base): pass
class B(A): pass

print(Base.names, type(A).__name__)
`,
      output: "['A', 'B'] type",
      distractors: ["['A'] type", "['Base', 'A', 'B'] type", "['A', 'B'] Base"],
      why: "`__init_subclass__` runs whenever a subclass is created, including subclasses of subclasses, but not for `Base` itself. Every ordinary class's type, its metaclass, is `type`.",
    },
  ],
  pitfalls: [
    "Overloading operators where the meaning isn't obvious. Keep them for value-like types: vectors, money, units, matrices.",
    "Defining `__eq__` without `__hash__` in Python (objects become unhashable), or `Equals` without `GetHashCode` and `==` in C#.",
    "Raising TypeError from a Python operator method instead of returning `NotImplemented`, which stops Python trying the other operand.",
    "Reaching for reflection or a metaclass when an interface, a dictionary of functions or `__init_subclass__` would do.",
    "Mutating objects that are used as dictionary keys after giving them value-based hashing.",
  ],
  next: [
    { id: "adv-vector-operators", label: "Exercise: A Vector Type with Operators" },
    { id: "adv-inclusive-range", label: "Exercise: A Range You Can Index, Count and Loop Over" },
    { id: "lang-advanced-generics", label: "Advanced Generics: Constraints, Variance and Protocols" },
  ],
};
