import { src, type LangLessonData } from "./types.ts";

export const asyncBasics: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Waiting without blocking: two slow calls at once",
      csharp: src`
var timer = System.Diagnostics.Stopwatch.StartNew();
Task<string> a = FetchAsync("PLC-1", 500);
Task<string> b = FetchAsync("PLC-2", 500);       // both are now in progress
string[] results = await Task.WhenAll(a, b);
Console.WriteLine(string.Join(", ", results));   // PLC-1 ok, PLC-2 ok
Console.WriteLine(timer.ElapsedMilliseconds < 900 ? "about 0.5 s, not 1 s" : "slow");

static async Task<string> FetchAsync(string name, int ms)
{
    await Task.Delay(ms);        // stands in for a network call
    return $"{name} ok";
}
`,
      python: src`
import asyncio
import time


async def fetch(name, seconds):
    await asyncio.sleep(seconds)     # stands in for a network call
    return f"{name} ok"


async def main():
    start = time.perf_counter()
    results = await asyncio.gather(fetch("PLC-1", 0.5), fetch("PLC-2", 0.5))
    print(results)                                   # ['PLC-1 ok', 'PLC-2 ok']
    elapsed = time.perf_counter() - start
    print("about 0.5 s, not 1 s" if elapsed < 0.9 else "slow")


asyncio.run(main())
`,
      notes: [
        "Much of a program's time is spent waiting: for a network reply, a database, a file, a PLC. Asynchronous (async) code lets the program start a slow operation, do other things (including starting more slow operations) while it's in progress, and pick up the result when it arrives. Here two half-second waits overlap, so the whole thing takes about half a second instead of one.",
        "An `async` method returns a promise of a result: a `Task<string>` in C#, a coroutine in Python, which becomes a Task when the event loop runs it. `await` means \"pause this method until that result is ready, and let other work run meanwhile\". `Task.WhenAll` and `asyncio.gather` wait for several at once and return the results in the order you passed them in.",
        "Async is about waiting efficiently, not about using more CPU cores: it shines for I/O (input and output, like network and disk), not for heavy calculations. Python needs an event loop (the scheduler that runs async code, switching between tasks at each `await`), started by `asyncio.run(main())` once at the top of the program; C# lets top-level code use `await` directly.",
      ],
    },
    {
      kind: "code",
      title: "What runs when: the order of events",
      csharp: src`
Console.WriteLine("1 caller starts");
Task work = StepAsync();
Console.WriteLine("3 caller carries on");
await work;
Console.WriteLine("5 caller done");

static async Task StepAsync()
{
    Console.WriteLine("2 StepAsync runs until its first await");
    await Task.Delay(100);
    Console.WriteLine("4 StepAsync resumes");
}
`,
      python: src`
import asyncio


async def step():
    print("3 step starts only when main awaits")
    await asyncio.sleep(0.1)
    print("4 step resumes")


async def main():
    print("1 main starts")
    task = asyncio.create_task(step())     # scheduled, not started yet
    print("2 main carries on")
    await task
    print("5 main done")


asyncio.run(main())
`,
      notes: [
        "The two languages differ in one important detail. Calling a C# async method runs it straight away, on the caller's thread, up to its first `await` of something unfinished; only then does control return to the caller. A Python coroutine doesn't start when called: `create_task` schedules it, and it starts the next time the running code hands control back to the event loop, which happens at an `await`.",
        "That's why the numbering differs. In both, everything between two `await`s runs without interruption, which makes async code much easier to reason about than threads.",
      ],
    },
    {
      kind: "code",
      title: "One after the other, or at the same time",
      csharp: src`
var log = new List<string>();

await Job("A", 300, log);                 // wait for A, then start B
await Job("B", 100, log);
Console.WriteLine(string.Join(" ", log)); // start A end A start B end B

log.Clear();
await Task.WhenAll(Job("A", 300, log), Job("B", 100, log));   // start both
Console.WriteLine(string.Join(" ", log)); // start A start B end B end A

static async Task Job(string name, int ms, List<string> log)
{
    log.Add($"start {name}");
    await Task.Delay(ms);
    log.Add($"end {name}");
}
`,
      python: src`
import asyncio


async def job(name, seconds, log):
    log.append(f"start {name}")
    await asyncio.sleep(seconds)
    log.append(f"end {name}")


async def main():
    log = []
    await job("A", 0.3, log)              # wait for A, then start B
    await job("B", 0.1, log)
    print(" ".join(log))                  # start A end A start B end B

    log.clear()
    await asyncio.gather(job("A", 0.3, log), job("B", 0.1, log))   # start both
    print(" ".join(log))                  # start A start B end B end A


asyncio.run(main())
`,
      notes: [
        "`await` on each call in turn is sequential: correct when B needs A's result, but slow when they're independent. Starting them all first and then awaiting them together lets the waits overlap. Running the waits overlapped like this is called concurrency.",
      ],
    },
    {
      kind: "code",
      title: "Forgetting to await, and exceptions",
      csharp: src`
var t = SlowAsync();
Console.WriteLine(t.IsCompleted);     // False: still in progress
Console.WriteLine(await t);           // 42

try
{
    await FailAsync();
}
catch (InvalidOperationException e)
{
    Console.WriteLine($"caught: {e.Message}");   // caught: sensor offline
}

static async Task<int> SlowAsync()
{
    await Task.Delay(50);
    return 42;
}

static async Task FailAsync()
{
    await Task.Delay(10);
    throw new InvalidOperationException("sensor offline");
}
`,
      python: src`
import asyncio


async def slow():
    await asyncio.sleep(0.05)
    return 42


async def fail():
    await asyncio.sleep(0.01)
    raise RuntimeError("sensor offline")


async def main():
    c = slow()                       # nothing runs yet: just a coroutine object
    print(type(c).__name__)          # coroutine
    print(await c)                   # 42
    try:
        await fail()
    except RuntimeError as e:
        print(f"caught: {e}")        # caught: sensor offline


asyncio.run(main())
`,
      notes: [
        "Without `await` you hold the promise, not the result. C# warns (CS4014) when you call an async method and ignore the Task; Python prints \"RuntimeWarning: coroutine ... was never awaited\" if a coroutine is never run. An exception inside an async method is stored in its Task and thrown again at the `await`, so ordinary `try` / `catch` and `try` / `except` work.",
        "Don't block on async code: `.Result` or `.Wait()` in C# can freeze or deadlock some apps, and in Python, a plain `time.sleep` inside a coroutine stops the whole event loop. Use `await Task.Delay` / `await asyncio.sleep`, and let async spread up through the methods that call it (\"async all the way\").",
      ],
    },
    {
      kind: "table",
      title: "Async side by side",
      head: ["", "C#", "Python"],
      rows: [
        ["Declare", "`async Task<int> GetAsync()`", "`async def get() -> int:`"],
        ["A pending result", "`Task<T>`, or `Task` for no result", "coroutine; `asyncio.Task` once scheduled"],
        ["Wait for it", "`await t`", "`await c`"],
        ["Start without waiting", "call the method and keep the Task", "`asyncio.create_task(c)`"],
        ["Wait for several", "`await Task.WhenAll(a, b)`", "`await asyncio.gather(a, b)`"],
        ["Pause without blocking", "`await Task.Delay(ms)`", "`await asyncio.sleep(s)`"],
        ["Give up after a time", "`await t.WaitAsync(TimeSpan.FromSeconds(2))`", "`await asyncio.wait_for(c, 2)`"],
        ["Cancel", "pass a `CancellationToken`", "`task.cancel()`"],
        ["Heavy CPU work off the main thread", "`await Task.Run(() => Work())`", "`await asyncio.to_thread(work)`"],
        ["Program entry", "top-level `await`, or `async Task Main()`", "`asyncio.run(main())`"],
      ],
      notes: [
        "Naming convention: C# async methods end in `Async`. Stage 3 covers cancellation, timeouts, async streams and what the event loop does in detail; async/await vs Threads in Concurrency & Memory explains the threads underneath.",
      ],
    },
    {
      kind: "text",
      title: "Why there's no graded async exercise",
      paragraphs: [
        "The C# runner behind the graded exercises only allows plain computation, and `System.Threading.Tasks` isn't on its list, so `Task` and `await` can't be graded there. Python's event loop in the browser is shared with the page, which makes timing-based tests unreliable. So async is taught here and in stage 3 with runnable samples instead: copy any of them into a file and run it with `dotnet run file.cs` or `python file.py` to experiment.",
      ],
    },
  ],
  predict: [
    {
      lang: "csharp",
      code: src`
Console.Write("A");
var t = Work();
Console.Write("C");
await t;
Console.WriteLine("E");

static async Task Work()
{
    Console.Write("B");
    await Task.Delay(10);
    Console.Write("D");
}
`,
      output: "ABCDE",
      distractors: ["ACBDE", "ABDCE", "ACDBE"],
      why: "`Work()` runs immediately up to its `await`, printing B before returning to the caller. The caller prints C, then waits; D appears when the delay ends.",
    },
    {
      lang: "python",
      code: src`
import asyncio

async def work():
    print("B", end="")
    await asyncio.sleep(0.01)
    print("D", end="")

async def main():
    print("A", end="")
    t = asyncio.create_task(work())
    print("C", end="")
    await t
    print("E")

asyncio.run(main())
`,
      output: "ACBDE",
      distractors: ["ABCDE", "ABDCE", "ACDBE"],
      why: "`create_task` only schedules `work`. It starts when `main` reaches `await t` and hands control to the event loop, so C prints before B. This is where Python differs from C#.",
    },
    {
      lang: "python",
      code: src`
import asyncio

async def work():
    print("B", end="")
    await asyncio.sleep(0.01)
    print("D", end="")

async def main():
    print("A", end="")
    await work()
    print("C")

asyncio.run(main())
`,
      output: "ABDC",
      distractors: ["ABCD", "ACBD", "AC"],
      why: "Awaiting the coroutine directly runs it to completion before `main` continues, so B and D both come before C.",
    },
    {
      lang: "csharp",
      code: src`
var t = Quick();
Console.WriteLine(t.IsCompleted);
Console.WriteLine(await t);

#pragma warning disable CS1998
static async Task<int> Quick() => 7;
`,
      output: "True\n7",
      distractors: ["False\n7", "True\nSystem.Threading.Tasks.Task`1[System.Int32]", "False\nSystem.Threading.Tasks.Task`1[System.Int32]"],
      why: "An async method with nothing to wait for runs to the end before returning, so its Task is already complete. (The compiler warns about an `async` method with no `await`; the pragma hides that warning.)",
    },
    {
      lang: "python",
      code: src`
import asyncio

async def job(name, delay):
    await asyncio.sleep(delay)
    print("finished", name)
    return name

async def main():
    results = await asyncio.gather(job("slow", 0.2), job("fast", 0.05))
    print(results)

asyncio.run(main())
`,
      output: "finished fast\nfinished slow\n['slow', 'fast']",
      distractors: ["finished slow\nfinished fast\n['slow', 'fast']", "finished fast\nfinished slow\n['fast', 'slow']", "finished slow\nfinished fast\n['fast', 'slow']"],
      why: "Both run at once, so the shorter wait finishes first. `gather` still returns results in the order the jobs were passed in, not the order they finished.",
    },
    {
      lang: "csharp",
      code: src`
var results = await Task.WhenAll(Job("slow", 200), Job("fast", 50));
Console.WriteLine(string.Join(",", results));

static async Task<string> Job(string name, int ms)
{
    await Task.Delay(ms);
    return name;
}
`,
      output: "slow,fast",
      distractors: ["fast,slow", "slow", "fast"],
      why: "`Task.WhenAll` returns an array in the order the tasks were given, whichever finished first.",
    },
    {
      lang: "python",
      code: src`
import asyncio

async def answer():
    return 42

async def main():
    x = answer()
    print(type(x).__name__)
    print(await x)

asyncio.run(main())
`,
      output: "coroutine\n42",
      distractors: ["int\n42", "42\n42", "coroutine\ncoroutine"],
      why: "Calling an `async def` function gives a coroutine object without running anything. Only `await` runs it and produces 42.",
    },
    {
      lang: "csharp",
      code: src`
try
{
    await Fail();
    Console.WriteLine("after");
}
catch (InvalidOperationException e)
{
    Console.WriteLine($"caught {e.Message}");
}

static async Task Fail()
{
    await Task.Delay(10);
    throw new InvalidOperationException("sensor offline");
}
`,
      output: "caught sensor offline",
      distractors: ["after", "after\ncaught sensor offline", "AggregateException"],
      why: "The exception is stored in the Task and thrown again by `await`, so `try` / `catch` works as if the call were ordinary, and \"after\" is skipped.",
    },
  ],
  pitfalls: [
    "Forgetting `await`, so you print or use a Task or coroutine object instead of its result, and errors inside it go unnoticed.",
    "Awaiting independent calls one by one when they could overlap with `Task.WhenAll` / `asyncio.gather`.",
    "Blocking inside async code: `.Result` / `.Wait()` in C#, `time.sleep` or other slow non-async calls in a Python coroutine.",
    "Using async for heavy calculation. It doesn't add CPU power; use `Task.Run`, threads or processes.",
    "Calling `asyncio.run` more than once, or from inside a coroutine. Use it once, at the top.",
  ],
  next: [
    { id: "async-await", label: "async/await vs Threads (Concurrency & Memory)" },
    { id: "lang-testing", label: "Unit Testing with xUnit and pytest" },
    { id: "threads-processes", label: "Threads vs Processes and the Scheduler" },
  ],
};
