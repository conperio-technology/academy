import { useState } from "react";

// A reference card per primitive, a "which one would you use?" scenario drill, and a small
// SemaphoreSlim model: permits, who is running, and who is queued in WaitAsync.

type Key = "lock" | "mutex" | "semaphore" | "interlocked" | "rwlock" | "concurrent";

const TOOLS: { key: Key; name: string; lets: string; cross: string; async: string; use: string; code: string }[] = [
  {
    key: "lock",
    name: "lock / Monitor",
    lets: "1 thread",
    cross: "no",
    async: "no",
    use: "The default for protecting shared state inside one process: several fields that must change together, a check-then-act, a non-thread-safe collection.",
    code: `private readonly object _gate = new();
private decimal _balance;
private readonly List<string> _history = new();

public void Deposit(decimal amount)
{
    lock (_gate)                  // one thread at a time
    {
        _balance += amount;       // both changes are seen
        _history.Add($"+{amount}"); // together or not at all
    }
}`,
  },
  {
    key: "mutex",
    name: "Mutex (named)",
    lets: "1 thread",
    cross: "yes",
    async: "no",
    use: "Mutual exclusion across processes, e.g. allow only one running copy of a tool. A kernel object, so every acquire is a system call: much slower than lock.",
    code: `using var mutex = new Mutex(false, @"Global\\Conperio.Importer");

if (!mutex.WaitOne(TimeSpan.Zero))
{
    Console.WriteLine("Another importer is already running.");
    return;
}
try   { RunImport(); }
finally { mutex.ReleaseMutex(); }   // only the owning thread may release`,
  },
  {
    key: "semaphore",
    name: "SemaphoreSlim",
    lets: "N threads",
    cross: "no",
    async: "yes (WaitAsync)",
    use: "Throttling: at most N callers inside at once. With one permit, it is the standard async-friendly lock, because you cannot await inside a lock block.",
    code: `private static readonly SemaphoreSlim _throttle = new(3); // 3 permits

public async Task<string> FetchAsync(string url)
{
    await _throttle.WaitAsync();       // take a permit, or wait
    try
    {
        return await _http.GetStringAsync(url);
    }
    finally
    {
        _throttle.Release();           // give it back
    }
}`,
  },
  {
    key: "interlocked",
    name: "Interlocked",
    lets: "never blocks",
    cross: "no*",
    async: "yes",
    use: "One variable updated atomically: counters, flags, swapping in a new reference. CompareExchange (compare-and-swap) is the building block of lock-free code.",
    code: `private long _requests;
private Config _config = Config.Default;

public void OnRequest() => Interlocked.Increment(ref _requests);

public void Reload(Config fresh)
{
    // Swap in the new object atomically; readers see old or new, never half.
    Interlocked.Exchange(ref _config, fresh);
}

private int _max;

// Lock-free max: compare-and-swap, retry if another thread got in first.
public void Observe(int value)
{
    int seen, updated;
    do { seen = _max; updated = Math.Max(seen, value); }
    while (Interlocked.CompareExchange(ref _max, updated, seen) != seen);
}`,
  },
  {
    key: "rwlock",
    name: "ReaderWriterLockSlim",
    lets: "many readers or 1 writer",
    cross: "no",
    async: "no",
    use: "Read-mostly data where reads are long enough for contention to matter, like a lookup table refreshed once an hour. For short reads a plain lock is often faster.",
    code: `private readonly ReaderWriterLockSlim _rw = new();

public Price Get(string sku)
{
    _rw.EnterReadLock();          // many readers at once
    try   { return _prices[sku]; }
    finally { _rw.ExitReadLock(); }
}

public void Refresh(Dictionary<string, Price> fresh)
{
    _rw.EnterWriteLock();         // waits for readers to leave, then alone
    try   { _prices = fresh; }
    finally { _rw.ExitWriteLock(); }
}`,
  },
  {
    key: "concurrent",
    name: "Concurrent collections",
    lets: "many threads",
    cross: "no",
    async: "Channel: yes",
    use: "Before writing any locking yourself: ConcurrentDictionary, ConcurrentQueue, BlockingCollection and System.Threading.Channels are already correct and fast.",
    code: `private readonly ConcurrentDictionary<string, int> _hits = new();

public void Hit(string page)
{
    // Atomic read-modify-write per key, no lock of your own.
    _hits.AddOrUpdate(page, 1, (_, n) => n + 1);
}

// Note: GetOrAdd's factory can run more than once under a race;
// only one result is stored. Wrap it in Lazy<T> if it must run once.
var conn = _pool.GetOrAdd(host, h => new Lazy<Conn>(() => Open(h))).Value;`,
  },
];

const SCENARIOS: { q: string; answer: Key; why: string }[] = [
  {
    q: "Count page views from many threads as cheaply as possible.",
    answer: "interlocked",
    why: "One integer, one atomic increment. No lock object, nothing ever blocks.",
  },
  {
    q: "Allow at most 5 calls at a time to a slow partner API from an async service.",
    answer: "semaphore",
    why: "A semaphore with 5 permits is exactly \"at most 5 inside\", and WaitAsync waits without blocking a thread.",
  },
  {
    q: "Move money between two fields (balance and pending) so no reader ever sees one updated without the other.",
    answer: "lock",
    why: "The invariant spans two variables, so no single atomic instruction covers it. A lock makes the pair of writes one unit.",
  },
  {
    q: "You need mutual exclusion around code that awaits a database call.",
    answer: "semaphore",
    why: "C# forbids await inside a lock block (the continuation may run on another thread, which could not release a Monitor). SemaphoreSlim(1, 1) with WaitAsync and Release in finally is the standard answer.",
  },
  {
    q: "Stop a second copy of a command-line tool from running on the same machine.",
    answer: "mutex",
    why: "Only a named, kernel-level Mutex is visible to other processes.",
  },
  {
    q: "A big in-memory price list is read thousands of times a second and replaced once an hour.",
    answer: "rwlock",
    why: "Readers can share; only the hourly writer needs to be alone. (Swapping the whole dictionary with Interlocked.Exchange and never mutating it is an even simpler answer, and worth mentioning.)",
  },
  {
    q: "Cache computed results per key, shared by all request threads.",
    answer: "concurrent",
    why: "ConcurrentDictionary.GetOrAdd does the check-and-insert atomically per key. Hand-rolling it with a Dictionary and a lock works, but is code you'd have to get right yourself.",
  },
];

const PERMITS = 3;

export function SyncPrimitives() {
  const [sel, setSel] = useState<Key>("lock");
  const [picked, setPicked] = useState<(Key | null)[]>(SCENARIOS.map(() => null));
  const [running, setRunning] = useState<number[]>([]);
  const [waiting, setWaiting] = useState<number[]>([]);
  const [next, setNext] = useState(1);

  const tool = TOOLS.find((t) => t.key === sel)!;
  const score = picked.filter((p, i) => p === SCENARIOS[i].answer).length;
  const answered = picked.filter((p) => p !== null).length;

  const request = () => {
    if (running.length < PERMITS) setRunning([...running, next]);
    else setWaiting([...waiting, next]);
    setNext(next + 1);
  };
  const finish = () => {
    if (running.length === 0) return;
    const rest = running.slice(1);
    // Release hands the permit straight to the longest waiter, if any.
    if (waiting.length > 0) {
      setRunning([...rest, waiting[0]]);
      setWaiting(waiting.slice(1));
    } else setRunning(rest);
  };

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>The toolbox</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Tool</th>
                <th>Lets in</th>
                <th>Across processes</th>
                <th>Inside async code</th>
              </tr>
            </thead>
            <tbody>
              {TOOLS.map((t) => (
                <tr key={t.key} className={t.key === sel ? "cm-row-on" : ""}>
                  <td>
                    <button className="link-button" onClick={() => setSel(t.key)}>
                      {t.name}
                    </button>
                  </td>
                  <td>{t.lets}</td>
                  <td>{t.cross}</td>
                  <td>{t.async}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="bigo-table-footnote">* Interlocked works on shared memory, so it also works across processes that map the same memory, but that's rare.</p>
        <div className="arch-detail">
          <strong>{tool.name}</strong>
          <p>{tool.use}</p>
        </div>
        <pre className="algo-code">{tool.code}</pre>
      </div>

      <div className="crypto-section">
        <h3>SemaphoreSlim(3): a throttle you can watch</h3>
        <div className="cm-actions">
          <button onClick={request}>A request calls WaitAsync()</button>
          <button onClick={finish} disabled={running.length === 0}>
            One finishes and calls Release()
          </button>
          <button
            onClick={() => {
              setRunning([]);
              setWaiting([]);
              setNext(1);
            }}
          >
            Reset
          </button>
        </div>
        <div className="mq-pipeline">
          <div className="mq-box">
            <strong>Permits free</strong>
            <div className="cm-permits">
              {Array.from({ length: PERMITS }, (_, i) => (
                <span key={i} className={i < PERMITS - running.length ? "cm-permit" : "cm-permit cm-permit-used"} />
              ))}
            </div>
            <span className="mq-small">CurrentCount = {PERMITS - running.length}</span>
          </div>
          <div className="mq-box">
            <strong>Inside (holding a permit)</strong>
            <div className="mq-consumers">
              {running.length ? running.map((r) => <span key={r} className="mq-c mq-c-busy">req {r}</span>) : <span className="mq-small">nobody</span>}
            </div>
          </div>
          <div className="mq-box">
            <strong>Waiting in WaitAsync</strong>
            <div className="mq-consumers">
              {waiting.length ? waiting.map((r) => <span key={r} className="mq-c">req {r}</span>) : <span className="mq-small">nobody</span>}
            </div>
          </div>
        </div>
        <p className="gate-note">
          The fourth caller waits, but with WaitAsync no thread is blocked: the request is just a continuation parked until a permit is released.
          Forgetting Release (no finally) leaks a permit for good, and after three such bugs the throttle lets nobody in.
        </p>
      </div>

      <div className="crypto-section">
        <h3>Which would you use?</h3>
        <ol className="cm-quiz">
          {SCENARIOS.map((sc, i) => (
            <li key={i}>
              <p>{sc.q}</p>
              <div className="sql-presets">
                {TOOLS.map((t) => (
                  <button
                    key={t.key}
                    className={picked[i] === t.key ? (t.key === sc.answer ? "active" : "cm-wrong") : ""}
                    onClick={() => setPicked(picked.map((p, k) => (k === i ? t.key : p)))}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
              {picked[i] !== null && (
                <p className={picked[i] === sc.answer ? "constraint-ok" : "constraint-fail"}>
                  {picked[i] === sc.answer ? "Right. " : `Not quite: ${TOOLS.find((t) => t.key === sc.answer)!.name}. `}
                  {sc.why}
                </p>
              )}
            </li>
          ))}
        </ol>
        {answered > 0 && (
          <p className="gate-note">
            {score} of {SCENARIOS.length} right{answered < SCENARIOS.length ? ` so far (${answered} answered)` : ""}.
          </p>
        )}
      </div>
    </div>
  );
}
