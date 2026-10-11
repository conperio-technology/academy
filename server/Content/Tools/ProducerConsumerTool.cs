namespace DsaAcademy.Content.Tools;

public class ProducerConsumerTool : ITool
{
    public string Id => "producer-consumer";
    public string Section => "Concurrency & Memory";
    public string Track => "concurrency";
    public int Order => 50;
    public string Title => "Producer-Consumer: a Bounded Blocking Queue";
    public string OneLiner => "The classic interview problem: a thread-safe queue (safe to use from several threads at once) with a fixed capacity, where producers wait when it's full and consumers wait when it's empty.";
    public string KeyTakeaway =>
        "Hold one lock around every queue access, wait in a while loop (never an if) until the condition you " +
        "need is true, and wake waiters after every change. Monitor.Wait releases the lock while it sleeps and " +
        "reacquires it before returning, so the condition must be checked again: another thread may have " +
        "changed it first. With one shared wait set, use PulseAll, because Pulse can wake the wrong kind of " +
        "thread and leave everyone asleep. In production, use Channel.CreateBounded or BlockingCollection.";

    public ToolKind ToolKind => ToolKind.ProducerConsumer;

    public string Explanation =>
        "Producers create work (incoming requests, log lines, frames to encode) and consumers process it. A " +
        "queue between them lets each side run at its own pace. A bounded queue also gives you backpressure: " +
        "when consumers fall behind, the queue fills and producers are made to wait, instead of memory growing " +
        "until the process dies. \"Implement a thread-safe bounded blocking queue\" is one of the most common " +
        "concurrency questions at large tech companies.\n\n" +
        "The shape of the answer: a plain Queue<T> and a capacity, guarded by one lock object. Enqueue takes " +
        "the lock, and while the queue is full it calls Monitor.Wait(gate). Wait atomically releases the lock " +
        "and puts the thread to sleep in the lock's wait set; when another thread calls Monitor.Pulse or " +
        "PulseAll on the same object, the waiter wakes up, reacquires the lock, and Wait returns. Then it adds " +
        "the item and calls PulseAll so any waiting consumer wakes. Dequeue is the mirror image: while empty, " +
        "wait; take an item; PulseAll.\n\n" +
        "Why while and not if? When a woken thread finally reacquires the lock, the world may have changed " +
        "again. Two consumers were waiting on an empty queue, a producer added one item and pulsed both; the " +
        "first consumer takes the item, and the second one, if it used if, now dequeues from an empty queue " +
        "and throws. Waits can also return spuriously in some runtimes. A while loop re-checks the condition " +
        "every time, so it is correct whatever woke you. Try the if bug in the simulator below.\n\n" +
        "Why PulseAll and not Pulse? Monitor gives each lock a single wait set, so producers waiting for space " +
        "and consumers waiting for items sleep in the same set. Pulse wakes one waiter, chosen by the runtime, " +
        "and if a consumer's pulse wakes another consumer instead of the sleeping producer, that consumer sees " +
        "an empty queue and goes back to sleep. The producer is never woken. Do that a few times and every " +
        "thread is waiting with nobody left to wake them. Languages with separate condition variables (Java's " +
        "Condition, C++'s std::condition_variable) solve this with a notFull and a notEmpty condition; in C# " +
        "PulseAll is the simple correct choice.\n\n" +
        "An alternative is two SemaphoreSlims, one counting free slots and one counting filled slots, which " +
        "also gives you WaitAsync for async producers. And in real code you write none of it: " +
        "Channel.CreateBounded<T>(capacity) is async, fast and correct, and BlockingCollection<T> with a " +
        "bounded capacity is the older blocking equivalent.";
}
