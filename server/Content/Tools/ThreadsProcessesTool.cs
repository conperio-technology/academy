namespace DsaAcademy.Content.Tools;

public class ThreadsProcessesTool : ITool
{
    public string Id => "threads-processes";
    public string Section => "Concurrency & Memory";
    public string Track => "concurrency";
    public int Order => 10;
    public string Title => "Threads vs Processes and the Scheduler";
    public string OneLiner => "What a process owns, what its threads share, and how the OS slices one CPU core between many threads.";
    public string KeyTakeaway =>
        "A process owns an address space (the memory it can see: its code, heap and globals), open file handles and other OS resources; " +
        "a thread owns only a stack, its registers (the CPU's working slots) and an instruction pointer (where it is in the code), and shares everything else " +
        "with the other threads in its process. Sharing memory is what makes threads cheap to create and to " +
        "switch between, and it is also exactly why they need locks. The scheduler gives each runnable thread " +
        "a short time slice, then saves its registers and loads another thread's: a context switch.";

    public ToolKind ToolKind => ToolKind.ThreadsProcesses;

    public string Explanation =>
        "A process is a running program plus everything the OS has handed it: a private virtual address space " +
        "(its code, its heap, its global and static data), a table of open files and sockets (network connections), environment " +
        "variables, a user identity and security token. Two processes cannot read each other's memory unless " +
        "they deliberately set up shared memory or talk through pipes, sockets or files. That isolation is " +
        "why one crashed browser tab does not take down the others, and why starting a process is " +
        "comparatively expensive: the OS has to build a whole new address space.\n\n" +
        "A thread is one path of execution inside a process. Every process starts with one thread, and can " +
        "start more. Each thread gets its own stack (a scratch area of memory for its local variables and the frames of the calls in progress; see Stack vs Heap and Garbage Collection), its own copy " +
        "of the CPU registers and its own instruction pointer, but all the threads in a process share the same " +
        "heap (the area where objects live), the same statics and the same open files. In C#, two threads that can reach the same " +
        "object are touching the very same bytes in memory, with nothing between them. That is the whole " +
        "reason race conditions exist.\n\n" +
        "A CPU core runs one thread at a time. The OS scheduler keeps a queue of runnable (ready) threads " +
        "and gives each one a time slice, often a few milliseconds. When the slice runs out, or the thread " +
        "blocks on I/O or a lock, the scheduler performs a context switch: it saves the current thread's " +
        "registers and instruction pointer, picks the next ready thread, and restores that thread's saved " +
        "registers. A blocked thread is not in the ready queue at all, so it costs no CPU while it waits. " +
        "Switching between threads of the same process is cheaper than switching between processes, because " +
        "the address space stays the same and the CPU's address translation cache (the TLB) stays useful.\n\n" +
        "Concurrency and parallelism are different words. Concurrency means several tasks are in progress at " +
        "once, possibly by taking turns on one core. Parallelism means they literally run at the same instant " +
        "on different cores. Turn the core count down to 1 below and you still get concurrency, just no " +
        "parallelism. In .NET you rarely create raw Thread objects: Task.Run and the thread pool reuse a " +
        "small set of threads, because each thread reserves its own stack (1 MB by default on Windows) plus a kernel object.\n\n" +
        "Interview phrasing to have ready: \"processes are isolated and communicate through IPC (inter-process communication: pipes, sockets, shared memory); threads share " +
        "memory and communicate through it, which is faster but needs synchronization.\" For the hardware " +
        "underneath (cores, RAM, the OS boundary) see Computer Architecture in Computer Fundamentals.";
}
