import { src, type LangLessonData } from "./types.ts";

export const memory: LangLessonData = {
  parts: [
    {
      kind: "text",
      title: "Where this track starts",
      paragraphs: [
        "This is the first lesson of the advanced track. It assumes the basics and intermediate tracks: classes, records and dataclasses, generics, iterators, lambdas, and the difference between values and references. The advanced lessons are aimed at two jobs: writing code that holds up in production, and answering the follow-up questions an interviewer asks once your solution works (\"what does this allocate?\", \"is it thread safe?\", \"how would you test or measure that?\").",
        "Some samples here measure memory. The exact byte counts in the comments are from 64-bit .NET 10 and 64-bit CPython 3.13 on Linux; other versions and 32-bit builds (including the Python that runs in this site's editor) print different numbers, but the comparisons and the reasons behind them hold.",
      ],
    },
    {
      kind: "code",
      title: "Who frees memory: the garbage collector and reference counting",
      csharp: src`
var reading = new object();
Console.WriteLine(GC.GetGeneration(reading));   // 0: brand new
GC.Collect();                                   // force a collection (demo only)
Console.WriteLine(GC.GetGeneration(reading));   // 1: survived one
GC.Collect();
Console.WriteLine(GC.GetGeneration(reading));   // 2: survived two, now "old"
GC.Collect();
Console.WriteLine(GC.GetGeneration(reading));   // 2: the oldest generation

var big = new byte[100_000];                    // 85,000 bytes or more
Console.WriteLine(GC.GetGeneration(big));       // 2: large objects start old
GC.KeepAlive(reading);
`,
      python: src`
import gc


class Probe:
    def __init__(self, name):
        self.name = name

    def __del__(self):                  # runs when the object is freed
        print("freed", self.name)


a = Probe("a")
b = a                                   # two references to one object
del a                                   # one left: nothing happens
print("still here")
b = None                                # last reference gone
print("after b = None")

x = Probe("x")
y = Probe("y")
x.other, y.other = y, x                 # a cycle: each keeps the other alive
del x, y
print("cycle unreachable")
gc.collect()                            # the cycle collector finds them
print("done")
`,
      notes: [
        "Objects you create with `new` (and every Python object) live on the heap, a large area of memory managed for you. Neither language makes you free memory yourself; they differ in how they notice an object is no longer used.",
        ".NET uses a tracing garbage collector (GC): every so often it pauses the program briefly, finds every object still reachable from your variables, and reclaims the rest. It's generational: new objects go in generation 0, which is collected often and cheaply because most objects die young (a temporary string, a LINQ iterator). Survivors are promoted to generation 1 and then 2, which are collected rarely. Arrays and strings of 85,000 bytes or more go straight to the large object heap, counted as generation 2, because copying them around is expensive.",
        "CPython mainly uses reference counting: every object counts how many references point at it, and frees itself the moment the count reaches zero, so `__del__` runs right at `b = None`. Reference counting can't free a cycle (two objects pointing at each other), so a second, generational cycle collector runs now and then, or when you call `gc.collect()`. `GC.Collect()` and `gc.collect()` are for demos and tests; calling them in production code almost always makes things slower.",
      ],
    },
    {
      kind: "code",
      title: "Counting allocations",
      csharp: src`
long before = GC.GetAllocatedBytesForCurrentThread();
var values = new int[1000];
long after = GC.GetAllocatedBytesForCurrentThread();
Console.WriteLine(after - before);    // 4024: 4000 for the ints + 24 of header and length

before = GC.GetAllocatedBytesForCurrentThread();
object boxed = 42;                    // boxing: an int copied into a heap object
after = GC.GetAllocatedBytesForCurrentThread();
Console.WriteLine(after - before);    // 24

before = GC.GetAllocatedBytesForCurrentThread();
var point = new PointStruct(1, 2);    // a struct local: no heap allocation
after = GC.GetAllocatedBytesForCurrentThread();
Console.WriteLine(after - before);    // 0
GC.KeepAlive(values); GC.KeepAlive(boxed);
Console.WriteLine(point.X + point.Y); // 3

struct PointStruct(int x, int y)
{
    public int X = x;
    public int Y = y;
}
`,
      python: src`
import sys

print(sys.getsizeof(1))            # 28: even a small int is a full object
print(sys.getsizeof(2**100))       # 40: ints grow as needed
print(sys.getsizeof("abc"))        # 44
print(sys.getsizeof([]))           # 56: an empty list

sizes = []
items = []
for i in range(9):
    sizes.append(sys.getsizeof(items))
    items.append(i)
print(sizes)    # [56, 88, 88, 88, 88, 120, 120, 120, 120]
`,
      notes: [
        "An allocation is a request for a new block of heap memory. Allocating in .NET is very fast, but every byte allocated brings the next garbage collection closer, so hot loops (code that runs millions of times) that allocate are a common cause of GC pauses. `GC.GetAllocatedBytesForCurrentThread` is a quick way to see what a piece of code allocates; for real measurements, BenchmarkDotNet's memory column (see the profiling lesson) is the tool.",
        "Boxing means copying a value type such as an int into a new heap object so it can be treated as an `object` or an interface. It happens silently when you store an int in an `object` variable, an `ArrayList`, or call an interface method on a struct through the interface type. Generics (`List<int>`) exist partly to avoid it.",
        "`sys.getsizeof` reports the size of one object itself, not of what it refers to: a list's size covers its array of references, not the items. The list grows its spare capacity in steps (88, 120, ...), the same amortized geometric-growth idea as a C# `List<T>` (CPython grows by about 1/8; `List<T>` doubles), which is why `append` is O(1) on average.",
      ],
    },
    {
      kind: "code",
      title: "Span<T>: a window onto memory, without copying",
      csharp: src`
int[] samples = [10, 20, 30, 40, 50];
Span<int> middle = samples.AsSpan(1, 3);   // a view of 20, 30, 40: nothing copied
middle[0] = 99;                            // writes through to the array
Console.WriteLine(string.Join(",", samples));     // 10,99,30,40,50

ReadOnlySpan<char> line = "PT-101;42;ok";
int first = line.IndexOf(';');
ReadOnlySpan<char> rest = line[(first + 1)..];
int value = int.Parse(rest[..rest.IndexOf(';')]); // parses "42" without making a string
Console.WriteLine(value + 1);                     // 43

Span<int> scratch = stackalloc int[4];     // 4 ints on the stack, freed on return
for (int i = 0; i < scratch.Length; i++) scratch[i] = i * i;
int total = 0;
foreach (int s in scratch) total += s;
Console.WriteLine(total);                  // 14
`,
      python: src`
data = bytearray(b"abcdef")
view = memoryview(data)[1:4]       # a window onto bytes 1..3: nothing copied
view[0] = ord("X")                 # writes through to the bytearray
print(data)                        # bytearray(b'aXcdef')

copy = data[1:4]                   # slicing a bytearray (or a list, or a str) copies
copy[0] = ord("Y")
print(data)                        # bytearray(b'aXcdef'): unchanged

line = "PT-101;42;ok"
name, value, status = line.split(";")   # three new strings
print(int(value) + 1)                   # 43
`,
      notes: [
        "`Span<T>` is a lightweight view of a run of memory: an array, part of an array, a string's characters, or memory on the stack. Slicing a span (`span[1..3]`, `Slice`) makes a new view of the same memory instead of copying, and `ReadOnlySpan<char>` lets you cut up and parse text without creating substrings. Many .NET methods accept spans: `int.Parse`, `double.TryParse`, `IndexOf`, `SequenceEqual`.",
        "`stackalloc` reserves a small buffer on the stack (the per-method memory that's freed automatically when the method returns) instead of the heap, so the GC never sees it. Keep it small, a few hundred bytes or so, because the stack is only about 1 MB. Because a span may point at the stack, the compiler stops it escaping: a `Span<T>` can't be stored in a class field, captured by a lambda or used across an `await`. `Memory<T>` is the heap-friendly sibling that can be stored and awaited, and you call `.Span` on it when you're ready to work.",
        "Python has the same idea for binary data only: `memoryview` gives a no-copy window onto `bytes`, `bytearray` or an array. Slicing a str, list or tuple always copies. In practice Python code that needs this kind of speed hands the work to C code: NumPy arrays, whose slices are views, or built-in functions that loop in C.",
      ],
    },
    {
      kind: "code",
      title: "Structs, classes and copies",
      csharp: src`
var a = new PointStruct { X = 1 };
var b = a;               // a struct copies its whole value
b.X = 2;
Console.WriteLine($"{a.X} {b.X}");    // 1 2

var c = new PointClass { X = 1 };
var d = c;               // a class copies the reference: one object
d.X = 2;
Console.WriteLine($"{c.X} {d.X}");    // 2 2

var points = new List<PointStruct> { new() { X = 1 } };
var p = points[0];       // the indexer returns a copy
p.X = 5;
Console.WriteLine(points[0].X);       // 1: the copy changed, not the list
points[0] = p;           // write the copy back
Console.WriteLine(points[0].X);       // 5

struct PointStruct { public int X; }
class PointClass { public int X; }
`,
      python: src`
class Point:
    def __init__(self, x):
        self.x = x


a = Point(1)
b = a                    # every assignment shares the object
b.x = 2
print(a.x, b.x)          # 2 2

n = 256
m = 256
print(n is m)            # True: CPython keeps one copy of -5..256
print(int("257") is int("257"))   # False: two separate int objects
print(int("257") == int("257"))   # True: compare values with ==
`,
      notes: [
        "A struct is stored inline: in a local variable, inside an array, or inside the object that contains it. That makes an array of a million structs one block of memory (good for the CPU cache, and only one object for the GC) where a million class instances would be a million separate objects plus an array of references. The cost is copying: every assignment, argument and return copies the whole struct, so keep structs small (16 bytes or so is the usual guidance) and preferably immutable with `readonly struct`, which avoids the copy-was-changed surprise above.",
        "Python has no value types: every name refers to an object, and assignment never copies. CPython saves memory by reusing the objects for small ints (and many short strings), which is why `is` sometimes appears to work for numbers. That's an implementation detail; always compare values with `==` and keep `is` for `None`.",
      ],
    },
    {
      kind: "code",
      title: "__slots__: smaller Python objects with a fixed set of attributes",
      csharp: src`
var r = new Reading(7, 21.5);
Console.WriteLine(r);              // Reading { Sensor = 7, Value = 21.5 }
Console.WriteLine(System.Runtime.CompilerServices.Unsafe.SizeOf<Reading>());   // 16
// r.Unit = "C";                   // CS1061: a type's fields are fixed when it's compiled

readonly record struct Reading(int Sensor, double Value);
`,
      python: src`
import sys
import tracemalloc


class Plain:
    def __init__(self, sensor, value):
        self.sensor = sensor
        self.value = value


class Slotted:
    __slots__ = ("sensor", "value")     # only these attributes, no per-object dict

    def __init__(self, sensor, value):
        self.sensor = sensor
        self.value = value


p = Plain(7, 21.5)
p.unit = "C"                            # fine: a Plain object has a __dict__
s = Slotted(7, 21.5)
print(hasattr(s, "__dict__"))           # False
try:
    s.unit = "C"
except AttributeError as e:
    print("AttributeError")             # AttributeError

tracemalloc.start()
start = tracemalloc.get_traced_memory()[0]
plain = [Plain(i, i) for i in range(10_000)]
middle = tracemalloc.get_traced_memory()[0]
slotted = [Slotted(i, i) for i in range(10_000)]
end = tracemalloc.get_traced_memory()[0]
print(end - middle < middle - start)    # True: the slotted list uses less memory
`,
      notes: [
        "A normal Python object keeps its attributes in a dictionary, `__dict__`, which is why you can add new attributes to it at any time. `__slots__` replaces that dictionary with a fixed set of attribute slots, much like a C# class's fields: the object is smaller and attribute access slightly faster, and assigning an attribute that isn't listed raises AttributeError. It's worth it for classes with many thousands of instances; `@dataclass(slots=True)` does it for you.",
        "Recent CPython versions already avoid creating `__dict__` until someone asks for it, so the saving is smaller than older articles claim: in this run about 30 percent. Measure with `tracemalloc` (which records every allocation Python makes) rather than adding up `sys.getsizeof` results, which miss the objects an object refers to.",
        "`readonly record struct` in C# is the compact, immutable value: 16 bytes here (an int, 4 bytes of padding, a double), stored inline with no object header.",
      ],
    },
    {
      kind: "table",
      title: "Memory management side by side",
      head: ["", ".NET (C#)", "CPython"],
      rows: [
        ["How unused objects are found", "Tracing GC: find everything reachable, reclaim the rest", "Reference counting, plus a cycle collector"],
        ["When an object is freed", "At some later collection", "Usually the moment its last reference goes"],
        ["Generations", "0 (new), 1, 2 (old), plus the large object heap for 85,000 bytes and up", "The cycle collector also uses generations; reference counting needs none"],
        ["Values stored inline", "Structs, and the primitive types `int`, `double`, `bool`", "None: every value is an object"],
        ["Measure allocations", "`GC.GetAllocatedBytesForCurrentThread()`, BenchmarkDotNet's `[MemoryDiagnoser]`", "`tracemalloc`, `sys.getsizeof` for one object"],
        ["No-copy views", "`Span<T>`, `ReadOnlySpan<T>`, `Memory<T>`", "`memoryview` (binary data), NumPy views"],
        ["Fewer allocations", "Structs, spans, `StringBuilder`, `ArrayPool<T>.Shared` to reuse buffers", "`__slots__`, generators instead of lists, `''.join`, arrays of numbers in `array` or NumPy"],
        ["Clean-up code", "`IDisposable` and `using` (finalizers are a last resort)", "`with` and context managers (`__del__` is a last resort)"],
      ],
      notes: [
        "A memory leak in a garbage-collected language is memory that's still reachable but no longer needed: an ever-growing static list or cache, or event handlers that were never removed. The GC can't free what your code can still reach.",
        "Interview angle: \"value type versus reference type\", \"what is boxing\", \"why are generations useful\" and \"why can't a Span be a field\" are standard .NET questions; \"how does Python free memory\", \"what does `is` compare\" and \"what are `__slots__` for\" are their Python counterparts.",
      ],
    },
    {
      kind: "terms",
      title: "Words from this lesson",
      terms: [
        { term: "Heap", meaning: "The large area of memory where objects live. The garbage collector or reference counting decides when each one is freed." },
        { term: "Stack", meaning: "Per-method memory for local variables, freed automatically when the method returns. Small (about 1 MB per thread) and very fast." },
        { term: "Allocation", meaning: "Reserving a new block of heap memory for an object. Cheap one at a time, costly in hot loops because it brings on more garbage collections." },
        { term: "Generational GC", meaning: "A garbage collector that groups objects by age and checks young ones most often, because most objects die young." },
        { term: "Reference counting", meaning: "Each object counts the references to it and is freed when the count reaches zero. CPython's main strategy." },
        { term: "Boxing", meaning: "Copying a C# value type into a new heap object so it can be used as `object` or an interface. Unboxing copies it back out." },
        { term: "Span<T>", meaning: "A view of a run of memory (part of an array or string, or stack memory) that can be sliced without copying. It can't be stored on the heap." },
        { term: "__slots__", meaning: "A class attribute listing a Python class's only allowed attributes, which removes the per-object dictionary and saves memory." },
      ],
    },
  ],
  predict: [
    {
      lang: "csharp",
      code: src`
int n = 5;
object boxed = n;
n = 6;
Console.WriteLine($"{n} {boxed}");
`,
      output: "6 5",
      distractors: ["6 6", "5 5", "5 6"],
      why: "Boxing copies the value into a new object at that moment. Changing `n` afterwards doesn't touch the boxed copy.",
    },
    {
      lang: "csharp",
      code: src`
int[] data = [1, 2, 3, 4, 5];
Span<int> part = data.AsSpan(2);
part[0] = 0;
part = part[1..];
part[0] = 9;
Console.WriteLine(string.Join(" ", data));
`,
      output: "1 2 0 9 5",
      distractors: ["1 2 3 4 5", "1 2 0 4 5", "0 9 3 4 5"],
      why: "Every span here is a window onto the same array. `AsSpan(2)` starts at index 2, so `part[0] = 0` changes `data[2]`; slicing again moves the window to index 3, which becomes 9.",
    },
    {
      lang: "csharp",
      code: src`
var list = new List<Counter> { new() };
var c = list[0];
c.Count++;
Console.WriteLine(list[0].Count);
c = list[0];
c.Count += 10;
list[0] = c;
Console.WriteLine(list[0].Count);

struct Counter { public int Count; }
`,
      output: "0\n10",
      distractors: ["1\n11", "1\n10", "0\n0"],
      why: "`list[0]` returns a copy of the struct, so the first increment changes only the copy. The second time the changed copy is written back with `list[0] = c`. Note `c` was re-read from the list first, so its count was 0, not 1.",
    },
    {
      lang: "csharp",
      code: src`
var x = new object();
GC.Collect();
GC.Collect();
var y = new object();
Console.WriteLine($"{GC.GetGeneration(x)} {GC.GetGeneration(y)}");
GC.KeepAlive(x);
`,
      output: "2 0",
      distractors: ["0 0", "1 0", "2 2"],
      why: "`x` survived two collections, so it was promoted twice, from generation 0 to 1 to 2. `y` was created after them and is still in generation 0.",
    },
    {
      lang: "csharp",
      code: src`
ReadOnlySpan<char> text = "id=42;unit=bar";
var key = text[..text.IndexOf('=')];
var value = text[(text.IndexOf('=') + 1)..text.IndexOf(';')];
Console.WriteLine($"{key.Length} {int.Parse(value) * 2}");
`,
      output: "2 84",
      distractors: ["3 84", "2 4242", "2 42"],
      why: "`key` is the characters before the first `=`, \"id\", length 2. `value` is between `=` and `;`, \"42\", which `int.Parse` reads straight from the span: 42 * 2 is 84.",
    },
    {
      lang: "python",
      code: src`
class Probe:
    def __init__(self, name):
        self.name = name
    def __del__(self):
        print("free", self.name)

a = Probe("a")
b = a
del a
print("after del")
b = Probe("b")
print("end")
`,
      output: "after del\nfree a\nend\nfree b",
      distractors: ["free a\nafter del\nend\nfree b", "after del\nend\nfree a\nfree b", "after del\nfree a\nend"],
      why: "`del a` removes one name, but `b` still refers to the object, so nothing is freed. Rebinding `b` drops the last reference and CPython frees \"a\" at once. \"b\" is freed when the program ends and its globals are cleaned up.",
    },
    {
      lang: "python",
      code: src`
class P:
    __slots__ = ("x",)
    def __init__(self, x):
        self.x = x

p = P(1)
p.x = 2
try:
    p.y = 3
    print("set y")
except AttributeError:
    print("no y")
print(p.x)
`,
      output: "no y\n2",
      distractors: ["set y\n2", "no y\n1", "AttributeError"],
      why: "With `__slots__ = (\"x\",)`, `x` can be read and changed freely, but there is nowhere to store any other attribute, so setting `y` raises AttributeError, which the `except` catches.",
    },
    {
      lang: "python",
      code: src`
data = bytearray(b"plc")
view = memoryview(data)
copy = bytes(data)
data[0] = ord("P")
print(bytes(view), copy)
`,
      output: "b'Plc' b'plc'",
      distractors: ["b'plc' b'plc'", "b'Plc' b'Plc'", "b'plc' b'Plc'"],
      why: "A memoryview shares the bytearray's memory, so it sees the change. `bytes(data)` made an independent copy before the change.",
    },
    {
      lang: "python",
      code: src`
a = [1, 2]
b = a
c = list(a)
b.append(3)
print(a is b, a is c, a == c, len(c))
`,
      output: "True False False 2",
      distractors: ["True False True 3", "True True False 2", "False False False 2"],
      why: "`b = a` shares one list, so appending through `b` changes `a`. `list(a)` copied the two items earlier, so `c` is a different list that still has 2 items and no longer equals `a`.",
    },
  ],
  pitfalls: [
    "Calling `GC.Collect()` or `gc.collect()` in production code to \"free memory\". It pauses the program and usually makes performance worse.",
    "Using `is` to compare numbers or strings in Python. It compares identity, which CPython's caching makes look right for small values only.",
    "Large mutable structs: every assignment copies them, and changing a copy (`list[0].X = 1` doesn't even compile) silently leaves the original alone.",
    "Trying to keep a `Span<T>` in a field or use it across an `await`. Use `Memory<T>` there and take `.Span` when you work on it.",
    "Trusting `sys.getsizeof` for a whole structure. It measures one object, not the objects it refers to; use `tracemalloc`.",
    "Growing a static list, cache or event subscription forever. A reachable object is never collected, which is how garbage-collected programs leak.",
  ],
  next: [
    { id: "stack-heap-gc", label: "Stack vs Heap and Garbage Collection (Concurrency & Memory)" },
    { id: "adv-sum-fields-span", label: "Exercise: Sum the Fields of a Line Without Splitting" },
    { id: "lang-concurrency", label: "Threads, Locks, the GIL and Parallelism" },
  ],
};
