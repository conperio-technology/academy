import { src, type LangLessonData } from "./types.ts";

export const valuesReferences: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Copying a value versus sharing an object",
      csharp: src`
var s1 = new PointStruct { X = 1 };
var s2 = s1;               // copies the whole value
s2.X = 99;
Console.WriteLine(s1.X);   // 1: s1 has its own copy

var c1 = new PointClass { X = 1 };
var c2 = c1;               // copies the reference: one shared object
c2.X = 99;
Console.WriteLine(c1.X);   // 99

struct PointStruct { public int X; }
class PointClass { public int X; }
`,
      python: src`
a = [1, 2, 3]
b = a                  # b is a second name for the same list
b.append(4)
print(a)               # [1, 2, 3, 4]
print(a is b)          # True: one object

x = 10
y = x
y += 1                 # an int can't change: += makes a new int for y
print(x, y)            # 10 11
`,
      notes: [
        "C# has two kinds of type. A value type (int, double, bool, char, DateTime, any `struct`) stores its data directly in the variable, so assigning it copies the data. A reference type (any `class`, string, arrays, List, records declared with `record`) lives elsewhere in memory, the heap, and the variable stores a reference to it, so assigning copies the reference and both variables now reach the same object. The Stack vs Heap and Garbage Collection lesson shows the memory picture.",
        "In Python every variable is a name attached to an object, so assignment never copies anything. What differs is whether the object can change. Lists, dicts and sets are mutable (changeable in place), so a change through one name is visible through the other. Ints, floats, strings and tuples are immutable: operations like `+=` build a new object and move the name, leaving other names alone. That's why `x` stays 10.",
      ],
    },
    {
      kind: "code",
      title: "Shallow and deep copies",
      csharp: src`
var grid = new List<List<int>> { new() { 1, 2 }, new() { 3, 4 } };
var shallow = new List<List<int>>(grid);                // a new outer list, the same rows
var deep = grid.Select(row => new List<int>(row)).ToList();   // new rows too

grid[0][0] = 100;
Console.WriteLine(shallow[0][0]);    // 100: shares the rows
Console.WriteLine(deep[0][0]);       // 1: has its own rows

int[] original = [3, 1, 2];
int[] sortedCopy = original.Order().ToArray();   // leave the original alone
Console.WriteLine($"{string.Join(",", original)} {string.Join(",", sortedCopy)}");   // 3,1,2 1,2,3
`,
      python: src`
import copy

grid = [[1, 2], [3, 4]]
shallow = grid.copy()                  # same as list(grid) or grid[:]
deep = copy.deepcopy(grid)             # or [row.copy() for row in grid]
grid[0][0] = 100
print(shallow[0][0])                   # 100: shares the rows
print(deep[0][0])                      # 1: has its own rows

original = [3, 1, 2]
sorted_copy = sorted(original)         # original.sort() would change it
print(original, sorted_copy)           # [3, 1, 2] [1, 2, 3]

bad = [[0] * 3] * 2                    # two references to ONE row
bad[0][0] = 7
print(bad)                             # [[7, 0, 0], [7, 0, 0]]
`,
      notes: [
        "A shallow copy is a new outer container holding the same inner objects; a deep copy copies the inner objects too, all the way down. For a list of numbers or strings, shallow is enough, since the items can't change anyway. For a list of lists, a grid, or objects you'll modify, you usually want the inner copies.",
        "`[[0] * 3] * 2` is the classic Python grid bug: `* 2` repeats the reference to one row. Build grids with a comprehension, `[[0] * 3 for _ in range(2)]`, which makes a new row each time. Similarly, prefer functions that return a new result (`sorted`, LINQ's `Order`) over ones that change their input (`sort`), unless changing it is the point.",
      ],
    },
    {
      kind: "code",
      title: "Immutable objects and read-only views",
      csharp: src`
using System.Collections.Immutable;

var limits = ImmutableList.Create(10, 20);
var more = limits.Add(30);               // returns a new list; limits is unchanged
Console.WriteLine($"{limits.Count} {more.Count}");    // 2 3

var owned = new List<int> { 1, 2 };
IReadOnlyList<int> view = owned;         // a read-only window onto owned
// view.Add(3);                          // compile error CS1061: no Add on the view
owned.Add(3);                            // but the owner can still change it
Console.WriteLine(view.Count);           // 3

var cfg = new Config("plc-1", 502);
Console.WriteLine(cfg with { Port = 503 });   // Config { Host = plc-1, Port = 503 }

record Config(string Host, int Port);
`,
      python: src`
from types import MappingProxyType

limits = (10, 20)                  # a tuple can't change
more = limits + (30,)              # makes a new tuple
print(len(limits), len(more))      # 2 3

tags = frozenset({"PT-1", "FT-2"})
print("PT-1" in tags)              # True, and tags has no add method

settings = {"host": "plc-1"}
view = MappingProxyType(settings)  # a read-only window onto settings
try:
    view["host"] = "x"
except TypeError:
    print("read-only")             # read-only
settings["host"] = "plc-2"         # but the owner can still change it
print(view["host"])                # plc-2
`,
      notes: [
        "Immutability, objects that can't change after they're made, removes a whole class of bugs: nobody can modify your data behind your back, immutable objects are safe to share between threads, and only immutable things make reliable dictionary keys. The cost is making a new object for every change, which for small data is usually nothing.",
        "A read-only view is weaker: it stops you changing the data through that view, but whoever owns the original can still change it, and you'll see the change. `IReadOnlyList<T>` and `MappingProxyType` are views; `ImmutableList<T>`, tuples, `frozenset`, strings, records with init-only properties and frozen dataclasses are truly immutable (as long as everything inside them is too).",
      ],
    },
    {
      kind: "code",
      title: "Same contents or same object: == versus identity",
      csharp: src`
string a = "pump";
string b = string.Concat("pu", "mp");          // built at run time
Console.WriteLine(a == b);                     // True: string == compares the text
Console.WriteLine(ReferenceEquals(a, b));      // False: two string objects

var l1 = new List<int> { 1 };
var l2 = new List<int> { 1 };
Console.WriteLine(l1 == l2);                   // False: lists compare references
Console.WriteLine(l1.SequenceEqual(l2));       // True: compare the contents
`,
      python: src`
a = "pump"
b = "".join(["pu", "mp"])     # built at run time
print(a == b)                 # True: same text
print(a is b)                 # False: two string objects

l1 = [1]
l2 = [1]
print(l1 == l2)               # True: lists compare contents
print(l1 is l2)               # False: two lists
x = None
print(x is None)              # True: the right way to test for None
`,
      notes: [
        "Every language separates \"equal\" (same contents) from \"identical\" (the very same object). C#'s `==` means whatever the type says: contents for strings and records, identity for most classes, including List. Python's `==` asks for equal contents for all the built-in types, and `is` always asks for identity.",
        "Use Python's `is` only for None (and other one-of-a-kind objects such as True and False). Never use it to compare numbers or strings: whether two equal strings happen to be the same object depends on details of the interpreter.",
      ],
    },
    {
      kind: "table",
      title: "Which types behave which way",
      head: ["", "C#", "Python"],
      rows: [
        ["Assignment copies the data", "Value types: `int`, `double`, `bool`, `char`, `decimal`, `DateTime`, `struct`, `record struct`, enums", "Never: assignment always shares the object"],
        ["Assignment shares one object", "Reference types: `class`, `record`, `string`, arrays, `List<T>`, `Dictionary`", "Everything"],
        ["Can't be changed after creation", "`string`, records with init-only properties, `ImmutableList<T>` and friends", "`int`, `float`, `str`, `tuple`, `frozenset`, `bytes`, frozen dataclasses"],
        ["Can be changed in place", "Most classes, arrays, `List<T>`, `Dictionary`", "`list`, `dict`, `set`, most objects"],
        ["Shallow copy", "`new List<T>(xs)`, `xs.ToList()`, `arr.Clone()`", "`xs.copy()`, `list(xs)`, `xs[:]`, `copy.copy(x)`"],
        ["Deep copy", "Write it (copy each inner item)", "`copy.deepcopy(x)`"],
      ],
      notes: [
        "A C# struct is copied every time it's passed or assigned, so keep structs small (a few fields) and preferably immutable (`readonly struct`). Stage 3 covers when structs pay off for performance.",
      ],
    },
  ],
  predict: [
    {
      lang: "csharp",
      code: src`
var list = new List<Counter> { new Counter() };
var c = list[0];
c.N++;
Console.WriteLine(list[0].N);

struct Counter { public int N; }
`,
      output: "0",
      distractors: ["1", "Compile error", "null"],
      why: "Counter is a struct, so `list[0]` hands back a copy and `c.N++` changes only the copy. With `class Counter` it would print 1.",
    },
    {
      lang: "csharp",
      code: src`
var arr = new Counter[1];
arr[0].N++;
arr[0].N++;
Console.WriteLine(arr[0].N);

struct Counter { public int N; }
`,
      output: "2",
      distractors: ["0", "1", "NullReferenceException"],
      why: "An array element is a storage slot you can change directly, so `arr[0].N++` changes the struct inside the array. A List's indexer returns a copy instead, as in the previous question. A new array of structs starts with every field at zero, not null.",
    },
    {
      lang: "python",
      code: src`
rows = [[]] * 3
rows[0].append("x")
print(rows)
`,
      output: "[['x'], ['x'], ['x']]",
      distractors: ["[['x'], [], []]", "[['x']]", "[[], [], []]"],
      why: "`* 3` repeats the reference, so all three slots hold the same list. Use `[[] for _ in range(3)]` for three separate lists.",
    },
    {
      lang: "python",
      code: src`
t = (1, [2, 3])
t[1].append(4)
print(t)
`,
      output: "(1, [2, 3, 4])",
      distractors: ["TypeError", "(1, [2, 3])", "(1, [2, 3], 4)"],
      why: "The tuple can't change which objects it holds, but the list inside it is still a mutable list. Immutable only means truly unchangeable when everything inside is immutable too.",
    },
    {
      lang: "python",
      code: src`
a = [1]
b = a
b += [2]
x = (1,)
y = x
y += (2,)
print(a, x)
`,
      output: "[1, 2] (1,)",
      distractors: ["[1] (1,)", "[1, 2] (1, 2)", "[1] (1, 2)"],
      why: "For a list, `+=` changes the list in place, which `a` also names. A tuple can't change, so `y += (2,)` builds a new tuple and points `y` at it; `x` still names the old one.",
    },
    {
      lang: "csharp",
      code: src`
string s = "abc";
s.ToUpper();
var t = s;
t += "d";
Console.WriteLine($"{s} {t}");
`,
      output: "abc abcd",
      distractors: ["ABC abcd", "abcd abcd", "ABC ABCd"],
      why: "Strings are immutable: `ToUpper` returns a new string, which is thrown away here. `t += \"d\"` also makes a new string and points `t` at it, leaving `s` alone.",
    },
    {
      lang: "python",
      code: src`
import copy

cfg = {"ports": [80]}
c1 = cfg.copy()
c2 = copy.deepcopy(cfg)
cfg["ports"].append(443)
print(c1["ports"], c2["ports"])
`,
      output: "[80, 443] [80]",
      distractors: ["[80] [80]", "[80, 443] [80, 443]", "[80] [80, 443]"],
      why: "`copy()` is shallow: the new dict holds the same list object. `deepcopy` copied the list as well, so it doesn't see the change.",
    },
    {
      lang: "csharp",
      code: src`
var p = new P { X = 1 };
Move(p);
Console.WriteLine(p.X);
MoveRef(ref p);
Console.WriteLine(p.X);

static void Move(P q) => q.X += 10;
static void MoveRef(ref P q) => q.X += 10;
struct P { public int X; }
`,
      output: "1\n11",
      distractors: ["11\n21", "1\n1", "11\n11"],
      why: "Passing a struct copies it, so `Move` changes its own copy. `ref` passes the caller's variable itself, so `MoveRef` changes `p`.",
    },
    {
      lang: "python",
      code: src`
def add_reading(value, history=None):
    if history is None:
        history = []
    history.append(value)
    return history

log = add_reading(1)
add_reading(2, log)
print(log, add_reading(3))
`,
      output: "[1, 2] [3]",
      distractors: ["[1] [3]", "[1, 2] [1, 2, 3]", "[1, 2, 3] [1, 2, 3]"],
      why: "Passing `log` hands over a reference to the same list, so the second call appends to it. The last call gets a fresh list, because `None` as the default and a new list inside avoids the shared-default trap from the Functions lesson.",
    },
  ],
  pitfalls: [
    "Building a Python grid with `[[0] * cols] * rows`: every row is the same list.",
    "Copying a list of lists or objects with a shallow copy and then changing the inner items.",
    "Changing a struct you got from a List, property or method, which only changes a copy.",
    "Treating a read-only view (`IReadOnlyList`, `MappingProxyType`) as a snapshot. The owner can still change the data underneath.",
    "Using `is` to compare numbers or strings in Python. Use `==`; keep `is` for None.",
  ],
  next: [
    { id: "inter-grid-with-cell", label: "Exercise: Change a Copy, Not the Original" },
    { id: "stack-heap-gc", label: "Stack vs Heap and Garbage Collection" },
    { id: "lang-files-formatting", label: "Files, Formatting and Parsing" },
  ],
};
