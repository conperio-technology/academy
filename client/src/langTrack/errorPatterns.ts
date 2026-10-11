import { src, type LangLessonData } from "./types.ts";

export const errorPatterns: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Designing your own exceptions",
      csharp: src`
try
{
    ReadRegister("10.0.0.5", 40001);
}
catch (PlcCommunicationException e)          // the specific case first
{
    Console.WriteLine($"comms: {e.Address} ({e.Message})");
}
catch (PlcException e)                        // then anything from this library
{
    Console.WriteLine($"plc: {e.Message}");
}
// comms: 10.0.0.5 (no reply from 10.0.0.5)

static int ReadRegister(string address, int register)
{
    ArgumentException.ThrowIfNullOrEmpty(address);           // guard clause
    ArgumentOutOfRangeException.ThrowIfLessThan(register, 1);
    throw new PlcCommunicationException(address, $"no reply from {address}");
}

class PlcException(string message, Exception? inner = null) : Exception(message, inner);

class PlcCommunicationException(string address, string message, Exception? inner = null)
    : PlcException(message, inner)
{
    public string Address { get; } = address;
}
`,
      python: src`
class PlcError(Exception):
    """Base class for everything this library raises."""


class PlcCommunicationError(PlcError):
    def __init__(self, address, message):
        super().__init__(message)
        self.address = address


def read_register(address, register):
    if not address:
        raise ValueError("address is required")              # guard clause
    if register < 1:
        raise ValueError(f"register must be 1 or more, got {register}")
    raise PlcCommunicationError(address, f"no reply from {address}")


try:
    read_register("10.0.0.5", 40001)
except PlcCommunicationError as e:          # the specific case first
    print(f"comms: {e.address} ({e})")
except PlcError as e:                       # then anything from this library
    print(f"plc: {e}")
# comms: 10.0.0.5 (no reply from 10.0.0.5)
`,
      notes: [
        "Good exception design starts with who catches what. Give a library or subsystem one base exception (`PlcException`, `PlcError`) so callers can catch everything from it in one place, and subclasses for the cases callers handle differently (a communication failure may be worth retrying; a bad configuration isn't). Put the useful facts in properties, like `Address`, not only in the message text, so handlers don't have to parse strings.",
        "Use the built-in types for programming mistakes: `ArgumentException`, `ArgumentNullException` and `ArgumentOutOfRangeException` in C# (whose static `ThrowIf...` helpers make guard clauses one line), `ValueError` and `TypeError` in Python. A guard clause checks an argument at the top of a method and fails immediately, which is called failing fast: the error appears where the bad value came in, not three calls later.",
        "In C# a custom exception derives from `Exception` and should pass the message and an optional inner exception up to the base constructor. In Python derive from `Exception` (not `BaseException`, which is for things like KeyboardInterrupt and SystemExit) and end the class name in Error.",
      ],
    },
    {
      kind: "code",
      title: "Wrapping, rethrowing and adding context",
      csharp: src`
try
{
    LoadRecipe("mix-7");
}
catch (RecipeException e)
{
    Console.WriteLine(e.Message);                          // could not load recipe mix-7
    Console.WriteLine(e.InnerException?.GetType().Name);   // FormatException
}

try
{
    Fetch(503);
}
catch (HttpError e) when (e.Status >= 500)               // an exception filter
{
    Console.WriteLine($"server error {e.Status}, worth a retry");   // server error 503, worth a retry
}

static void LoadRecipe(string name)
{
    try
    {
        int.Parse("12x");                                 // the low-level failure
    }
    catch (FormatException e)
    {
        throw new RecipeException($"could not load recipe {name}", e);   // wrap, keep the cause
    }
}

static void Fetch(int status) => throw new HttpError(status);

class RecipeException(string message, Exception inner) : Exception(message, inner);
class HttpError(int status) : Exception($"HTTP {status}") { public int Status { get; } = status; }
`,
      python: src`
class RecipeError(Exception):
    pass


def load_recipe(name):
    try:
        int("12x")                                      # the low-level failure
    except ValueError as e:
        raise RecipeError(f"could not load recipe {name}") from e   # wrap, keep the cause


try:
    load_recipe("mix-7")
except RecipeError as e:
    print(e)                                  # could not load recipe mix-7
    print(type(e.__cause__).__name__)         # ValueError

try:
    try:
        1 / 0
    except ZeroDivisionError as e:
        e.add_note("while scaling PT-1")      # Python 3.11+: extra context
        raise                                 # rethrow the same exception
except ZeroDivisionError as e:
    print(e.__notes__)                        # ['while scaling PT-1']
`,
      notes: [
        "Wrapping (or chaining) means catching a low-level exception and throwing a higher-level one that says what the program was trying to do, while keeping the original as its cause: `new RecipeException(message, inner)` sets `InnerException`, and `raise ... from e` sets `__cause__`. Both appear in the printed stack trace, so nothing is lost. Wrap at boundaries between layers, so the caller sees \"could not load recipe\" rather than a parsing detail; don't wrap at every level.",
        "To rethrow the exception you caught, write `throw;` in C# and a bare `raise` in Python. `throw e;` in C# resets the stack trace to the current line and hides where the error really came from. Python 3.11's `add_note` attaches extra context to an exception without changing its type.",
        "A C# exception filter, `catch (X e) when (condition)`, only catches when the condition is true; otherwise the exception keeps travelling with its stack untouched. Python does the same with an `if` inside `except` followed by a bare `raise`.",
      ],
    },
    {
      kind: "code",
      title: "Result types: failures as ordinary return values",
      csharp: src`
foreach (var text in new[] { "502", "abc", "70000" })
{
    var message = ParsePort(text) switch
    {
        { IsOk: true, Value: var port } => $"port {port}",
        { Error: var error } => $"error: {error}",
    };
    Console.WriteLine(message);
}
// port 502
// error: not a number: abc
// error: out of range: 70000

static Result<int> ParsePort(string text)
{
    if (!int.TryParse(text, out int port)) return Result<int>.Fail($"not a number: {text}");
    if (port is < 1 or > 65535) return Result<int>.Fail($"out of range: {port}");
    return Result<int>.Ok(port);
}

record Result<T>(bool IsOk, T? Value, string? Error)
{
    public static Result<T> Ok(T value) => new(true, value, null);
    public static Result<T> Fail(string error) => new(false, default, error);
}
`,
      python: src`
from dataclasses import dataclass


@dataclass(frozen=True)
class Ok[T]:
    value: T


@dataclass(frozen=True)
class Err:
    error: str


type Result[T] = Ok[T] | Err


def parse_port(text: str) -> Result[int]:
    if not text.isdigit():
        return Err(f"not a number: {text}")
    port = int(text)
    if not 1 <= port <= 65535:
        return Err(f"out of range: {port}")
    return Ok(port)


for text in ["502", "abc", "70000"]:
    match parse_port(text):
        case Ok(port):
            print(f"port {port}")
        case Err(error):
            print(f"error: {error}")
# port 502
# error: not a number: abc
# error: out of range: 70000
`,
      notes: [
        "Exceptions are for the unexpected. When failure is a normal outcome the caller must deal with (validating user input, parsing a file that's often wrong, a lookup that often misses) a result type makes it part of the return value: either success with a value or failure with a reason. The caller can't forget the failure case, the signature documents it, and nothing is thrown, which also matters for speed in a loop where failures are common.",
        ".NET's own small-scale version is the Try pattern: `bool int.TryParse(string, out int)`, `dictionary.TryGetValue`. Python's is returning `None`, or `dict.get`. For richer errors, a small `Result` type as above, or a library such as OneOf or FluentResults in C#, does the job. Don't mix styles within one layer: pick exceptions or results per kind of failure and stick to it.",
        "A related Python idea: EAFP (\"easier to ask forgiveness than permission\": try it and catch the exception) is normal Python style, while LBYL (\"look before you leap\": check first) is more common in C#. Checking first can also be wrong under concurrency: the file can vanish between the check and the open.",
      ],
    },
    {
      kind: "code",
      title: "Retrying transient failures, with backoff",
      csharp: src`
var flaky = new FlakyDevice(failuresBeforeSuccess: 2);
var waits = new List<int>();
int value = Retry(flaky.Read, maxAttempts: 4, sleep: ms => waits.Add(ms));
Console.WriteLine($"{value} after {flaky.Calls} calls, waited {string.Join("+", waits)} ms");
// 42 after 3 calls, waited 100+200 ms

static T Retry<T>(Func<T> action, int maxAttempts, Action<int> sleep, int baseDelayMs = 100)
{
    for (int attempt = 1; ; attempt++)
    {
        try
        {
            return action();
        }
        catch (TimeoutException) when (attempt < maxAttempts)   // only transient errors, only while attempts remain
        {
            sleep(baseDelayMs * (1 << (attempt - 1)));         // 100, 200, 400, ...
        }
    }
}

class FlakyDevice(int failuresBeforeSuccess)
{
    public int Calls { get; private set; }
    public int Read()
    {
        Calls++;
        if (Calls <= failuresBeforeSuccess) throw new TimeoutException("no reply");
        return 42;
    }
}
`,
      python: src`
import random


def retry(action, max_attempts, sleep, base_delay=0.1, transient=(TimeoutError,)):
    for attempt in range(1, max_attempts + 1):
        try:
            return action()
        except transient:
            if attempt == max_attempts:
                raise                                   # out of attempts: let it propagate
            sleep(base_delay * 2 ** (attempt - 1))      # 0.1, 0.2, 0.4, ...


calls = 0


def flaky_read():
    global calls
    calls += 1
    if calls <= 2:
        raise TimeoutError("no reply")
    return 42


waits = []
print(retry(flaky_read, max_attempts=4, sleep=waits.append), calls, waits)   # 42 3 [0.1, 0.2]

# Real code adds jitter, so many clients don't retry in lockstep:
delay = random.uniform(0, 0.1 * 2 ** 3)        # "full jitter": anywhere up to the backoff
print(0 <= delay <= 0.8)                       # True
`,
      notes: [
        "A transient failure is one that may go away by itself: a timeout, a dropped connection, \"server busy\" (HTTP 503 or 429). Retrying those is sensible; retrying a permanent failure (bad credentials, invalid input, a 404) just wastes time, so retry only specific exception types. Exponential backoff doubles the wait after each failure (100 ms, 200 ms, 400 ms) so a struggling service gets room to recover, with a cap on attempts and on the longest wait. Jitter (a random part of the delay) stops thousands of clients that failed together from retrying together.",
        "Only retry operations that are safe to repeat. An idempotent operation has the same effect whether it runs once or several times (reading a value, setting a setpoint to 72); \"add 10 to the counter\" or \"charge the card\" is not, and a retry after a timeout may do it twice. APIs handle this with idempotency keys.",
        "Passing `sleep` in as a parameter is dependency injection on a small scale: production passes `Thread.Sleep` or `time.sleep` (or awaits `Task.Delay` in async code), and tests pass a function that just records the delay, so tests run instantly. In real C# projects the Polly library (built into `Microsoft.Extensions.Http.Resilience`) and in Python `tenacity` provide retries, backoff, timeouts and circuit breakers ready-made.",
      ],
    },
    {
      kind: "table",
      title: "Error handling rules of thumb",
      head: ["Situation", "Do", "Avoid"],
      rows: [
        ["Caller passed a bad argument", "Throw `ArgumentException` / raise `ValueError` at once (fail fast)", "Carrying on with a default nobody asked for"],
        ["Failure is a normal outcome", "Return a result: Try pattern, `None`, a Result type", "Throwing in a loop where half the items fail"],
        ["Low-level error crosses a layer", "Wrap it with context, keep the cause (`inner`, `from e`)", "Losing the original, or wrapping at every level"],
        ["You can't handle it here", "Let it propagate", "`catch (Exception) { }` / `except Exception: pass`"],
        ["Rethrowing", "`throw;` / bare `raise`", "`throw e;`, which loses the original stack trace"],
        ["Transient failure", "Retry with backoff, jitter and a limit, only if idempotent", "Retrying forever, or retrying permanent errors"],
        ["Resources", "`using` / `with`, so clean-up runs on every path", "Clean-up code that only runs when nothing failed"],
        ["Top of the program or request", "One handler that logs the full exception and returns a safe error", "Showing stack traces to end users"],
      ],
    },
    {
      kind: "terms",
      title: "Words from this lesson",
      terms: [
        { term: "Guard clause", meaning: "A check at the top of a method that throws or returns straight away when an argument is invalid." },
        { term: "Fail fast", meaning: "Reporting a problem as soon as it's detected, close to its cause, instead of carrying on with bad data." },
        { term: "Exception chaining", meaning: "Throwing a new exception that keeps the original as its cause: `InnerException` in C#, `raise ... from e` in Python." },
        { term: "Exception filter", meaning: "A C# `catch (X e) when (condition)` that only catches when the condition holds." },
        { term: "Result type", meaning: "A return type that holds either a success value or an error, making failure part of the signature." },
        { term: "Transient failure", meaning: "A failure that may succeed if tried again later, like a timeout or a busy server." },
        { term: "Exponential backoff", meaning: "Waiting longer after each failed attempt, typically doubling, before retrying." },
        { term: "EAFP and LBYL", meaning: "Two styles: try and handle the exception (Python's usual way), or check before acting." },
      ],
    },
  ],
  predict: [
    {
      lang: "csharp",
      code: src`
try
{
    try
    {
        throw new KeyNotFoundException("tag FT-9");
    }
    catch (Exception e)
    {
        throw new InvalidOperationException("lookup failed", e);
    }
}
catch (InvalidOperationException e)
{
    Console.WriteLine($"{e.Message} <- {e.InnerException!.Message}");
}
`,
      output: "lookup failed <- tag FT-9",
      distractors: ["tag FT-9", "lookup failed", "tag FT-9 <- lookup failed"],
      why: "The outer catch receives the wrapping exception; its `InnerException` is the original KeyNotFoundException with its own message.",
    },
    {
      lang: "csharp",
      code: src`
foreach (int code in new[] { 404, 503 })
{
    try
    {
        throw new HttpRequestException("failed", null, (System.Net.HttpStatusCode)code);
    }
    catch (HttpRequestException e) when ((int?)e.StatusCode >= 500)
    {
        Console.WriteLine($"{code}: retry");
    }
    catch (HttpRequestException)
    {
        Console.WriteLine($"{code}: give up");
    }
}
`,
      output: "404: give up\n503: retry",
      distractors: ["404: retry\n503: retry", "404: give up\n503: give up", "404: retry\n503: give up"],
      why: "The filter only lets the first `catch` take server errors (500 and up). A 404 fails the filter, so the next `catch` handles it.",
    },
    {
      lang: "csharp",
      code: src`
var r = Divide(10, 0);
Console.WriteLine(r.IsOk ? $"ok {r.Value}" : $"err {r.Error}");
r = Divide(10, 4);
Console.WriteLine(r.IsOk ? $"ok {r.Value}" : $"err {r.Error}");

static Result Divide(int a, int b) =>
    b == 0 ? new Result(false, 0, "divide by zero") : new Result(true, a / b, null);

record Result(bool IsOk, int Value, string? Error);
`,
      output: "err divide by zero\nok 2",
      distractors: ["DivideByZeroException\nok 2", "err divide by zero\nok 2.5", "ok 0\nok 2"],
      why: "The division by zero is never attempted: the result records the error instead. 10 / 4 is integer division, 2.",
    },
    {
      lang: "csharp",
      code: src`
int attempts = 0;
try
{
    Retry(() => { attempts++; throw new TimeoutException(); }, 3);
}
catch (TimeoutException)
{
    Console.WriteLine($"gave up after {attempts}");
}

static void Retry(Action action, int max)
{
    for (int i = 1; ; i++)
    {
        try { action(); return; }
        catch (TimeoutException) when (i < max) { }
    }
}
`,
      output: "gave up after 3",
      distractors: ["gave up after 2", "gave up after 4", "(loops forever)"],
      why: "The filter catches the first two failures. On the third attempt `i < max` is false, so the filter declines and the exception escapes to the caller.",
    },
    {
      lang: "python",
      code: src`
class AppError(Exception):
    pass

def load():
    try:
        {}["missing"]
    except KeyError as e:
        raise AppError("config incomplete") from e

try:
    load()
except AppError as e:
    print(e, "|", repr(e.__cause__))
`,
      output: "config incomplete | KeyError('missing')",
      distractors: ["'missing' | None", "config incomplete | None", "KeyError: 'missing'"],
      why: "`raise ... from e` stores the original exception as `__cause__`. Printing the AppError shows its own message.",
    },
    {
      lang: "python",
      code: src`
def parse_all(texts):
    good, bad = [], []
    for t in texts:
        try:
            good.append(int(t))
        except ValueError:
            bad.append(t)
    return good, bad

print(parse_all(["1", "x", "3", ""]))
`,
      output: "([1, 3], ['x', ''])",
      distractors: ["([1, 3], ['x'])", "ValueError", "([1, 0, 3], ['x'])"],
      why: "Each failure is handled per item, so one bad value doesn't stop the rest. `int(\"\")` raises ValueError too, so the empty string ends up in `bad`.",
    },
    {
      lang: "python",
      code: src`
def backoff(attempt, base=0.5, cap=4.0):
    return min(cap, base * 2 ** attempt)

print([backoff(a) for a in range(6)])
`,
      output: "[0.5, 1.0, 2.0, 4.0, 4.0, 4.0]",
      distractors: ["[0.5, 1.0, 2.0, 4.0, 8.0, 16.0]", "[0.5, 1.0, 1.5, 2.0, 2.5, 3.0]", "[1.0, 2.0, 4.0, 4.0, 4.0, 4.0]"],
      why: "The delay doubles from 0.5 each attempt until it reaches the 4-second cap, then stays there.",
    },
    {
      lang: "python",
      code: src`
log = []
try:
    try:
        raise ValueError("bad reading")
    except ValueError:
        log.append("handled")
        raise
    finally:
        log.append("cleanup")
except ValueError as e:
    log.append(f"outer saw: {e}")
print(log)
`,
      output: "['handled', 'cleanup', 'outer saw: bad reading']",
      distractors: ["['handled', 'outer saw: bad reading', 'cleanup']", "['handled', 'cleanup']", "['cleanup', 'handled', 'outer saw: bad reading']"],
      why: "The inner `except` runs, then the bare `raise` sends the same exception on. The `finally` runs as it leaves the inner `try`, before the outer handler.",
    },
  ],
  pitfalls: [
    "`catch (Exception) { }` or `except Exception: pass`, which hide real bugs. Catch what you can handle, let the rest propagate.",
    "`throw e;` in C#, which replaces the original stack trace. Use `throw;`.",
    "Wrapping without the cause, so the root error disappears from logs.",
    "Retrying non-idempotent operations, or permanent errors, or without a limit.",
    "Using exceptions for expected, frequent outcomes in hot loops. Exceptions are slow compared with returning a result.",
    "Putting essential details only in the message string, so handlers have to parse text. Add properties or attributes.",
  ],
  next: [
    { id: "adv-retry-backoff", label: "Exercise: Retry with Exponential Backoff" },
    { id: "adv-parse-result", label: "Exercise: Validate Settings with a Result Type" },
    { id: "lang-profiling", label: "Profiling and Benchmarking" },
  ],
};
