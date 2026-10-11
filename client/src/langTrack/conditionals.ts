import { src, type LangLessonData } from "./types.ts";

export const conditionals: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "if, else if, else",
      csharp: src`
double tankLevel = 72.5;   // percent

if (tankLevel >= 90)
{
    Console.WriteLine("High: stop the fill pump");
}
else if (tankLevel >= 20)
{
    Console.WriteLine("Normal");
}
else
{
    Console.WriteLine("Low: start the fill pump");
}
`,
      python: src`
tank_level = 72.5   # percent

if tank_level >= 90:
    print("High: stop the fill pump")
elif tank_level >= 20:
    print("Normal")
else:
    print("Low: start the fill pump")
`,
      notes: [
        "A conditional runs code only when a condition is true. The conditions are checked top to bottom and only the first true branch runs, so order matters: checking `>= 20` before `>= 90` would make the High branch unreachable.",
        "C# puts the condition in parentheses and the branch in braces, and spells the middle part `else if`. Python ends each condition with a colon, indents the branch, and spells it `elif`.",
      ],
    },
    {
      kind: "table",
      title: "Comparison and logical operators",
      head: ["Meaning", "C#", "Python"],
      rows: [
        ["equal, not equal", "`==`, `!=`", "`==`, `!=`"],
        ["less, less or equal (and greater)", "`<`, `<=`, `>`, `>=`", "`<`, `<=`, `>`, `>=`"],
        ["and, or, not", "`&&`, `||`, `!`", "`and`, `or`, `not`"],
        ["in a range", "`x >= 0 && x < 10` or `x is >= 0 and < 10`", "`0 <= x < 10` (chained)"],
        ["is it null / None", "`x == null` or `x is null`", "`x is None`"],
        ["same object (not just equal)", "`ReferenceEquals(a, b)`", "`a is b`"],
      ],
      notes: [
        "`=` assigns and `==` compares, in both languages. C# refuses `if (x = 5)` for an int x, and Python refuses `if x = 5:`, so this classic C bug is caught for you.",
      ],
    },
    {
      kind: "code",
      title: "Short-circuit evaluation",
      csharp: src`
List<int>? readings = null;

// && stops as soon as the left side is false, so .Count is never touched on null
if (readings != null && readings.Count > 0)
    Console.WriteLine("Have data");
else
    Console.WriteLine("No data");

string? user = null;
Console.WriteLine(user == null || user.Length == 0 ? "anonymous" : user);
`,
      python: src`
readings = None

# "and" stops as soon as the left side is false, so len() never sees None
if readings is not None and len(readings) > 0:
    print("Have data")
else:
    print("No data")

user = None
print("anonymous" if user is None or len(user) == 0 else user)
`,
      notes: [
        "Short-circuit evaluation means the right side of `&&` / `and` runs only if the left side is true, and the right side of `||` / `or` runs only if the left side is false, because otherwise the answer is already known. That makes \"check it exists, then use it\" safe in one line. Swap the two sides and the program crashes on null or None.",
        "C# also has `&` and `|` on bools, which always evaluate both sides. You rarely want them in conditions.",
      ],
    },
    {
      kind: "code",
      title: "Truthiness: Python's shortcut, C#'s strictness",
      csharp: src`
int count = 0;
string name = "";
List<int> items = new();

// C# conditions must be bool, so say exactly what you mean:
if (count != 0) Console.WriteLine("count is set");
if (!string.IsNullOrEmpty(name)) Console.WriteLine("name is set");
if (items.Count > 0) Console.WriteLine("items exist");
Console.WriteLine("done");
`,
      python: src`
count = 0
name = ""
items = []

# Python treats empty and zero values as false:
if count: print("count is set")
if name: print("name is set")
if items: print("items exist")
print("done")

print(bool(0), bool(""), bool([]), bool(None))   # all False
print(bool(-1), bool(" "), bool([0]), bool("False"))  # all True
`,
      notes: [
        "In Python any value can stand in a condition. These count as false (falsy): `False`, `None`, `0`, `0.0`, the empty string, and empty collections (`[]`, `{}`, `set()`, `()`). Everything else is true (truthy), including the string \"False\", a single space, and a list holding a zero. `if items:` is the idiomatic way to say \"if the list isn't empty\".",
        "C# allows only real bools in conditions. `if (count)` is error CS0029, cannot convert int to bool. That's more typing, but it can't confuse 0 with \"missing\".",
        "Python's `and` and `or` return one of their operands, not necessarily True or False: `name or \"guest\"` gives \"guest\" when name is empty. Handy for defaults, but it also replaces a legitimate 0.",
      ],
    },
    {
      kind: "code",
      title: "One-line choices: the conditional expression",
      csharp: src`
int stock = 3;
string label = stock > 0 ? "in stock" : "sold out";   // condition ? if-true : if-false
Console.WriteLine(label);
Console.WriteLine($"{stock} {(stock == 1 ? "item" : "items")}");
`,
      python: src`
stock = 3
label = "in stock" if stock > 0 else "sold out"   # if-true if condition else if-false
print(label)
print(f"{stock} {'item' if stock == 1 else 'items'}")
`,
      notes: [
        "Both languages have an expression version of if/else that produces a value, often called the ternary operator because it has three parts. The order differs: C# puts the condition first, `cond ? a : b`; Python puts the true value first, `a if cond else b`. Use it for short choices; nesting several gets hard to read quickly.",
      ],
    },
    {
      kind: "code",
      title: "switch and match: choosing among many cases",
      csharp: src`
int statusCode = 503;

switch (statusCode)            // switch statement
{
    case 200:
        Console.WriteLine("OK");
        break;                 // every case must end with break (or return)
    case 301:
    case 302:                  // stacked labels share a body
        Console.WriteLine("Redirect");
        break;
    default:
        Console.WriteLine("Something else");
        break;
}

string kind = statusCode switch      // switch expression gives a value
{
    >= 200 and < 300 => "success",
    >= 400 and < 500 => "client error",
    >= 500 => "server error",
    _ => "other",                    // _ matches anything
};
Console.WriteLine(kind);             // server error
`,
      python: src`
status_code = 503

match status_code:          # Python 3.10 and later
    case 200:
        print("OK")         # no break needed, no fall-through
    case 301 | 302:         # | means "or"
        print("Redirect")
    case _:                 # _ matches anything
        print("Something else")

# Ranges are clearer with if/elif:
if 200 <= status_code < 300:
    kind = "success"
elif 400 <= status_code < 500:
    kind = "client error"
elif status_code >= 500:
    kind = "server error"
else:
    kind = "other"
print(kind)                 # server error
`,
      notes: [
        "A switch compares one value against a list of cases. C#'s switch statement needs `break` at the end of each case; it never falls through into the next case (a C and Java habit), and the compiler rejects a case that would. C#'s newer switch expression returns a value and accepts patterns such as `>= 500` and `and`. `default` and `_` catch everything else.",
        "Python's `match` (added in 3.10) looks like a switch but is really pattern matching. Literal cases such as `case 200:` compare values. A bare name such as `case RED:` does not compare with a variable called RED: it captures, meaning it matches anything and assigns the value to that name. Compare with a dotted name such as `Color.RED`, or use if/elif.",
      ],
    },
  ],
  predict: [
    {
      lang: "python",
      code: src`
x = 0
if x:
    print("yes")
else:
    print("no")
print(bool("False"), bool(""))
`,
      output: "no\nTrue False",
      distractors: ["yes\nFalse False", "no\nFalse False", "yes\nTrue False"],
      why: "0 is falsy, so the else branch runs. Any non-empty string is truthy, even \"False\"; only the empty string is falsy.",
    },
    {
      lang: "python",
      code: src`
print([] or "empty", 0 and 5, 3 and 5)
`,
      output: "empty 0 5",
      distractors: ["True False True", "empty False True", "[] 0 3"],
      why: "`or` returns the first truthy operand (or the last one): `[]` is falsy, so \"empty\". `and` returns the first falsy operand (or the last one): 0 is falsy, so 0; 3 is truthy, so it returns 5.",
    },
    {
      lang: "python",
      code: src`
x = 5
print(1 < x < 10, 10 < x > 1)
`,
      output: "True False",
      distractors: ["True True", "False False", "TypeError"],
      why: "Python chains comparisons: `1 < x < 10` means `1 < x and x < 10`. `10 < x > 1` means `10 < x and x > 1`, and 10 < 5 is false.",
    },
    {
      lang: "csharp",
      code: src`
int calls = 0;
bool Check() { calls++; return true; }

bool a = false && Check();
bool b = true || Check();
bool c = false & Check();
Console.WriteLine($"{a} {b} {c} {calls}");
`,
      output: "False True False 1",
      distractors: ["False True False 3", "False True False 0", "True True True 1"],
      why: "`&&` with a false left side and `||` with a true left side already know the answer, so `Check()` is skipped. The single `&` always evaluates both sides, so `Check()` runs once.",
    },
    {
      lang: "csharp",
      code: src`
int n = 7;
string size = n > 10 ? "big" : n > 5 ? "medium" : "small";
Console.WriteLine(size);
`,
      output: "medium",
      distractors: ["big", "small", "Compile error"],
      why: "A nested conditional reads like an else-if chain: not over 10, but over 5, so \"medium\". Legal, but past two levels an if/else chain is kinder to readers.",
    },
    {
      lang: "csharp",
      code: src`
int code = 404;
string kind = code switch
{
    200 => "ok",
    >= 400 and < 500 => "client error",
    >= 500 => "server error",
    _ => "other",
};
Console.WriteLine(kind);
`,
      output: "client error",
      distractors: ["other", "server error", "ok"],
      why: "Switch expression arms are tried top to bottom, and 404 matches the relational pattern `>= 400 and < 500`.",
    },
    {
      lang: "python",
      code: src`
RED = "red"
color = "blue"
match color:
    case RED:
        print("matched", RED)
`,
      output: "matched blue",
      distractors: ["(nothing)", "matched red", "NameError"],
      why: "A bare name in a `case` is a capture pattern: it matches anything and assigns the value to that name. So `RED` is overwritten with \"blue\". To compare with a constant, use a dotted name such as `Color.RED` or an `if`.",
    },
    {
      lang: "python",
      code: src`
command = "go north"
match command.split():
    case ["go", direction]:
        print("going", direction)
    case ["stop"]:
        print("stopping")
    case _:
        print("unknown")
`,
      output: "going north",
      distractors: ["unknown", "going direction", "stopping"],
      why: "`split()` gives `[\"go\", \"north\"]`. The first case is a sequence pattern: a two-item list whose first item is \"go\". It matches and captures the second item as `direction`. This is where `match` beats if/elif.",
    },
  ],
  pitfalls: [
    "Putting a broad condition before a narrow one in an else-if chain, so the narrow branch can never run.",
    "In Python, `if value:` when 0 or an empty string is a valid value. Write `if value is not None:` when you mean \"was it provided\".",
    "Using `==` to compare with None in Python. Use `is None`; `==` can be redefined by a class, `is` cannot.",
    "Python `match` with a bare name in a case: it captures instead of comparing.",
    "Forgetting `break` in a C# switch statement is a compile error, not a fall-through; stack the case labels to share code.",
  ],
  next: [
    { id: "logic-gates", label: "Logic Gates: AND, OR and NOT in hardware (Computer Fundamentals)" },
    { id: "basics-letter-grade", label: "Exercise: Letter Grade from a Score" },
    { id: "lang-loops", label: "Next: Loops" },
  ],
};
