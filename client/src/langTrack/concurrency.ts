import { src, type LangLessonData } from "./types.ts";

export const concurrency: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Two threads, one counter: a race condition and a lock",
      csharp: src`
int unsafeCount = 0, safeCount = 0;
var gate = new object();

void Work()
{
    for (int i = 0; i < 1_000_000; i++)
    {
        unsafeCount++;                 // read, add 1, write back: three steps
        lock (gate) { safeCount++; }   // one thread at a time in here
    }
}

var t1 = new Thread(Work);
var t2 = new Thread(Work);
t1.Start(); t2.Start();                // both run at the same time
t1.Join(); t2.Join();                  // wait for both to finish
Console.WriteLine(safeCount);          // 2000000
Console.WriteLine(unsafeCount <= 2_000_000);   // True; usually well under 2000000
`,
      python: src`
import threading

safe_count = 0
gate = threading.Lock()


def work():
    global safe_count
    for _ in range(100_000):
        with gate:                      # one thread at a time in here
            safe_count += 1


threads = [threading.Thread(target=work) for _ in range(4)]
for t in threads:
    t.start()                           # all four run concurrently
for t in threads:
    t.join()                            # wait for each to finish
print(safe_count)                       # 400000
`,
      notes: [
        "A thread is an independent path of execution inside one program. Threads share the program's memory, which makes them powerful and dangerous: `count++` looks like one step but is three (read the value, add one, write it back), and when two threads interleave those steps one update overwrites the other. That's a race condition: the result depends on timing, so the bug may hide in testing and appear in production. The C# unsafe counter typically ends somewhere between 1,000,000 and 2,000,000.",
        "A lock (also called a mutex, for mutual exclusion) lets one thread at a time run a block of code, the critical section. C#'s `lock (obj) { }` and Python's `with lock:` both release the lock even if the block throws. Keep locked sections short and never call unknown code (a callback, an event) while holding a lock.",
        "`Start` begins a thread; `Join` waits for it to finish. In real code you rarely create threads by hand: C# uses the thread pool through `Task.Run` and `Parallel`, and Python uses `concurrent.futures`, both shown below.",
      ],
    },
    {
      kind: "code",
      title: "The GIL: Python threads wait well but don't compute in parallel",
      csharp: src`
using System.Diagnostics;

var sw = Stopwatch.StartNew();
long serial = 0;
for (int i = 0; i < 4; i++) serial += CountPrimes(200_000);
long serialMs = sw.ElapsedMilliseconds;

sw.Restart();
long parallel = 0;
Parallel.For(0, 4, _ => Interlocked.Add(ref parallel, CountPrimes(200_000)));
long parallelMs = sw.ElapsedMilliseconds;

Console.WriteLine($"{serial} {parallel}");    // 71936 71936
Console.WriteLine(Environment.ProcessorCount > 1 ? (parallelMs < serialMs ? "parallel was faster" : "no speed-up") : "one core");

static int CountPrimes(int limit)
{
    int count = 0;
    for (int n = 2; n < limit; n++)
    {
        bool prime = true;
        for (int d = 2; d * d <= n; d++)
            if (n % d == 0) { prime = false; break; }
        if (prime) count++;
    }
    return count;
}
`,
      python: src`
import time
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor


def wait_for_device(n):
    time.sleep(0.2)          # stands in for a network or serial call
    return n


def count_primes(limit):
    return sum(all(n % d for d in range(2, int(n**0.5) + 1)) for n in range(2, limit))


if __name__ == "__main__":
    start = time.perf_counter()
    with ThreadPoolExecutor(max_workers=4) as pool:
        print(list(pool.map(wait_for_device, range(4))))   # [0, 1, 2, 3]
    print("waits overlapped" if time.perf_counter() - start < 0.6 else "slow")   # waits overlapped

    with ProcessPoolExecutor() as pool:                  # separate processes, separate GILs
        print(sum(pool.map(count_primes, [50_000] * 4)))  # 20532
`,
      notes: [
        "CPython has a global interpreter lock (GIL): only one thread runs Python bytecode at a time. Threads still help when they spend their time waiting (on a network, a disk, a serial port, `time.sleep`), because a waiting thread releases the GIL. They don't speed up pure-Python calculation: four threads counting primes take as long as one.",
        "For CPU-heavy work (calculation that keeps a processor core busy) Python uses processes: `ProcessPoolExecutor` or `multiprocessing` start separate Python interpreters, each with its own GIL, and send arguments and results between them by pickling (serializing them to bytes). That costs time per call, so give each process a decent chunk of work. The `if __name__ == \"__main__\":` guard is required, because each worker process imports your file. NumPy and other C libraries also release the GIL while they work. Python 3.13 offers an experimental free-threaded build without a GIL, but most code still runs with it.",
        "C# has no GIL: threads run truly in parallel on all cores. `Parallel.For` and `Parallel.ForEach` split a loop across the thread pool, and `Interlocked.Add` adds to a shared number atomically, as one indivisible step, without a lock. Use them for CPU-bound work and async/await for waiting.",
      ],
    },
    {
      kind: "code",
      title: "Thread pools, tasks and thread-safe collections",
      csharp: src`
using System.Collections.Concurrent;

var lengths = new ConcurrentDictionary<string, int>();
string[] tags = ["FT-101", "PT-2", "LT-30", "TT-4"];
Parallel.ForEach(tags, tag => lengths[tag] = tag.Length);   // safe from many threads
Console.WriteLine(string.Join(",", lengths.OrderBy(kv => kv.Key).Select(kv => kv.Value)));  // 6,5,4,4

Task<int> job = Task.Run(() => tags.Sum(t => t.Length));    // runs on a pool thread
Console.WriteLine(await job);                               // 19

var queue = new BlockingCollection<int>(boundedCapacity: 2);
var consumer = Task.Run(() =>
{
    int total = 0;
    foreach (int item in queue.GetConsumingEnumerable()) total += item;
    return total;
});
for (int i = 1; i <= 5; i++) queue.Add(i);    // waits while the queue is full
queue.CompleteAdding();                       // tells the consumer no more is coming
Console.WriteLine(await consumer);            // 15
`,
      python: src`
import queue
import threading
from concurrent.futures import ThreadPoolExecutor

tags = ["FT-101", "PT-2", "LT-30", "TT-4"]
with ThreadPoolExecutor(max_workers=4) as pool:
    print(list(pool.map(len, tags)))          # [6, 4, 5, 4]: input order
    future = pool.submit(sum, map(len, tags))
    print(future.result())                    # 19

q = queue.Queue(maxsize=2)                    # a thread-safe FIFO queue
totals = []


def consumer():
    total = 0
    while (item := q.get()) is not None:      # None means "no more"
        total += item
    totals.append(total)


t = threading.Thread(target=consumer)
t.start()
for i in range(1, 6):
    q.put(i)                                  # blocks while the queue is full
q.put(None)
t.join()
print(totals[0])                              # 15
`,
      notes: [
        "A thread pool is a set of threads kept alive and reused for many small jobs, because creating a thread is expensive. `Task.Run` and `Parallel` use .NET's shared pool; `ThreadPoolExecutor` makes a Python pool, and `pool.map` returns results in input order, whichever finishes first. `submit` returns a future (a placeholder for a result that isn't ready yet; a C# Task plays the same role) and `.result()` waits for it.",
        "Ordinary `List<T>`, `Dictionary<K, V>` and `HashSet<T>` are not safe to change from several threads at once; use `System.Collections.Concurrent` (`ConcurrentDictionary`, `ConcurrentQueue`, `BlockingCollection`) or a lock. In CPython the GIL makes single operations like `list.append` or `dict[key] = value` safe, but a read-modify-write such as `d[k] += 1` is still a race.",
        "The producer-consumer pattern hands work from producing threads to consuming threads through a queue with a size limit, so a fast producer waits instead of filling memory. That waiting is called backpressure. A final \"no more items\" signal (`CompleteAdding`, or a sentinel value like None) lets the consumer finish cleanly.",
      ],
    },
    {
      kind: "text",
      title: "Deadlocks, and the rules that prevent most threading bugs",
      paragraphs: [
        "A deadlock happens when threads wait for each other forever: thread 1 holds lock A and waits for lock B while thread 2 holds B and waits for A. Neither can move, and the program hangs without an error. The standard prevention is a lock order: if code ever needs two locks, every thread takes them in the same order. Timeouts (`Monitor.TryEnter(gate, timeout)`, `lock.acquire(timeout=1)`) turn a hang into an error you can see.",
        "Rules that prevent most threading bugs: share as little as possible (give each thread its own data and combine the results at the end, as `Parallel.For` with `Interlocked` and `pool.map` do); make shared data immutable; when you must share mutable state, protect every access with the same lock, or use a thread-safe collection; and prefer high-level tools (thread pools, `Parallel`, `concurrent.futures`, queues) over raw threads and locks.",
        "Async and await (next lesson) is a different tool: it overlaps waiting on one thread or a few, which is cheaper than a thread per waiting job. Rough guide: waiting on I/O, use async; CPU-bound work, use `Parallel`/`Task.Run` in C# and processes in Python; blocking library calls with no async version, use a thread pool.",
      ],
    },
    {
      kind: "table",
      title: "Concurrency tools side by side",
      head: ["Need", "C#", "Python"],
      rows: [
        ["Start a thread and wait for it", "`new Thread(f).Start()`, `t.Join()`", "`threading.Thread(target=f).start()`, `t.join()`"],
        ["Run small jobs on a pool", "`Task.Run(() => f())`", "`ThreadPoolExecutor().submit(f)`"],
        ["Run a loop on all cores", "`Parallel.For`, `Parallel.ForEach`, PLINQ `.AsParallel()`", "`ProcessPoolExecutor().map(f, items)`"],
        ["Mutual exclusion", "`lock (obj) { }`", "`with threading.Lock():`"],
        ["Atomic counter", "`Interlocked.Increment(ref n)`", "a lock (no atomic int in the standard library)"],
        ["Limit how many run at once", "`SemaphoreSlim`", "`threading.Semaphore`"],
        ["Thread-safe queue", "`ConcurrentQueue<T>`, `BlockingCollection<T>`, `Channel<T>`", "`queue.Queue`"],
        ["Thread-safe dictionary", "`ConcurrentDictionary<K, V>`", "`dict` with a lock for read-modify-write"],
        ["Signal between threads", "`ManualResetEventSlim`, `CancellationToken`", "`threading.Event`"],
        ["Per-thread data", "`ThreadLocal<T>`, `[ThreadStatic]`", "`threading.local()`"],
      ],
      notes: [
        "Why there's no graded exercise here: the exercise sandbox's C# allowlist has no `System.Threading`, and Python in the browser runs on a single thread with no `threading` support. Copy the samples into a file and run them with `dotnet run file.cs` or `python file.py` instead; run the racy ones several times to see the results change.",
      ],
    },
    {
      kind: "terms",
      title: "Words from this lesson",
      terms: [
        { term: "Thread", meaning: "An independent path of execution inside a program. Threads share the program's memory." },
        { term: "Race condition", meaning: "A bug where the result depends on how threads happen to interleave, such as two threads both doing `count++`." },
        { term: "Lock (mutex)", meaning: "Lets only one thread at a time run a critical section. `lock` in C#, `threading.Lock` in Python." },
        { term: "Atomic operation", meaning: "An operation that happens as one indivisible step, so no other thread can see it half done. `Interlocked.Increment` is one." },
        { term: "GIL", meaning: "CPython's global interpreter lock: only one thread runs Python code at a time, so threads help with waiting but not with calculation." },
        { term: "CPU-bound and I/O-bound", meaning: "CPU-bound work is limited by calculation speed; I/O-bound work spends its time waiting for disks, networks or devices." },
        { term: "Thread pool", meaning: "A set of reusable threads that run many short jobs, avoiding the cost of creating a thread for each." },
        { term: "Deadlock", meaning: "Threads waiting for each other's locks forever. Prevent it by always taking locks in the same order." },
      ],
    },
  ],
  predict: [
    {
      lang: "csharp",
      code: src`
var log = new List<string>();
var t = new Thread(() => log.Add("worker"));
log.Add("before start");
t.Start();
t.Join();
log.Add("after join");
Console.WriteLine(string.Join(", ", log));
`,
      output: "before start, worker, after join",
      distractors: ["before start, after join, worker", "worker, before start, after join", "before start, after join"],
      why: "The thread only starts at `Start`, and `Join` waits until it has finished, so its entry is always between the other two. Without the `Join` the order would depend on timing.",
    },
    {
      lang: "csharp",
      code: src`
long total = 0;
Parallel.For(1, 101, i => Interlocked.Add(ref total, i));
Console.WriteLine(total);
`,
      output: "5050",
      distractors: ["100", "less than 5050, varying", "0"],
      why: "`Parallel.For` runs the body for 1 to 100 (the upper bound is exclusive), possibly on several threads, and `Interlocked.Add` makes each addition atomic, so no update is lost: 1 + 2 + ... + 100 = 5050.",
    },
    {
      lang: "csharp",
      code: src`
var results = Enumerable.Range(1, 5).AsParallel().AsOrdered().Select(x => x * x).ToList();
Console.WriteLine(string.Join(" ", results));
`,
      output: "1 4 9 16 25",
      distractors: ["25 16 9 4 1", "The same numbers in a different order each run", "1 2 3 4 5"],
      why: "PLINQ may compute the squares on several threads in any order, but `AsOrdered()` makes it return them in the source order. Without it, the order of the results isn't guaranteed.",
    },
    {
      lang: "csharp",
      code: src`
var tasks = Enumerable.Range(1, 3).Select(i => Task.Run(() => i * 10)).ToArray();
int[] values = await Task.WhenAll(tasks);
Console.WriteLine(string.Join(",", values));
`,
      output: "10,20,30",
      distractors: ["30,30,30", "Any order of 10, 20 and 30", "60"],
      why: "Each lambda captures its own `i` from `Select`, and `Task.WhenAll` returns results in the order the tasks were given, however the pool happened to run them.",
    },
    {
      lang: "python",
      code: src`
from concurrent.futures import ThreadPoolExecutor
import time

def job(n):
    time.sleep(0.1 * (3 - n))
    return n * 2

with ThreadPoolExecutor(max_workers=3) as pool:
    print(list(pool.map(job, [0, 1, 2])))
`,
      output: "[0, 2, 4]",
      distractors: ["[4, 2, 0]", "[0, 1, 2]", "[2, 4, 0]"],
      why: "Job 2 finishes first and job 0 last, but `map` returns results in the order of its inputs.",
    },
    {
      lang: "python",
      code: src`
import threading

def greet():
    print(threading.current_thread().name)

t = threading.Thread(target=greet, name="poller")
t.start()
t.join()
greet()
`,
      output: "poller\nMainThread",
      distractors: ["MainThread\npoller", "poller\npoller", "Thread-1\nMainThread"],
      why: "Inside the thread, `current_thread()` is the thread named \"poller\". The second call runs on the program's original thread, which Python names MainThread.",
    },
    {
      lang: "python",
      code: src`
import queue

q = queue.Queue()
for tag in ["a", "b", "c"]:
    q.put(tag)
print(q.get(), q.get(), q.qsize())
`,
      output: "a b 1",
      distractors: ["c b 1", "a b 3", "a a 2"],
      why: "`queue.Queue` is first in, first out, so the first two items come out first, leaving one. (`queue.LifoQueue` would give c and b.)",
    },
    {
      lang: "python",
      code: src`
import threading

done = threading.Event()
seen = []

def worker():
    done.wait()
    seen.append("worker saw the event")

t = threading.Thread(target=worker)
t.start()
seen.append("main sets it")
done.set()
t.join()
print(seen)
`,
      output: "['main sets it', 'worker saw the event']",
      distractors: ["['worker saw the event', 'main sets it']", "['main sets it']", "The order changes from run to run"],
      why: "The worker blocks in `done.wait()` until the main thread calls `set()`, which happens after main's append, so the order is fixed even though two threads are involved.",
    },
  ],
  pitfalls: [
    "Sharing a `List<T>`, `Dictionary` or counter between threads without a lock or a concurrent collection.",
    "Expecting Python threads to speed up calculation. Use processes (or NumPy) for CPU-bound work; threads only help with waiting.",
    "Forgetting the `if __name__ == \"__main__\":` guard with `multiprocessing` or `ProcessPoolExecutor`, so every worker process starts the whole program again.",
    "Taking two locks in different orders in different places: the classic deadlock.",
    "Calling `.Result` or `.Wait()` on tasks inside code that could itself be awaited, which wastes a thread and can deadlock UI and older ASP.NET apps.",
    "Assuming the order threads finish in. Use `Join`, `Task.WhenAll`, `pool.map` or an `Event` when order matters.",
  ],
  next: [
    { id: "race-conditions", label: "Race Conditions: Why count++ Isn't Safe (Concurrency & Memory)" },
    { id: "sync-primitives", label: "Locks, Mutexes, Semaphores and Atomics (Concurrency & Memory)" },
    { id: "lang-async-advanced", label: "Async in Depth: Cancellation, Timeouts and Streams" },
  ],
};
