import { src, type LangLessonData } from "./types.ts";

export const exceptions: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "When something goes wrong: an unhandled exception",
      csharp: src`
int[] counts = { 12, 0, 7 };
Console.WriteLine(Shift.AverageRate(counts));

static class Shift
{
    public static double AverageRate(int[] values)
    {
        int total = 0;
        foreach (int v in values)
            total += Rate(v);
        return (double)total / values.Length;
    }

    static int Rate(int count)
    {
        return 3600 / count;
    }
}
`,
      python: src`
def average_rate(values):
    total = 0
    for v in values:
        total += rate(v)
    return total / len(values)


def rate(count):
    return 3600 // count


counts = [12, 0, 7]
print(average_rate(counts))
`,
      notes: [
        "An exception is an object that describes an error, created and thrown (C#) or raised (Python) at the point where the program can't carry on: here, dividing by zero. Throwing stops the current function immediately and passes the exception back to whatever called it, then to its caller, and so on, until some code catches it. If nothing does, the program stops and prints a stack trace.",
        "Both programs crash on the second count, 0. The output of each is shown next.",
      ],
      expectError: { csharp: "DivideByZeroException", python: "ZeroDivisionError" },
    },
    {
      kind: "code",
      title: "Reading a stack trace",
      csharp: src`
Unhandled exception. System.DivideByZeroException: Attempted to divide by zero.
   at Shift.Rate(Int32 count) in Program.cs:line 16
   at Shift.AverageRate(Int32[] values) in Program.cs:line 10
   at Program.<Main>$(String[] args) in Program.cs:line 2
`,
      python: src`
Traceback (most recent call last):
  File "shift.py", line 13, in <module>
    print(average_rate(counts))
          ~~~~~~~~~~~~^^^^^^^^
  File "shift.py", line 4, in average_rate
    total += rate(v)
             ~~~~^^^
  File "shift.py", line 9, in rate
    return 3600 // count
           ~~~~~^^~~~~~~
ZeroDivisionError: integer division or modulo by zero
`,
      notes: [
        "These are the real outputs (file paths shortened). A stack trace lists the chain of function calls that were in progress when the exception happened, which is the call stack at that moment. Each line names a function and the file and line number it had reached.",
        "The two languages print the chain in opposite orders. C# puts the exception type and message first, then the innermost call (where it actually broke, `Rate`, line 16), then each caller outwards, ending at the program's entry point. Python prints the outermost call first and the innermost last, so the exception type and message are on the final line; read a Python traceback from the bottom up.",
        "How to use one: read the exception type and message first (division by zero). Find the first line that is in your own code rather than in a library: that's where to look. Then walk outwards to see how you got there: `AverageRate` passed a 0 from the `counts` array into `Rate`. Python 3.11 and later also underline the exact part of each line with `~` and `^`.",
        "`<Main>$` is the method the C# compiler generates for top-level statements, and `<module>` is Python's name for code at the top level of a file.",
      ],
      captions: { csharp: "C# output", python: "Python output" },
      fragment: { csharp: true, python: true },
    },
    {
      kind: "code",
      title: "Catching exceptions: try, catch / except, finally",
      csharp: src`
string[] inputs = { "42", "forty", "0" };
foreach (string text in inputs)
{
    try
    {
        int n = int.Parse(text);
        Console.WriteLine($"100 / {n} = {100 / n}");
    }
    catch (FormatException)
    {
        Console.WriteLine($"'{text}' is not a number");
    }
    catch (DivideByZeroException e)
    {
        Console.WriteLine($"Can't divide by zero: {e.Message}");
    }
    finally
    {
        Console.WriteLine("  (checked)");   // runs every time
    }
}
`,
      python: src`
inputs = ["42", "forty", "0"]
for text in inputs:
    try:
        n = int(text)
        result = 100 // n
    except ValueError:
        print(f"'{text}' is not a number")
    except ZeroDivisionError as e:
        print(f"Can't divide by zero: {e}")
    else:                       # only if nothing was raised
        print(f"100 // {n} = {result}")
    finally:
        print("  (checked)")    # runs every time
`,
      notes: [
        "Put the code that might fail in the `try` block. If an exception is thrown there, the rest of the `try` block is skipped and the first `catch` (C#) or `except` (Python) clause whose type matches runs. `e` gives you the exception object, with its message. A `finally` block runs whether or not anything failed, even if the `try` block returns, which makes it the place for cleanup such as closing a connection.",
        "Python adds an optional `else` block, which runs only when the `try` block raised nothing. It keeps the `try` block small, so you don't accidentally catch errors from code you didn't mean to protect.",
        "Catch specific types, not everything. Clauses are checked top to bottom, so a broad type (`Exception`) placed first would swallow everything; C# refuses to compile a specific catch placed after a broader one (error CS0160), while Python silently never reaches it.",
      ],
    },
    {
      kind: "code",
      title: "Throwing your own: throw and raise",
      csharp: src`
try
{
    SetSpeed(1800);
    SetSpeed(-5);
}
catch (ArgumentOutOfRangeException e)
{
    Console.WriteLine($"Rejected: {e.Message}");
}

static void SetSpeed(int rpm)
{
    if (rpm < 0 || rpm > 3000)
        throw new ArgumentOutOfRangeException(nameof(rpm), $"must be 0 to 3000, got {rpm}");
    Console.WriteLine($"Speed set to {rpm}");
}
`,
      python: src`
def set_speed(rpm):
    if not 0 <= rpm <= 3000:
        raise ValueError(f"rpm must be 0 to 3000, got {rpm}")
    print(f"Speed set to {rpm}")


try:
    set_speed(1800)
    set_speed(-5)
except ValueError as e:
    print(f"Rejected: {e}")
`,
      notes: [
        "Throw (C#) or raise (Python) an exception when a function is asked to do something it can't do sensibly, such as a negative speed. That is better than returning a made-up value like -1 that the caller might forget to check. Pick the built-in type that fits: `ArgumentException` or `ArgumentOutOfRangeException` in C# and `ValueError` in Python for bad inputs, `InvalidOperationException` or `RuntimeError` when the object is in the wrong state, and include the bad value in the message.",
        "Inside a catch block, `throw;` (C#) or a bare `raise` (Python) re-throws the same exception with its original stack trace. In C#, `throw e;` restarts the trace at that line, hiding where the problem really started.",
      ],
    },
    {
      kind: "code",
      title: "Exceptions or checks?",
      csharp: src`
// Expected failures: check, don't throw
if (int.TryParse("12a", out int qty))
    Console.WriteLine(qty);
else
    Console.WriteLine("Please enter a whole number");

var prices = new Dictionary<string, decimal> { ["bolt"] = 0.15m };
Console.WriteLine(prices.TryGetValue("nut", out var p) ? p : -1m);
`,
      python: src`
# Python style: try it and handle the failure ("easier to ask forgiveness")
try:
    qty = int("12a")
    print(qty)
except ValueError:
    print("Please enter a whole number")

prices = {"bolt": 0.15}
print(prices.get("nut", -1))
`,
      notes: [
        "Exceptions are for exceptional situations. In C#, throwing is relatively slow and the libraries offer `TryParse`, `TryGetValue` and similar methods for failures you expect, such as bad user input. Python leans the other way: it's normal Python style to just try the operation and catch the exception (EAFP, \"easier to ask forgiveness than permission\"), though `dict.get` and `in` checks are fine too.",
        "Never write an empty catch block (`catch { }` or `except: pass`) to make an error go away. The program then carries on in a broken state, and the stack trace that would have told you why is gone.",
      ],
    },
    {
      kind: "table",
      title: "The same mistake, two names",
      head: ["What went wrong", "C#", "Python"],
      rows: [
        ["Used a missing value (null / None)", "`NullReferenceException`", "`AttributeError` or `TypeError` mentioning `NoneType`"],
        ["Index past the end", "`IndexOutOfRangeException` (arrays), `ArgumentOutOfRangeException` (List)", "`IndexError`"],
        ["Missing dictionary key", "`KeyNotFoundException`", "`KeyError`"],
        ["Text isn't a valid number", "`FormatException`", "`ValueError`"],
        ["Bad argument value", "`ArgumentException`, `ArgumentOutOfRangeException`", "`ValueError`"],
        ["Wrong type of value", "`InvalidCastException` (most are compile errors)", "`TypeError`"],
        ["Whole-number division by zero", "`DivideByZeroException` (a double gives infinity)", "`ZeroDivisionError` (floats too)"],
        ["Object in the wrong state, collection changed while looping", "`InvalidOperationException`", "`RuntimeError`"],
        ["File not found", "`FileNotFoundException`", "`FileNotFoundError`"],
        ["Recursion too deep", "Stack overflow: the process stops, can't be caught", "`RecursionError`"],
        ["Base type to catch \"anything reasonable\"", "`Exception`", "`Exception`"],
      ],
    },
  ],
  predict: [
    {
      lang: "csharp",
      code: src`
try
{
    Console.WriteLine("A");
    throw new InvalidOperationException("boom");
}
catch (InvalidOperationException e)
{
    Console.WriteLine("C " + e.Message);
}
finally
{
    Console.WriteLine("D");
}
Console.WriteLine("E");
`,
      output: "A\nC boom\nD\nE",
      distractors: ["A\nD\nC boom\nE", "A\nC boom\nE", "C boom\nD\nE"],
      why: "A prints, the throw jumps straight to the matching catch, `finally` runs after the catch, and then the program continues normally after the whole try statement.",
    },
    {
      lang: "python",
      code: src`
def f(x):
    try:
        r = 10 / x
    except ZeroDivisionError:
        print("div0")
        return -1
    else:
        print("ok")
        return r
    finally:
        print("cleanup")

print(f(0))
print(f(5))
`,
      output: "div0\ncleanup\n-1\nok\ncleanup\n2.0",
      distractors: ["div0\n-1\ncleanup\nok\n2.0\ncleanup", "div0\n-1\nok\n2.0", "div0\ncleanup\n-1\nok\n2.0"],
      why: "`finally` runs on the way out of the function, after the `return` value is decided but before the caller gets it, so \"cleanup\" prints before each result. `10 / 5` is true division: 2.0.",
    },
    {
      lang: "python",
      code: src`
try:
    int("x")
except Exception:
    print("general")
except ValueError:
    print("value")
`,
      output: "general",
      distractors: ["value", "general\nvalue", "ValueError"],
      why: "Except clauses are tried top to bottom and `ValueError` is a kind of `Exception`, so the first clause wins and the second can never run. Python allows this order; C# refuses to compile it (error CS0160). Put specific types first.",
    },
    {
      lang: "csharp",
      code: src`
try { Level1(); }
catch (Exception e) { Console.WriteLine($"{e.GetType().Name}: {e.Message}"); }

static void Level1() => Level2();
static void Level2() => throw new ArgumentException("bad input");
`,
      output: "ArgumentException: bad input",
      distractors: ["Exception: bad input", "bad input", "Unhandled exception"],
      why: "The exception travels up from `Level2` through `Level1` to the caller's catch. Catching the base type `Exception` still gives you the real object, whose type is `ArgumentException`.",
    },
    {
      lang: "csharp",
      code: src`
double d = 1.0 / 0;
Console.WriteLine(double.IsInfinity(d));
int zero = 0;
try { Console.WriteLine(1 / zero); }
catch (DivideByZeroException) { Console.WriteLine("caught"); }
`,
      output: "True\ncaught",
      distractors: ["caught\ncaught", "True\nInfinity", "False\ncaught"],
      why: "Floating point division by zero follows the IEEE 754 standard and gives infinity, no exception. Whole-number division by zero has no sensible answer, so it throws. Python raises `ZeroDivisionError` for both.",
    },
    {
      lang: "python",
      code: src`
def g():
    try:
        return "try"
    finally:
        print("finally runs")

print(g())
`,
      output: "finally runs\ntry",
      distractors: ["try", "try\nfinally runs", "finally runs"],
      why: "`return` inside `try` still runs the `finally` block before the function actually hands back its value.",
    },
    {
      lang: "python",
      code: src`
try:
    {}["tag"]
except KeyError as e:
    print("missing", e)
try:
    None.upper()
except AttributeError as e:
    print(type(e).__name__)
`,
      output: "missing 'tag'\nAttributeError",
      distractors: ["missing tag\nAttributeError", "missing 'tag'\nTypeError", "KeyError\nAttributeError"],
      why: "A `KeyError`'s message is the key itself, shown with quotes. Calling a method on `None` is Python's version of C#'s `NullReferenceException`: an `AttributeError` saying `'NoneType' object has no attribute 'upper'`.",
    },
  ],
  pitfalls: [
    "Empty catch blocks that hide errors. At the very least, log the exception.",
    "Catching `Exception` everywhere instead of the specific types you can actually handle.",
    "`throw e;` in C#, which loses the original stack trace. Use `throw;`.",
    "Reading a Python traceback from the top. The cause is at the bottom.",
    "Using exceptions for normal control flow in C#, like checking whether text is a number. Use `TryParse`.",
    "Cleanup code after the `try` block instead of in `finally` (or `using` / `with`), so it's skipped when an exception escapes.",
  ],
  next: [
    { id: "basics-sum-valid-numbers", label: "Exercise: Add Up the Valid Numbers" },
    { id: "lang-classes", label: "Next: Classes and Objects" },
  ],
};
