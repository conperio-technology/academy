namespace DsaAcademy.Content.Tools;

public class LangConcurrencyTool : ITool
{
    public string Id => "lang-concurrency";
    public string Section => "Programming in C# & Python";
    public string Track => "advanced";
    public int Order => 2100;
    public string Title => "Threads, Locks, the GIL and Parallelism";
    public string OneLiner => "Running work at the same time: threads and race conditions, locks and atomic operations, the GIL and why Python uses processes for CPU-bound work, thread pools, Parallel.For, thread-safe collections, producer-consumer queues and deadlocks.";
    public string KeyTakeaway =>
        "Threads share memory, so any read-modify-write of shared data needs a lock, an atomic operation or a thread-safe collection. C# threads run truly in parallel; CPython's GIL lets only one thread run Python code at a time, so use threads for waiting and processes for calculation. Prefer pools, Parallel and queues over raw threads.";

    public ToolKind ToolKind => ToolKind.LangConcurrency;

    public string Explanation =>
        "A thread is an independent path of execution inside a program. Several threads can wait for devices or networks at the same time, or keep several processor cores busy, but because they share memory, two threads changing the same data can corrupt it in ways that depend on timing.\n\n" +
        "The lesson shows a race condition and its fix in both languages, explains Python's global interpreter lock and when to use processes instead of threads, and covers the everyday tools: thread pools, Parallel.For and ProcessPoolExecutor, thread-safe queues and dictionaries, and the lock-ordering rule that prevents deadlocks.\n\n" +
        "Every sample runs as a normal program. There's no graded exercise: the exercise sandbox's C# allowlist has no System.Threading, and Python in the browser has no threads. The Concurrency & Memory section goes further into the operating system side.";
}
