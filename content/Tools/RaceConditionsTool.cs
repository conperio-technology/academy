namespace DsaAcademy.Content.Tools;

public class RaceConditionsTool : ITool
{
    public string Id => "race-conditions";
    public string Section => "Concurrency & Memory";
    public string Track => "concurrency";
    public int Order => 20;
    public string Title => "Race Conditions: Why count++ Isn't Safe";
    public string OneLiner => "Interleave two threads' load, add and store yourself and watch an update vanish, then add a lock and try to break it again.";
    public string KeyTakeaway =>
        "count++ is three steps: load the value into a register, add one, store it back. If another thread " +
        "runs between the load and the store, both threads write the same result and one increment is lost. " +
        "A race condition is any bug whose outcome depends on the timing of threads. The fix is to make the read-modify-write " +
        "atomic (indivisible: no other thread can see it half done): a lock around it, or Interlocked.Increment for a single number.";

    public ToolKind ToolKind => ToolKind.RaceConditions;

    public string Explanation =>
        "In C#, count++ looks like one operation, but the CPU sees three: LOAD the current value of count " +
        "from memory into a register, ADD 1 to the register, STORE the register back to memory. Each thread " +
        "has its own registers. If thread A loads 0, and before it stores, thread B also loads 0, then both " +
        "compute 1 and both store 1. Two increments ran and count went up by one. This is a lost update, and " +
        "it is the classic data race: two threads access the same memory, at least one of them writes, and " +
        "nothing orders the accesses.\n\n" +
        "The nasty part is that it usually works. The two threads have to touch the counter within a window a few " +
        "nanoseconds wide, so a test that increments a few hundred times may pass every run on your laptop, " +
        "and then lose thousands of updates on a busy 32-core server. Races are timing dependent, which makes " +
        "them hard to reproduce. You find them by reasoning about every possible interleaving, which is what " +
        "the stepper below lets you do: you play the scheduler.\n\n" +
        "The fix is mutual exclusion. A critical section is code that touches shared state and must not run " +
        "on two threads at once. Wrapping it in lock (gate) { count++; } means a thread must acquire the lock " +
        "before the load and holds it until after the store; a second thread that reaches the lock blocks " +
        "until the first releases it. The load, add and store now happen as one indivisible unit as far as " +
        "every other thread using the same lock is concerned. Every access to the shared value must take the " +
        "same lock: a lock only protects code that agrees to use it.\n\n" +
        "For a single integer, Interlocked.Increment(ref count) does the whole read-modify-write as one " +
        "atomic CPU instruction (lock xadd on x86), with no lock object and no blocking. It is faster, but " +
        "it only works for one variable; the moment an invariant (a rule that must always hold, like \"the balance " +
        "equals the sum of the history\") spans two fields you need a lock. Check-then-act races are the same bug in another shape: if " +
        "(!dict.ContainsKey(k)) dict[k] = v; can let two threads both see \"missing\" and both insert. Use " +
        "ConcurrentDictionary.GetOrAdd or a lock around the whole check-and-act.";
}
