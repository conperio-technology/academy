import { src, type Lang } from "./types.ts";

// One data set feeds all three cheat sheets: the C# sheet shows every entry with C#
// code, the Python sheet every entry with Python code, and the translation table the
// entries that have both, side by side. Every snippet runs as is (C# as a file-based
// console program, Python as a script); the output is in the comments. The exceptions
// are the entries marked `fragment` (comment-only references and the unit tests).

export const SHEET_TOPICS = [
  "Syntax basics",
  "Strings",
  "Collections",
  "LINQ and comprehensions",
  "Classes",
  "Exceptions",
  "Lambdas and generics",
  "Interfaces and equality",
  "Files and parsing",
  "Async, tests and modules",
  "Performance and concurrency",
  "Advanced language features",
  "Interview idioms",
] as const;

export type SheetTopic = (typeof SHEET_TOPICS)[number];

export interface SheetEntry {
  id: string;
  topic: SheetTopic;
  title: string;
  csharp?: string;
  python?: string;
  // Shared note; `backticks` render as inline code.
  note?: string;
  // Headline cost, shown next to the title.
  bigO?: string;
  fragment?: Partial<Record<Lang, boolean>>;
}

export const cheatSheet: { entries: SheetEntry[] } = {
  entries: [
    // ---------------- Syntax basics ----------------
    {
      id: "hello",
      topic: "Syntax basics",
      title: "Program shape and comments",
      csharp: src`
// Top-level statements: no Main method needed (C# 9+)
Console.WriteLine("Hello");   // statements end with ;
/* block comment */
if (DateTime.Now.Year > 2000)
{                             // braces mark blocks
    Console.WriteLine("Indentation is for humans");
}
`,
      python: src`
# No main needed; the file runs top to bottom
print("Hello")                # a line break ends a statement
"""A string on its own line is often used as a block comment."""
if 2026 > 2000:               # colon, then an indented block
    print("Indentation IS the block")
`,
      note: "Run with `dotnet run file.cs` (.NET 10) or in a project made by `dotnet new console`; run Python with `python file.py`.",
    },
    {
      id: "variables",
      topic: "Syntax basics",
      title: "Variables and basic types",
      csharp: src`
int n = 42;                 // 32-bit, about ±2.1 billion
long big = 9_000_000_000L;  // 64-bit
double x = 3.14;            // 64-bit binary floating point
decimal price = 19.99m;     // exact base 10: money
bool ok = true;
char c = 'A';
string s = "text";
var inferred = 1.5;         // still static: double
const int Max = 10;         // compile-time constant
int? maybe = null;          // nullable value type
Console.WriteLine($"{n} {big} {x} {price} {ok} {c} {s} {inferred} {Max} {maybe ?? -1}");
`,
      python: src`
n = 42                # int: unlimited size
big = 9_000_000_000
x = 3.14              # float = C# double
from decimal import Decimal
price = Decimal("19.99")
ok = True             # True / False / None are capitalized
c = "A"               # no char type
s = "text"
MAX = 10              # constant by convention only
maybe = None
print(n, big, x, price, ok, c, s, MAX, maybe)
n: int = 5            # optional type hint, not enforced
`,
    },
    {
      id: "arithmetic",
      topic: "Syntax basics",
      title: "Arithmetic and division",
      csharp: src`
Console.WriteLine(7 / 2);        // 3   int / int truncates
Console.WriteLine(7 / 2.0);      // 3.5
Console.WriteLine(-7 / 2);       // -3  toward zero
Console.WriteLine(7 % 3);        // 1
Console.WriteLine(-7 % 3);       // -1  sign of the left side
Console.WriteLine(Math.Pow(2, 10));   // 1024 (double)
Console.WriteLine(1 << 10);      // 1024 (int shift)
int i = 5; i++; i += 2;          // 8
Console.WriteLine(i);
`,
      python: src`
print(7 // 2)       # 3   floor division
print(7 / 2)        # 3.5 always true division
print(-7 // 2)      # -4  toward minus infinity
print(7 % 3)        # 1
print(-7 % 3)       # 2   sign of the right side
print(2 ** 10)      # 1024 (int)
print(1 << 10)      # 1024
i = 5; i += 1; i += 2   # no ++ in Python
print(i)            # 8
print(divmod(17, 5))    # (3, 2)
`,
      note: "For a non-negative remainder in C# use `((a % m) + m) % m`.",
    },
    {
      id: "convert",
      topic: "Syntax basics",
      title: "Converting and parsing",
      csharp: src`
int a = int.Parse("42");
double d = double.Parse("2.5", System.Globalization.CultureInfo.InvariantCulture);
bool ok = int.TryParse("x1", out int b);    // False, b = 0
string s = 42.ToString();
int t = (int)3.99;                          // 3: truncates
long r = (long)Math.Round(2.5);             // 2: half to even
Console.WriteLine($"{a} {d} {ok} {b} {s} {t} {r}");
`,
      python: src`
a = int("42")
d = float("2.5")
try:
    b = int("x1")
except ValueError:
    b = 0
s = str(42)
t = int(3.99)          # 3: truncates
r = round(2.5)         # 2: half to even
print(a, d, b, s, t, r)
print(int("ff", 16), bin(5), hex(255))   # 255 0b101 0xff
`,
    },
    {
      id: "conditions",
      topic: "Syntax basics",
      title: "Conditions and logic",
      csharp: src`
int t = 72;
if (t > 90) Console.WriteLine("hot");
else if (t > 60 && t <= 90) Console.WriteLine("ok");   // && || !
else Console.WriteLine("cold");

string label = t > 60 ? "warm" : "cool";               // ternary
bool inRange = t is >= 0 and < 100;                    // pattern
Console.WriteLine($"{label} {inRange}");
`,
      python: src`
t = 72
if t > 90:
    print("hot")
elif 60 < t <= 90:            # chained comparison; and or not
    print("ok")
else:
    print("cold")

label = "warm" if t > 60 else "cool"   # conditional expression
print(label, 0 <= t < 100)
print(bool([]), bool(""), bool(0), bool(None))   # all falsy
`,
      note: "Python treats empty and zero values as false; C# conditions must be `bool`.",
    },
    {
      id: "switch",
      topic: "Syntax basics",
      title: "switch and match",
      csharp: src`
int code = 404;
string kind = code switch
{
    200 => "ok",
    301 or 302 => "redirect",
    >= 400 and < 500 => "client error",
    _ => "other",
};
Console.WriteLine(kind);   // client error
`,
      python: src`
code = 404
match code:                 # Python 3.10+
    case 200:
        kind = "ok"
    case 301 | 302:
        kind = "redirect"
    case c if 400 <= c < 500:   # guard
        kind = "client error"
    case _:
        kind = "other"
print(kind)   # client error
`,
      note: "In `match`, a bare name like `case c` captures anything; compare with constants via literals or dotted names.",
    },
    {
      id: "loops",
      topic: "Syntax basics",
      title: "Loops",
      csharp: src`
for (int i = 0; i < 3; i++) Console.Write(i);      // 012
Console.WriteLine();
foreach (var s in new[] { "a", "b" }) Console.Write(s);   // ab
Console.WriteLine();
foreach (var (i, s) in new[] { "a", "b" }.Index())       // .NET 9+
    Console.Write($"{i}{s} ");                           // 0a 1b
Console.WriteLine();
int n = 3;
while (n > 0) { n--; if (n == 1) continue; Console.Write(n); }   // 20
Console.WriteLine();
for (int i = 10; i > 0; i -= 4) Console.Write($"{i} ");  // 10 6 2
`,
      python: src`
for i in range(3):
    print(i, end="")              # 012
print()
for s in ["a", "b"]:
    print(s, end="")              # ab
print()
for i, s in enumerate(["a", "b"]):
    print(f"{i}{s}", end=" ")     # 0a 1b
print()
n = 3
while n > 0:
    n -= 1
    if n == 1:
        continue
    print(n, end="")              # 20
print()
for i in range(10, 0, -4):
    print(i, end=" ")             # 10 6 2
`,
    },
    {
      id: "functions",
      topic: "Syntax basics",
      title: "Functions",
      csharp: src`
Console.WriteLine(Area(3));                 // 9
Console.WriteLine(Area(3, h: 2));           // 6
var (lo, hi) = MinMax(new[] { 4, 1, 9 });
Console.WriteLine($"{lo} {hi}");            // 1 9
Func<int, int> square = x => x * x;         // lambda
Console.WriteLine(square(5));               // 25

static int Area(int w, int h = -1) => w * (h < 0 ? w : h);
static (int, int) MinMax(int[] a) => (a.Min(), a.Max());
`,
      python: src`
def area(w, h=None):          # never use [] or {} as a default
    return w * (w if h is None else h)


def min_max(a):
    return min(a), max(a)     # returns a tuple


print(area(3))                # 9
print(area(3, h=2))           # 6
lo, hi = min_max([4, 1, 9])
print(lo, hi)                 # 1 9
square = lambda x: x * x
print(square(5))              # 25
`,
    },
    {
      id: "null",
      topic: "Syntax basics",
      title: "null and None",
      csharp: src`
string? name = null;
Console.WriteLine(name?.Length);        // (empty): ?. short-circuits to null
Console.WriteLine(name ?? "anon");      // anon
name ??= "set";                         // assign if null
Console.WriteLine(name is null);        // False
Console.WriteLine(name!.Length);        // 3  (! = "trust me, not null")
`,
      python: src`
name = None
print(name is None)                         # True: use "is", not ==
print(name or "anon")                       # anon (also replaces "" and 0)
print("anon" if name is None else name)     # anon: only None
name = name if name is not None else "set"
print(len(name))                            # 3
`,
    },
    // ---------------- Strings ----------------
    {
      id: "str-index",
      topic: "Strings",
      title: "Indexing and slicing",
      bigO: "slice O(k)",
      csharp: src`
string s = "Hello, world";
Console.WriteLine(s.Length);           // 12
Console.WriteLine(s[0]);               // H (a char)
Console.WriteLine(s[^1]);              // d
Console.WriteLine(s[7..]);             // world
Console.WriteLine(s[..5]);             // Hello  (end excluded)
Console.WriteLine(s.Substring(7, 3));  // wor    (start, LENGTH)
`,
      python: src`
s = "Hello, world"
print(len(s))          # 12
print(s[0])            # H (a 1-char str)
print(s[-1])           # d
print(s[7:])           # world
print(s[:5])           # Hello  (end excluded)
print(s[7:10])         # wor
print(s[::-1])         # dlrow ,olleH
`,
      note: "Python slices clamp out-of-range ends; C# `Substring` and ranges throw `ArgumentOutOfRangeException`.",
    },
    {
      id: "str-methods",
      topic: "Strings",
      title: "Everyday string methods",
      csharp: src`
string s = "  a,b,,c  ";
string t = s.Trim();                               // "a,b,,c"
Console.WriteLine(t.Split(',').Length);            // 4
Console.WriteLine(t.Split(',', StringSplitOptions.RemoveEmptyEntries).Length); // 3
Console.WriteLine(string.Join("|", t.Split(',')));  // a|b||c
Console.WriteLine(t.Replace(",", ""));             // abc
Console.WriteLine(t.ToUpper().Contains("B"));      // True
Console.WriteLine(t.IndexOf('c'));                 // 5 (-1 if missing)
Console.WriteLine(t.StartsWith("a") && t.EndsWith("c"));  // True
Console.WriteLine(string.Equals("A", "a", StringComparison.OrdinalIgnoreCase)); // True
`,
      python: src`
s = "  a,b,,c  "
t = s.strip()                        # "a,b,,c"
print(len(t.split(",")))             # 4
print(len([p for p in t.split(",") if p]))   # 3
print("|".join(t.split(",")))        # a|b||c
print(t.replace(",", ""))            # abc
print("B" in t.upper())              # True
print(t.find("c"))                   # 5 (-1 if missing; .index raises)
print(t.startswith("a") and t.endswith("c"))  # True
print("A".lower() == "a".lower())    # True (casefold() for Unicode)
print("a b  c".split())              # ['a', 'b', 'c']: runs of whitespace
`,
    },
    {
      id: "str-format",
      topic: "Strings",
      title: "Interpolation and number formatting",
      csharp: src`
double v = 1234.5678;
int n = 42;
Console.WriteLine($"{v:F2}");        // 1234.57
Console.WriteLine($"{v:N1}");        // 1,234.6 (culture-dependent)
Console.WriteLine($"[{n,5}][{n,-5}]");   // [   42][42   ]
Console.WriteLine($"{n:D4} {n:X}");  // 0042 2A
Console.WriteLine($"{0.256:P1}");    // 25.6 % (culture-dependent)
Console.WriteLine(@"C:\temp" + "\n" + $"{{braces}}");
`,
      python: src`
v = 1234.5678
n = 42
print(f"{v:.2f}")           # 1234.57
print(f"{v:,.1f}")          # 1,234.6
print(f"[{n:>5}][{n:<5}]")  # [   42][42   ]
print(f"{n:04d} {n:X}")     # 0042 2A
print(f"{0.256:.1%}")       # 25.6%
print(r"C:\temp" + "\n" + f"{{braces}}")
print(f"{n=}")              # n=42  (debug form, 3.8+)
`,
    },
    {
      id: "str-build",
      topic: "Strings",
      title: "Building strings in a loop",
      bigO: "O(n) total, not O(n²)",
      csharp: src`
using System.Text;

var sb = new StringBuilder();
for (int i = 0; i < 5; i++)
    sb.Append(i).Append(',');
sb.Length--;                          // drop the last comma
Console.WriteLine(sb.ToString());     // 0,1,2,3,4
Console.WriteLine(string.Join(",", Enumerable.Range(0, 5)));  // same
Console.WriteLine(new string('-', 10));   // ----------
`,
      python: src`
parts = []
for i in range(5):
    parts.append(str(i))
print(",".join(parts))                      # 0,1,2,3,4
print(",".join(str(i) for i in range(5)))   # same
print("-" * 10)                             # ----------
`,
      note: "Strings are immutable: `s += x` in a loop copies the whole string each time. Collect pieces and join once.",
    },
    {
      id: "str-chars",
      topic: "Strings",
      title: "Characters",
      csharp: src`
string s = "a1B?";
foreach (char c in s)
    Console.Write($"{char.IsLetter(c)}{char.IsDigit(c)} ");  // TrueFalse FalseTrue TrueFalse FalseFalse
Console.WriteLine();
Console.WriteLine((int)'a');              // 97
Console.WriteLine((char)('a' + 2));       // c
Console.WriteLine('7' - '0');             // 7: digit value
Console.WriteLine('z' - 'a');             // 25: letter index
char[] cs = "hello".ToCharArray();
Array.Reverse(cs);
Console.WriteLine(new string(cs));        // olleh
`,
      python: src`
s = "a1B?"
for c in s:
    print(f"{c.isalpha()}{c.isdigit()}", end=" ")
print()
print(ord("a"))               # 97
print(chr(ord("a") + 2))      # c
print(int("7"))               # 7
print(ord("z") - ord("a"))    # 25
cs = list("hello")
cs.reverse()
print("".join(cs))            # olleh
print(sorted("banana"))       # ['a', 'a', 'a', 'b', 'n', 'n']
`,
    },
    // ---------------- Collections ----------------
    {
      id: "list",
      topic: "Collections",
      title: "List (dynamic array)",
      bigO: "index O(1), append O(1)*, insert/remove/search O(n)",
      csharp: src`
var a = new List<int> { 3, 1, 2 };
a.Add(4);              // O(1) amortized
a.Insert(0, 9);        // O(n)
a.RemoveAt(0);         // O(n) (O(1) at the end)
a.Remove(1);           // O(n): first match
Console.WriteLine(a.Contains(2));          // O(n)  True
a.Sort();              // O(n log n)
a.Reverse();
Console.WriteLine(string.Join(",", a));    // 4,3,2
Console.WriteLine($"{a.Count} {a[0]} {a[^1]}");   // 3 4 2
int[] fixedArr = new int[3];               // [0,0,0], length fixed
var copy = new List<int>(a);               // O(n) copy
var sub = a.GetRange(1, 2);                // [3,2]
Console.WriteLine($"{fixedArr.Length} {copy.Count} {sub[0]}");   // 3 3 3
`,
      python: src`
a = [3, 1, 2]
a.append(4)            # O(1) amortized
a.insert(0, 9)         # O(n)
a.pop(0)               # O(n) (pop() at the end is O(1))
a.remove(1)            # O(n): first match
print(2 in a)          # O(n)  True
a.sort()               # O(n log n), in place
a.reverse()
print(a)               # [4, 3, 2]
print(len(a), a[0], a[-1])    # 3 4 2
fixed = [0] * 3        # [0, 0, 0]
copy = a.copy()        # or a[:] or list(a), O(n)
sub = a[1:3]           # [3, 2]
print(fixed, copy, sub)   # [0, 0, 0] [4, 3, 2] [3, 2]
`,
      note: "*Amortized: an occasional resize copies everything, but averaged over many appends each is O(1).",
    },
    {
      id: "dict",
      topic: "Collections",
      title: "Dictionary / dict",
      bigO: "get/set/remove/contains O(1) avg",
      csharp: src`
var d = new Dictionary<string, int> { ["a"] = 1 };
d["b"] = 2;                                  // add or overwrite
d["a"] += 10;
Console.WriteLine(d.ContainsKey("z"));       // False
Console.WriteLine(d.GetValueOrDefault("z", 0));  // 0
if (d.TryGetValue("b", out int v)) Console.WriteLine(v);   // 2
d.Remove("b");
foreach (var (k, val) in d) Console.WriteLine($"{k}={val}");   // a=11
Console.WriteLine(string.Join(",", d.Keys));  // a
Console.WriteLine(d.TryAdd("a", 0));          // False: key exists
`,
      python: src`
d = {"a": 1}
d["b"] = 2                    # add or overwrite
d["a"] += 10
print("z" in d)               # False
print(d.get("z", 0))          # 0
if (v := d.get("b")) is not None:   # walrus (3.8+)
    print(v)                  # 2
del d["b"]                    # or d.pop("b", None)
for k, val in d.items():
    print(f"{k}={val}")       # a=11
print(list(d.keys()))         # ['a']
print(d.setdefault("a", 0))   # 11: existing value kept
`,
      note: "Python dicts keep insertion order; C# `Dictionary` order is not guaranteed (use `SortedDictionary` for sorted keys, O(log n)).",
    },
    {
      id: "set",
      topic: "Collections",
      title: "HashSet / set",
      bigO: "add/remove/contains O(1) avg",
      csharp: src`
var s = new HashSet<int> { 1, 2, 3 };
Console.WriteLine(s.Add(3));           // False: already present
s.Remove(1);
Console.WriteLine(s.Contains(2));      // True
var other = new HashSet<int> { 2, 9 };
var both = new HashSet<int>(s); both.IntersectWith(other);    // {2}
var either = new HashSet<int>(s); either.UnionWith(other);    // {2,3,9}
Console.WriteLine($"{both.Count} {either.Count}");            // 1 3
Console.WriteLine(s.SetEquals(new[] { 3, 2 }));               // True
`,
      python: src`
s = {1, 2, 3}           # empty set is set(), not {}
s.add(3)                # no-op
s.discard(1)            # remove without KeyError
print(2 in s)           # True
other = {2, 9}
print(sorted(s | other), s & other, s - other)   # [2, 3, 9] {2} {3}
print(s == {3, 2})      # True
frozen = frozenset(s)   # immutable, hashable: can be a dict key
print(len(frozen))      # 2
`,
    },
    {
      id: "tuple",
      topic: "Collections",
      title: "Tuples",
      csharp: src`
(string name, int qty) item = ("bolt", 5);
Console.WriteLine($"{item.name} {item.qty}");   // bolt 5
var (n, q) = item;                              // deconstruct
int a = 1, b = 2;
(a, b) = (b, a);                                // swap
var seen = new HashSet<(int, int)> { (0, 0) };  // value equality: good keys
Console.WriteLine($"{n} {q} {a} {b} {seen.Contains((0, 0))}");   // bolt 5 2 1 True
`,
      python: src`
item = ("bolt", 5)            # immutable
print(item[0], item[1])       # bolt 5
n, q = item                   # unpack
a, b = 1, 2
a, b = b, a                   # swap
seen = {(0, 0)}               # hashable: good keys
print(n, q, a, b, (0, 0) in seen)   # bolt 5 2 1 True
first, *rest = [1, 2, 3]      # star unpacking
print(first, rest)            # 1 [2, 3]
`,
    },
    {
      id: "stack",
      topic: "Collections",
      title: "Stack (last in, first out)",
      bigO: "push/pop/peek O(1)",
      csharp: src`
var st = new Stack<int>();
st.Push(1); st.Push(2); st.Push(3);
Console.WriteLine(st.Peek());      // 3
Console.WriteLine(st.Pop());       // 3
Console.WriteLine(st.Count);       // 2
Console.WriteLine(st.TryPop(out int top) ? top : -1);   // 2
`,
      python: src`
st = []                    # a list is the stack
st.append(1); st.append(2); st.append(3)
print(st[-1])              # 3  peek
print(st.pop())            # 3
print(len(st))             # 2
print(st.pop() if st else -1)   # 2
`,
    },
    {
      id: "queue",
      topic: "Collections",
      title: "Queue and deque (first in, first out)",
      bigO: "enqueue/dequeue O(1)",
      csharp: src`
var q = new Queue<string>();
q.Enqueue("a"); q.Enqueue("b");
Console.WriteLine(q.Peek());       // a
Console.WriteLine(q.Dequeue());    // a
Console.WriteLine(q.Count);        // 1
// Both ends: LinkedList<T> (AddFirst/AddLast/RemoveFirst/RemoveLast, O(1))
var dq = new LinkedList<int>();
dq.AddLast(1); dq.AddFirst(0);
Console.WriteLine($"{dq.First!.Value} {dq.Last!.Value}");   // 0 1
`,
      python: src`
from collections import deque

q = deque()
q.append("a"); q.append("b")
print(q[0])              # a
print(q.popleft())       # a: O(1)
print(len(q))            # 1
q.appendleft("z")        # both ends O(1)
print(list(q))           # ['z', 'b']
window = deque(maxlen=3) # keeps only the last 3
for i in range(5):
    window.append(i)
print(list(window))      # [2, 3, 4]
`,
      note: "Never use `list.pop(0)` as a queue in Python: it's O(n). Use `deque.popleft()`.",
    },
    {
      id: "grid",
      topic: "Collections",
      title: "2D grids",
      csharp: src`
int rows = 2, cols = 3;
var grid = new int[rows, cols];            // rectangular
grid[1, 2] = 5;
Console.WriteLine($"{grid.GetLength(0)}x{grid.GetLength(1)} {grid[1, 2]}");   // 2x3 5
var jagged = new int[rows][];              // array of arrays
for (int r = 0; r < rows; r++) jagged[r] = new int[cols];
jagged[0][1] = 7;
Console.WriteLine(string.Join(" ", jagged.Select(row => string.Join(",", row))));  // 0,7,0 0,0,0
`,
      python: src`
rows, cols = 2, 3
grid = [[0] * cols for _ in range(rows)]   # NOT [[0] * cols] * rows
grid[1][2] = 5
print(len(grid), len(grid[0]), grid[1][2])   # 2 3 5
for r, row in enumerate(grid):
    for c, val in enumerate(row):
        pass                                  # visit grid[r][c]
dirs = [(1, 0), (-1, 0), (0, 1), (0, -1)]     # 4 neighbours
print([(1 + dr, 1 + dc) for dr, dc in dirs if 0 <= 1 + dr < rows and 0 <= 1 + dc < cols])
# [(0, 1), (1, 2), (1, 0)]: in-bounds neighbours of (1, 1)
`,
    },
    // ---------------- LINQ and comprehensions ----------------
    {
      id: "filter-map",
      topic: "LINQ and comprehensions",
      title: "Filter and transform",
      bigO: "O(n)",
      csharp: src`
int[] nums = { 1, 2, 3, 4, 5, 6 };
var evensSquared = nums.Where(n => n % 2 == 0).Select(n => n * n).ToList();
Console.WriteLine(string.Join(",", evensSquared));   // 4,16,36
var words = new[] { "pump", "fan" };
Console.WriteLine(string.Join(",", words.Select((w, i) => $"{i}:{w.ToUpper()}")));  // 0:PUMP,1:FAN
Console.WriteLine(string.Join(",", nums.Take(2).Concat(nums.Skip(4))));   // 1,2,5,6
`,
      python: src`
nums = [1, 2, 3, 4, 5, 6]
evens_squared = [n * n for n in nums if n % 2 == 0]
print(evens_squared)                         # [4, 16, 36]
words = ["pump", "fan"]
print([f"{i}:{w.upper()}" for i, w in enumerate(words)])   # ['0:PUMP', '1:FAN']
print(nums[:2] + nums[4:])                   # [1, 2, 5, 6]
print(list(map(str, nums[:3])), list(filter(None, [0, 1, "", "a"])))   # ['1', '2', '3'] [1, 'a']
`,
    },
    {
      id: "aggregate",
      topic: "LINQ and comprehensions",
      title: "Sum, count, min, max, any, all",
      bigO: "O(n)",
      csharp: src`
int[] a = { 4, 8, 15, 16, 23, 42 };
Console.WriteLine(a.Sum());                    // 108
Console.WriteLine(a.Count(x => x > 10));       // 4
Console.WriteLine($"{a.Min()} {a.Max()}");     // 4 42
Console.WriteLine(a.Average());                // 18
Console.WriteLine(a.Any(x => x > 40));         // True
Console.WriteLine(a.All(x => x > 0));          // True
Console.WriteLine(a.MaxBy(x => x % 10));       // 8
Console.WriteLine(a.FirstOrDefault(x => x > 100));   // 0 (default)
Console.WriteLine(a.Aggregate(1L, (acc, x) => acc * x));   // 7418880
`,
      python: src`
a = [4, 8, 15, 16, 23, 42]
print(sum(a))                         # 108
print(sum(1 for x in a if x > 10))    # 4
print(min(a), max(a))                 # 4 42
print(sum(a) / len(a))                # 18.0
print(any(x > 40 for x in a))         # True
print(all(x > 0 for x in a))          # True
print(max(a, key=lambda x: x % 10))   # 8
print(next((x for x in a if x > 100), 0))   # 0
import math
print(math.prod(a))                   # 7418880
`,
      note: "C# `Max()`/`Min()` throw on an empty sequence; Python's `max([])` raises `ValueError` (pass `default=`).",
    },
    {
      id: "to-dict",
      topic: "LINQ and comprehensions",
      title: "Build dictionaries and sets",
      csharp: src`
var words = new[] { "pump", "fan", "valve" };
Dictionary<string, int> lengths = words.ToDictionary(w => w, w => w.Length);
HashSet<int> sizes = words.Select(w => w.Length).ToHashSet();
Console.WriteLine($"{lengths["valve"]} {sizes.Count}");   // 5 3
var lookup = words.Select((w, i) => (w, i)).ToDictionary(p => p.w, p => p.i);
Console.WriteLine(lookup["fan"]);                         // 1
`,
      python: src`
words = ["pump", "fan", "valve"]
lengths = {w: len(w) for w in words}       # dict comprehension
sizes = {len(w) for w in words}            # set comprehension
print(lengths["valve"], len(sizes))        # 5 3
lookup = {w: i for i, w in enumerate(words)}
print(lookup["fan"])                       # 1
print(dict(zip(["a", "b"], [1, 2])))       # {'a': 1, 'b': 2}
`,
      note: "`ToDictionary` throws on a duplicate key; a Python dict comprehension keeps the last one.",
    },
    {
      id: "group",
      topic: "LINQ and comprehensions",
      title: "Group by a key",
      bigO: "O(n)",
      csharp: src`
var words = new[] { "ant", "bee", "cat", "bird", "cow" };
var byLetter = words.GroupBy(w => w[0])
                    .ToDictionary(g => g.Key, g => g.ToList());
Console.WriteLine(string.Join(",", byLetter['c']));   // cat,cow
foreach (var g in words.GroupBy(w => w.Length).OrderBy(g => g.Key))
    Console.WriteLine($"{g.Key}: {g.Count()}");      // 3: 4, then 4: 1
`,
      python: src`
from collections import defaultdict

words = ["ant", "bee", "cat", "bird", "cow"]
by_letter = defaultdict(list)
for w in words:
    by_letter[w[0]].append(w)
print(by_letter["c"])                  # ['cat', 'cow']
counts = defaultdict(int)
for w in words:
    counts[len(w)] += 1
for k in sorted(counts):
    print(f"{k}: {counts[k]}")         # 3: 4, then 4: 1
`,
      note: "`itertools.groupby` only groups ADJACENT equal keys, so sort first; `defaultdict` is usually simpler.",
    },
    {
      id: "order",
      topic: "LINQ and comprehensions",
      title: "Sort by one or more keys",
      bigO: "O(n log n)",
      csharp: src`
var people = new[] { ("Ada", 36), ("Bob", 25), ("Cy", 36) };
var sorted = people.OrderByDescending(p => p.Item2).ThenBy(p => p.Item1).ToList();
Console.WriteLine(string.Join(" ", sorted.Select(p => p.Item1)));   // Ada Cy Bob
var list = new List<string> { "bb", "a", "ccc" };
list.Sort((x, y) => y.Length.CompareTo(x.Length));   // in place, by comparison
Console.WriteLine(string.Join(",", list));           // ccc,bb,a
`,
      python: src`
people = [("Ada", 36), ("Bob", 25), ("Cy", 36)]
by_age_desc = sorted(people, key=lambda p: (-p[1], p[0]))
print([p[0] for p in by_age_desc])          # ['Ada', 'Cy', 'Bob']
lst = ["bb", "a", "ccc"]
lst.sort(key=len, reverse=True)             # in place
print(lst)                                  # ['ccc', 'bb', 'a']
from operator import itemgetter
print(sorted(people, key=itemgetter(1))[0]) # ('Bob', 25)
`,
      note: "Both `OrderBy` and Python's sort are stable: equal keys keep their original order. `List.Sort` and `Array.Sort` are not stable.",
    },
    {
      id: "lazy",
      topic: "LINQ and comprehensions",
      title: "Lazy sequences: deferred LINQ and generators",
      csharp: src`
var source = new List<int> { 1, 2, 3 };
var query = source.Where(x => x > 1);    // nothing runs yet
source.Add(10);
Console.WriteLine(query.Count());        // 3: runs now, sees 10
var snapshot = query.ToList();           // run once, keep the results
Console.WriteLine(string.Join(",", Evens().Take(3)));   // 0,2,4

static IEnumerable<int> Evens()
{
    for (int i = 0; ; i += 2) yield return i;   // infinite, but lazy
}
`,
      python: src`
source = [1, 2, 3]
gen = (x for x in source if x > 1)   # generator: lazy, one pass only
source.append(10)
print(sum(1 for _ in gen))           # 3: runs now, sees 10
print(sum(1 for _ in gen))           # 0: already used up


def evens():
    i = 0
    while True:
        yield i
        i += 2


from itertools import islice
print(list(islice(evens(), 3)))      # [0, 2, 4]
`,
      note: "A LINQ query re-runs every time you enumerate it; a generator can only be consumed once. Call `ToList()` / `list()` to keep results.",
    },
    {
      id: "yield",
      topic: "LINQ and comprehensions",
      title: "Writing your own sequence with yield",
      csharp: src`
Console.WriteLine(string.Join(" ", CountDown(3)));        // 3 2 1
Console.WriteLine(string.Join(" ", Fib().Take(8)));       // 0 1 1 2 3 5 8 13

static IEnumerable<int> CountDown(int n)
{
    while (n > 0) yield return n--;     // pauses here until the next item is wanted
}

static IEnumerable<long> Fib()
{
    long a = 0, b = 1;
    while (true)                        // endless is fine: callers Take what they need
    {
        yield return a;
        (a, b) = (b, a + b);
    }
}
`,
      python: src`
from itertools import islice


def count_down(n):
    while n > 0:
        yield n             # pauses here until the next item is wanted
        n -= 1


def fib():
    a, b = 0, 1
    while True:             # endless is fine: callers take what they need
        yield a
        a, b = b, a + b


print(list(count_down(3)))          # [3, 2, 1]
print(list(islice(fib(), 8)))       # [0, 1, 1, 2, 3, 5, 8, 13]
`,
      note: "`yield break` (C#) or `return` (Python) ends the sequence early; `yield from other` (Python) yields everything in another iterable.",
      bigO: "O(1) memory",
    },
    {
      id: "linq-more",
      topic: "LINQ and comprehensions",
      title: "Flatten, zip, distinct, chunk",
      csharp: src`
int[][] rows = [[1, 2], [3], [2, 4]];
var flat = rows.SelectMany(r => r).ToList();
Console.WriteLine(string.Join(",", flat));                    // 1,2,3,2,4
Console.WriteLine(string.Join(",", flat.Distinct()));         // 1,2,3,4 (first-seen order)

string[] names = ["ann", "bob"];
int[] ages = [31, 27];
foreach (var (name, age) in names.Zip(ages))
    Console.WriteLine($"{name} {age}");                      // ann 31, bob 27

foreach (var chunk in flat.Chunk(2))                          // .NET 6+
    Console.Write($"[{string.Join(",", chunk)}] ");           // [1,2] [3,2] [4]
Console.WriteLine();
Console.WriteLine(Enumerable.Range(1, 4).Aggregate(1, (acc, x) => acc * x));   // 24
`,
      python: src`
from functools import reduce
from itertools import batched, chain

rows = [[1, 2], [3], [2, 4]]
flat = [x for r in rows for x in r]          # or list(chain.from_iterable(rows))
print(flat)                                  # [1, 2, 3, 2, 4]
print(list(dict.fromkeys(flat)))             # [1, 2, 3, 4] (first-seen order)

for name, age in zip(["ann", "bob"], [31, 27]):
    print(name, age)                         # ann 31, bob 27

print(list(batched(flat, 2)))                # [(1, 2), (3, 2), (4,)]  Python 3.12+
print(reduce(lambda acc, x: acc * x, range(1, 5), 1))   # 24
`,
      note: "`set(xs)` also removes duplicates but loses the order. `zip` and `Zip` stop at the shorter input.",
    },
    // ---------------- Classes ----------------
    {
      id: "class",
      topic: "Classes",
      title: "Class, constructor, property, method",
      csharp: src`
var m = new Motor("Fan", 900);
m.Start();
Console.WriteLine(m);              // Fan (900 rpm) running

class Motor
{
    public string Name { get; }               // read-only after construction
    public int Rpm { get; private set; }
    public bool Running { get; private set; }
    private static int _count;                // shared by all Motors

    public Motor(string name, int rpm) { Name = name; Rpm = rpm; _count++; }

    public void Start() => Running = true;
    public override string ToString() => $"{Name} ({Rpm} rpm) {(Running ? "running" : "stopped")}";
}
`,
      python: src`
class Motor:
    count = 0                          # class attribute: shared

    def __init__(self, name, rpm):
        self.name = name               # instance attributes
        self.rpm = rpm
        self.running = False
        Motor.count += 1

    def start(self):                   # self is explicit
        self.running = True

    def __str__(self):
        return f"{self.name} ({self.rpm} rpm) {'running' if self.running else 'stopped'}"


m = Motor("Fan", 900)
m.start()
print(m)                               # Fan (900 rpm) running
`,
    },
    {
      id: "record",
      topic: "Classes",
      title: "Data classes: record and @dataclass",
      csharp: src`
var a = new Point(1, 2);
var b = a with { Y = 5 };          // copy with a change
Console.WriteLine(a);              // Point { X = 1, Y = 2 }
Console.WriteLine(a == new Point(1, 2));   // True: value equality
Console.WriteLine(b.Y);            // 5

record Point(int X, int Y);
`,
      python: src`
from dataclasses import dataclass, replace


@dataclass(frozen=True)            # frozen: immutable and hashable
class Point:
    x: int
    y: int


a = Point(1, 2)
b = replace(a, y=5)                # copy with a change
print(a)                           # Point(x=1, y=2)
print(a == Point(1, 2))            # True: value equality
print(b.y)                         # 5
`,
    },
    {
      id: "property",
      topic: "Classes",
      title: "Validated and computed properties",
      csharp: src`
var t = new Tank { Level = 150 };
Console.WriteLine($"{t.Level} {t.IsFull}");   // 100 True

class Tank
{
    private double _level;
    public double Level
    {
        get => _level;
        set => _level = Math.Clamp(value, 0, 100);
    }
    public bool IsFull => _level >= 100;      // computed
}
`,
      python: src`
class Tank:
    def __init__(self):
        self._level = 0.0

    @property
    def level(self):
        return self._level

    @level.setter
    def level(self, value):
        self._level = max(0.0, min(value, 100.0))

    @property
    def is_full(self):                        # computed
        return self._level >= 100


t = Tank()
t.level = 150
print(t.level, t.is_full)                     # 100.0 True
`,
    },
    {
      id: "inherit",
      topic: "Classes",
      title: "Interfaces, inheritance and overriding",
      csharp: src`
IShape[] shapes = { new Circle(1), new Square(2) };
foreach (var s in shapes) Console.WriteLine($"{s.Name}: {s.Area():F2}");
// Circle: 3.14
// Square: 4.00

interface IShape { string Name { get; } double Area(); }

abstract class ShapeBase : IShape
{
    public virtual string Name => GetType().Name;
    public abstract double Area();
}

class Circle(double r) : ShapeBase { public override double Area() => Math.PI * r * r; }
class Square(double s) : ShapeBase { public override double Area() => s * s; }
`,
      python: src`
from abc import ABC, abstractmethod
import math


class Shape(ABC):
    @property
    def name(self):
        return type(self).__name__

    @abstractmethod
    def area(self): ...


class Circle(Shape):
    def __init__(self, r):
        self.r = r

    def area(self):
        return math.pi * self.r ** 2


class Square(Shape):
    def __init__(self, s):
        self.s = s

    def area(self):
        return self.s * self.s


for s in [Circle(1), Square(2)]:
    print(f"{s.name}: {s.area():.2f}")
`,
      note: "Stage 2 of this section covers interfaces and protocols in depth. `class Circle(double r)` is a C# 12 primary constructor.",
    },
    // ---------------- Exceptions ----------------
    {
      id: "try",
      topic: "Exceptions",
      title: "try / catch / finally",
      csharp: src`
try
{
    int[] a = new int[2];
    a[5] = 1;
}
catch (IndexOutOfRangeException e) when (e.Message.Length > 0)   // optional filter
{
    Console.WriteLine($"caught {e.GetType().Name}");
}
catch (Exception)            // broader types last (CS0160 otherwise)
{
    throw;                   // rethrow, keeping the stack trace
}
finally
{
    Console.WriteLine("always runs");
}
`,
      python: src`
try:
    a = [0, 0]
    a[5] = 1
except (IndexError, KeyError) as e:      # several types at once
    print(f"caught {type(e).__name__}")
except Exception:
    raise                                # rethrow, keeping the traceback
else:
    print("only if nothing was raised")
finally:
    print("always runs")
`,
    },
    {
      id: "throw",
      topic: "Exceptions",
      title: "Throwing and custom exceptions",
      csharp: src`
try { Withdraw(50, 80); }
catch (InsufficientFundsException e) { Console.WriteLine($"{e.Message} (short by {e.Shortfall})"); }

static void Withdraw(decimal balance, decimal amount)
{
    ArgumentOutOfRangeException.ThrowIfNegative(amount);
    if (amount > balance) throw new InsufficientFundsException(amount - balance);
}

class InsufficientFundsException(decimal shortfall)
    : Exception("Insufficient funds")
{
    public decimal Shortfall { get; } = shortfall;
}
`,
      python: src`
class InsufficientFundsError(Exception):
    def __init__(self, shortfall):
        super().__init__("Insufficient funds")
        self.shortfall = shortfall


def withdraw(balance, amount):
    if amount < 0:
        raise ValueError("amount must not be negative")
    if amount > balance:
        raise InsufficientFundsError(amount - balance)


try:
    withdraw(50, 80)
except InsufficientFundsError as e:
    print(f"{e} (short by {e.shortfall})")
`,
    },
    {
      id: "cleanup",
      topic: "Exceptions",
      title: "Guaranteed cleanup: using and with",
      csharp: src`
using (var writer = new StringWriter())   // Dispose() runs at the end, even on an exception
{
    writer.Write("log line");
    Console.WriteLine(writer.ToString());   // log line
}
using var reader = new StringReader("a\nb");   // disposed at the end of the scope
Console.WriteLine(reader.ReadLine());       // a
`,
      python: src`
import io

with io.StringIO() as buf:                 # closed at the end, even on an exception
    buf.write("log line")
    print(buf.getvalue())                  # log line
with io.StringIO("a\nb") as reader:
    print(reader.readline().strip())       # a
# Files: with open("data.csv") as f: ...
`,
    },
    {
      id: "exc-map",
      topic: "Exceptions",
      title: "Common exceptions, side by side",
      csharp: src`
// NullReferenceException       using null
// IndexOutOfRangeException     array index (List: ArgumentOutOfRangeException)
// KeyNotFoundException         missing dictionary key
// FormatException              int.Parse("abc")
// ArgumentException            bad argument value
// InvalidOperationException    wrong state; collection changed while iterating
// DivideByZeroException        integer / 0 (double / 0 is Infinity)
// OverflowException            checked arithmetic overflow
`,
      python: src`
# AttributeError / TypeError    using None ('NoneType' object ...)
# IndexError                    list index
# KeyError                      missing dict key
# ValueError                    int("abc"), bad argument value
# TypeError                     wrong type, wrong number of arguments
# RuntimeError                  dict/set changed size during iteration
# ZeroDivisionError             any / 0, including floats
# RecursionError                too deep (about 1000 frames by default)
`,
      fragment: { csharp: true, python: true },
    },
    // ---------------- Lambdas and generics ----------------
    {
      id: "lambda",
      topic: "Lambdas and generics",
      title: "Lambdas, function types and closures",
      csharp: src`
Func<int, int> twice = x => x * 2;           // last type argument = return type
Func<int, int, int> add = (a, b) => a + b;
Action<string> log = s => Console.WriteLine($"log: {s}");   // returns nothing
Console.WriteLine(twice(add(2, 3)));         // 10
log("hi");                                   // log: hi

var counter = MakeCounter();                 // a closure keeps count alive
counter();
Console.WriteLine(counter());                // 2

static Func<int> MakeCounter()
{
    int count = 0;
    return () => ++count;
}
`,
      python: src`
twice = lambda x: x * 2                      # one expression only
add = lambda a, b: a + b
print(twice(add(2, 3)))                      # 10


def make_counter():
    count = 0

    def step():
        nonlocal count                       # needed to assign the outer variable
        count += 1
        return count

    return step


counter = make_counter()                     # a closure keeps count alive
counter()
print(counter())                             # 2
`,
      note: "Closures capture variables, not values: lambdas made in a C# `for` loop or any Python loop all see the final value. Copy it first (C#) or use `lambda i=i: ...` (Python).",
    },
    {
      id: "sort-key",
      topic: "Lambdas and generics",
      title: "Sorting by several keys",
      csharp: src`
var people = new[] { ("cy", 30), ("ann", 25), ("bob", 30) };
var sorted = people.OrderByDescending(p => p.Item2).ThenBy(p => p.Item1, StringComparer.Ordinal);
Console.WriteLine(string.Join(" ", sorted.Select(p => $"{p.Item1}:{p.Item2}")));
// bob:30 cy:30 ann:25

var list = new List<string> { "pear", "fig", "apple" };
list.Sort((a, b) => a.Length.CompareTo(b.Length));       // in place, by a comparison (unstable)
Console.WriteLine(string.Join(" ", list));               // fig pear apple
Console.WriteLine(list.MaxBy(w => w.Length));            // apple
`,
      python: src`
people = [("cy", 30), ("ann", 25), ("bob", 30)]
s = sorted(people, key=lambda p: (-p[1], p[0]))   # age high to low, then name
print(" ".join(f"{n}:{a}" for n, a in s))          # bob:30 cy:30 ann:25

words = ["pear", "fig", "apple"]
words.sort(key=len)                                # in place, by a key function
print(words)                                       # ['fig', 'pear', 'apple']
print(max(words, key=len))                         # apple
`,
      note: "`OrderBy`/`ThenBy` and Python's sorts are stable: equal items keep their order. C#'s `List.Sort` is not (it uses introsort), so add a tie-breaking key or use `OrderBy` when ties matter. To sort text descending in Python, sort twice (least important key first) or use `reverse=True`.",
      bigO: "O(n log n)",
    },
    {
      id: "generic",
      topic: "Lambdas and generics",
      title: "Generic functions and classes",
      csharp: src`
Console.WriteLine(Largest([3, 9, 2]));          // 9
Console.WriteLine(Largest(["b", "c", "a"]));    // c
var box = new Box<string>("PT-101");
Console.WriteLine(box.Item.Length);             // 6

static T Largest<T>(T[] items) where T : IComparable<T>   // constraint
{
    T best = items[0];
    foreach (var x in items)
        if (x.CompareTo(best) > 0) best = x;
    return best;
}

class Box<T>(T item)                            // primary constructor (C# 12)
{
    public T Item { get; } = item;
}
`,
      python: src`
def largest[T](items: list[T]) -> T:            # Python 3.12+ syntax
    best = items[0]
    for x in items:
        if x > best:
            best = x
    return best


class Box[T]:
    def __init__(self, item: T) -> None:
        self.item = item


print(largest([3, 9, 2]))          # 9
print(largest(["b", "c", "a"]))    # c
print(len(Box("PT-101").item))     # 6
`,
      note: "Python type hints are checked by tools (mypy, Pyright), not when the code runs. Older Python: `T = TypeVar(\"T\")` and `class Box(Generic[T])`.",
    },
    {
      id: "optional",
      topic: "Lambdas and generics",
      title: "Maybe a value: nullable and optional",
      csharp: src`
int? port = ParsePort("x");
Console.WriteLine(port.HasValue);        // False
Console.WriteLine(port ?? 502);          // 502
string? name = null;
Console.WriteLine(name?.Length ?? 0);    // 0: ?. stops at null

static int? ParsePort(string s) => int.TryParse(s, out var p) ? p : null;
`,
      python: src`
def parse_port(s: str) -> int | None:    # older: Optional[int]
    return int(s) if s.isdigit() else None


port = parse_port("x")
print(port is not None)                  # False
print(port if port is not None else 502) # 502
name = None
print(len(name) if name is not None else 0)   # 0
`,
      note: "Test for None with `is None`, not `==` or truthiness: `0 or 502` is 502.",
    },
    // ---------------- Interfaces and equality ----------------
    {
      id: "interface",
      topic: "Interfaces and equality",
      title: "Interfaces, protocols and abstract classes",
      csharp: src`
IAlarm[] alarms = [new Beep(), new Flash()];
foreach (var a in alarms) Console.WriteLine(a.Raise());   // beep, flash
Console.WriteLine(new Temp().Report());                   // Temp: 21.5

interface IAlarm { string Raise(); }               // a promise, no code
class Beep : IAlarm { public string Raise() => "beep"; }
class Flash : IAlarm { public string Raise() => "flash"; }

abstract class Sensor                              // shared code + required gaps
{
    public abstract string Name { get; }
    protected abstract double Read();
    public string Report() => $"{Name}: {Read():F1}";
}
class Temp : Sensor
{
    public override string Name => "Temp";
    protected override double Read() => 21.46;
}
`,
      python: src`
from abc import ABC, abstractmethod
from typing import Protocol


class Alarm(Protocol):              # for type checkers; no inheritance needed
    def raise_alarm(self) -> str: ...


class Beep:
    def raise_alarm(self) -> str:
        return "beep"


class Sensor(ABC):                  # shared code + required gaps
    @abstractmethod
    def read(self) -> float: ...

    def report(self) -> str:
        return f"{type(self).__name__}: {self.read():.1f}"


class Temp(Sensor):
    def read(self) -> float:
        return 21.46


alarms: list[Alarm] = [Beep()]
print(alarms[0].raise_alarm())      # beep
print(Temp().report())              # Temp: 21.5
`,
      note: "Python is duck typed: any object with `raise_alarm` works. `Sensor()` itself raises TypeError because `read` is abstract.",
    },
    {
      id: "equality",
      topic: "Interfaces and equality",
      title: "Value equality and hashing",
      csharp: src`
var set = new HashSet<Tag> { new("PT-1", 1), new("PT-1", 1) };
Console.WriteLine(set.Count);              // 1: records compare by value
Console.WriteLine(new Pt(1, 2).Equals(new Pt(1, 2)));   // True

record Tag(string Name, int Unit);

class Pt(int x, int y) : IEquatable<Pt>    // by hand: Equals AND GetHashCode
{
    public int X { get; } = x;
    public int Y { get; } = y;
    public bool Equals(Pt? o) => o is not null && X == o.X && Y == o.Y;
    public override bool Equals(object? o) => Equals(o as Pt);
    public override int GetHashCode() => HashCode.Combine(X, Y);
}
`,
      python: src`
from dataclasses import dataclass


@dataclass(frozen=True)             # frozen: hashable, so usable in sets and as keys
class Tag:
    name: str
    unit: int


class Pt:                           # by hand: __eq__ AND __hash__
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __eq__(self, o):
        return isinstance(o, Pt) and (self.x, self.y) == (o.x, o.y)

    def __hash__(self):
        return hash((self.x, self.y))


print(len({Tag("PT-1", 1), Tag("PT-1", 1)}))   # 1
print(Pt(1, 2) == Pt(1, 2))                    # True
`,
      note: "Equal objects must have equal hash codes, and keys must not change while in a set or dictionary. A plain `@dataclass` (not frozen) is unhashable.",
    },
    {
      id: "compare",
      topic: "Interfaces and equality",
      title: "Making your own type sortable",
      csharp: src`
var vs = new List<Ver> { new(1, 10), new(1, 2), new(0, 9) };
vs.Sort();
Console.WriteLine(string.Join(" ", vs));    // 0.9 1.2 1.10

record Ver(int Major, int Minor) : IComparable<Ver>
{
    public int CompareTo(Ver? o) => o is null ? 1 : (Major, Minor).CompareTo((o.Major, o.Minor));
    public override string ToString() => $"{Major}.{Minor}";
}
`,
      python: src`
from dataclasses import dataclass


@dataclass(frozen=True, order=True)        # compares fields in order
class Ver:
    major: int
    minor: int

    def __str__(self):
        return f"{self.major}.{self.minor}"


vs = sorted([Ver(1, 10), Ver(1, 2), Ver(0, 9)])
print(" ".join(str(v) for v in vs))        # 0.9 1.2 1.10
`,
    },
    {
      id: "copy",
      topic: "Interfaces and equality",
      title: "Shallow and deep copies",
      csharp: src`
int[][] grid = [[1, 2], [3, 4]];
var shallow = (int[][])grid.Clone();               // new outer array, same rows
var deep = grid.Select(r => r.ToArray()).ToArray(); // rows copied too
grid[0][0] = 9;
Console.WriteLine($"{shallow[0][0]} {deep[0][0]}"); // 9 1

var s1 = new P { X = 1 };
var s2 = s1;          // a struct is copied on assignment
s2.X = 5;
Console.WriteLine(s1.X);                           // 1

struct P { public int X; }
`,
      python: src`
import copy

grid = [[1, 2], [3, 4]]
shallow = grid.copy()             # or list(grid), grid[:]
deep = copy.deepcopy(grid)        # or [r.copy() for r in grid]
grid[0][0] = 9
print(shallow[0][0], deep[0][0])  # 9 1

rows = [[0] * 2 for _ in range(2)]   # NOT [[0] * 2] * 2, which shares one row
rows[0][0] = 7
print(rows)                       # [[7, 0], [0, 0]]
`,
      note: "In Python, assignment never copies; immutable values (int, str, tuple) just can't be changed through either name.",
    },
    // ---------------- Files and parsing ----------------
    {
      id: "files",
      topic: "Files and parsing",
      title: "Read and write text files",
      csharp: src`
File.WriteAllText("notes.txt", "line 1\nline 2\n");
File.AppendAllText("notes.txt", "line 3\n");
foreach (var line in File.ReadLines("notes.txt"))    // lazily, line by line
    Console.WriteLine(line);                         // line 1, line 2, line 3

using (var w = new StreamWriter("log.txt"))          // closed at the }
    w.WriteLine("done");
Console.WriteLine(File.ReadAllText("log.txt").Trim());   // done
`,
      python: src`
from pathlib import Path

Path("notes.txt").write_text("line 1\nline 2\n", encoding="utf-8")
with open("notes.txt", "a", encoding="utf-8") as f:     # "a" appends
    f.write("line 3\n")
with open("notes.txt", encoding="utf-8") as f:          # closed after the block
    for line in f:                                      # lazily, line by line
        print(line.rstrip("\n"))                        # line 1, line 2, line 3

print(Path("notes.txt").read_text(encoding="utf-8").count("\n"))   # 3
`,
      note: "Relative paths are relative to the current working directory. Always pass `encoding=\"utf-8\"` in Python.",
    },
    {
      id: "format-spec",
      topic: "Files and parsing",
      title: "Format specifiers",
      csharp: src`
double p = 1234.5;
Console.WriteLine($"[{p:F2}] [{p:N1}] [{42:D5}] [{255:X}]");   // [1234.50] [1,234.5] [00042] [FF]
Console.WriteLine($"[{"ab",5}] [{"ab",-5}] [{p,10:F1}]");     // [   ab] [ab   ] [    1234.5]
Console.WriteLine($"{0.256:P0}");     // 26 %  (exact form depends on culture)
Console.WriteLine($"{2.5:F0} {3.5:F0}");                       // 2 4: halves round to even
`,
      python: src`
p = 1234.5
print(f"[{p:.2f}] [{p:,.1f}] [{42:05}] [{255:X}]")   # [1234.50] [1,234.5] [00042] [FF]
print(f"[{'ab':>5}] [{'ab':<5}] [{p:>10.1f}]")       # [   ab] [ab   ] [    1234.5]
print(f"{0.256:.0%}")                                # 26%
print(f"{2.5:.0f} {3.5:.0f}")                        # 2 4: halves round to even
`,
      note: "C# formatting follows the current culture (a German PC writes `1234,50`); use `ToString(\"F2\", CultureInfo.InvariantCulture)` for files and APIs.",
    },
    {
      id: "parse",
      topic: "Files and parsing",
      title: "Parse numbers and key=value text",
      csharp: src`
using System.Globalization;

Console.WriteLine(int.TryParse(" 42 ", out var n) ? n : -1);    // 42
Console.WriteLine(int.TryParse("4.5", out _));                   // False
Console.WriteLine(double.Parse("4.5", CultureInfo.InvariantCulture) * 2);   // 9

var parts = "url = http://x/?a=b".Split('=', 2);                 // first '=' only
Console.WriteLine($"{parts[0].Trim()} | {parts[1].Trim()}");     // url | http://x/?a=b
`,
      python: src`
def to_int(s, default=-1):
    try:
        return int(s)
    except ValueError:
        return default


print(to_int(" 42 "))        # 42
print(to_int("4.5"))         # -1
print(float("4.5") * 2)      # 9.0

key, _, value = "url = http://x/?a=b".partition("=")   # first "=" only
print(f"{key.strip()} | {value.strip()}")              # url | http://x/?a=b
`,
      note: "For real CSV (quoted fields with commas), use Python's `csv` module or a C# library such as CsvHelper rather than `Split(',')`.",
    },
    {
      id: "json",
      topic: "Files and parsing",
      title: "JSON in and out",
      csharp: src`
#:property PublishAot=false
// (dotnet run file.cs defaults to AOT, which blocks reflection-based JSON; the line above turns AOT off)
using System.Text.Json;

var json = JsonSerializer.Serialize(new Reading("PT-1", 4.2));
Console.WriteLine(json);                                   // {"Tag":"PT-1","Value":4.2}
var r = JsonSerializer.Deserialize<Reading>(json)!;
Console.WriteLine(r.Value);                                // 4.2

record Reading(string Tag, double Value);
`,
      python: src`
import json

text = json.dumps({"tag": "PT-1", "value": 4.2})
print(text)                          # {"tag": "PT-1", "value": 4.2}
data = json.loads(text)
print(data["value"])                 # 4.2
print(json.dumps([True, None]))      # [true, null]
`,
      note: "Files: `JsonSerializer.Serialize(stream, obj)` / `json.dump(obj, f)`; read with `Deserialize` / `json.load(f)`.",
    },
    // ---------------- Async, tests and modules ----------------
    {
      id: "async",
      topic: "Async, tests and modules",
      title: "async and await",
      csharp: src`
var results = await Task.WhenAll(FetchAsync("A", 200), FetchAsync("B", 100));
Console.WriteLine(string.Join(",", results));    // A ok,B ok: input order, ~0.2 s total

static async Task<string> FetchAsync(string name, int ms)
{
    await Task.Delay(ms);                        // waits without blocking a thread
    return $"{name} ok";
}
`,
      python: src`
import asyncio


async def fetch(name, seconds):
    await asyncio.sleep(seconds)                 # waits without blocking the loop
    return f"{name} ok"


async def main():
    results = await asyncio.gather(fetch("A", 0.2), fetch("B", 0.1))
    print(results)                               # ['A ok', 'B ok']: input order, ~0.2 s


asyncio.run(main())
`,
      note: "Never block inside async code (`.Result`, `.Wait()`, `time.sleep`). A Python coroutine doesn't start until awaited or passed to `create_task`.",
    },
    {
      id: "test",
      topic: "Async, tests and modules",
      title: "Unit tests: xUnit and pytest",
      csharp: src`
// dotnet new xunit; dotnet test
using Xunit;

public class MathTests
{
    [Fact]
    public void Adds() => Assert.Equal(4, 2 + 2);          // (expected, actual)

    [Theory]
    [InlineData(2, 4)]
    [InlineData(3, 9)]
    public void Squares(int x, int expected) => Assert.Equal(expected, x * x);

    [Fact]
    public void Throws() => Assert.Throws<FormatException>(() => int.Parse("x"));
}
`,
      python: src`
# pip install pytest; pytest
import pytest


def test_adds():
    assert 2 + 2 == 4


@pytest.mark.parametrize("x, expected", [(2, 4), (3, 9)])
def test_squares(x, expected):
    assert x * x == expected


def test_raises():
    with pytest.raises(ValueError):
        int("x")
`,
      fragment: { csharp: true, python: true },
      note: "Floats: `Assert.Equal(0.3, x, 9)` / `x == pytest.approx(0.3)`. Per-test setup: the test class constructor / `@pytest.fixture`.",
    },
    {
      id: "imports",
      topic: "Async, tests and modules",
      title: "using and import",
      csharp: src`
#:property PublishAot=false
// (dotnet run file.cs defaults to AOT, which blocks reflection-based JSON; the line above turns AOT off)
using System.Text;                          // a namespace
using static System.Math;                   // a class's static members
using Json = System.Text.Json.JsonSerializer;   // an alias

Console.WriteLine(new StringBuilder("ab").Append(Max(1, 2)));   // ab2
Console.WriteLine(Json.Serialize(new[] { 1 }));                  // [1]
`,
      python: src`
import math                                 # the module: math.sqrt
from statistics import mean                 # one name from it
import datetime as dt                       # an alias

print(math.sqrt(16), mean([1, 2, 3]))       # 4.0 2
print(dt.date(2026, 1, 1).year)             # 2026
if __name__ == "__main__":                  # only when run, not when imported
    print("run directly")                   # run directly
`,
    },
    {
      id: "packages",
      topic: "Async, tests and modules",
      title: "Projects and packages",
      csharp: src`
// dotnet new console -n Plant          a new project folder
// dotnet add package Serilog           adds a <PackageReference> to Plant.csproj
// dotnet add reference ../Lib/Lib.csproj
// dotnet build / dotnet run / dotnet test
// dotnet run file.cs                   run a single file (.NET 10)
`,
      python: src`
# python -m venv .venv                  a per-project environment
# source .venv/bin/activate             Windows: .venv\Scripts\activate
# pip install requests                  install into the active environment
# pip freeze > requirements.txt         record versions; pip install -r requirements.txt
# python -m pytest / python main.py
`,
      fragment: { csharp: true, python: true },
      note: "Python modules are files and packages are folders; C# namespaces are just names, and every file in a project compiles together.",
    },
    // ---------------- Performance and concurrency ----------------
    {
      id: "span",
      topic: "Performance and concurrency",
      title: "Slicing without copying",
      bigO: "slice O(1)",
      csharp: src`
int[] data = [10, 20, 30, 40];
Span<int> mid = data.AsSpan(1, 2);         // a view: nothing copied
mid[0] = 99;                               // writes through to data
Console.WriteLine(string.Join(",", data)); // 10,99,30,40

ReadOnlySpan<char> line = "PT-1;42";
int n = int.Parse(line[(line.IndexOf(';') + 1)..]);   // parse without a substring
Console.WriteLine(n);                      // 42
Span<byte> buffer = stackalloc byte[16];   // small scratch space on the stack
Console.WriteLine(buffer.Length);          // 16
`,
      python: src`
data = bytearray(b"abcd")
view = memoryview(data)[1:3]               # a view of binary data: nothing copied
view[0] = ord("X")
print(data)                                # bytearray(b'aXcd')

items = [10, 20, 30, 40]
part = items[1:3]                          # list (and str) slices copy
part[0] = 99
print(items)                               # [10, 20, 30, 40]
`,
      note: "A `Span<T>` can't be stored in a field or used across `await`; use `Memory<T>` there. Python's `memoryview` works on bytes-like objects only.",
    },
    {
      id: "allocations",
      topic: "Performance and concurrency",
      title: "Measuring memory and allocations",
      csharp: src`
long before = GC.GetAllocatedBytesForCurrentThread();
var arr = new int[1000];
Console.WriteLine(GC.GetAllocatedBytesForCurrentThread() - before);   // 4024 (64-bit)
Console.WriteLine(GC.GetGeneration(arr));                             // 0: new objects start young
object boxed = 42;                         // boxing: a heap copy of the int
Console.WriteLine(boxed is int);           // True
`,
      python: src`
import sys
import tracemalloc


class Point:
    __slots__ = ("x", "y")                 # no per-object __dict__: smaller objects

    def __init__(self, x, y):
        self.x, self.y = x, y


print(sys.getsizeof([]))                   # 56: one object, not what it refers to
tracemalloc.start()
points = [Point(i, i) for i in range(1000)]
print(tracemalloc.get_traced_memory()[0] > 0)   # True: bytes currently allocated
`,
      note: "Sizes shown are for 64-bit .NET 10 and CPython 3.13. For real measurements use BenchmarkDotNet's `[MemoryDiagnoser]` or `tracemalloc` snapshots.",
    },
    {
      id: "threads",
      topic: "Performance and concurrency",
      title: "Threads and locks",
      csharp: src`
int count = 0;
var gate = new object();
var threads = Enumerable.Range(0, 4).Select(_ => new Thread(() =>
{
    for (int i = 0; i < 10_000; i++)
        lock (gate) count++;               // one thread at a time
})).ToList();
threads.ForEach(t => t.Start());
threads.ForEach(t => t.Join());            // wait for all
Console.WriteLine(count);                  // 40000

int atomic = 0;
Parallel.For(0, 1000, _ => Interlocked.Increment(ref atomic));
Console.WriteLine(atomic);                 // 1000
`,
      python: src`
import threading

count = 0
gate = threading.Lock()


def work():
    global count
    for _ in range(10_000):
        with gate:                         # one thread at a time
            count += 1


threads = [threading.Thread(target=work) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()                               # wait for all
print(count)                               # 40000
`,
      note: "`count++` and `count += 1` are read-modify-write: without the lock, updates get lost. Prefer thread-safe collections (`ConcurrentDictionary`, `queue.Queue`) and pools over raw threads.",
    },
    {
      id: "parallel",
      topic: "Performance and concurrency",
      title: "CPU-bound work on all cores",
      csharp: src`
var squares = Enumerable.Range(1, 5).AsParallel().AsOrdered().Select(x => x * x).ToArray();
Console.WriteLine(string.Join(",", squares));    // 1,4,9,16,25

int total = await Task.Run(() => Enumerable.Range(1, 100).Sum());   // off the current thread
Console.WriteLine(total);                        // 5050
`,
      python: src`
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor


def square(x):
    return x * x


if __name__ == "__main__":                       # required for process pools
    with ProcessPoolExecutor() as pool:          # separate processes: no GIL limit
        print(list(pool.map(square, range(1, 6))))   # [1, 4, 9, 16, 25]
    with ThreadPoolExecutor(max_workers=4) as pool:  # threads: good for waiting, not computing
        print(pool.submit(sum, range(1, 101)).result())   # 5050
`,
      note: "The GIL lets only one Python thread run Python code at a time, so CPU-heavy Python uses processes (or NumPy). C# threads run in parallel on every core.",
    },
    {
      id: "cancel",
      topic: "Performance and concurrency",
      title: "Cancellation and timeouts",
      csharp: src`
using var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(50));
try
{
    await Task.Delay(5000, cts.Token);           // pass the token down
}
catch (OperationCanceledException)
{
    Console.WriteLine("cancelled");              // cancelled
}

try
{
    await Task.Delay(5000).WaitAsync(TimeSpan.FromMilliseconds(50));
}
catch (TimeoutException)
{
    Console.WriteLine("timed out");              // timed out
}
`,
      python: src`
import asyncio


async def main():
    task = asyncio.create_task(asyncio.sleep(5))
    await asyncio.sleep(0.01)
    task.cancel()                                # CancelledError at its await
    try:
        await task
    except asyncio.CancelledError:
        print("cancelled")                       # cancelled
    try:
        async with asyncio.timeout(0.05):        # Python 3.11+
            await asyncio.sleep(5)
    except TimeoutError:
        print("timed out")                       # timed out


asyncio.run(main())
`,
      note: "Cancellation is cooperative: the work stops at a check or an `await`. Clean up in `finally`, then let `CancelledError` / `OperationCanceledException` propagate.",
    },
    {
      id: "throttle",
      topic: "Performance and concurrency",
      title: "Limit concurrency, first to finish, async streams",
      csharp: src`
var gate = new SemaphoreSlim(2);                 // at most 2 at once
async Task<int> Fetch(int id, int ms)
{
    await gate.WaitAsync();
    try { await Task.Delay(ms); return id; }
    finally { gate.Release(); }
}
var first = await Task.WhenAny(Fetch(1, 200), Fetch(2, 20));
Console.WriteLine(await first);                  // 2

await foreach (var x in Countdown(3)) Console.Write(x + " ");   // 3 2 1
Console.WriteLine();

static async IAsyncEnumerable<int> Countdown(int n)
{
    for (; n > 0; n--) { await Task.Yield(); yield return n; }
}
`,
      python: src`
import asyncio


async def fetch(gate, item, seconds):
    async with gate:                             # at most 2 at once
        await asyncio.sleep(seconds)
        return item


async def countdown(n):
    for i in range(n, 0, -1):
        await asyncio.sleep(0)
        yield i                                  # an async generator


async def main():
    gate = asyncio.Semaphore(2)
    tasks = [fetch(gate, 1, 0.2), fetch(gate, 2, 0.02)]
    for done in asyncio.as_completed(tasks):
        print(await done)                        # 2, then 1
        break
    print([x async for x in countdown(3)])      # [3, 2, 1]


asyncio.run(main())
`,
    },
    {
      id: "timing",
      topic: "Performance and concurrency",
      title: "Timing and profiling",
      csharp: src`
using System.Diagnostics;

var sw = Stopwatch.StartNew();
long sum = 0;
for (int i = 0; i < 1_000_000; i++) sum += i;
sw.Stop();
Console.WriteLine(sum);                          // 499999500000
Console.WriteLine(sw.Elapsed.TotalMilliseconds >= 0);   // True
// Benchmarks: BenchmarkDotNet, [Benchmark] + [MemoryDiagnoser], dotnet run -c Release
// Profiling: dotnet-counters, dotnet-trace, the Visual Studio / Rider profiler
`,
      python: src`
import cProfile
import pstats
import timeit

print(min(timeit.repeat("sum(range(1000))", number=100, repeat=3)) > 0)   # True

profiler = cProfile.Profile()
profiler.runcall(sorted, range(10_000), key=lambda x: -x)
stats = pstats.Stats(profiler).sort_stats("cumulative")
print(stats.total_calls > 10_000)                # True: one call per key
# stats.print_stats(10); from a shell: python -m cProfile -s cumtime app.py
`,
      note: "Warm up and use Release builds before timing .NET code. Look for O(n) work inside loops, repeated lazy queries, and one network or database call per item first.",
    },
    // ---------------- Advanced language features ----------------
    {
      id: "decorator",
      topic: "Advanced language features",
      title: "Wrapping functions: decorators",
      csharp: src`
var calls = 0;
Func<int, long> slow = n => { calls++; return (long)n * n; };
var fast = Memoize(slow);
Console.WriteLine(fast(9) + fast(9));            // 162
Console.WriteLine(calls);                        // 1

static Func<T, R> Memoize<T, R>(Func<T, R> f) where T : notnull
{
    var cache = new Dictionary<T, R>();          // captured by the lambda
    return x => cache.TryGetValue(x, out var y) ? y : cache[x] = f(x);
}
`,
      python: src`
import functools


def logged(func):
    @functools.wraps(func)                       # keep the name and docstring
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        print(f"{func.__name__}{args} -> {result}")
        return result
    return wrapper


@logged
@functools.cache                                 # memoize: each argument computed once
def square(n):
    return n * n


square(9)                                        # square(9,) -> 81
square(9)                                        # square(9,) -> 81 (from the cache)
print(square.__name__)                           # square
`,
      note: "Stacked decorators apply bottom up. A decorator with settings (`@retry(times=3)`) is a function that returns a decorator.",
    },
    {
      id: "dispose",
      topic: "Advanced language features",
      title: "Guaranteed clean-up: using and with",
      csharp: src`
using (var a = new Res("A"))
{
    using var b = new Res("B");                  // disposed at the end of the block
    Console.WriteLine("work");
}
// open A / open B / work / close B / close A

sealed class Res : IDisposable
{
    private readonly string _name;
    public Res(string name) { _name = name; Console.WriteLine($"open {_name}"); }
    public void Dispose() => Console.WriteLine($"close {_name}");
}
`,
      python: src`
from contextlib import ExitStack, contextmanager


@contextmanager
def res(name):
    print(f"open {name}")
    try:
        yield name
    finally:                                     # runs even if the block raises
        print(f"close {name}")


with res("A"), res("B"):
    print("work")
# open A / open B / work / close B / close A

with ExitStack() as stack:                       # a run-time number of resources
    names = [stack.enter_context(res(n)) for n in "xy"]
# open x / open y / close y / close x
`,
      note: "Clean-up runs in reverse order of acquisition, on every path. A class version implements `__enter__` / `__exit__`; async versions are `await using` and `async with`.",
    },
    {
      id: "operators",
      topic: "Advanced language features",
      title: "Operators and special methods",
      csharp: src`
var a = new Vec(1, 2);
Console.WriteLine(a + new Vec(3, 4));            // (4, 6)
Console.WriteLine(2 * a);                        // (2, 4)
Console.WriteLine(a == new Vec(1, 2));           // True: record equality

readonly record struct Vec(int X, int Y)
{
    public static Vec operator +(Vec p, Vec q) => new(p.X + q.X, p.Y + q.Y);
    public static Vec operator *(int k, Vec p) => new(k * p.X, k * p.Y);
    public override string ToString() => $"({X}, {Y})";
}
`,
      python: src`
class Vec:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __add__(self, other):
        return Vec(self.x + other.x, self.y + other.y)

    def __rmul__(self, k):                       # 2 * v
        return Vec(k * self.x, k * self.y)

    def __eq__(self, other):
        return isinstance(other, Vec) and (self.x, self.y) == (other.x, other.y)

    def __hash__(self):
        return hash((self.x, self.y))

    def __len__(self):                           # len(v), and truthiness
        return 2

    def __repr__(self):
        return f"({self.x}, {self.y})"


a = Vec(1, 2)
print(a + Vec(3, 4), 2 * a, a == Vec(1, 2), len(a))   # (4, 6) (2, 4) True 2
`,
      note: "Other hooks: `__getitem__` (indexer `this[int i]`), `__contains__` (`Contains`), `__iter__` (`IEnumerable<T>`), `__call__`, `__lt__` (`IComparable<T>`).",
    },
    {
      id: "patterns",
      topic: "Advanced language features",
      title: "Pattern matching",
      csharp: src`
Console.WriteLine(Route(["move", "3", "4"]));   // move to 3,4
Console.WriteLine(Route(["say", "hi", "all"])); // say: hi all
Console.WriteLine(Grade(87));                   // B

static string Route(string[] words) => words switch
{
    ["stop"] => "stop",
    ["move", var x, var y] => $"move to {x},{y}",
    ["say", .. var rest] => $"say: {string.Join(" ", rest)}",
    [] => "empty",
    _ => "unknown",
};

static string Grade(int score) => score switch
{
    >= 90 => "A",
    >= 80 and < 90 => "B",
    _ => "C",
};
`,
      python: src`
def route(words):
    match words:
        case ["stop"]:
            return "stop"
        case ["move", x, y]:
            return f"move to {x},{y}"
        case ["say", *rest]:
            return "say: " + " ".join(rest)
        case []:
            return "empty"
        case _:
            return "unknown"


print(route(["move", "3", "4"]))      # move to 3,4
print(route(["say", "hi", "all"]))    # say: hi all

match {"type": "alarm", "level": 4}:
    case {"type": "alarm", "level": int(n)} if n >= 3:   # mapping pattern + guard
        print("urgent", n)            # urgent 4
`,
      note: "In Python a bare name in a `case` captures anything; compare with constants through dotted names (`Color.RED`). C# warns when a switch expression isn't exhaustive.",
    },
    {
      id: "generics-adv",
      topic: "Advanced language features",
      title: "Generic math and variance",
      csharp: src`
using System.Numerics;

Console.WriteLine(Total([1, 2, 3]));             // 6
Console.WriteLine(Total([0.1m, 0.2m]));          // 0.3

IEnumerable<object> things = new List<string> { "a" };   // covariant: out T
Action<object> logAny = o => Console.WriteLine(o);
Action<string> log = logAny;                     // contravariant: in T
log("ok");                                       // ok
Console.WriteLine(things.Count());               // 1

static T Total<T>(IEnumerable<T> items) where T : INumber<T>
{
    T sum = T.Zero;
    foreach (var x in items) sum += x;
    return sum;
}
`,
      python: src`
from collections.abc import Callable, Sequence
from decimal import Decimal


def total[T: (int, float, Decimal)](items: Sequence[T]) -> T | int:
    return sum(items)


def timed[**P, R](func: Callable[P, R]) -> Callable[P, R]:   # keeps the signature
    return func


print(total([1, 2, 3]), total([Decimal("0.1"), Decimal("0.2")]))   # 6 0.3
print(timed(len)("abc"))                                             # 3
`,
      note: "Accept `IEnumerable<T>` / `Sequence[T]` rather than lists: they're covariant, so callers can pass a list of a subtype. Python type parameters are for type checkers only.",
    },
    {
      id: "itertools",
      topic: "Advanced language features",
      title: "itertools and functools vs LINQ",
      csharp: src`
int[] xs = [1, 2, 3, 4];
Console.WriteLine(string.Join(",", xs.Zip(xs.Skip(1), (a, b) => b - a)));   // 1,1,1
Console.WriteLine(string.Join("|", xs.Chunk(3).Select(c => string.Join(",", c))));   // 1,2,3|4
Console.WriteLine(xs.Aggregate(1, (acc, x) => acc * x));                    // 24
Console.WriteLine(string.Join(",", new[] { new[] { 1 }, [2, 3] }.SelectMany(a => a)));  // 1,2,3
`,
      python: src`
from functools import partial, reduce
from itertools import accumulate, batched, chain, groupby, pairwise
import operator

xs = [1, 2, 3, 4]
print([b - a for a, b in pairwise(xs)])                  # [1, 1, 1]
print(list(batched(xs, 3)))                              # [(1, 2, 3), (4,)]
print(reduce(operator.mul, xs, 1), list(accumulate(xs))) # 24 [1, 3, 6, 10]
print(list(chain.from_iterable([[1], [2, 3]])))          # [1, 2, 3]
print([(k, len(list(g))) for k, g in groupby("aabca")])  # [('a', 2), ('b', 1), ('c', 1), ('a', 1)]
print(partial(int, base=2)("101"))                       # 5
`,
      note: "`itertools.groupby` groups adjacent equal items only (sort first for per-key groups); LINQ's `GroupBy` collects every item with the key.",
    },
    {
      id: "error-design",
      topic: "Advanced language features",
      title: "Wrapping errors, filters and result types",
      csharp: src`
try
{
    try { int.Parse("x"); }
    catch (FormatException e) { throw new InvalidOperationException("bad config", e); }   // keep the cause
}
catch (InvalidOperationException e) when (e.InnerException is FormatException)   // a filter
{
    Console.WriteLine($"{e.Message} <- {e.InnerException.GetType().Name}");   // bad config <- FormatException
}

var ok = int.TryParse("42", out int port);       // the Try pattern: no exception
Console.WriteLine($"{ok} {port}");               // True 42
`,
      python: src`
class ConfigError(Exception):
    pass


try:
    try:
        int("x")
    except ValueError as e:
        raise ConfigError("bad config") from e   # keep the cause
except ConfigError as e:
    print(e, "<-", type(e.__cause__).__name__)   # bad config <- ValueError


def parse_port(text):                            # a simple result: (value, error)
    return (int(text), None) if text.isdigit() else (None, f"not a number: {text}")


print(parse_port("502"), parse_port("http"))     # (502, None) (None, 'not a number: http')
`,
      note: "Rethrow with `throw;` / bare `raise` to keep the stack trace. Return results for expected failures; throw for the unexpected.",
    },
    {
      id: "retry",
      topic: "Advanced language features",
      title: "Retry with exponential backoff",
      csharp: src`
int attempt = 0;
var waits = new List<int>();
int result = Retry(() => ++attempt < 3 ? throw new TimeoutException() : 42, 5, waits.Add);
Console.WriteLine($"{result} after {attempt} tries, waits {string.Join(",", waits)}");   // 42 after 3 tries, waits 100,200

static T Retry<T>(Func<T> action, int max, Action<int> sleep, int baseMs = 100, int capMs = 2000)
{
    for (int i = 1; ; i++)
    {
        try { return action(); }
        catch (TimeoutException) when (i < max)            // transient errors only
        {
            sleep((int)Math.Min(capMs, baseMs * Math.Pow(2, i - 1)));
        }
    }
}
`,
      python: src`
import random


def retry(action, max_attempts, sleep, base=0.1, cap=2.0):
    for attempt in range(1, max_attempts + 1):
        try:
            return action()
        except TimeoutError:                     # transient errors only
            if attempt == max_attempts:
                raise
            delay = min(cap, base * 2 ** (attempt - 1))
            sleep(random.uniform(0, delay))      # "full jitter"


tries = iter([TimeoutError(), TimeoutError(), 42])


def flaky():
    value = next(tries)
    if isinstance(value, Exception):
        raise value
    return value


print(retry(flaky, 5, sleep=lambda s: None))     # 42
`,
      note: "Retry only idempotent operations and only transient failures, with a limit and a cap. Libraries: Polly (`Microsoft.Extensions.Http.Resilience`) and `tenacity`.",
    },
    {
      id: "versions",
      topic: "Advanced language features",
      title: "Projects, packages and versions",
      csharp: src`
// <PackageReference Include="Serilog" Version="4.2.0" /> in the .csproj
// dotnet add package Serilog / dotnet list package --outdated / dotnet pack
Console.WriteLine(new Version("1.10.0") > new Version("1.9.3"));   // True
Console.WriteLine(string.CompareOrdinal("1.10.0", "1.9.3") > 0);   // False: never compare as text
`,
      python: src`
# pyproject.toml: dependencies = ["httpx>=0.27,<1"]
# python -m venv .venv / pip install -e ".[dev]" / python -m build
def key(version):
    return tuple(int(p) for p in version.split("."))


print(key("1.10.0") > key("1.9.3"))              # True
print("1.10.0" > "1.9.3")                         # False: never compare as text
`,
      note: "SemVer: MAJOR.MINOR.PATCH, and a pre-release (`2.0.0-rc.1`) sorts before its release. Commit lock files for applications.",
    },
    // ---------------- Interview idioms ----------------
    {
      id: "heap",
      topic: "Interview idioms",
      title: "Priority queue / heap",
      bigO: "push/pop O(log n), peek O(1)",
      csharp: src`
var pq = new PriorityQueue<string, int>();    // min-heap by priority
pq.Enqueue("low", 5);
pq.Enqueue("urgent", 1);
pq.Enqueue("mid", 3);
Console.WriteLine(pq.Peek());                 // urgent
Console.WriteLine(pq.Dequeue());              // urgent
Console.WriteLine(pq.Count);                  // 2

// Max-heap: reverse the comparer (or negate int priorities)
var maxPq = new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));
foreach (var x in new[] { 3, 9, 4 }) maxPq.Enqueue(x, x);
Console.WriteLine(maxPq.Dequeue());           // 9
`,
      python: src`
import heapq

pq = []                                # a plain list kept in heap order
heapq.heappush(pq, (5, "low"))         # (priority, item) tuples
heapq.heappush(pq, (1, "urgent"))
heapq.heappush(pq, (3, "mid"))
print(pq[0][1])                        # urgent  (peek)
print(heapq.heappop(pq)[1])            # urgent
print(len(pq))                         # 2

max_heap = []                          # max-heap: push negatives
for x in [3, 9, 4]:
    heapq.heappush(max_heap, -x)
print(-heapq.heappop(max_heap))        # 9
print(heapq.nlargest(2, [3, 9, 4]))    # [9, 4]
`,
      note: "Neither supports changing a priority in place: push a new entry and skip stale ones when popped. Python compares the whole tuple, so add a tie-breaker (a counter) if items aren't comparable.",
    },
    {
      id: "bfs",
      topic: "Interview idioms",
      title: "BFS with a queue",
      bigO: "O(V + E)",
      csharp: src`
var graph = new Dictionary<int, int[]> { [0] = [1, 2], [1] = [3], [2] = [3], [3] = [] };
var dist = new Dictionary<int, int> { [0] = 0 };
var queue = new Queue<int>([0]);
while (queue.Count > 0)
{
    int node = queue.Dequeue();
    foreach (int next in graph[node])
        if (dist.TryAdd(next, dist[node] + 1))   // first visit only
            queue.Enqueue(next);
}
Console.WriteLine(dist[3]);   // 2
`,
      python: src`
from collections import deque

graph = {0: [1, 2], 1: [3], 2: [3], 3: []}
dist = {0: 0}
queue = deque([0])
while queue:
    node = queue.popleft()
    for nxt in graph[node]:
        if nxt not in dist:          # first visit only
            dist[nxt] = dist[node] + 1
            queue.append(nxt)
print(dist[3])   # 2
`,
    },
    {
      id: "counter",
      topic: "Interview idioms",
      title: "Counting: Counter vs Dictionary",
      bigO: "O(n)",
      csharp: src`
string text = "banana";
var counts = new Dictionary<char, int>();
foreach (char c in text)
    counts[c] = counts.GetValueOrDefault(c) + 1;
Console.WriteLine(counts['a']);                    // 3
var top = counts.OrderByDescending(kv => kv.Value).First();
Console.WriteLine($"{top.Key} {top.Value}");       // a 3
var byLinq = text.GroupBy(c => c).ToDictionary(g => g.Key, g => g.Count());
Console.WriteLine(byLinq['n']);                    // 2
int[] letters = new int[26];                       // fixed alphabet: an array is fastest
foreach (char c in text) letters[c - 'a']++;
Console.WriteLine(letters['b' - 'a']);             // 1
`,
      python: src`
from collections import Counter

counts = Counter("banana")
print(counts["a"])                 # 3
print(counts["z"])                 # 0: missing keys count as 0
print(counts.most_common(1))       # [('a', 3)]
print(Counter("listen") == Counter("silent"))   # True: anagram check
counts.update("aa")                # add more
print(counts["a"])                 # 5
`,
    },
    {
      id: "defaultdict",
      topic: "Interview idioms",
      title: "Map of lists: defaultdict vs TryGetValue",
      csharp: src`
var edges = new[] { ("a", "b"), ("a", "c"), ("b", "c") };
var adj = new Dictionary<string, List<string>>();
foreach (var (from, to) in edges)
{
    if (!adj.TryGetValue(from, out var list))
        adj[from] = list = new List<string>();
    list.Add(to);
}
Console.WriteLine(string.Join(",", adj["a"]));   // b,c
Console.WriteLine(adj.ContainsKey("c"));         // False
`,
      python: src`
from collections import defaultdict

edges = [("a", "b"), ("a", "c"), ("b", "c")]
adj = defaultdict(list)            # missing key -> new empty list
for frm, to in edges:
    adj[frm].append(to)
print(adj["a"])                    # ['b', 'c']
print("c" in adj)                  # False ("in" doesn't create keys)
print(adj["c"])                    # [] ...but reading does!
`,
    },
    {
      id: "limits",
      topic: "Interview idioms",
      title: "Integer limits and infinity",
      csharp: src`
Console.WriteLine(int.MaxValue);     // 2147483647
Console.WriteLine(int.MinValue);     // -2147483648
Console.WriteLine(long.MaxValue);    // 9223372036854775807
int best = int.MaxValue;             // "nothing found yet" for a minimum
best = Math.Min(best, 42);
Console.WriteLine(best);             // 42
int big = int.MaxValue;
Console.WriteLine(big + 1);          // -2147483648: silent wraparound
long safe = (long)big + 1;           // widen BEFORE the arithmetic
Console.WriteLine(safe);             // 2147483648
int lo = 1_500_000_000, hi = 2_000_000_000;
Console.WriteLine(lo + (hi - lo) / 2);   // 1750000000: (lo + hi) / 2 would overflow
Console.WriteLine(double.PositiveInfinity > 1e308);   // True
`,
      python: src`
import math
import sys

print(sys.maxsize)              # 9223372036854775807: not a real limit
print(2 ** 100)                 # ints never overflow
best = math.inf                 # or float("inf")
best = min(best, 42)
print(best)                     # 42
print(-math.inf < -10**100)     # True
print(math.isqrt(17), 17 // 4, abs(-3))   # 4 4 3
print(math.gcd(12, 18))         # 6
`,
      note: "In C#, `checked(a + b)` throws `OverflowException` instead of wrapping. Use `long` for sums and products of large ints.",
    },
    {
      id: "bisect",
      topic: "Interview idioms",
      title: "Binary search built-ins",
      bigO: "O(log n)",
      csharp: src`
int[] sorted = { 1, 3, 5, 7 };
Console.WriteLine(Array.BinarySearch(sorted, 5));    // 2
int i = Array.BinarySearch(sorted, 4);               // not found: negative
Console.WriteLine(~i);                               // 2: where 4 would go
var list = new List<int>(sorted);
int pos = list.BinarySearch(6);
list.Insert(pos < 0 ? ~pos : pos, 6);                // keep it sorted
Console.WriteLine(string.Join(",", list));           // 1,3,5,6,7
`,
      python: src`
import bisect

a = [1, 3, 5, 7]
print(bisect.bisect_left(a, 5))     # 2: first index >= 5
print(bisect.bisect_left(a, 4))     # 2: where 4 would go
print(bisect.bisect_right(a, 5))    # 3: first index > 5
bisect.insort(a, 6)                 # keep it sorted (insert is O(n))
print(a)                            # [1, 3, 5, 6, 7]
`,
    },
    {
      id: "memo",
      topic: "Interview idioms",
      title: "Memoization",
      csharp: src`
var memo = new Dictionary<int, long>();
Console.WriteLine(Fib(80));     // 23416728348467685

long Fib(int n)
{
    if (n < 2) return n;
    if (memo.TryGetValue(n, out long cached)) return cached;
    return memo[n] = Fib(n - 1) + Fib(n - 2);
}
`,
      python: src`
from functools import cache


@cache                          # remembers every (args) -> result
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)


print(fib(80))                  # 23416728348467685
# Deep recursion: sys.setrecursionlimit(10_000), or rewrite as a loop
`,
    },
    {
      id: "two-pointers",
      topic: "Interview idioms",
      title: "Index tricks: two pointers, reversed, zip",
      csharp: src`
int[] a = { 1, 2, 4, 7, 11 };
int lo = 0, hi = a.Length - 1, target = 9;
while (lo < hi)
{
    int sum = a[lo] + a[hi];
    if (sum == target) break;
    if (sum < target) lo++; else hi--;
}
Console.WriteLine($"{a[lo]}+{a[hi]}");       // 2+7
for (int i = a.Length - 1; i >= 0; i--) Console.Write(a[i] + " ");   // 11 7 4 2 1
Console.WriteLine();
foreach (var (x, y) in a.Zip(a.Skip(1))) Console.Write(y - x);      // 1234
`,
      python: src`
a = [1, 2, 4, 7, 11]
lo, hi, target = 0, len(a) - 1, 9
while lo < hi:
    s = a[lo] + a[hi]
    if s == target:
        break
    if s < target:
        lo += 1
    else:
        hi -= 1
print(f"{a[lo]}+{a[hi]}")                 # 2+7
print(*reversed(a))                        # 11 7 4 2 1
print("".join(str(y - x) for x, y in zip(a, a[1:])))   # 1234
`,
    },
  ],
};
