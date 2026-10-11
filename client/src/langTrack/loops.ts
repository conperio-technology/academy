import { src, type LangLessonData } from "./types.ts";

export const loops: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Counting loops",
      csharp: src`
for (int i = 0; i < 5; i++)          // start; keep going while; step
    Console.Write($"{i} ");          // 0 1 2 3 4
Console.WriteLine();

for (int i = 10; i > 0; i -= 3)      // counting down by 3
    Console.Write($"{i} ");          // 10 7 4 1
Console.WriteLine();
`,
      python: src`
for i in range(5):                   # 0 up to, not including, 5
    print(i, end=" ")                # 0 1 2 3 4
print()

for i in range(10, 0, -3):           # start, stop, step
    print(i, end=" ")                # 10 7 4 1
print()
`,
      notes: [
        "A loop repeats a block of code. Each repetition is called an iteration. C#'s `for` has three parts in the parentheses: what to do before starting (`int i = 0`), the condition checked before every iteration (`i < 5`), and what to do after each one (`i++`).",
        "Python's `for` always walks through a sequence, and `range` produces the numbers. `range(5)` is 0 to 4, `range(2, 5)` is 2 to 4, and `range(10, 0, -3)` counts down. The stop value is never included, the same \"up to but not including\" rule as slicing.",
        "`Console.Write` prints without a line break, like Python's `print(x, end=\" \")`.",
      ],
    },
    {
      kind: "code",
      title: "Looping over a collection, with and without the index",
      csharp: src`
string[] tags = { "PT-101", "TT-205", "FT-330" };

foreach (string tag in tags)                 // just the items
    Console.WriteLine(tag);

for (int i = 0; i < tags.Length; i++)        // index and item
    Console.WriteLine($"{i}: {tags[i]}");

foreach (var (i, tag) in tags.Index())       // .NET 9 and later
    Console.WriteLine($"{i + 1}. {tag}");
`,
      python: src`
tags = ["PT-101", "TT-205", "FT-330"]

for tag in tags:                             # just the items
    print(tag)

for i in range(len(tags)):                   # index and item, the long way
    print(f"{i}: {tags[i]}")

for i, tag in enumerate(tags, start=1):      # the Python way
    print(f"{i}. {tag}")
`,
      notes: [
        "`foreach` (C#) and `for ... in` (Python) visit each item in order without you managing an index, so they can't go out of range. Prefer them whenever you don't need the position.",
        "When you do need the position, Python's `enumerate` hands you (index, item) pairs, optionally starting from 1. C#'s classic answer is the counting `for` loop; .NET 9 added `Index()`, which works like enumerate. `for i in range(len(tags))` works in Python but is considered clumsy.",
      ],
    },
    {
      kind: "code",
      title: "while loops, break and continue",
      csharp: src`
int pressure = 20;
while (pressure < 100)          // check first, then run the body
{
    pressure += 30;
}
Console.WriteLine(pressure);    // 110

int[] values = { 4, -1, 7, 0, 9 };
foreach (int v in values)
{
    if (v < 0) continue;        // skip to the next item
    if (v == 0) break;          // leave the loop entirely
    Console.Write($"{v} ");     // 4 7
}
Console.WriteLine();

int tries = 0;
do { tries++; } while (tries < 0);   // the body runs at least once
Console.WriteLine(tries);            // 1
`,
      python: src`
pressure = 20
while pressure < 100:           # check first, then run the body
    pressure += 30
print(pressure)                 # 110

values = [4, -1, 7, 0, 9]
for v in values:
    if v < 0:
        continue                # skip to the next item
    if v == 0:
        break                   # leave the loop entirely
    print(v, end=" ")           # 4 7
print()

tries = 0
while True:                     # Python has no do-while
    tries += 1
    if not tries < 0:
        break
print(tries)                    # 1
`,
      notes: [
        "A `while` loop repeats as long as its condition is true, for when you don't know in advance how many iterations you'll need. If nothing in the body moves the condition towards false, the loop never ends: an infinite loop. The academy's exercise runner stops those with a timeout.",
        "`continue` skips the rest of the current iteration; `break` leaves the loop. In nested loops both affect only the innermost loop. C#'s `do { } while (...)` checks after the body, so it always runs at least once; in Python write `while True:` with a `break`.",
      ],
    },
    {
      kind: "code",
      title: "Off-by-one errors",
      csharp: src`
int[] data = { 3, 8, 5 };

// Wrong: i <= data.Length visits index 3, which doesn't exist
try
{
    for (int i = 0; i <= data.Length; i++) Console.Write(data[i] + " ");
}
catch (IndexOutOfRangeException)
{
    Console.WriteLine("\nIndexOutOfRangeException");
}

// Fence posts: 4 posts need 3 gaps between them
int posts = 4;
Console.WriteLine($"{posts} posts, {posts - 1} gaps");
`,
      python: src`
data = [3, 8, 5]

# Wrong: range(len(data) + 1) visits index 3, which doesn't exist
try:
    for i in range(len(data) + 1):
        print(data[i], end=" ")
except IndexError:
    print("\nIndexError")

# Fence posts: 4 posts need 3 gaps between them
posts = 4
print(f"{posts} posts, {posts - 1} gaps")
`,
      notes: [
        "An off-by-one error is a loop that runs one time too many or too few. It's the most common loop bug, usually from mixing up `<` and `<=`, or from forgetting that indexes stop at length minus 1. Each wrong program above prints 3 8 5 and then fails.",
        "Two habits help. Use half-open ranges, which include the start and exclude the end (`i < n`, `range(n)`): then the number of iterations is simply end minus start. And check the edges by hand: what happens with an empty list, one item, and the last item?",
      ],
    },
    {
      kind: "code",
      title: "Walking two lists together, and nested loops",
      csharp: src`
string[] names = { "Pump", "Fan", "Valve" };
int[] amps = { 12, 3, 1 };

foreach (var (name, a) in names.Zip(amps))
    Console.WriteLine($"{name}: {a} A");

for (int row = 1; row <= 3; row++)            // nested: 3 x 3 = 9 iterations
{
    for (int col = 1; col <= 3; col++)
        Console.Write($"{row * col,3}");
    Console.WriteLine();
}
`,
      python: src`
names = ["Pump", "Fan", "Valve"]
amps = [12, 3, 1]

for name, a in zip(names, amps):
    print(f"{name}: {a} A")

for row in range(1, 4):                       # nested: 3 x 3 = 9 iterations
    for col in range(1, 4):
        print(f"{row * col:3}", end="")
    print()
`,
      notes: [
        "`zip` pairs up items at the same position in two (or more) sequences and stops at the shorter one; C#'s LINQ `Zip` does the same. A loop inside a loop runs the inner body once for every combination: n times m iterations. That multiplication is where O(n²) running times come from, which the Big O lessons cover.",
      ],
    },
  ],
  predict: [
    {
      lang: "python",
      code: src`
print(list(range(2, 10, 3)))
print(list(range(5, 0, -1)))
`,
      output: "[2, 5, 8]\n[5, 4, 3, 2, 1]",
      distractors: ["[2, 5, 8, 11]\n[5, 4, 3, 2, 1]", "[2, 5, 8]\n[5, 4, 3, 2, 1, 0]", "[3, 6, 9]\n[4, 3, 2, 1, 0]"],
      why: "`range(2, 10, 3)` starts at 2 and adds 3 while staying below 10: 2, 5, 8. Counting down, the stop value 0 is still excluded.",
    },
    {
      lang: "python",
      code: src`
for i in range(3):
    pass
print(i)
`,
      output: "2",
      distractors: ["3", "NameError", "0"],
      why: "The loop variable survives the loop in Python and keeps the last value it was given, 2. `range(3)` never produces 3. (In C# a variable declared in the `for` header doesn't exist after the loop.)",
    },
    {
      lang: "csharp",
      code: src`
int i;
for (i = 0; i < 3; i++) { }
Console.WriteLine(i);
`,
      output: "3",
      distractors: ["2", "0", "Compile error"],
      why: "Declared outside the loop, `i` is still there afterwards. The loop stops when the condition `i < 3` fails, which happens when `i` is 3. Compare with Python, where the last value handed out by `range(3)` is 2.",
    },
    {
      lang: "csharp",
      code: src`
int n = 0, total = 0;
while (n < 6)
{
    n++;
    if (n % 2 == 0) continue;
    total += n;
}
Console.WriteLine(total);
`,
      output: "9",
      distractors: ["6", "15", "12"],
      why: "n takes the values 1 to 6 inside the loop. Even values skip the add, so total is 1 + 3 + 5 = 9.",
    },
    {
      lang: "python",
      code: src`
for n in [3, 5, 7]:
    if n % 2 == 0:
        print("found even", n)
        break
else:
    print("no even numbers")
`,
      output: "no even numbers",
      distractors: ["no even numbers\nno even numbers\nno even numbers", "(nothing)", "SyntaxError"],
      why: "A Python loop can have an `else` block, which runs only if the loop finished without `break`. No even number, no break, so it runs. It's a little-known feature; many teams prefer a flag variable for clarity.",
    },
    {
      lang: "python",
      code: src`
for i, c in enumerate("abc", start=1):
    print(i, c)
`,
      output: "1 a\n2 b\n3 c",
      distractors: ["0 a\n1 b\n2 c", "1 abc", "a 1\nb 2\nc 3"],
      why: "`enumerate` yields (position, item) pairs, and `start=1` makes the count begin at 1. A string is a sequence of characters, so the items are \"a\", \"b\", \"c\".",
    },
    {
      lang: "csharp",
      code: src`
int[] a = { 10, 20, 30 };
int sum = 0;
for (int i = 1; i < a.Length; i++) sum += a[i];
Console.WriteLine(sum);
`,
      output: "50",
      distractors: ["60", "IndexOutOfRangeException", "30"],
      why: "Starting at 1 skips index 0, so only 20 and 30 are added. An off-by-one at the start of the range: no crash, just a wrong answer, which is worse.",
    },
    {
      lang: "python",
      code: src`
for i in range(3):
    print(i)
    i = 10
`,
      output: "0\n1\n2",
      distractors: ["0", "0\n10", "0\n11\n12"],
      why: "Assigning to the loop variable changes it only until the next iteration, when `for` hands out the next value from `range`. To jump ahead you need a `while` loop that manages its own counter.",
    },
    {
      lang: "python",
      code: src`
for i in range(3):
    for j in range(3):
        if j == 1:
            break
        print(i, j)
`,
      output: "0 0\n1 0\n2 0",
      distractors: ["0 0", "0 0\n0 1\n0 2", "0 0\n1 0\n1 1\n2 0"],
      why: "`break` leaves only the innermost loop. Each outer iteration prints the `j == 0` line, then the inner loop breaks at `j == 1`.",
    },
    {
      lang: "csharp",
      code: src`
int k = 10;
do
{
    Console.WriteLine(k);
    k++;
} while (k < 5);
`,
      output: "10",
      distractors: ["(nothing)", "10\n11\n12\n13\n14", "5"],
      why: "A do-while runs the body first and checks the condition afterwards, so it always runs at least once, even though 10 < 5 is false from the start.",
    },
  ],
  pitfalls: [
    "Using `<=` with a length, or `range(len(x) + 1)`. Indexes stop at length minus 1.",
    "A `while` loop whose body never changes the condition. Make sure every path through the body moves towards the exit.",
    "Changing a list while a `foreach` or `for ... in` loop is walking it. The Collections lesson shows what goes wrong and the fixes.",
    "Expecting `break` to leave every loop in a nest. It leaves only the innermost one; move the loops into a function and `return` instead.",
    "Recomputing something expensive inside a loop that doesn't change between iterations. Work it out once before the loop.",
  ],
  next: [
    { id: "big-o-notation", label: "Big O Notation: how loop counts turn into running time" },
    { id: "basics-sum-of-evens", label: "Exercise: Sum of the Even Numbers" },
    { id: "basics-fizzbuzz", label: "Exercise: FizzBuzz as a List" },
    { id: "lang-functions", label: "Next: Functions" },
  ],
};
