import { src, type LangLessonData } from "./types.ts";

export const decorators: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Decorators: wrapping a function to add behaviour",
      csharp: src`
Func<int, int> square = x => x * x;
Func<int, int> logged = Logged("square", square);   // wrap it, same shape

Console.WriteLine(logged(4));
// calling square(4)
// square returned 16
// 16

static Func<int, int> Logged(string name, Func<int, int> inner) => x =>
{
    Console.WriteLine($"calling {name}({x})");
    int result = inner(x);
    Console.WriteLine($"{name} returned {result}");
    return result;
};
`,
      python: src`
import functools


def logged(func):
    @functools.wraps(func)                 # keep the name and docstring
    def wrapper(*args, **kwargs):
        print(f"calling {func.__name__}{args}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result}")
        return result
    return wrapper


@logged                                    # means: square = logged(square)
def square(x):
    return x * x


print(square(4))
# calling square(4,)
# square returned 16
# 16
print(square.__name__)                     # square
`,
      notes: [
        "A decorator is a function that takes a function and returns a new one that wraps it: it can run code before and after, change the arguments or the result, catch errors, or skip the call. It's the previous track's higher-order functions and closures put to work. Python has syntax for it: `@logged` above a `def` means \"define `square`, then replace it with `logged(square)`\". Real uses include logging, timing, caching, retries, permission checks and registering web routes (`@app.get(\"/\")`).",
        "`*args, **kwargs` collects any positional and keyword arguments, so one wrapper fits any function. `functools.wraps` copies the original's name, docstring and other metadata onto the wrapper; without it every decorated function would be called `wrapper` in stack traces and tools.",
        "C# has no `@` syntax for this. You get the same effect by wrapping a delegate as above, or, for classes, with the decorator design pattern: a class that implements the same interface as the one it wraps and forwards each call, adding behaviour around it. Frameworks such as ASP.NET Core build their middleware and filters this way.",
      ],
    },
    {
      kind: "code",
      title: "Decorators with settings, stacking, and caching",
      csharp: src`
int calls = 0;
Func<int, long> slowSquare = n => { calls++; return (long)n * n; };
var fast = Memoize(slowSquare);
Console.WriteLine(fast(9) + fast(9) + fast(3));   // 171
Console.WriteLine(calls);                         // 2: 9 was computed once

static Func<TIn, TOut> Memoize<TIn, TOut>(Func<TIn, TOut> f) where TIn : notnull
{
    var cache = new Dictionary<TIn, TOut>();       // captured by the closure
    return x =>
    {
        if (!cache.TryGetValue(x, out var y))
        {
            y = f(x);
            cache[x] = y;
        }
        return y;
    };
}
`,
      python: src`
import functools


def repeat(times):                     # a decorator factory: takes the settings...
    def decorator(func):               # ...and returns the real decorator
        @functools.wraps(func)
        def wrapper(*args):
            return [func(*args) for _ in range(times)]
        return wrapper
    return decorator


def shout(func):
    @functools.wraps(func)
    def wrapper(*args):
        return func(*args).upper()
    return wrapper


@repeat(2)
@shout                                 # applied first: repeat(2)(shout(greet))
def greet(name):
    return f"hi {name}"


print(greet("ana"))                    # ['HI ANA', 'HI ANA']


@functools.cache                       # remember every result (lru_cache(maxsize=None))
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)


print(fib(80))                         # 23416728348467685
print(fib.cache_info().hits)           # 78
`,
      notes: [
        "A decorator that takes settings, `@repeat(2)`, is a function that returns a decorator: three nested functions. Stacked decorators apply bottom up, the one nearest the `def` first, and run top down when called.",
        "Memoization (remembering each result by its arguments) is the most common decorator in interviews: `@functools.cache` or `@functools.lru_cache(maxsize=128)`, which forgets the least recently used results beyond the limit. The arguments must be hashable. C#'s version is a closure over a dictionary like `Memoize` above; for recursion, the recursive calls must go through the memoized function or only the top call is cached.",
      ],
    },
    {
      kind: "code",
      title: "Clean-up you can't forget: using and with",
      csharp: src`
using (var conn = new Connection("plc-1"))
{
    conn.Send("start");
}                                       // Dispose runs here, even after an exception

try
{
    using var conn = new Connection("plc-2");   // a using declaration: disposed at the end of the block
    conn.Send("stop");
    throw new InvalidOperationException("comms lost");
}
catch (InvalidOperationException e)
{
    Console.WriteLine($"caught: {e.Message}");
}
// open plc-1 / send start / close plc-1
// open plc-2 / send stop / close plc-2 / caught: comms lost

sealed class Connection : IDisposable
{
    private readonly string _name;
    public Connection(string name) { _name = name; Console.WriteLine($"open {_name}"); }
    public void Send(string command) => Console.WriteLine($"send {command}");
    public void Dispose() => Console.WriteLine($"close {_name}");
}
`,
      python: src`
class Connection:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        print(f"open {self.name}")
        return self                     # what "as conn" receives

    def __exit__(self, exc_type, exc, tb):
        print(f"close {self.name}")
        return False                    # don't swallow the exception

    def send(self, command):
        print(f"send {command}")


with Connection("plc-1") as conn:
    conn.send("start")

try:
    with Connection("plc-2") as conn:
        conn.send("stop")
        raise RuntimeError("comms lost")
except RuntimeError as e:
    print(f"caught: {e}")
# open plc-1 / send start / close plc-1
# open plc-2 / send stop / close plc-2 / caught: comms lost
`,
      notes: [
        "Files, network connections, database transactions and locks must be released when you're done, whether or not an error happened. Waiting for the garbage collector isn't good enough: it runs whenever it likes, and a finalizer or `__del__` may run late or never. Both languages give you a statement that guarantees the clean-up, like a built-in `try` / `finally`.",
        "In C#, a class that holds such a resource implements `IDisposable`, whose one method is `Dispose()`. `using (var x = ...) { }` calls `Dispose` when the block ends, and the shorter `using var x = ...;` (a using declaration) calls it at the end of the enclosing block. In Python, an object with `__enter__` and `__exit__` is a context manager. `with` calls `__enter__`, binds its result to the `as` name, and calls `__exit__` when the block ends, passing the exception if there was one. Returning True from `__exit__` would swallow the exception, which you almost never want.",
        "Files are the everyday case: `using var reader = new StreamReader(path);` and `with open(path) as f:`. `lock (obj)` and `with lock:` from the concurrency lesson are the same idea.",
      ],
    },
    {
      kind: "code",
      title: "Writing context managers the short way, and several at once",
      csharp: src`
using (var a = new Step("A"))
using (var b = new Step("B"))
{
    Console.WriteLine("work");
}
// enter A / enter B / work / exit B / exit A

sealed class Step : IDisposable
{
    private readonly string _name;
    public Step(string name) { _name = name; Console.WriteLine($"enter {_name}"); }
    public void Dispose() => Console.WriteLine($"exit {_name}");
}
`,
      python: src`
from contextlib import ExitStack, contextmanager


@contextmanager
def step(name):
    print(f"enter {name}")          # the part before yield is __enter__
    try:
        yield name                  # the with block runs here
    finally:
        print(f"exit {name}")       # the part after is __exit__


with step("A"), step("B"):
    print("work")
# enter A / enter B / work / exit B / exit A

with ExitStack() as stack:          # a number of resources known only at run time
    names = [stack.enter_context(step(n)) for n in ["x", "y", "z"]]
    print(names)
# enter x / enter y / enter z / ['x', 'y', 'z'] / exit z / exit y / exit x
`,
      notes: [
        "Resources are released in the reverse order they were acquired, so something opened later (a transaction) is closed before what it depends on (the connection). Both languages do this automatically.",
        "`@contextmanager` turns a generator into a context manager: the code before `yield` sets up, the yielded value is what `as` receives, and the code after cleans up. Put the clean-up in `finally`, or it's skipped when the block raises. `ExitStack` handles a list of resources whose length you only know at run time; C# would use a list of disposables and dispose them in reverse in a `finally`.",
        "Async versions exist for clean-up that has to wait: `IAsyncDisposable` with `await using`, and `__aenter__` / `__aexit__` with `async with` (or `@asynccontextmanager`).",
      ],
    },
    {
      kind: "code",
      title: "Attributes: labels a framework reads",
      csharp: src`
using System.Reflection;

foreach (var method in typeof(Pump).GetMethods())
{
    var command = method.GetCustomAttribute<CommandAttribute>();
    if (command is not null)
        Console.WriteLine($"{command.Name} -> {method.Name}");
}
// start -> Start
// stop -> Stop

[AttributeUsage(AttributeTargets.Method)]
sealed class CommandAttribute(string name) : Attribute
{
    public string Name { get; } = name;
}

class Pump
{
    [Command("start")] public void Start() { }
    [Command("stop")] public void Stop() { }
    public void Service() { }               // no attribute: not a command
}
`,
      python: src`
COMMANDS = {}


def command(name):                       # a registering decorator
    def register(func):
        COMMANDS[name] = func.__name__
        return func                      # returns the function unchanged
    return register


class Pump:
    @command("start")
    def start(self): ...

    @command("stop")
    def stop(self): ...

    def service(self): ...


for name, method in COMMANDS.items():
    print(f"{name} -> {method}")
# start -> start
# stop -> stop
`,
      notes: [
        "A C# attribute, `[Command(\"start\")]`, is metadata: a label stored in the compiled program that does nothing by itself. Code that looks for it, usually a framework using reflection (the next lesson), gives it meaning: `[HttpGet]` in ASP.NET Core, `[Fact]` in xUnit, `[JsonPropertyName]` for serialization, `[Obsolete]` (read by the compiler, which then warns). An attribute class derives from `Attribute`, and by convention its name ends in Attribute, which you leave off when you use it.",
        "So a C# attribute and a Python decorator look alike but work differently: an attribute is passive data read later, while a decorator is code that runs when the function is defined and can replace it. A registering decorator like `command` above, which records the function and returns it unchanged, is Python's nearest equivalent of an attribute plus the framework that scans for it.",
      ],
    },
    {
      kind: "table",
      title: "Side by side",
      head: ["", "C#", "Python"],
      rows: [
        ["Wrap a function", "a method taking and returning a `Func<...>`", "a decorator, `@wrapper`"],
        ["Wrap an object", "decorator pattern: same interface, forwards calls", "same pattern, or `__getattr__` forwarding"],
        ["Cache results", "closure over a `Dictionary`, or `IMemoryCache`", "`@functools.cache`, `@lru_cache(maxsize=n)`"],
        ["Guaranteed clean-up", "`IDisposable` + `using`", "`__enter__` / `__exit__` + `with`"],
        ["Short form", "`using var x = ...;`", "`@contextlib.contextmanager`"],
        ["Many resources", "stacked `using`s, or a list disposed in `finally`", "`with a, b:`, `contextlib.ExitStack`"],
        ["Async clean-up", "`IAsyncDisposable`, `await using`", "`__aenter__` / `__aexit__`, `async with`"],
        ["Metadata on code", "attributes, `[Name(args)]`, read by reflection", "decorators that register, function attributes, annotations"],
      ],
    },
    {
      kind: "terms",
      title: "Words from this lesson",
      terms: [
        { term: "Decorator (Python)", meaning: "A function that takes a function and returns a wrapped version, applied with `@name` above a `def` or `class`." },
        { term: "Decorator pattern", meaning: "A class that wraps another object with the same interface, forwarding calls and adding behaviour around them." },
        { term: "Memoization", meaning: "Caching a function's results by its arguments so repeated calls are instant." },
        { term: "Context manager", meaning: "A Python object with `__enter__` and `__exit__` that `with` uses to set up and reliably clean up." },
        { term: "IDisposable", meaning: "The C# interface with one method, `Dispose()`, for releasing resources; `using` calls it automatically." },
        { term: "Attribute (C#)", meaning: "Metadata attached to a class, method or property, such as `[Obsolete]`, read by the compiler or by code using reflection." },
      ],
    },
  ],
  predict: [
    {
      lang: "python",
      code: src`
def twice(func):
    def wrapper(x):
        return func(func(x))
    return wrapper

@twice
def add3(x):
    return x + 3

print(add3(1), add3.__name__)
`,
      output: "7 wrapper",
      distractors: ["4 add3", "7 add3", "4 wrapper"],
      why: "`add3` is replaced by `wrapper`, which calls the original twice: 1 + 3 + 3 = 7. Without `functools.wraps`, the name is the wrapper's.",
    },
    {
      lang: "python",
      code: src`
def tag(label):
    def decorator(func):
        def wrapper():
            return f"<{label}>{func()}</{label}>"
        return wrapper
    return decorator

@tag("b")
@tag("i")
def hello():
    return "hi"

print(hello())
`,
      output: "<b><i>hi</i></b>",
      distractors: ["<i><b>hi</b></i>", "<b>hi</b>", "<b><i>hi</b></i>"],
      why: "Decorators apply bottom up: `hello = tag(\"b\")(tag(\"i\")(hello))`, so the outer wrapper adds `<b>` around the result of the inner one.",
    },
    {
      lang: "python",
      code: src`
import functools

calls = 0

@functools.lru_cache(maxsize=None)
def slow(n):
    global calls
    calls += 1
    return n * 2

print(slow(2) + slow(2) + slow(3), calls)
`,
      output: "14 2",
      distractors: ["14 3", "14 1", "10 2"],
      why: "The second `slow(2)` comes from the cache, so the body runs only for 2 and 3: two calls. The cached call still returns its value, so the sum is 4 + 4 + 6 = 14.",
    },
    {
      lang: "python",
      code: src`
class Res:
    def __enter__(self):
        print("enter")
        return 42
    def __exit__(self, *exc):
        print("exit")
        return False

with Res() as value:
    print(value)
print("after")
`,
      output: "enter\n42\nexit\nafter",
      distractors: ["enter\nexit\n42\nafter", "42\nenter\nexit\nafter", "enter\n<__main__.Res object>\nexit\nafter"],
      why: "`as` receives what `__enter__` returns, 42, not the `Res` object. `__exit__` runs when the block ends, before the next statement.",
    },
    {
      lang: "python",
      code: src`
class Quiet:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        print("exit saw", exc_type.__name__)
        return True

with Quiet():
    raise ValueError("bad")
print("still running")
`,
      output: "exit saw ValueError\nstill running",
      distractors: ["exit saw ValueError\nValueError: bad", "ValueError: bad", "still running"],
      why: "`__exit__` receives the exception's type. Returning True tells Python the exception was handled, so it's swallowed and the program carries on. That's rarely what you want.",
    },
    {
      lang: "csharp",
      code: src`
using (new Log("outer"))
{
    using var inner = new Log("inner");
    Console.WriteLine("body");
}

sealed class Log : IDisposable
{
    private readonly string _name;
    public Log(string name) { _name = name; Console.WriteLine($"+{_name}"); }
    public void Dispose() => Console.WriteLine($"-{_name}");
}
`,
      output: "+outer\n+inner\nbody\n-inner\n-outer",
      distractors: ["+outer\n+inner\nbody\n-outer\n-inner", "+outer\n-outer\n+inner\nbody\n-inner", "+outer\n+inner\nbody"],
      why: "The using declaration lasts until the end of the outer block, and disposal is in reverse order of creation: inner first, then outer.",
    },
    {
      lang: "csharp",
      code: src`
try
{
    using var r = new Res();
    throw new InvalidOperationException("boom");
}
catch (InvalidOperationException e)
{
    Console.WriteLine($"caught {e.Message}");
}

sealed class Res : IDisposable
{
    public void Dispose() => Console.WriteLine("disposed");
}
`,
      output: "disposed\ncaught boom",
      distractors: ["caught boom\ndisposed", "caught boom", "disposed"],
      why: "A using declaration is a `try` / `finally` around the rest of its block, so `Dispose` runs while the exception leaves the block, before the `catch` sees it.",
    },
    {
      lang: "csharp",
      code: src`
var counted = Count(x => x + 1, out var calls);
counted(1); counted(2); counted(3);
Console.WriteLine(calls());

static Func<int, int> Count(Func<int, int> f, out Func<int> calls)
{
    int n = 0;
    calls = () => n;
    return x => { n++; return f(x); };
}
`,
      output: "3",
      distractors: ["0", "1", "6"],
      why: "Both lambdas capture the same variable `n`, not a copy of it, so the wrapper's increments are visible through `calls`: three calls.",
    },
    {
      lang: "python",
      code: src`
from contextlib import contextmanager

@contextmanager
def section(name):
    print("start", name)
    yield
    print("end", name)

try:
    with section("a"):
        raise KeyError("x")
except KeyError:
    print("handled")
`,
      output: "start a\nhandled",
      distractors: ["start a\nend a\nhandled", "start a\nhandled\nend a", "handled"],
      why: "The exception is raised inside the generator at `yield`. With no `try` / `finally` around the `yield`, the line after it never runs, so \"end a\" is skipped. Always put the clean-up in `finally`.",
    },
  ],
  pitfalls: [
    "Forgetting `functools.wraps`, so every decorated function reports its name as `wrapper` in logs and stack traces.",
    "A `@contextmanager` function without `try` / `finally` around `yield`: the clean-up is skipped when the block raises.",
    "Returning True from `__exit__` by accident, which silently swallows every exception in the block.",
    "Creating an `IDisposable` (a `StreamReader`, an `HttpResponseMessage`, a database connection) without `using`, leaking it until the GC gets round to it.",
    "Caching with `lru_cache` on methods or with unhashable arguments: the cache keeps `self` alive, and lists or dicts as arguments raise TypeError.",
    "Expecting a C# attribute to do something by itself. Nothing happens unless the compiler or some code reads it.",
  ],
  next: [
    { id: "adv-cleanup-order", label: "Exercise: Open and Close in the Right Order" },
    { id: "adv-memoize", label: "Exercise: A Memoizing Wrapper" },
    { id: "lang-metaprogramming", label: "Dunder Methods, Operators and Reflection" },
  ],
};
