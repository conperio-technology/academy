namespace DsaAcademy.Content.Tools;

public class CpuSchedulingTool : ITool
{
    public string Id => "cpu-scheduling";
    public string Section => "Computer Fundamentals";
    public string Track => "operating systems and runtimes";
    public string Title => "CPU Scheduling: FCFS, SJF, Round Robin and Priority";
    public string OneLiner => "How the OS decides which ready process (running program) gets the CPU next, and how that choice changes waiting time, response time and fairness.";
    public string KeyTakeaway =>
        "Every scheduling algorithm trades one metric for another. First-come first-served is simple and fair in " +
        "order, but one long job makes everyone behind it wait (the convoy effect). Shortest job first gives the " +
        "lowest average waiting time, but it needs to know burst lengths in advance and can starve long jobs. Round " +
        "robin bounds how long anyone waits for a turn, at the cost of more context switches. Priority scheduling " +
        "serves what matters first and starves what doesn't, unless the scheduler ages waiting processes upward.";

    public ToolKind ToolKind => ToolKind.CpuScheduling;

    public string Explanation =>
        "A CPU core (one independent processing unit; most CPUs have several) runs one thread at a time, so whenever more threads are " +
        "ready than there are cores, the OS scheduler has to pick. A process is a running program, and a thread is one sequence of instructions inside it; Concurrency & Memory covers both in depth. The textbooks call the unit of work a process with a CPU burst: how long it needs the CPU " +
        "before it finishes or blocks on I/O (input/output: waiting for the disk, the network or a keyboard). (The lesson Threads vs Processes and the Scheduler, in Concurrency " +
        "and Memory, covers what a context switch saves and restores. This lesson is about the policy: who goes next.)\n\n" +
        "Three numbers measure a schedule. Turnaround time is completion time minus arrival time. Waiting time is " +
        "turnaround minus burst: the time spent ready but not running. Response time is the time from arrival until " +
        "the process first gets the CPU, which is what an interactive user feels. A scheduler is non-preemptive if a " +
        "process keeps the CPU until it finishes or blocks, and preemptive if the OS can take the CPU away, normally when " +
        "the timer interrupt fires (a hardware signal, every few milliseconds, that makes the CPU pause and run the OS) or a more important process becomes ready.\n\n" +
        "First-come first-served (FCFS) runs processes in arrival order, non-preemptively. It's a plain FIFO (first in, first out) queue, but " +
        "if a 20 ms job arrives just before three 2 ms jobs, all three wait behind it: the convoy effect. Shortest job " +
        "first (SJF) picks the ready process with the smallest burst, and is provably optimal for average waiting time " +
        "among non-preemptive schedules. Its preemptive form, shortest remaining time first (SRTF), switches as soon as " +
        "a shorter job arrives. The catch for both is that the OS can't know burst lengths in advance; real schedulers " +
        "estimate them from past behaviour, typically with an exponential average.\n\n" +
        "Round robin (RR) gives each process a fixed time quantum and then moves it to the back of the queue. With n " +
        "ready processes and quantum q, nobody waits more than (n minus 1) times q for a turn, which is why RR suits " +
        "time-sharing systems. A quantum that's too large turns RR back into FCFS; one that's too small spends the CPU on context " +
        "switches (saving one process's state and loading another's). Priority scheduling runs the most important ready process first (in this lesson a lower " +
        "number means higher priority, as in Unix nice values). If high-priority work keeps arriving, a low-priority " +
        "process may never run: starvation. The standard fix is aging, which raises a process's priority the longer it waits.\n\n" +
        "Real kernels (the kernel is the core of the OS) combine these ideas. A multilevel feedback queue keeps several priority levels with round robin " +
        "inside each, and demotes processes that use their whole quantum (CPU-bound) while keeping ones that block early " +
        "(interactive) near the top. Windows uses 32 priority levels with temporary boosts for threads that wake from I/O " +
        "or own the foreground window. Linux used the Completely Fair Scheduler, which tracks how much CPU time each task " +
        "has had and runs the one that has had least, and since kernel 6.6 it uses EEVDF, which also accounts for " +
        "deadlines so latency-sensitive tasks get on the CPU sooner.\n\n" +
        "In an interview, say which metric you are optimizing before naming an algorithm: throughput, average " +
        "waiting time, response time for interactive users, or fairness. Then mention the trade-off you're accepting.";
}
