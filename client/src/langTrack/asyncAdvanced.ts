import { src, type LangLessonData } from "./types.ts";

export const asyncAdvanced: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "What await really does: the event loop and the state machine",
      csharp: src`
var log = new List<string>();
Task a = Worker("A", log);
Task b = Worker("B", log);
await Task.WhenAll(a, b);
Console.WriteLine(string.Join(" ", log));   // A1 B1 then A2 and B2 in either order

Console.WriteLine(Quick().IsCompleted);      // True: nothing to wait for, so no pause

static async Task Worker(string name, List<string> log)
{
    lock (log) log.Add(name + "1");
    await Task.Delay(50);      // returns to the caller; resumes later on a pool thread
    lock (log) log.Add(name + "2");
}

static async Task<int> Quick()
{
    await Task.CompletedTask;  // already finished: carries straight on
    return 1;
}
`,
      python: src`
import asyncio

log = []


async def worker(name):
    log.append(name + "1")
    await asyncio.sleep(0)     # hand control back to the event loop
    log.append(name + "2")


async def main():
    await asyncio.gather(worker("A"), worker("B"))
    print(" ".join(log))       # A1 B1 A2 B2


asyncio.run(main())
`,
      notes: [
        "The compiler turns a C# async method into a state machine: an object that remembers which `await` it reached and the values of its local variables. At an `await` on something unfinished, the method registers \"call me back when it's done\" (a continuation) and returns to its caller. When the awaited work finishes, the continuation resumes the method. In a console app or ASP.NET Core it resumes on any thread-pool thread, which is why the log needs a lock; in a desktop UI app it goes back to the UI thread. An `await` on something already finished doesn't pause at all.",
        "Python's event loop runs on one thread. It keeps a queue of ready tasks and runs each until it reaches an `await` that has to wait; then it picks the next ready task. So between two `await`s your code is never interrupted, and no lock is needed for plain Python data. `await asyncio.sleep(0)` is the explicit way to say \"let others run now\".",
        "Both models are cooperative: a task gives up control only at an `await`. A long calculation or a blocking call (`time.sleep`, `requests.get`, a synchronous database driver) inside a coroutine freezes every other task on the loop. Move such work to a thread with `await asyncio.to_thread(work)`, or in C# use `await Task.Run(work)`.",
      ],
    },
    {
      kind: "code",
      title: "Cancellation: asking work to stop",
      csharp: src`
using var cts = new CancellationTokenSource();
cts.CancelAfter(TimeSpan.FromMilliseconds(150));   // cancel automatically later

try
{
    await PollAsync(cts.Token);
}
catch (OperationCanceledException)
{
    Console.WriteLine("polling stopped");           // polling stopped
}

static async Task PollAsync(CancellationToken token)
{
    int polls = 0;
    try
    {
        while (true)
        {
            token.ThrowIfCancellationRequested();   // check between steps
            polls++;
            await Task.Delay(50, token);            // Delay also watches the token
        }
    }
    finally
    {
        Console.WriteLine(polls >= 2 ? "cleaned up after a few polls" : "too few");   // cleaned up after a few polls
    }
}
`,
      python: src`
import asyncio


async def poll():
    polls = 0
    try:
        while True:
            polls += 1
            await asyncio.sleep(0.05)    # cancellation arrives at an await
    except asyncio.CancelledError:
        print("cleaned up after a few polls" if polls >= 2 else "too few")   # cleaned up after a few polls
        raise                            # let the cancellation finish


async def main():
    task = asyncio.create_task(poll())
    await asyncio.sleep(0.15)
    task.cancel()                        # request cancellation
    try:
        await task
    except asyncio.CancelledError:
        print("polling stopped")         # polling stopped
    print(task.cancelled())              # True


asyncio.run(main())
`,
      notes: [
        "Cancellation is cooperative in both languages: you can't kill a running method from outside, you ask it to stop and it stops at a safe point. In C# the caller owns a `CancellationTokenSource` and passes its `Token` down; long-running methods take a `CancellationToken` parameter (by convention the last one), hand it to everything they await, and check it between steps. Cancelling makes the awaited call throw `OperationCanceledException` (or its subclass `TaskCanceledException`), which unwinds through `finally` blocks like any exception.",
        "In Python, `task.cancel()` throws `asyncio.CancelledError` into the task at the `await` where it's paused. Clean up in `finally` or `except CancelledError`, then re-raise it; swallowing it makes the task look as if it finished normally and breaks timeouts and task groups. `CancelledError` derives from `BaseException`, so a plain `except Exception` doesn't catch it.",
      ],
    },
    {
      kind: "code",
      title: "Timeouts",
      csharp: src`
try
{
    await SlowDeviceAsync().WaitAsync(TimeSpan.FromMilliseconds(100));
}
catch (TimeoutException e)
{
    Console.WriteLine(e.Message);         // The operation has timed out.
}

using var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(100));
try
{
    await Task.Delay(2000, cts.Token);    // the token also stops the work itself
}
catch (OperationCanceledException)
{
    Console.WriteLine("cancelled by the timeout");   // cancelled by the timeout
}

static async Task SlowDeviceAsync() => await Task.Delay(2000);
`,
      python: src`
import asyncio


async def slow_device():
    await asyncio.sleep(2)


async def main():
    try:
        async with asyncio.timeout(0.1):      # Python 3.11+
            await slow_device()
    except TimeoutError:
        print("timed out")                    # timed out

    try:
        await asyncio.wait_for(slow_device(), timeout=0.1)
    except TimeoutError:
        print("wait_for timed out too")       # wait_for timed out too


asyncio.run(main())
`,
      notes: [
        "Every call that waits on something outside your program (a network service, a device, a database) needs a timeout, or one stuck dependency hangs everything that waits on it. `WaitAsync(timeout)` stops waiting but leaves the work running in the background; passing a token from `new CancellationTokenSource(timeout)` actually cancels the work, which is usually what you want. Many APIs take a timeout directly too (`HttpClient.Timeout`).",
        "Python's `asyncio.timeout` and `wait_for` cancel the inner task when time runs out and raise `TimeoutError` (the built-in; before 3.11 it was `asyncio.TimeoutError`).",
      ],
    },
    {
      kind: "code",
      title: "First to finish, and limiting how many run at once",
      csharp: src`
Task<string> primary = Fetch("primary", 300);
Task<string> backup = Fetch("backup", 50);
Task<string> first = await Task.WhenAny(primary, backup);   // whichever finishes first
Console.WriteLine(await first);                             // backup

var gate = new SemaphoreSlim(2);         // at most 2 inside at once
int running = 0, peak = 0;
var jobs = Enumerable.Range(1, 6).Select(async i =>
{
    await gate.WaitAsync();
    try
    {
        int now = Interlocked.Increment(ref running);
        lock (gate) peak = Math.Max(peak, now);
        await Task.Delay(30);
        Interlocked.Decrement(ref running);
    }
    finally { gate.Release(); }
});
await Task.WhenAll(jobs);
Console.WriteLine(peak);                 // 2

static async Task<string> Fetch(string name, int ms)
{
    await Task.Delay(ms);
    return name;
}
`,
      python: src`
import asyncio


async def fetch(name, seconds):
    await asyncio.sleep(seconds)
    return name


async def main():
    tasks = [asyncio.create_task(fetch("primary", 0.3)), asyncio.create_task(fetch("backup", 0.05))]
    for next_done in asyncio.as_completed(tasks):   # in finishing order
        print(await next_done)                      # backup, then primary

    gate = asyncio.Semaphore(2)                     # at most 2 inside at once
    running = peak = 0

    async def job():
        nonlocal running, peak
        async with gate:
            running += 1
            peak = max(peak, running)
            await asyncio.sleep(0.03)
            running -= 1

    await asyncio.gather(*(job() for _ in range(6)))
    print(peak)                                     # 2


asyncio.run(main())
`,
      notes: [
        "`Task.WhenAny` returns the first task to finish (the task itself, so await it again for its result or exception); `asyncio.as_completed` yields results in finishing order, and `asyncio.wait(..., return_when=FIRST_COMPLETED)` matches `WhenAny`. Losers keep running unless you cancel them.",
        "A semaphore is a counter of free places: entering takes one, leaving gives it back, and when none are free the next caller waits. It's the standard way to say \"at most N requests to this server at once\" while still starting all the work together. Always release in `finally` (C#) or use `async with` (Python), or a failure leaks a place and the program slowly grinds to a halt.",
      ],
    },
    {
      kind: "code",
      title: "Async streams: await foreach and async for",
      csharp: src`
await foreach (var reading in ReadingsAsync(3))
    Console.Write(reading + " ");          // 10 20 30
Console.WriteLine();

static async IAsyncEnumerable<int> ReadingsAsync(int count)
{
    for (int i = 1; i <= count; i++)
    {
        await Task.Delay(20);              // wait for the next value
        yield return i * 10;               // hand it out as soon as it's ready
    }
}
`,
      python: src`
import asyncio


async def readings(count):
    for i in range(1, count + 1):
        await asyncio.sleep(0.02)          # wait for the next value
        yield i * 10                       # an async generator


async def main():
    async for reading in readings(3):
        print(reading, end=" ")            # 10 20 30
    print()
    print([r async for r in readings(2)])  # [10, 20]


asyncio.run(main())
`,
      notes: [
        "An async stream is a sequence whose items arrive over time: messages from a queue, pages from an API, readings from a device. It combines the previous track's iterators with `await`: the producer awaits between items, and the consumer's loop awaits each next item. In C# the method returns `IAsyncEnumerable<T>` and the caller writes `await foreach`; in Python, an `async def` containing `yield` is an async generator, consumed with `async for`.",
        "Like ordinary iterators they're lazy: nothing runs until the loop asks for the next item, so a consumer that stops early stops the producer too.",
      ],
    },
    {
      kind: "code",
      title: "When several tasks fail",
      csharp: src`
Task all = Task.WhenAll(Fail("pump", 10), Fail("valve", 50));
try
{
    await all;
}
catch (InvalidOperationException e)
{
    Console.WriteLine($"await threw: {e.Message}");                  // await threw: pump
    Console.WriteLine($"all errors: {all.Exception!.InnerExceptions.Count}");   // all errors: 2
}

static async Task Fail(string name, int delayMs)
{
    await Task.Delay(delayMs);
    throw new InvalidOperationException(name);
}
`,
      python: src`
import asyncio


async def fail(name):
    await asyncio.sleep(0.01)
    raise ValueError(name)


async def main():
    try:
        async with asyncio.TaskGroup() as group:   # Python 3.11+
            group.create_task(fail("pump"))
            group.create_task(fail("valve"))
    except* ValueError as eg:
        print(sorted(str(e) for e in eg.exceptions))   # ['pump', 'valve']

    results = await asyncio.gather(fail("x"), asyncio.sleep(0, "ok"), return_exceptions=True)
    print(results)                                 # [ValueError('x'), 'ok']


asyncio.run(main())
`,
      notes: [
        "`await Task.WhenAll(...)` rethrows only the first exception; the task's `Exception` property (an `AggregateException`) holds all of them. Python's `TaskGroup` is structured concurrency: no task outlives the `async with` block, a failure cancels the remaining tasks, and every failure is raised together as an `ExceptionGroup`, caught with `except*`. `gather(..., return_exceptions=True)` returns exceptions as values instead of raising.",
      ],
    },
    {
      kind: "table",
      title: "Async in depth side by side",
      head: ["", "C#", "Python"],
      rows: [
        ["Cancel", "`CancellationTokenSource.Cancel()`, token passed down", "`task.cancel()`"],
        ["What the cancelled code sees", "`OperationCanceledException`", "`asyncio.CancelledError` (a BaseException)"],
        ["Timeout", "`t.WaitAsync(timeout)`, `new CancellationTokenSource(timeout)`", "`async with asyncio.timeout(s)`, `asyncio.wait_for(c, s)`"],
        ["First finished", "`Task.WhenAny`", "`asyncio.wait(..., FIRST_COMPLETED)`, `as_completed`"],
        ["Limit concurrency", "`SemaphoreSlim.WaitAsync` / `Release`", "`async with asyncio.Semaphore(n)`"],
        ["Async sequence", "`IAsyncEnumerable<T>`, `await foreach`", "async generator, `async for`"],
        ["Producer-consumer queue", "`System.Threading.Channels.Channel<T>`", "`asyncio.Queue`"],
        ["Group of tasks that fail together", "`Task.WhenAll` plus cancellation", "`asyncio.TaskGroup`"],
        ["Run blocking code", "`await Task.Run(work)`", "`await asyncio.to_thread(work)`"],
        ["Cheap result that's often ready", "`ValueTask<T>`", "(not needed)"],
      ],
      notes: [
        "Library code in C# often writes `await x.ConfigureAwait(false)`, meaning \"don't come back to the caller's UI thread or context\". It matters in UI apps and old ASP.NET; ASP.NET Core and console apps have no such context.",
        "Avoid `async void` except for event handlers: nobody can await it, so its exceptions crash the process. In Python, keep a reference to tasks from `create_task`, or use a TaskGroup: the event loop holds only a weak reference, and an unreferenced task can be garbage collected before it finishes.",
        "Not graded, for the same reason as the basics lesson: the exercise sandbox doesn't allow `System.Threading.Tasks`, and Python in the browser shares its event loop with the page.",
      ],
    },
    {
      kind: "terms",
      title: "Words from this lesson",
      terms: [
        { term: "Continuation", meaning: "The rest of an async method after an `await`, scheduled to run when the awaited work finishes." },
        { term: "Cooperative cancellation", meaning: "Cancellation by request: the running code checks a token or receives an error at an `await` and stops at a safe point." },
        { term: "CancellationToken", meaning: "The C# value passed down to async methods so a caller can ask them to stop." },
        { term: "Semaphore", meaning: "A counter of free places that limits how many tasks or threads can be inside a section at once." },
        { term: "Async stream", meaning: "A sequence whose items arrive over time, consumed with `await foreach` or `async for`." },
        { term: "Structured concurrency", meaning: "Tasks started inside a block all finish (or are cancelled) before the block ends, as with Python's TaskGroup." },
      ],
    },
  ],
  predict: [
    {
      lang: "python",
      code: src`
import asyncio

async def worker(name, log):
    for i in range(2):
        log.append(f"{name}{i}")
        await asyncio.sleep(0)

async def main():
    log = []
    await asyncio.gather(worker("a", log), worker("b", log))
    print(" ".join(log))

asyncio.run(main())
`,
      output: "a0 b0 a1 b1",
      distractors: ["a0 a1 b0 b1", "b0 a0 b1 a1", "a0 b0 b1 a1"],
      why: "The event loop runs `a` until its first `await`, then `b` until its first, then each resumes in turn. `sleep(0)` exists to hand over control exactly like this.",
    },
    {
      lang: "csharp",
      code: src`
using var cts = new CancellationTokenSource();
cts.Cancel();
try
{
    await Task.Delay(1000, cts.Token);
    Console.WriteLine("waited");
}
catch (OperationCanceledException e)
{
    Console.WriteLine(e.GetType().Name);
}
`,
      output: "TaskCanceledException",
      distractors: ["waited", "OperationCanceledException", "TimeoutException"],
      why: "The token is already cancelled, so the delay fails at once. `Task.Delay` throws `TaskCanceledException`, a subclass of `OperationCanceledException`, which is why the `catch` matches it.",
    },
    {
      lang: "python",
      code: src`
import asyncio

async def job():
    try:
        await asyncio.sleep(1)
    finally:
        print("cleanup")

async def main():
    t = asyncio.create_task(job())
    await asyncio.sleep(0.01)
    t.cancel()
    try:
        await t
    except asyncio.CancelledError:
        print("cancelled")

asyncio.run(main())
`,
      output: "cleanup\ncancelled",
      distractors: ["cancelled\ncleanup", "cancelled", "cleanup"],
      why: "`cancel()` raises CancelledError inside `job` at its `await`, so its `finally` runs first; then the error comes out of `await t` in `main`.",
    },
    {
      lang: "python",
      code: src`
import asyncio

async def main():
    try:
        await asyncio.wait_for(asyncio.sleep(1, "late"), timeout=0.05)
    except TimeoutError:
        print("timeout")
    print(await asyncio.wait_for(asyncio.sleep(0.01, "early"), timeout=1))

asyncio.run(main())
`,
      output: "timeout\nearly",
      distractors: ["late\nearly", "timeout\ntimeout", "timeout"],
      why: "`asyncio.sleep(seconds, result)` returns its second argument when it finishes. The first wait is too long for its timeout; the second finishes in time and returns \"early\".",
    },
    {
      lang: "csharp",
      code: src`
var slow = Task.Delay(300).ContinueWith(_ => "slow");
var fast = Task.Delay(30).ContinueWith(_ => "fast");
var winner = await Task.WhenAny(slow, fast);
Console.WriteLine(await winner);
Console.WriteLine(slow.IsCompleted);
`,
      output: "fast\nFalse",
      distractors: ["slow\nTrue", "fast\nTrue", "fast"],
      why: "`WhenAny` completes as soon as the faster task does. The slower one is still running at that moment; WhenAny doesn't wait for or cancel the others.",
    },
    {
      lang: "csharp",
      code: src`
var seen = new List<int>();
await foreach (var x in Numbers())
{
    if (x > 2) break;
    seen.Add(x);
}
Console.WriteLine(string.Join(",", seen));

static async IAsyncEnumerable<int> Numbers()
{
    try
    {
        for (int i = 1; ; i++) { await Task.Yield(); yield return i; }
    }
    finally { Console.WriteLine("producer stopped"); }
}
`,
      output: "producer stopped\n1,2",
      distractors: ["1,2\nproducer stopped", "1,2", "1,2,3\nproducer stopped"],
      why: "Breaking out of `await foreach` disposes the async iterator, which runs the producer's `finally` straight away, before the line after the loop prints the two values seen.",
    },
    {
      lang: "python",
      code: src`
import asyncio

async def countdown(n):
    while n > 0:
        await asyncio.sleep(0)
        yield n
        n -= 1

async def main():
    print([x async for x in countdown(3)])
    print(type(countdown(1)).__name__)

asyncio.run(main())
`,
      output: "[3, 2, 1]\nasync_generator",
      distractors: ["[3, 2, 1]\ncoroutine", "[3, 2, 1]\ngenerator", "[1, 2, 3]\nasync_generator"],
      why: "An `async def` with `yield` is an async generator, not a coroutine. The async comprehension collects its values in the order they're yielded.",
    },
    {
      lang: "python",
      code: src`
import asyncio

async def fail(name):
    raise ValueError(name)

async def main():
    results = await asyncio.gather(fail("a"), asyncio.sleep(0, 5), return_exceptions=True)
    print([type(r).__name__ for r in results])

asyncio.run(main())
`,
      output: "['ValueError', 'int']",
      distractors: ["ValueError: a", "['int']", "['ValueError', 'NoneType']"],
      why: "With `return_exceptions=True`, `gather` puts each exception into the results list instead of raising. The sleep returns its result argument, 5.",
    },
  ],
  pitfalls: [
    "Waiting on a network call or device without a timeout: one hung dependency then hangs everything waiting on it.",
    "Accepting a `CancellationToken` and not passing it to the calls you await, so cancelling does nothing until they finish.",
    "Catching `asyncio.CancelledError` (or `OperationCanceledException`) and carrying on as if nothing happened. Clean up, then let it propagate.",
    "Blocking the event loop with `time.sleep`, CPU-heavy loops or synchronous libraries inside a coroutine.",
    "Starting thousands of requests at once. Limit them with a semaphore.",
    "Using `async void` in C#, or dropping the result of `asyncio.create_task` so the task can vanish.",
  ],
  next: [
    { id: "async-await", label: "async/await vs Threads (Concurrency & Memory)" },
    { id: "lang-decorators-context", label: "Decorators, Context Managers and IDisposable" },
    { id: "lang-async", label: "Async and Await Basics (recap)" },
  ],
};
