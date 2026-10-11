import { src, type LangLessonData } from "./types.ts";

export const collections: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Lists (and C# arrays)",
      csharp: src`
int[] fixedSize = { 30, 10, 20 };       // array: length can't change
fixedSize[0] = 35;

var readings = new List<int> { 30, 10, 20 };  // List<T>: grows as needed
readings.Add(40);                 // to the end
readings.Insert(0, 5);            // at a position
readings.Remove(10);              // first matching value
readings.RemoveAt(0);             // by position
Console.WriteLine(string.Join(", ", readings));     // 30, 20, 40
Console.WriteLine(readings.Count);                  // 3
Console.WriteLine(readings.Contains(20));           // True
Console.WriteLine(readings.IndexOf(40));            // 2
readings.Sort();
Console.WriteLine(string.Join(", ", readings));     // 20, 30, 40
Console.WriteLine(readings[^1]);                    // 40
`,
      python: src`
readings = [30, 10, 20]          # list: grows as needed
readings[0] = 30

readings.append(40)              # to the end
readings.insert(0, 5)            # at a position
readings.remove(10)              # first matching value
del readings[0]                  # by position (or readings.pop(0))
print(readings)                  # [30, 20, 40]
print(len(readings))             # 3
print(20 in readings)            # True
print(readings.index(40))        # 2
readings.sort()
print(readings)                  # [20, 30, 40]
print(readings[-1])              # 40
last = readings.pop()            # remove and return the last item
print(last, readings)            # 40 [20, 30]
`,
      notes: [
        "A collection holds many values under one name. The workhorse is the list: items in order, reached by index, able to grow. C# has two versions: an array (`int[]`), whose length is fixed when it's created, and `List<int>`, which grows. The `<int>` says what type of item the list holds; that's called a generic type, and it means the compiler stops you adding a string by mistake. A Python list can hold any mix of types and always grows.",
        "Adding to the end is fast (amortized O(1): occasionally the list has to move to a bigger block of memory, but averaged over many adds each one is constant time). Inserting or removing at the front or middle is O(n), because every later item has to shift along by one. Searching for a value (`Contains`, `in`, `IndexOf`) checks items one by one, also O(n).",
      ],
    },
    {
      kind: "code",
      title: "Dictionaries: look things up by key",
      csharp: src`
var stock = new Dictionary<string, int>
{
    ["bolt"] = 120,
    ["nut"] = 300,
};
stock["washer"] = 50;                    // add or overwrite
stock["bolt"] -= 20;                     // update
Console.WriteLine(stock["bolt"]);        // 100
Console.WriteLine(stock.ContainsKey("gear"));         // False
Console.WriteLine(stock.GetValueOrDefault("gear", 0)); // 0

if (stock.TryGetValue("nut", out int nuts))
    Console.WriteLine($"nuts: {nuts}");  // nuts: 300

stock.Remove("washer");
foreach (var (part, qty) in stock)
    Console.WriteLine($"{part} = {qty}");

try { Console.WriteLine(stock["gear"]); }
catch (KeyNotFoundException) { Console.WriteLine("KeyNotFoundException"); }
`,
      python: src`
stock = {
    "bolt": 120,
    "nut": 300,
}
stock["washer"] = 50                     # add or overwrite
stock["bolt"] -= 20                      # update
print(stock["bolt"])                     # 100
print("gear" in stock)                   # False
print(stock.get("gear", 0))              # 0

nuts = stock.get("nut")
if nuts is not None:
    print(f"nuts: {nuts}")               # nuts: 300

del stock["washer"]
for part, qty in stock.items():
    print(f"{part} = {qty}")

try:
    print(stock["gear"])
except KeyError:
    print("KeyError")
`,
      notes: [
        "A dictionary (C# `Dictionary<TKey, TValue>`, Python `dict`) stores key and value pairs and finds a value from its key in O(1) on average, however many entries there are, using a hash table underneath. Keys are unique: assigning to an existing key replaces its value. Reading a key that isn't there fails (`KeyNotFoundException`, `KeyError`), so check first or use a method with a fallback.",
        "Python dictionaries remember the order keys were added (guaranteed since Python 3.7). C#'s `Dictionary` makes no promise about order, even though small examples often look ordered; use `SortedDictionary` when you need keys in sorted order.",
        "Keys must not change while they're in a dictionary. In Python that's enforced: lists can't be keys, but tuples and strings can. In C# a mutable class used as a key and then modified simply can't be found any more.",
      ],
    },
    {
      kind: "code",
      title: "Sets: unique values, fast membership",
      csharp: src`
var seen = new HashSet<string>();
Console.WriteLine(seen.Add("PT-101"));   // True: added
Console.WriteLine(seen.Add("PT-101"));   // False: already there
Console.WriteLine(seen.Count);           // 1

var a = new HashSet<int> { 1, 2, 3 };
var b = new HashSet<int> { 2, 3, 4 };
var both = new HashSet<int>(a);
both.IntersectWith(b);                   // changes "both" in place
Console.WriteLine(string.Join(",", both));        // 2,3
Console.WriteLine(a.Contains(4));        // False
`,
      python: src`
seen = set()                    # {} would be an empty dict
seen.add("PT-101")
seen.add("PT-101")              # no effect, no error
print(len(seen))                # 1

a = {1, 2, 3}
b = {2, 3, 4}
print(a & b)                    # {2, 3}   intersection
print(a | b)                    # {1, 2, 3, 4}   union
print(a - b)                    # {1}   difference
print(4 in a)                   # False
`,
      notes: [
        "A set holds each value at most once and answers \"is this in here?\" in O(1) on average, the same hashing trick as a dictionary without the values. Use one to remove duplicates or to remember what you've already seen. A set has no positions, so there's no `s[0]`.",
        "C#'s `HashSet.Add` returns false when the value was already there, which is handy for \"first time I've seen this?\" checks. Python's `add` returns nothing; test with `in` first if you need to know.",
      ],
    },
    {
      kind: "code",
      title: "Tuples: small fixed groups",
      csharp: src`
(string Tag, double Value) reading = ("TT-205", 71.5);
Console.WriteLine(reading.Tag);          // TT-205
Console.WriteLine(reading);              // (TT-205, 71.5)

var (tag, value) = reading;              // unpack
Console.WriteLine($"{tag} {value}");

var byPoint = new Dictionary<(int, int), string> { [(0, 0)] = "origin" };
Console.WriteLine(byPoint[(0, 0)]);      // origin: tuples make good keys
`,
      python: src`
reading = ("TT-205", 71.5)
print(reading[0])                        # TT-205
print(reading)                           # ('TT-205', 71.5)

tag, value = reading                     # unpack
print(tag, value)

by_point = {(0, 0): "origin"}
print(by_point[(0, 0)])                  # origin: tuples make good keys

a, b = 1, 2
a, b = b, a                              # swap with a tuple
print(a, b)                              # 2 1
`,
      notes: [
        "A tuple groups a few values of possibly different types, such as a tag and its reading. Python tuples are immutable (`reading[0] = \"x\"` is a `TypeError`), which is what lets them be dictionary keys. C# value tuples can have named elements and their fields can be assigned, but they compare by value, so they work as dictionary keys too. Swapping two variables with `(a, b) = (b, a)` works in both languages.",
        "For anything with more than three or so fields, or that travels far through a program, use a class or record instead, so the fields have proper names. The Classes lesson starts on that.",
      ],
    },
    {
      kind: "code",
      title: "Changing a collection while looping over it",
      csharp: src`
var alarms = new List<string> { "low", "HIGH", "low", "HIGH" };

try
{
    foreach (var a in alarms)
        if (a == "low") alarms.Remove(a);    // not allowed
}
catch (InvalidOperationException e)
{
    Console.WriteLine(e.Message);
}

// Fixes: remove with a condition, or build a new list
alarms.RemoveAll(a => a == "low");
Console.WriteLine(string.Join(",", alarms));   // HIGH,HIGH
var high = alarms.Where(a => a == "HIGH").ToList();
Console.WriteLine(high.Count);                 // 2
`,
      python: src`
alarms = ["low", "low", "HIGH", "HIGH"]
for a in alarms:
    if a == "low":
        alarms.remove(a)        # no error... but it skips items
print(alarms)                   # ['low', 'HIGH', 'HIGH']: one "low" survived

counts = {"a": 1, "b": 0}
try:
    for k in counts:
        if counts[k] == 0:
            del counts[k]
except RuntimeError as e:
    print(e)

# Fixes: build a new collection, or loop over a copy
alarms = [a for a in alarms if a != "low"]
print(alarms)                   # ['HIGH', 'HIGH']
for k in list(counts):          # list(...) makes a copy of the keys
    if counts[k] == 0:
        del counts[k]
print(counts)                   # {'a': 1}
`,
      notes: [
        "Adding or removing items while a `foreach` or `for ... in` loop walks the same collection is one of the classic bugs. C# detects it and throws `InvalidOperationException` (\"Collection was modified\"). Python's dictionaries and sets raise `RuntimeError`, but a Python list doesn't complain: removing an item shifts the rest left, the loop's hidden position moves on anyway, and the item after each removed one is skipped.",
        "The fixes: build a new collection with only the items you want (LINQ `Where` in C#, a list comprehension in Python, which the cheat sheets show), use `RemoveAll` in C#, loop over a copy, or loop by index from the end backwards.",
      ],
    },
    {
      kind: "table",
      title: "Big O of the common operations",
      head: ["Operation", "C#", "Python", "Cost"],
      rows: [
        ["Read or write by index", "`list[i]`", "`lst[i]`", "O(1)"],
        ["Add to the end", "`list.Add(x)`", "`lst.append(x)`", "O(1) amortized"],
        ["Remove from the end", "`list.RemoveAt(list.Count - 1)`", "`lst.pop()`", "O(1)"],
        ["Insert or remove at the front or middle", "`list.Insert(0, x)`, `list.RemoveAt(0)`", "`lst.insert(0, x)`, `lst.pop(0)`", "O(n)"],
        ["Find a value in a list", "`list.Contains(x)`, `IndexOf`", "`x in lst`, `lst.index(x)`", "O(n)"],
        ["Sort a list", "`list.Sort()`", "`lst.sort()`, `sorted(lst)`", "O(n log n)"],
        ["Dictionary: add, read, remove, check a key", "`d[k] = v`, `d[k]`, `Remove`, `ContainsKey`", "`d[k] = v`, `d[k]`, `del d[k]`, `k in d`", "O(1) average"],
        ["Set: add, remove, check membership", "`Add`, `Remove`, `Contains`", "`add`, `discard`, `in`", "O(1) average"],
        ["Find a value among a dictionary's values", "`d.ContainsValue(v)`", "`v in d.values()`", "O(n)"],
        ["Copy a list", "`new List<int>(list)`", "`lst.copy()`, `lst[:]`", "O(n)"],
        ["Add or remove at either end of a queue", "`Queue<T>`: `Enqueue`, `Dequeue`", "`collections.deque`: `append`, `popleft`", "O(1)"],
      ],
      notes: [
        "O(1) means the cost doesn't grow with the size of the collection; O(n) means it grows in proportion to the number of items n. \"Average\" for hash-based collections means typical inputs; many keys landing in the same hash bucket can make single operations slower. The Big O and Hashing lessons explain why.",
        "The rule of thumb: if you search a list inside a loop, you have an O(n²) program. Put the values in a set or dictionary first and each search becomes O(1).",
      ],
    },
  ],
  predict: [
    {
      lang: "python",
      code: src`
a = [1, 2]
b = a
b.append(3)
c = a.copy()
c.append(4)
print(a)
`,
      output: "[1, 2, 3]",
      distractors: ["[1, 2]", "[1, 2, 3, 4]", "[1, 2, 4]"],
      why: "`b = a` doesn't copy anything: both names refer to the same list, so appending through `b` changes `a`. `a.copy()` makes a separate list, so appending to `c` doesn't. The same is true of C# `List<T>` and arrays.",
    },
    {
      lang: "python",
      code: src`
nums = [2, 4, 5, 6]
for n in nums:
    if n % 2 == 0:
        nums.remove(n)
print(nums)
`,
      output: "[4, 5]",
      distractors: ["[5]", "[2, 4, 5, 6]", "RuntimeError"],
      why: "Removing 2 shifts 4 into position 0, but the loop moves on to position 1, which is now 5, so 4 is never checked. Then 6 is removed. Python lists don't detect this; build a new list instead: `[n for n in nums if n % 2 != 0]`.",
    },
    {
      lang: "csharp",
      code: src`
var d = new Dictionary<string, int>();
d["a"] = 1;
d["a"] = 2;
Console.WriteLine($"{d.Count} {d["a"]}");
try { d.Add("a", 3); }
catch (ArgumentException) { Console.WriteLine("ArgumentException"); }
`,
      output: "1 2\nArgumentException",
      distractors: ["2 2\nArgumentException", "1 1\n(no output)", "1 2\n(no output)"],
      why: "Assigning with `d[key] = value` adds or overwrites, so there's still one key. `Add` insists the key is new and throws `ArgumentException` if it isn't.",
    },
    {
      lang: "python",
      code: src`
stock = {"bolt": 4}
print(stock.get("nut", 0), stock.get("bolt"), stock.get("gear"))
`,
      output: "0 4 None",
      distractors: ["0 4 0", "KeyError", "0 4 KeyError"],
      why: "`get` never raises: it returns the fallback you give it, or `None` if you give none. Only `stock[\"gear\"]` would raise `KeyError`.",
    },
    {
      lang: "csharp",
      code: src`
var seen = new HashSet<int>();
Console.WriteLine($"{seen.Add(5)} {seen.Add(5)} {seen.Count}");
`,
      output: "True False 1",
      distractors: ["True True 2", "True True 1", "True False 2"],
      why: "A set stores each value once. The second `Add` finds 5 already there, changes nothing and returns false.",
    },
    {
      lang: "python",
      code: src`
print(len({1, 2, 2, 3, 3, 3}))
print({1, 2, 3} & {2, 3, 4})
print(type({}))
`,
      output: "3\n{2, 3}\n<class 'dict'>",
      distractors: ["6\n{2, 3}\n<class 'set'>", "3\n{1, 2, 3, 4}\n<class 'dict'>", "3\n{2, 3}\n<class 'set'>"],
      why: "Duplicates collapse, leaving 1, 2, 3. `&` is intersection. And `{}` is an empty dictionary, not an empty set: write `set()` for that.",
    },
    {
      lang: "python",
      code: src`
grid = [[0] * 3] * 2
grid[0][0] = 1
print(grid)
`,
      output: "[[1, 0, 0], [1, 0, 0]]",
      distractors: ["[[1, 0, 0], [0, 0, 0]]", "[[1, 1, 1], [0, 0, 0]]", "TypeError"],
      why: "`* 2` repeats the reference to the same inner list, so both rows are one list. Build rows separately: `[[0] * 3 for _ in range(2)]`. In C#, `new int[2, 3]` or a loop that creates each row avoids this.",
    },
    {
      lang: "python",
      code: src`
xs = [3, 1, 2]
ys = xs.sort()
zs = sorted([3, 1, 2], reverse=True)
print(ys, xs, zs)
`,
      output: "None [1, 2, 3] [3, 2, 1]",
      distractors: ["[1, 2, 3] [3, 1, 2] [3, 2, 1]", "[1, 2, 3] [1, 2, 3] [3, 2, 1]", "None [3, 1, 2] [3, 2, 1]"],
      why: "`list.sort()` sorts in place and returns `None`. `sorted(...)` leaves its input alone and returns a new sorted list. C#'s `List.Sort()` is in place too; LINQ's `OrderBy` returns a new sequence.",
    },
    {
      lang: "csharp",
      code: src`
int[] a = new int[3];
a[1] = 7;
string[] s = new string[2];
Console.WriteLine(string.Join(",", a));
Console.WriteLine(s[0] == null);
`,
      output: "0,7,0\nTrue",
      distractors: ["null,7,null\nTrue", "0,7,0\nFalse", "IndexOutOfRangeException"],
      why: "A new C# array is filled with the type's default value: 0 for numbers, false for bool, null for strings and other reference types.",
    },
  ],
  pitfalls: [
    "Assuming `b = a` copies a list or dictionary. It makes a second name for the same object.",
    "Adding or removing items while looping over the same collection.",
    "Searching a list inside a loop (`if x in big_list`) when a set or dictionary would make each check O(1).",
    "Relying on C# `Dictionary` iteration order. Sort the keys, or use `SortedDictionary`, when order matters.",
    "Reading a missing key with `d[key]`. Use `TryGetValue` / `GetValueOrDefault` in C#, `get` or `in` in Python, or `defaultdict` and `Counter` (see the cheat sheets).",
    "`{}` in Python is an empty dict. An empty set is `set()`.",
  ],
  next: [
    { id: "dynamic-array-growth", label: "Dynamic Arrays: How They Grow (why appending is amortized O(1))" },
    { id: "hash-table-internals", label: "Hashing: How a Hash Map Actually Works" },
    { id: "basics-word-frequency", label: "Exercise: Word Frequency" },
    { id: "basics-remove-duplicates", label: "Exercise: Remove Duplicates, Keep Order" },
    { id: "lang-exceptions", label: "Next: Errors and Exceptions" },
  ],
};
