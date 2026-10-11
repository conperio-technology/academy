namespace DsaAcademy.Content.Tools;

public class SyncPrimitivesTool : ITool
{
    public string Id => "sync-primitives";
    public string Section => "Concurrency & Memory";
    public string Track => "concurrency";
    public int Order => 30;
    public string Title => "Locks, Mutexes, Semaphores and Atomics";
    public string OneLiner => "The synchronization toolbox in C#: what each tool guarantees, what it costs, and which one an interviewer expects for a given problem.";
    public string KeyTakeaway =>
        "Use Interlocked for a single counter or flag, lock for a critical section inside one process, " +
        "SemaphoreSlim to cap how many callers run at once (and as an async-friendly lock, since you cannot " +
        "await inside lock), ReaderWriterLockSlim when reads vastly outnumber writes, and a named Mutex only " +
        "when the exclusion must span processes. Reach for a concurrent collection before building your own.";

    public ToolKind ToolKind => ToolKind.SyncPrimitives;

    public string Explanation =>
        "All of these exist to answer one question: when two threads want the same thing, who goes first and " +
        "who waits? They differ in how many threads they let through, whether the waiting thread sleeps or " +
        "spins, whether they work across processes, and whether they cooperate with async code.\n\n" +
        "A lock (mutual exclusion lock) lets exactly one thread into a critical section. C#'s lock statement " +
        "is shorthand for Monitor.Enter and Monitor.Exit in a try/finally, so the lock is released even if " +
        "the code throws. It is reentrant (the thread holding it can take it again), cheap when uncontended, meaning " +
        "no other thread wants it (it spins, retrying in a tight loop, briefly before asking the OS to put the thread to sleep), and works only within one " +
        "process. Lock on a private readonly object you own, never on this, a Type or a string, because " +
        "outside code could lock the same object and deadlock you.\n\n" +
        "A mutex in OS terms is the same idea implemented by the kernel. In .NET, System.Threading.Mutex is " +
        "the kernel version: slower (every acquire is a system call), but it can be named and shared across " +
        "processes, for example to stop a second copy of an app from starting. It has thread affinity: only " +
        "the thread that acquired it may release it.\n\n" +
        "A semaphore holds a count of permits. Wait takes a permit (blocking if none are left) and Release " +
        "returns one, and any thread may release. A semaphore with N permits lets up to N threads in at once, " +
        "which is how you throttle: at most 3 concurrent downloads, at most 10 database connections. " +
        "SemaphoreSlim is the lightweight in-process version and it has WaitAsync, so SemaphoreSlim(1, 1) is " +
        "the standard way to get mutual exclusion around code that awaits. A binary semaphore looks like a " +
        "mutex, but it has no owner, so nothing stops the wrong thread from releasing it.\n\n" +
        "Atomics (the Interlocked class) are single CPU instructions that read, modify and write one memory " +
        "location indivisibly: Increment, Add, Exchange, and CompareExchange, the compare-and-swap (CAS) that " +
        "lock-free data structures are built on. No thread ever blocks, but they cover one variable at a " +
        "time. volatile is not a lock: it only stops the compiler and CPU from caching or reordering reads " +
        "and writes of that field, so it fits a stop flag but cannot make count++ safe.\n\n" +
        "ReaderWriterLockSlim allows many readers at once but a writer alone, which helps only when reads " +
        "dominate and the critical section is long enough to matter. And before writing any of this yourself, " +
        "check System.Collections.Concurrent: ConcurrentDictionary, ConcurrentQueue and BlockingCollection, " +
        "plus System.Threading.Channels, already solve the common cases correctly.";
}
