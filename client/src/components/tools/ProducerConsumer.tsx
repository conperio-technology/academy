import { useState } from "react";
import { CodeTabs } from "./concurrencyShared";

// A bounded buffer shared by two producers and two consumers, all using one Monitor (one
// lock, one wait set), exactly like the C# below. Each click runs one thread's whole call
// while it holds the lock, up to the point where it either finishes or calls Wait. A
// woken thread resumes right after its Wait, so what it does next depends on whether the
// code says while (check again) or if (assume the condition still holds).

type Kind = "producer" | "consumer";
type TState = "ready" | "waiting" | "woken";

const THREADS: { name: string; kind: Kind }[] = [
  { name: "P1", kind: "producer" },
  { name: "P2", kind: "producer" },
  { name: "C1", kind: "consumer" },
  { name: "C2", kind: "consumer" },
];

interface Sim {
  queue: number[];
  nextItem: number;
  states: TState[];
  waitSet: number[]; // thread indexes, longest waiter first
  log: string[];
  error: string | null;
}

const fresh = (): Sim => ({ queue: [], nextItem: 1, states: THREADS.map(() => "ready"), waitSet: [], log: [], error: null });

interface Opts {
  capacity: number;
  useWhile: boolean;
  pulseAll: boolean;
}

function notify(s: Sim, o: Opts, who: string) {
  if (s.waitSet.length === 0) {
    s.log.push(`${who} calls ${o.pulseAll ? "PulseAll" : "Pulse"}: nobody is waiting`);
    return;
  }
  const woken = o.pulseAll ? s.waitSet : [s.waitSet[0]];
  woken.forEach((t) => (s.states[t] = "woken"));
  s.waitSet = s.waitSet.filter((t) => !woken.includes(t));
  s.log.push(`${who} calls ${o.pulseAll ? "PulseAll" : "Pulse"}, waking ${woken.map((t) => THREADS[t].name).join(", ")}`);
}

function run(prev: Sim, t: number, o: Opts): Sim {
  const s: Sim = { ...prev, queue: [...prev.queue], states: [...prev.states], waitSet: [...prev.waitSet], log: [...prev.log] };
  const { name, kind } = THREADS[t];
  const woken = s.states[t] === "woken";
  const blocked = kind === "producer" ? s.queue.length >= o.capacity : s.queue.length === 0;
  const recheck = !woken || o.useWhile;
  const prefix = woken ? `${name} wakes, reacquires the lock` : `${name} takes the lock`;

  if (blocked && recheck) {
    s.states[t] = "waiting";
    s.waitSet.push(t);
    s.log.push(`${prefix}; queue is ${kind === "producer" ? "full" : "empty"}, so it calls Monitor.Wait (releasing the lock)`);
    return s;
  }

  s.states[t] = "ready";
  if (kind === "producer") {
    const item = s.nextItem++;
    s.queue.push(item);
    s.log.push(`${prefix}${woken && !o.useWhile ? " and skips the check (if)" : ""}; enqueues item ${item}`);
    if (s.queue.length > o.capacity) {
      s.error = `Buffer overflow: ${s.queue.length} items in a ${o.capacity}-slot queue. The woken producer assumed there was room because there was when it was told to wake up.`;
      return s;
    }
  } else {
    if (s.queue.length === 0) {
      s.log.push(`${prefix}${!o.useWhile ? " and skips the check (if)" : ""}; calls Dequeue on an empty queue`);
      s.error = "InvalidOperationException: Queue empty. Another consumer took the item between the PulseAll and this thread getting the lock back.";
      return s;
    }
    const item = s.queue.shift()!;
    s.log.push(`${prefix}${woken && !o.useWhile ? " and skips the check (if)" : ""}; dequeues item ${item}`);
  }
  notify(s, o, name);
  return s;
}

const SCENARIOS: { label: string; opts: Opts; seq: number[]; note: string }[] = [
  {
    label: "if instead of while",
    opts: { capacity: 2, useWhile: false, pulseAll: true },
    seq: [2, 3, 0, 2, 3],
    note: "C1 and C2 both wait on an empty queue. P1 adds one item and wakes both. C1 gets the lock first and takes it. C2 wakes up after its Wait, doesn't re-check, and dequeues from an empty queue.",
  },
  {
    label: "Pulse wakes the wrong thread",
    opts: { capacity: 1, useWhile: true, pulseAll: false },
    seq: [2, 3, 0, 1, 0, 2, 3, 2],
    note: "Capacity 1. Both consumers wait, P1 adds an item and wakes C1, both producers find the queue full and wait. C1 takes the item, and its single Pulse wakes the longest waiter: C2, a consumer, not a producer. C2 finds the queue empty and goes back to sleep, then C1 does too. Every thread is waiting and nobody is left to wake anyone.",
  },
];

const CODE = [
  {
    label: "Monitor (the interview answer)",
    code: `public class BoundedBlockingQueue<T>
{
    private readonly Queue<T> _items = new();
    private readonly object _gate = new();
    private readonly int _capacity;

    public BoundedBlockingQueue(int capacity) => _capacity = capacity;

    public void Enqueue(T item)
    {
        lock (_gate)
        {
            while (_items.Count == _capacity)   // while, not if
                Monitor.Wait(_gate);            // releases _gate while asleep
            _items.Enqueue(item);
            Monitor.PulseAll(_gate);            // wake waiting consumers
        }
    }

    public T Dequeue()
    {
        lock (_gate)
        {
            while (_items.Count == 0)
                Monitor.Wait(_gate);
            T item = _items.Dequeue();
            Monitor.PulseAll(_gate);            // wake waiting producers
            return item;
        }
    }
}`,
    note: "Monitor.Wait must be called while holding the lock. It releases the lock, sleeps until pulsed, then reacquires the lock before returning.",
  },
  {
    label: "Two semaphores (async)",
    code: `public class BoundedQueue<T>
{
    private readonly Queue<T> _items = new();
    private readonly object _gate = new();
    private readonly SemaphoreSlim _free;          // empty slots
    private readonly SemaphoreSlim _filled = new(0); // items ready

    public BoundedQueue(int capacity) => _free = new SemaphoreSlim(capacity);

    public async Task EnqueueAsync(T item)
    {
        await _free.WaitAsync();        // wait for a slot
        lock (_gate) _items.Enqueue(item);
        _filled.Release();              // one more item
    }

    public async Task<T> DequeueAsync()
    {
        await _filled.WaitAsync();      // wait for an item
        T item;
        lock (_gate) item = _items.Dequeue();
        _free.Release();                // one more slot
        return item;
    }
}`,
    note: "Each semaphore counts one condition, so there's no wrong-thread wake-up problem, and WaitAsync parks the caller without blocking a thread.",
  },
  {
    label: "Channel (production)",
    code: `var channel = Channel.CreateBounded<Order>(new BoundedChannelOptions(100)
{
    FullMode = BoundedChannelFullMode.Wait,   // producers wait when full
});

// producer
await channel.Writer.WriteAsync(order);

// consumer
await foreach (var order in channel.Reader.ReadAllAsync())
    await ProcessAsync(order);

// shutdown: no more writes; readers drain what's left, then the loop ends
channel.Writer.Complete();`,
    note: "System.Threading.Channels is what you'd use in real .NET code. BlockingCollection<T> with a bounded capacity is the older, blocking equivalent.",
  },
];

export function ProducerConsumer() {
  const [opts, setOpts] = useState<Opts>({ capacity: 3, useWhile: true, pulseAll: true });
  const [s, setS] = useState<Sim>(fresh);
  const [note, setNote] = useState<string | null>(null);

  const change = (o: Partial<Opts>) => {
    setOpts({ ...opts, ...o });
    setS(fresh());
    setNote(null);
  };

  const scenario = (sc: (typeof SCENARIOS)[number]) => {
    let x = fresh();
    for (const t of sc.seq) if (!x.error && x.states[t] !== "waiting") x = run(x, t, sc.opts);
    setOpts(sc.opts);
    setS(x);
    setNote(sc.note);
  };

  const hung = !s.error && s.states.every((st) => st === "waiting");

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>A bounded buffer, two producers, two consumers</h3>
        <div className="cache-controls">
          <label>
            Capacity: <strong>{opts.capacity}</strong>
            <input type="range" min={1} max={4} value={opts.capacity} onChange={(e) => change({ capacity: Number(e.target.value) })} />
          </label>
        </div>
        <div className="sql-presets">
          <button className={opts.useWhile ? "active" : ""} onClick={() => change({ useWhile: true })}>
            while (condition) Wait
          </button>
          <button className={!opts.useWhile ? "active" : ""} onClick={() => change({ useWhile: false })}>
            if (condition) Wait (bug)
          </button>
        </div>
        <div className="sql-presets">
          <button className={opts.pulseAll ? "active" : ""} onClick={() => change({ pulseAll: true })}>
            PulseAll
          </button>
          <button className={!opts.pulseAll ? "active" : ""} onClick={() => change({ pulseAll: false })}>
            Pulse (wakes one)
          </button>
        </div>

        <div className="cm-buffer" aria-label="Queue contents">
          {Array.from({ length: Math.max(opts.capacity, s.queue.length) }, (_, i) => (
            <span key={i} className={`cm-slot ${i < s.queue.length ? "cm-slot-full" : ""} ${i >= opts.capacity ? "cm-slot-over" : ""}`}>
              {i < s.queue.length ? `#${s.queue[i]}` : ""}
            </span>
          ))}
          <span className="mq-small">
            {s.queue.length}/{opts.capacity}
          </span>
        </div>

        <div className="cm-threads cm-threads-4">
          {THREADS.map((th, i) => (
            <div key={th.name} className={`cm-card ${s.states[i] === "waiting" ? "cm-card-blocked" : ""} ${s.states[i] === "woken" ? "cm-card-woken" : ""}`}>
              <strong>
                {th.name} <span className="mq-small">{th.kind}</span>
              </strong>
              <span className="mq-small">
                {s.states[i] === "ready" && (th.kind === "producer" ? "about to call Enqueue" : "about to call Dequeue")}
                {s.states[i] === "waiting" && "asleep in Monitor.Wait"}
                {s.states[i] === "woken" && "pulsed: will resume after Wait"}
              </span>
              <button disabled={s.states[i] === "waiting" || !!s.error} onClick={() => setS(run(s, i, opts))}>
                {s.states[i] === "waiting" ? "waiting" : s.states[i] === "woken" ? "Resume" : th.kind === "producer" ? "Enqueue" : "Dequeue"}
              </button>
            </div>
          ))}
        </div>
        <p className="mq-small">Wait set: {s.waitSet.length ? s.waitSet.map((t) => THREADS[t].name).join(", ") : "empty"}</p>

        <div className="cm-actions">
          {SCENARIOS.map((sc) => (
            <button key={sc.label} onClick={() => scenario(sc)}>
              Replay: {sc.label}
            </button>
          ))}
          <button onClick={() => { setS(fresh()); setNote(null); }}>Reset</button>
        </div>

        {note && <p className="gate-note">{note}</p>}
        {s.error && <p className="constraint-fail">{s.error}</p>}
        {hung && (
          <p className="constraint-fail">
            Hung: all four threads are asleep in Wait and none is left to call Pulse. This is a lost wake-up. PulseAll, or separate conditions for
            "not full" and "not empty", prevents it.
          </p>
        )}

        {s.log.length > 0 && (
          <ol className="sql-txn-log">
            {s.log.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ol>
        )}
      </div>

      <div className="crypto-section">
        <h3>Three ways to write it in C#</h3>
        <CodeTabs samples={CODE} />
      </div>
    </div>
  );
}
