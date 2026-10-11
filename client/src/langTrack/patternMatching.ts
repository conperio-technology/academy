import { src, type LangLessonData } from "./types.ts";

export const patternMatching: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Matching on type, properties and ranges",
      csharp: src`
object[] events = [new Alarm("TT-4", 3), new Reading("FT-1", 120.5), new Reading("FT-2", -1), "heartbeat", 42];
foreach (var e in events)
    Console.WriteLine(Describe(e));
// high-priority alarm on TT-4
// FT-1 reads 120.5 (above range)
// FT-2: sensor fault
// text: heartbeat
// something else: Int32

static string Describe(object e) => e switch
{
    Alarm { Priority: >= 3 } a => $"high-priority alarm on {a.Tag}",
    Alarm a => $"alarm on {a.Tag}",
    Reading { Value: < 0 } r => $"{r.Tag}: sensor fault",
    Reading { Value: > 100 and <= 1000 } r => $"{r.Tag} reads {r.Value} (above range)",
    Reading r => $"{r.Tag} reads {r.Value}",
    string s => $"text: {s}",
    null => "nothing",
    _ => $"something else: {e.GetType().Name}",
};

record Alarm(string Tag, int Priority);
record Reading(string Tag, double Value);
`,
      python: src`
from dataclasses import dataclass


@dataclass
class Alarm:
    tag: str
    priority: int


@dataclass
class Reading:
    tag: str
    value: float


def describe(e):
    match e:
        case Alarm(tag=tag, priority=p) if p >= 3:
            return f"high-priority alarm on {tag}"
        case Alarm(tag=tag):
            return f"alarm on {tag}"
        case Reading(tag, value) if value < 0:          # positional, via __match_args__
            return f"{tag}: sensor fault"
        case Reading(tag, value) if 100 < value <= 1000:
            return f"{tag} reads {value} (above range)"
        case Reading(tag, value):
            return f"{tag} reads {value}"
        case str() as s:
            return f"text: {s}"
        case None:
            return "nothing"
        case _:
            return f"something else: {type(e).__name__}"


for e in [Alarm("TT-4", 3), Reading("FT-1", 120.5), Reading("FT-2", -1), "heartbeat", 42]:
    print(describe(e))
# high-priority alarm on TT-4
# FT-1 reads 120.5 (above range)
# FT-2: sensor fault
# text: heartbeat
# something else: int
`,
      notes: [
        "Pattern matching tests a value's shape and pulls pieces out of it in one step. A C# switch expression (`value switch { pattern => result, ... }`) returns the result of the first arm whose pattern matches. Patterns combine: a type pattern (`Alarm a` checks the type and names the result), a property pattern (`{ Priority: >= 3 }`), relational patterns (`< 0`, `>= 3`) and the logical `and`, `or` and `not`. `_` is the discard pattern that matches anything.",
        "Python's `match` statement (3.10+) tries each `case` in order. `Reading(tag, value)` is a class pattern: it checks `isinstance` and binds the attributes, positionally through the class's `__match_args__` (dataclasses set that for you) or by keyword (`priority=p`). `if` after a pattern is a guard, an extra condition. Python has no relational patterns, so ranges go in guards. `str() as s` matches any str and names it.",
        "Order matters in both: put specific cases before general ones. C# refuses to compile an arm that an earlier arm already covers (error CS8510); Python simply never reaches it.",
      ],
    },
    {
      kind: "code",
      title: "Tuples, positions and deconstruction",
      csharp: src`
for (int n = 1; n <= 15; n++)
    Console.Write(FizzBuzz(n) + " ");
Console.WriteLine();
// 1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz

Console.WriteLine(Quadrant(new Point(3, -2)));   // IV
Console.WriteLine(Quadrant(new Point(0, 5)));    // on an axis

static string FizzBuzz(int n) => (n % 3, n % 5) switch
{
    (0, 0) => "FizzBuzz",
    (0, _) => "Fizz",
    (_, 0) => "Buzz",
    _ => n.ToString(),
};

static string Quadrant(Point p) => p switch
{
    (0, _) or (_, 0) => "on an axis",
    ( > 0, > 0) => "I",
    ( < 0, > 0) => "II",
    ( < 0, < 0) => "III",
    _ => "IV",
};

record Point(int X, int Y);    // records can be deconstructed into (X, Y)
`,
      python: src`
def fizz_buzz(n):
    match (n % 3, n % 5):
        case (0, 0):
            return "FizzBuzz"
        case (0, _):
            return "Fizz"
        case (_, 0):
            return "Buzz"
        case _:
            return str(n)


print(" ".join(fizz_buzz(n) for n in range(1, 16)))
# 1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz


def quadrant(x, y):
    match (x, y):
        case (0, _) | (_, 0):
            return "on an axis"
        case (x, y) if x > 0 and y > 0:
            return "I"
        case (x, y) if x < 0 < y:
            return "II"
        case (x, y) if x < 0 and y < 0:
            return "III"
        case _:
            return "IV"


print(quadrant(3, -2), quadrant(0, 5))   # IV on an axis
`,
      notes: [
        "Matching on a tuple tests several values at once, which turns nested `if`s into a readable table. A positional pattern, `(0, _)`, matches each element in turn; for your own C# types it works through a `Deconstruct` method, which records generate. `or` (C#) and `|` (Python) combine alternatives.",
      ],
    },
    {
      kind: "code",
      title: "List patterns: matching sequences",
      csharp: src`
string[][] commands = [["stop"], ["move", "3", "4"], ["say", "hello", "big", "world"], [], ["move", "x"]];
foreach (var c in commands)
    Console.WriteLine(Run(c));
// stopping
// moving to 3,4
// saying: hello big world
// empty command
// bad command: move x

static string Run(string[] words) => words switch
{
    ["stop"] => "stopping",
    ["move", var x, var y] => $"moving to {x},{y}",
    ["say", .. var rest] => $"saying: {string.Join(" ", rest)}",
    [] => "empty command",
    _ => $"bad command: {string.Join(" ", words)}",
};
`,
      python: src`
def run(words):
    match words:
        case ["stop"]:
            return "stopping"
        case ["move", x, y]:
            return f"moving to {x},{y}"
        case ["say", *rest]:
            return f"saying: {' '.join(rest)}"
        case []:
            return "empty command"
        case _:
            return f"bad command: {' '.join(words)}"


for c in [["stop"], ["move", "3", "4"], ["say", "hello", "big", "world"], [], ["move", "x"]]:
    print(run(c))
# stopping
# moving to 3,4
# saying: hello big world
# empty command
# bad command: move x
`,
      notes: [
        "A list pattern (C# 11) matches an array or list element by element: literal values must be equal, `var x` captures one element, `_` skips one, and `..` (C#) or `*rest` (Python) matches any number of elements, optionally capturing them. The length is part of the pattern: `[\"move\", var x, var y]` needs exactly three elements, so `[\"move\", \"x\"]` falls through to the default.",
        "This is how command-line arguments, chat commands and simple protocols are parsed neatly. Python sequence patterns match lists and tuples but deliberately not strings, so a string isn't taken apart character by character.",
      ],
    },
    {
      kind: "code",
      title: "Dictionaries, null checks and the capture trap",
      csharp: src`
var msg = new Dictionary<string, object> { ["type"] = "reading", ["tag"] = "PT-2", ["value"] = 4.5 };
if (msg.TryGetValue("type", out var t) && t is "reading" && msg["value"] is double v and > 0)
    Console.WriteLine($"{msg["tag"]} = {v}");    // PT-2 = 4.5

string? name = null;
Console.WriteLine(name is not null ? name.Length : -1);   // -1

const int Limit = 10;
int level = 7;
Console.WriteLine(level switch
{
    Limit => "at the limit",         // a constant pattern: compares with 10
    _ => "below or above",
});                                  // below or above
`,
      python: src`
msg = {"type": "reading", "tag": "PT-2", "value": 4.5, "extra": True}

match msg:
    case {"type": "reading", "tag": str(tag), "value": float(v)} if v > 0:
        print(f"{tag} = {v}")            # PT-2 = 4.5 (extra keys are ignored)
    case {"type": "alarm"}:
        print("alarm")

LIMIT = 10
level = 7
match level:
    case LIMIT:                         # NOT a comparison: captures level into LIMIT
        print("at the limit?")          # at the limit?
print(LIMIT)                            # 7: the "constant" was overwritten


class Limits:
    MAX = 10


match level:
    case Limits.MAX:                    # a dotted name is a value pattern: compares
        print("at the limit")
    case _:
        print("below or above")         # below or above
`,
      notes: [
        "Python mapping patterns match dictionaries by key, ignoring keys you don't mention, which suits JSON messages. `str(tag)` checks the type and captures. C# has no dictionary pattern; for JSON you'd deserialize into records and use property patterns, or test entries one by one as above.",
        "The classic Python trap: a bare name in a `case` is a capture pattern. It matches anything and assigns to that name, so `case LIMIT:` doesn't compare with LIMIT, it overwrites it. If more cases follow, Python refuses with a SyntaxError (\"makes remaining patterns unreachable\"); alone, it silently matches. Compare with constants through a dotted name (`Limits.MAX`, an Enum member) or a guard (`case x if x == LIMIT`). C# has no such trap: a `const` in a pattern is compared.",
        "`is not null` and `is null` are the recommended null tests in C#, because they can't be changed by an overloaded `==`. A C# switch expression with no arm for some value throws `SwitchExpressionException` at run time, and the compiler warns (CS8509) when it can see a gap, so finish with `_` unless every case is covered. A Python `match` with no matching case just does nothing.",
      ],
    },
    {
      kind: "table",
      title: "Patterns side by side",
      head: ["Pattern", "C#", "Python"],
      rows: [
        ["Constant", "`5`, `\"stop\"`, `null`, a `const`", "`5`, `\"stop\"`, `None`, `Color.RED` (dotted)"],
        ["Anything", "`_` (discard)", "`_` (wildcard)"],
        ["Capture", "`var x`", "a bare name, `x`"],
        ["Type", "`string s`, `Reading r`", "`str() as s`, `str(s)`, `Reading()`"],
        ["Properties / attributes", "`{ Priority: >= 3 }`", "`Alarm(priority=p)` plus a guard"],
        ["Positional", "`(0, _)`, via `Deconstruct`", "`(0, _)`, `Reading(tag, value)` via `__match_args__`"],
        ["Relational", "`< 0`, `>= 3 and <= 9`", "(use a guard)"],
        ["Alternatives", "`\"a\" or \"b\"`", "`\"a\" | \"b\"`"],
        ["Negation", "`not null`", "(use a guard)"],
        ["Sequence", "`[first, .. var rest]`, `[_, _]`", "`[first, *rest]`, `[_, _]`"],
        ["Dictionary", "(none; deserialize to a record)", "`{\"type\": \"alarm\", **rest}`"],
        ["Extra condition", "`when x > 0` (in switch statements and expressions)", "`if x > 0` (a guard)"],
      ],
    },
    {
      kind: "terms",
      title: "Words from this lesson",
      terms: [
        { term: "Pattern matching", meaning: "Testing a value against a shape (a type, values, properties, a list layout) and extracting parts of it in one step." },
        { term: "Switch expression", meaning: "C#'s `value switch { pattern => result, ... }`, an expression that returns the first matching arm's result." },
        { term: "Guard", meaning: "An extra condition on a case: `if` in Python's `case`, `when` in C#." },
        { term: "Capture pattern", meaning: "A pattern that matches anything and binds it to a name: a bare name in Python, `var x` in C#." },
        { term: "List pattern", meaning: "A pattern that matches a sequence element by element, with `..` or `*rest` for any number of elements." },
        { term: "Exhaustive", meaning: "Covering every possible value. C# warns when a switch expression isn't, and throws if an unmatched value arrives." },
      ],
    },
  ],
  predict: [
    {
      lang: "csharp",
      code: src`
int[] temps = [-5, 0, 18, 30, 45];
Console.WriteLine(string.Join(",", temps.Select(t => t switch
{
    < 0 => "freezing",
    0 => "zero",
    > 0 and < 25 => "mild",
    >= 25 and < 40 => "hot",
    _ => "alarm",
})));
`,
      output: "freezing,zero,mild,hot,alarm",
      distractors: ["freezing,freezing,mild,hot,alarm", "freezing,zero,mild,hot,hot", "freezing,zero,mild,mild,alarm"],
      why: "Each value takes the first arm that matches: 0 isn't `< 0`, so it hits the constant `0`; 30 is in `>= 25 and < 40`; 45 matches nothing earlier, so the discard catches it.",
    },
    {
      lang: "csharp",
      code: src`
int[][] lists = [[], [7], [1, 2], [1, 2, 3, 4]];
Console.WriteLine(string.Join(" ", lists.Select(xs => xs switch
{
    [] => "E",
    [var only] => $"1:{only}",
    [var a, .., var z] => $"{a}..{z}",
})));
`,
      output: "E 1:7 1..2 1..4",
      distractors: ["E 1:7 1..2 1..3", "E 7 1..2 1..4", "E 1:7 1:1 1..4"],
      why: "`[var a, .., var z]` needs at least two elements and `..` may match none, so [1, 2] gives 1..2. For [1, 2, 3, 4], `..` swallows the middle and z is 4.",
    },
    {
      lang: "csharp",
      code: src`
object?[] things = [3, "3", 3.0, null];
Console.WriteLine(string.Join("; ", things.Select(t => t switch
{
    int i when i > 2 => "big int",
    int => "int",
    string { Length: 1 } => "short string",
    double => "double",
    null => "null",
    _ => "other",
})));
`,
      output: "big int; short string; double; null",
      distractors: ["big int; short string; big int; null", "int; short string; double; null", "big int; other; double; null"],
      why: "Type patterns check the runtime type exactly: 3.0 is a double, not an int. The `when` clause adds a condition to the first arm, and \"3\" has length 1.",
    },
    {
      lang: "csharp",
      code: src`
var p = new Point(2, 0);
var label = p switch
{
    (0, 0) => "origin",
    (var x, 0) => $"x-axis at {x}",
    (0, var y) => $"y-axis at {y}",
    _ => "elsewhere",
};
Console.WriteLine(label);

record Point(int X, int Y);
`,
      output: "x-axis at 2",
      distractors: ["origin", "elsewhere", "y-axis at 0"],
      why: "The record deconstructs to (2, 0). It isn't (0, 0), but it matches `(var x, 0)`, capturing x = 2.",
    },
    {
      lang: "python",
      code: src`
def kind(value):
    match value:
        case []:
            return "empty"
        case [x]:
            return f"one {x}"
        case [x, *rest]:
            return f"{x} and {len(rest)} more"
        case _:
            return "not a list"

print(kind([]), kind([5]), kind((1, 2, 3)), kind("ab"), sep=" | ")
`,
      output: "empty | one 5 | 1 and 2 more | not a list",
      distractors: ["empty | one 5 | not a list | a and 1 more", "empty | one 5 | 1 and 2 more | a and 1 more", "empty | one [5] | 1 and 2 more | not a list"],
      why: "Sequence patterns match lists and tuples alike, so the tuple counts. Strings are deliberately excluded from sequence patterns, so \"ab\" falls to the wildcard.",
    },
    {
      lang: "python",
      code: src`
STOP = "stop"
cmd = "go"
match cmd:
    case STOP:
        print("stopping")
print(STOP)
`,
      output: "stopping\ngo",
      distractors: ["stop", "(nothing printed)\nstop", "stopping\nstop"],
      why: "A bare name in a `case` is a capture pattern, not a comparison: it matches anything and assigns the value to STOP. So \"stopping\" prints for \"go\", and STOP now holds \"go\".",
    },
    {
      lang: "python",
      code: src`
event = {"kind": "alarm", "tag": "TT-1", "level": 4, "ack": False}
match event:
    case {"kind": "alarm", "level": int(n)} if n >= 5:
        print("critical")
    case {"kind": "alarm", "tag": tag, **rest}:
        print(tag, sorted(rest))
`,
      output: "TT-1 ['ack', 'level']",
      distractors: ["critical", "TT-1 ['kind', 'tag']", "TT-1 []"],
      why: "The first case's pattern matches, but its guard fails (4 is less than 5), so the second case is tried. `**rest` collects the keys not named in the pattern: ack and level.",
    },
    {
      lang: "python",
      code: src`
from dataclasses import dataclass

@dataclass
class Move:
    x: int
    y: int

for m in [Move(0, 3), Move(2, 2), Move(1, 5)]:
    match m:
        case Move(0, y):
            print("vertical", y)
        case Move(x, y) if x == y:
            print("diagonal", x)
        case Move(x=x):
            print("other", x)
`,
      output: "vertical 3\ndiagonal 2\nother 1",
      distractors: ["vertical 3\nother 2\nother 1", "vertical 3\ndiagonal 2\ndiagonal 1", "other 0\ndiagonal 2\nother 1"],
      why: "Dataclasses set `__match_args__` to (\"x\", \"y\"), so `Move(0, y)` checks x == 0 and captures y. The guard picks out (2, 2); the keyword pattern `Move(x=x)` catches the rest.",
    },
  ],
  pitfalls: [
    "A bare name in a Python `case` captures instead of comparing. Use dotted names (`Color.RED`), literals or guards.",
    "Putting a general case before specific ones: C# refuses to compile it, Python never reaches the later case.",
    "Leaving a C# switch expression without a final `_` arm when not every value is covered: it throws `SwitchExpressionException` at run time.",
    "Expecting a Python `match` with no matching case to raise. It silently does nothing; add `case _:` that raises if that's an error.",
    "Expecting Python sequence patterns to match strings. They don't; match the string's `split()` result instead.",
  ],
  next: [
    { id: "adv-command-router", label: "Exercise: Route Commands with List Patterns" },
    { id: "adv-shipping-rate", label: "Exercise: Shipping Rates with Patterns" },
    { id: "lang-functional", label: "Functional Style: Immutability, Pure Functions and Pipelines" },
  ],
};
