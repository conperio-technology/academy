import { src, type LangLessonData } from "./types.ts";

export const functions: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Defining and calling a function",
      csharp: src`
Console.WriteLine(Add(2, 3));          // 5
Console.WriteLine(Area(2.0, 4.5));     // 9
PrintBanner("Shift report");

// return type, name, parameters with their types
static int Add(int a, int b)
{
    return a + b;
}

// one-expression body with =>
static double Area(double width, double height) => width * height;

// void = returns nothing
static void PrintBanner(string title)
{
    Console.WriteLine($"=== {title} ===");
}
`,
      python: src`
def add(a, b):
    return a + b


def area(width, height):
    """Area of a rectangle. (A docstring: the function's built-in help.)"""
    return width * height


def print_banner(title):
    print(f"=== {title} ===")   # no return: gives back None


print(add(2, 3))          # 5
print(area(2.0, 4.5))     # 9.0
print_banner("Shift report")
`,
      notes: [
        "A function is a named, reusable block of code. It takes inputs, called parameters (the names in the definition) or arguments (the actual values you pass in a call), and can return a result with `return`. `return` also ends the function immediately.",
        "C# states the type of every parameter and of the result (`int`, `double`; `void` means \"returns nothing\"). Inside a class a function is called a method; in a small top-level program like this one the functions can sit below the code that calls them. Python's `def` lists only names, and a Python function must be defined before the line that calls it runs, which is why the calls come last.",
        "A Python function without a `return` statement returns `None`. A C# method that isn't `void` must return a value on every path, or it won't compile.",
      ],
    },
    {
      kind: "code",
      title: "Default values and named arguments",
      csharp: src`
Console.WriteLine(Greet("Ada"));                    // Hello, Ada!
Console.WriteLine(Greet("Ada", "Welcome back"));    // Welcome back, Ada!
Console.WriteLine(Greet(greeting: "Hi", name: "Linus"));  // Hi, Linus!

static string Greet(string name, string greeting = "Hello")
{
    return $"{greeting}, {name}!";
}
`,
      python: src`
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"


print(greet("Ada"))                       # Hello, Ada!
print(greet("Ada", "Welcome back"))       # Welcome back, Ada!
print(greet(greeting="Hi", name="Linus")) # Hi, Linus!
`,
      notes: [
        "A default value makes a parameter optional: leave it out and the default is used. Parameters with defaults come after the ones without.",
        "A named argument (C# `greeting: \"Hi\"`, Python `greeting=\"Hi\"`) says which parameter a value is for, so the order no longer matters and a call like `Connect(host, port, true, false)` can become readable: `Connect(host, port, useTls: true, retry: false)`.",
        "C# defaults must be constants known when compiling. Python evaluates a default once, when the `def` line runs, and reuses that same object on every call. With a list or dictionary as the default that causes a famous bug; see the questions below.",
      ],
    },
    {
      kind: "code",
      title: "Returning more than one value",
      csharp: src`
int[] temps = { 18, 25, 21, 30 };
var (low, high) = MinMax(temps);          // unpack the tuple
Console.WriteLine($"{low} to {high}");    // 18 to 30

static (int Min, int Max) MinMax(int[] values)
{
    int min = values[0], max = values[0];
    foreach (int v in values)
    {
        if (v < min) min = v;
        if (v > max) max = v;
    }
    return (min, max);
}
`,
      python: src`
def min_max(values):
    lo = hi = values[0]
    for v in values:
        if v < lo:
            lo = v
        if v > hi:
            hi = v
    return lo, hi             # really one tuple: (lo, hi)


temps = [18, 25, 21, 30]
low, high = min_max(temps)    # unpack the tuple
print(f"{low} to {high}")     # 18 to 30
`,
      notes: [
        "A tuple is a small, fixed group of values kept together. Both languages return several values by returning one tuple, and the caller unpacks it into separate variables. C#'s tuple elements can have names (`Min`, `Max`); Python's `return lo, hi` makes a tuple without needing parentheses. The Collections lesson has more on tuples.",
      ],
    },
    {
      kind: "code",
      title: "Scope: where a name is visible",
      csharp: src`
int total = 0;          // a top-level variable

AddToTotal(5);
AddToTotal(7);
Console.WriteLine(total);   // 12

// A local function (no "static") can see and change variables around it.
void AddToTotal(int amount)
{
    int doubled = amount * 2;   // doubled exists only inside this call
    total += amount;
}
// Console.WriteLine(doubled);  // error CS0103: doubled does not exist here
`,
      python: src`
total = 0               # a global variable


def add_to_total(amount):
    global total        # without this line, "total +=" fails
    doubled = amount * 2    # doubled exists only inside this call
    total += amount


def broken(amount):
    total += amount     # assigning makes total local to this function...


add_to_total(5)
add_to_total(7)
print(total)            # 12
try:
    broken(1)
except UnboundLocalError as e:
    print("UnboundLocalError:", e)
`,
      notes: [
        "Scope is the region of code where a name can be used. A variable created inside a function is local: it exists only while that call runs, and other functions can't see it. Every call gets fresh local variables.",
        "Python decides scope by assignment: if a function assigns to a name anywhere, that name is local throughout the function, so `total += amount` tries to read a local `total` that has no value yet and raises `UnboundLocalError`. `global total` says \"use the module's variable\". Reading a global without assigning to it needs no declaration.",
        "In C#, a method inside a class can see the class's fields but not other methods' locals. A local function (a function declared inside another, or in top-level code as here) can see and change the variables around it; mark it `static` to forbid that.",
        "Changing variables outside the function is a side effect. Functions that only use their parameters and return a result, called pure functions, are much easier to test and reason about. Prefer `total = Add(total, 5)` to a function that secretly updates `total`.",
      ],
    },
    {
      kind: "code",
      title: "What a function can change: values and references",
      csharp: src`
int count = 5;
var names = new List<string> { "Ada" };

Bump(count);
AddName(names);
ReplaceList(names);
Console.WriteLine(count);              // 5: Bump changed its own copy
Console.WriteLine(string.Join(",", names));  // Ada,Linus

static void Bump(int n) { n++; }
static void AddName(List<string> list) { list.Add("Linus"); }   // changes the shared list
static void ReplaceList(List<string> list) { list = new List<string>(); }  // only the local name
`,
      python: src`
def bump(n):
    n += 1                  # rebinds the local name only


def add_name(lst):
    lst.append("Linus")     # changes the shared list


def replace_list(lst):
    lst = []                # rebinds the local name only


count = 5
names = ["Ada"]
bump(count)
add_name(names)
replace_list(names)
print(count)                # 5
print(",".join(names))      # Ada,Linus
`,
      notes: [
        "When you pass a number, the function gets its own copy (C#) or a name for an unchangeable value (Python), so the caller's variable can't change. When you pass a list, the function receives a reference, a way of reaching the same list object. Calling methods on it, like `Add` or `append`, changes the one list both sides see. Assigning a new list to the parameter only repoints the function's local name; the caller's list is untouched.",
        "The rules are the same in both languages for this kind of code, and the Stack vs Heap and Garbage Collection lesson shows the memory behind it. C# can also pass a variable itself with `ref`, letting the function reassign the caller's variable; Python has no equivalent, so return the new value instead.",
      ],
    },
    {
      kind: "code",
      title: "A function that calls itself",
      csharp: src`
Console.WriteLine(Factorial(5));   // 120

static long Factorial(int n)
{
    if (n <= 1) return 1;          // base case: stop here
    return n * Factorial(n - 1);   // smaller version of the same problem
}
`,
      python: src`
def factorial(n):
    if n <= 1:
        return 1                   # base case: stop here
    return n * factorial(n - 1)    # smaller version of the same problem


print(factorial(5))   # 120
`,
      notes: [
        "Recursion is a function calling itself on a smaller input until it reaches a base case it can answer directly. It's the natural fit for trees, nested data and divide-and-conquer algorithms. Each call waits on the call stack for the one below it, so very deep recursion runs out of stack: Python stops at about 1,000 levels by default with `RecursionError`, and C# crashes with a stack overflow at a depth that depends on the frame size. The recursion lessons in Data Structures & Algorithms build this up step by step.",
      ],
    },
  ],
  predict: [
    {
      lang: "python",
      code: src`
def add_item(item, bucket=[]):
    bucket.append(item)
    return bucket

print(add_item(1))
print(add_item(2))
`,
      output: "[1]\n[1, 2]",
      distractors: ["[1]\n[2]", "[1, 2]\n[1, 2]", "TypeError"],
      why: "The default list is created once, when `def` runs, and every call that leaves out `bucket` shares it. The fix: `def add_item(item, bucket=None):` then `if bucket is None: bucket = []` inside.",
    },
    {
      lang: "python",
      code: src`
def double(x):
    x * 2

print(double(3))
`,
      output: "None",
      distractors: ["6", "3", "(nothing)"],
      why: "The function works out `x * 2` and throws it away. Without `return`, a Python function gives back `None`. C# would refuse to compile a non-void method that never returns.",
    },
    {
      lang: "csharp",
      code: src`
Console.WriteLine(Label("bolt", unit: "boxes"));

static string Label(string name, int qty = 1, string unit = "pcs")
    => $"{qty} {unit} {name}";
`,
      output: "1 boxes bolt",
      distractors: ["1 pcs bolt", "boxes 1 bolt", "Compile error"],
      why: "`qty` is left out, so it takes its default, 1. The named argument skips over it and sets `unit`. Named arguments let you supply just the optional parameters you care about.",
    },
    {
      lang: "csharp",
      code: src`
int a = 5;
var list = new List<int>();
Bump(a);
AddOne(list);
Replace(list);
Console.WriteLine($"{a} {list.Count} {list[0]}");

static void Bump(int n) { n++; }
static void AddOne(List<int> xs) { xs.Add(1); }
static void Replace(List<int> xs) { xs = new List<int> { 99 }; }
`,
      output: "5 1 1",
      distractors: ["6 1 1", "5 1 99", "6 2 99"],
      why: "`Bump` changes its own copy of the int. `AddOne` changes the shared list. `Replace` points its local parameter at a new list, which the caller never sees.",
    },
    {
      lang: "python",
      code: src`
def change(xs):
    xs.append(4)
    xs = [0]
    xs.append(5)

nums = [1, 2, 3]
change(nums)
print(nums)
`,
      output: "[1, 2, 3, 4]",
      distractors: ["[0, 5]", "[1, 2, 3, 4, 5]", "[1, 2, 3]"],
      why: "The first `append` changes the caller's list. Then `xs = [0]` points the local name at a brand new list, so the second `append` changes that new list, which is thrown away when the function ends.",
    },
    {
      lang: "python",
      code: src`
count = 0

def bump():
    global count
    count += 1

def show():
    print(count)

bump()
bump()
show()
`,
      output: "2",
      distractors: ["0", "UnboundLocalError", "1"],
      why: "`global count` lets `bump` assign to the module-level variable. `show` only reads `count`, and reading a global needs no declaration.",
    },
    {
      lang: "csharp",
      code: src`
var (lo, hi) = Range(new[] { 4, 9, 1 });
Console.WriteLine($"{lo}..{hi}");

static (int Min, int Max) Range(int[] xs) => (xs.Min(), xs.Max());
`,
      output: "1..9",
      distractors: ["4..1", "(1, 9)", "9..1"],
      why: "The method returns a tuple, and `var (lo, hi) = ...` unpacks it by position into two variables. `Min()` and `Max()` are LINQ methods available on any array.",
    },
    {
      lang: "python",
      code: src`
def f(n):
    if n == 0:
        return "done"
    return f(n - 1) + "!"

print(f(3))
`,
      output: "done!!!",
      distractors: ["!!!done", "done!", "done"],
      why: "f(3) waits for f(2), which waits for f(1), which waits for f(0) = \"done\". Then each waiting call adds its \"!\" on the way back up: three of them.",
    },
  ],
  pitfalls: [
    "A mutable default in Python (`def f(x, items=[])`). Use `None` and create the list inside.",
    "Forgetting `return` in Python, so the caller gets `None`, usually discovered much later as `'NoneType' object has no attribute ...`.",
    "Functions that quietly change their arguments or global variables. Return new values instead where you can, and name changing functions clearly (`AddName`, not `GetNames`).",
    "Shadowing: a parameter or local with the same name as an outer variable hides it. In Python, naming a variable `list`, `str` or `max` hides the built-in for the rest of that scope.",
    "Recursion without a reachable base case, which ends in a stack overflow or `RecursionError`.",
  ],
  next: [
    { id: "recursion-factorial", label: "Recursion: Factorial (Data Structures & Algorithms)" },
    { id: "stack-heap-gc", label: "Stack vs Heap and Garbage Collection: what calls and references look like in memory" },
    { id: "basics-greeting", label: "Exercise: Greeting with a Default" },
    { id: "lang-collections", label: "Next: Collections" },
  ],
};
