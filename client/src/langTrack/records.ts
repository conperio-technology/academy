import { src, type LangLessonData } from "./types.ts";

export const records: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Records and dataclasses: data types in a line or two",
      csharp: src`
var a = new Reading("PT-101", 4.2);
var b = new Reading("PT-101", 4.2);
Console.WriteLine(a);                       // Reading { Tag = PT-101, Value = 4.2 }
Console.WriteLine(a == b);                  // True: same data
Console.WriteLine(ReferenceEquals(a, b));   // False: still two objects

var c = a with { Value = 5.0 };             // a copy with one change
Console.WriteLine(c);                       // Reading { Tag = PT-101, Value = 5 }
Console.WriteLine(a.Value);                 // 4.2: a is unchanged
// a.Value = 9;                             // compile error CS8852: init-only

var (tag, value) = a;                       // take a record apart
Console.WriteLine($"{tag} {value}");        // PT-101 4.2

record Reading(string Tag, double Value);
`,
      python: src`
from dataclasses import dataclass, replace


@dataclass(frozen=True)
class Reading:
    tag: str
    value: float


a = Reading("PT-101", 4.2)
b = Reading("PT-101", 4.2)
print(a)                  # Reading(tag='PT-101', value=4.2)
print(a == b)             # True: same data
print(a is b)             # False: still two objects

c = replace(a, value=5.0)     # a copy with one change
print(c)                  # Reading(tag='PT-101', value=5.0)
print(a.value)            # 4.2: a is unchanged
# a.value = 9             # FrozenInstanceError

tag, value = a.tag, a.value
print(tag, value)         # PT-101 4.2
`,
      notes: [
        "Many classes are mostly data: a reading, an order line, a coordinate. A C# `record` and a Python `@dataclass` write the boring parts for you from the list of fields: the constructor, a readable printed form, and value equality, meaning two objects are equal when their data is equal, not only when they are the same object.",
        "The positional record `record Reading(string Tag, double Value)` makes properties you can set only while the object is being created (init-only), so a record like this is immutable: it can't change after it's built. `with` makes a modified copy. `@dataclass(frozen=True)` is the Python equivalent, and `dataclasses.replace` makes the modified copy. A plain `@dataclass` (without `frozen`) can be changed freely.",
      ],
    },
    {
      kind: "code",
      title: "Equality and hashing: what sets and dictionaries rely on",
      csharp: src`
var points = new HashSet<Point> { new(1, 2), new(1, 2), new(3, 4) };
Console.WriteLine(points.Count);             // 2

var plain = new HashSet<PlainPoint> { new(1, 2), new(1, 2) };
Console.WriteLine(plain.Count);              // 2: compared as objects

var custom = new HashSet<EqPoint> { new(1, 2), new(1, 2) };
Console.WriteLine(custom.Count);             // 1: our Equals and GetHashCode

record Point(int X, int Y);

class PlainPoint
{
    public int X { get; }
    public int Y { get; }
    public PlainPoint(int x, int y) { X = x; Y = y; }
}

class EqPoint : IEquatable<EqPoint>
{
    public int X { get; }
    public int Y { get; }
    public EqPoint(int x, int y) { X = x; Y = y; }

    public bool Equals(EqPoint? other) => other is not null && X == other.X && Y == other.Y;
    public override bool Equals(object? obj) => Equals(obj as EqPoint);
    public override int GetHashCode() => HashCode.Combine(X, Y);
}
`,
      python: src`
from dataclasses import dataclass


@dataclass(frozen=True)
class Point:
    x: int
    y: int


class PlainPoint:
    def __init__(self, x, y):
        self.x, self.y = x, y


class EqPoint:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __eq__(self, other):
        return isinstance(other, EqPoint) and (self.x, self.y) == (other.x, other.y)

    def __hash__(self):
        return hash((self.x, self.y))


print(len({Point(1, 2), Point(1, 2), Point(3, 4)}))   # 2
print(len({PlainPoint(1, 2), PlainPoint(1, 2)}))      # 2: compared as objects
print(len({EqPoint(1, 2), EqPoint(1, 2)}))            # 1: our __eq__ and __hash__
`,
      notes: [
        "A hash set or dictionary finds things in two steps. First it computes the key's hash code, a number worked out from the key, to jump straight to a small bucket; then it uses equality to check the few items in that bucket. So the rule is: objects that are equal must have equal hash codes. Override equality without the hash and lookups quietly fail.",
        "Records and frozen dataclasses follow the rule automatically. For a hand-written class, override `Equals` and `GetHashCode` together in C# (`HashCode.Combine` mixes several fields), or `__eq__` and `__hash__` together in Python (hashing a tuple of the fields is the usual trick). An ordinary class with neither compares by identity, which is fine for things like a connection or a motor where \"the same one\" is what you mean.",
      ],
    },
    {
      kind: "code",
      title: "The mutable-key trap",
      csharp: src`
var key = new Box { Value = 1 };
var set = new HashSet<Box> { key };
key.Value = 2;                          // its hash code changes too
Console.WriteLine(set.Contains(key));   // False: looked in the wrong bucket
Console.WriteLine(set.Count);           // 1: but it's still in there

record Box
{
    public int Value { get; set; }      // a record CAN have settable properties
}
`,
      python: src`
from dataclasses import dataclass


@dataclass
class Box:                 # eq but not frozen: Python makes it unhashable
    value: int


try:
    {Box(1)}
except TypeError as e:
    print("TypeError:", e)          # TypeError: unhashable type: 'Box'


@dataclass(unsafe_hash=True)       # forces a hash, and allows the same trap
class LooseBox:
    value: int


k = LooseBox(1)
s = {k}
k.value = 2
print(k in s)                      # False
`,
      notes: [
        "A key's hash is computed when it goes into the set. Change the object afterwards and its new hash points at a different bucket, so the set can no longer find it, even though it's still inside. Only use immutable objects as dictionary keys and set members: strings, numbers, tuples, records with init-only properties, frozen dataclasses.",
        "Python protects you by default: a dataclass that compares by value but isn't frozen gets no hash at all, so putting it in a set fails straight away with a clear TypeError instead of misbehaving later. Lists and dicts are unhashable for the same reason.",
      ],
    },
    {
      kind: "code",
      title: "Ordering your own types",
      csharp: src`
var versions = new List<Version3> { new(1, 10, 0), new(1, 2, 5), new(0, 9, 9) };
versions.Sort();
Console.WriteLine(string.Join(", ", versions));    // 0.9.9, 1.2.5, 1.10.0
Console.WriteLine(versions.Max());                 // 1.10.0

record Version3(int Major, int Minor, int Patch) : IComparable<Version3>
{
    public int CompareTo(Version3? other) =>
        other is null ? 1 : (Major, Minor, Patch).CompareTo((other.Major, other.Minor, other.Patch));

    public override string ToString() => $"{Major}.{Minor}.{Patch}";
}
`,
      python: src`
from dataclasses import dataclass


@dataclass(frozen=True, order=True)    # order=True compares fields in order
class Version3:
    major: int
    minor: int
    patch: int

    def __str__(self):
        return f"{self.major}.{self.minor}.{self.patch}"


versions = [Version3(1, 10, 0), Version3(1, 2, 5), Version3(0, 9, 9)]
print(", ".join(str(v) for v in sorted(versions)))    # 0.9.9, 1.2.5, 1.10.0
print(max(versions))                                  # 1.10.0
`,
      notes: [
        "Equality says whether two things are the same; ordering says which comes first. Records don't get ordering automatically: implement `IComparable<T>` and `Sort`, `Max` and `OrderBy(v => v)` use it. Comparing tuples of the fields gives \"by major, then minor, then patch\" in one line. `@dataclass(order=True)` generates `<`, `<=`, `>` and `>=` that compare the fields in the order they're declared.",
        "Comparing versions as text would put \"1.10.0\" before \"1.2.5\", because the character '1' sorts before '2'. Comparing numbers fixes it.",
      ],
    },
    {
      kind: "table",
      title: "Data types compared",
      head: ["", "C# class", "C# record", "Python class", "Python @dataclass"],
      rows: [
        ["Constructor written for you", "No", "Yes (positional)", "No", "Yes"],
        ["Readable printing", "No: prints the type name", "Yes", "No: `<... object at 0x...>`", "Yes"],
        ["`==` compares", "Identity", "Values", "Identity", "Values (`eq=True`, the default)"],
        ["Can change after creation", "Yes", "No for positional properties", "Yes", "Yes, unless `frozen=True`"],
        ["Usable as a dict key or in a set", "Yes, by identity", "Yes, by value", "Yes, by identity", "Only if frozen (or `unsafe_hash`)"],
        ["Copy with a change", "Write it yourself", "`with { ... }`", "Write it yourself", "`dataclasses.replace(...)`"],
        ["Sorting", "`IComparable<T>`", "`IComparable<T>`", "`__lt__` and friends", "`order=True`"],
      ],
      notes: [
        "C# also has `record struct`, a value type with the same conveniences, and Python has `typing.NamedTuple`, an immutable tuple with named fields. Records compare collection fields by reference, not by contents (see the questions).",
      ],
    },
  ],
  predict: [
    {
      lang: "csharp",
      code: src`
var a = new P(1, 2);
var b = a with { Y = 5 };
Console.WriteLine($"{a.Y} {b.Y} {a == b} {a == (b with { Y = 2 })}");

record P(int X, int Y);
`,
      output: "2 5 False True",
      distractors: ["5 5 True True", "2 5 False False", "2 5 True True"],
      why: "`with` copies, so `a` keeps Y = 2. The copy differs from `a` until another `with` sets Y back to 2, and then the data, and so `==`, matches.",
    },
    {
      lang: "python",
      code: src`
from dataclasses import dataclass

@dataclass
class P:
    x: int
    y: int

print(P(1, 2) == P(1, 2), P(1, 2) == (1, 2))
`,
      output: "True False",
      distractors: ["True True", "False False", "False True"],
      why: "The generated `__eq__` compares field by field, but only with another P. A tuple with the same numbers is a different type, so it isn't equal.",
    },
    {
      lang: "python",
      code: src`
from dataclasses import dataclass

@dataclass
class Tag:
    name: str

try:
    counts = {Tag("a"): 1}
    print("ok")
except TypeError:
    print("TypeError")
`,
      output: "TypeError",
      distractors: ["ok", "KeyError", "AttributeError"],
      why: "A dataclass that compares by value but isn't frozen has its hash switched off, so it can't be a dictionary key. `@dataclass(frozen=True)` would make it work.",
    },
    {
      lang: "csharp",
      code: src`
var a = new Batch("B1", new List<int> { 1, 2 });
var b = new Batch("B1", new List<int> { 1, 2 });
Console.WriteLine(a == b);

record Batch(string Id, List<int> Items);
`,
      output: "False",
      distractors: ["True", "Compile error", "B1"],
      why: "A record compares each field with that field's own equality. List<int> compares by reference, and these are two different lists, so the records differ even though everything looks the same.",
    },
    {
      lang: "python",
      code: src`
from dataclasses import dataclass, FrozenInstanceError

@dataclass(frozen=True)
class Cfg:
    port: int

c = Cfg(80)
try:
    c.port = 8080
except FrozenInstanceError:
    print("frozen")
print(c.port)
`,
      output: "frozen\n80",
      distractors: ["8080", "frozen\n8080", "AttributeError"],
      why: "Assigning to a field of a frozen dataclass raises FrozenInstanceError, and the object keeps its original value.",
    },
    {
      lang: "csharp",
      code: src`
var set = new HashSet<Item> { new Item("a"), new Item("a") };
var rset = new HashSet<RItem> { new RItem("a"), new RItem("a") };
Console.WriteLine($"{set.Count} {rset.Count}");

class Item
{
    public string N;
    public Item(string n) => N = n;
}
record RItem(string N);
`,
      output: "2 1",
      distractors: ["1 1", "2 2", "1 2"],
      why: "The class compares by identity, so two separate Items are both kept. The record compares by value, so the second RItem(\"a\") is a duplicate.",
    },
    {
      lang: "python",
      code: src`
class K:
    def __init__(self, v):
        self.v = v
    def __eq__(self, other):
        return self.v == other.v

print(K(1) == K(1))
print(K.__hash__ is None)
`,
      output: "True\nTrue",
      distractors: ["True\nFalse", "False\nTrue", "False\nFalse"],
      why: "Defining `__eq__` without `__hash__` makes Python set `__hash__` to None, so K objects can't go in sets or be dict keys. Equal objects must hash equally, and Python won't guess how.",
    },
    {
      lang: "python",
      code: src`
from dataclasses import dataclass

@dataclass(order=True)
class Job:
    priority: int
    name: str

jobs = [Job(2, "b"), Job(1, "z"), Job(2, "a")]
print([j.name for j in sorted(jobs)])
`,
      output: "['z', 'a', 'b']",
      distractors: ["['a', 'b', 'z']", "['z', 'b', 'a']", "TypeError"],
      why: "`order=True` compares fields in declaration order: priority first, then name for ties. So the priority 1 job comes first, then \"a\" before \"b\".",
    },
  ],
  pitfalls: [
    "Overriding `Equals` without `GetHashCode` (or `__eq__` without `__hash__`), so sets and dictionaries stop finding things.",
    "Using objects that can change as dictionary keys or set members, then changing them.",
    "Expecting a record with a list field to compare the lists' contents. It compares the references; write `Equals` yourself or use an immutable collection with value equality.",
    "Comparing version numbers or dates as strings.",
    "Making every class a record. Records suit values (a reading, a point); things with identity and changing state (a motor, a connection) are better as ordinary classes.",
  ],
  next: [
    { id: "inter-distinct-points", label: "Exercise: Distinct Points with a Record" },
    { id: "lang-values-references", label: "Immutability, Values and References" },
    { id: "hash-table-internals", label: "Hashing: How a Hash Map Actually Works" },
  ],
};
