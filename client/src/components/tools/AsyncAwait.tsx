import { useMemo, useState } from "react";
import { CodeListing, Timeline, type TimelineRow } from "./concurrencyShared";

// Part 1: a deterministic server model. 12 requests arrive at once; each is CPU work, then
// a wait on the database, then a little more CPU. A pool of threads runs them on 4 cores.
// Blocking: a thread keeps its request for the whole time, sitting blocked through the
// database wait. async/await: at the await the thread is handed back to the pool, and the
// rest of the request (the continuation) is queued for whichever thread is free when the
// database answers.
// Part 2: a line-by-line walk through what one await does.

const CORES = 4;
const REQUESTS = 12;

type Workload = "io" | "cpu";
const PHASES: Record<Workload, [number, number, number]> = {
  io: [1, 6, 1], // cpu, db wait, cpu
  cpu: [5, 1, 1],
};

type CellKind = "cpu" | "blocked" | "nocore" | "idle";

interface Result {
  rows: { kind: CellKind; req: number | null }[][];
  ioWaiting: number[]; // per tick: requests waiting on I/O with no thread
  ticks: number;
  blockedTicks: number;
}

function simulate(work: Workload, asyncMode: boolean, threads: number): Result {
  const reqs = Array.from({ length: REQUESTS }, () => ({ left: [...PHASES[work]], phase: 0, thread: null as number | null }));
  const queue: number[] = reqs.map((_, i) => i);
  const th: (number | null)[] = Array(threads).fill(null);
  const rows: Result["rows"] = Array.from({ length: threads }, () => []);
  const ioWaiting: number[] = [];
  let blockedTicks = 0;
  let t = 0;

  while (reqs.some((r) => r.phase < 3) && t < 80) {
    // Free threads take the next queued work item: a new request or a continuation.
    for (let k = 0; k < threads; k++) {
      if (th[k] === null && queue.length) {
        const r = queue.shift()!;
        th[k] = r;
        reqs[r].thread = k;
      }
    }
    // Threads wanting CPU share the cores, rotating so nobody starves.
    const wantCpu = th.map((r, k) => (r !== null && reqs[r].phase !== 1 ? k : -1)).filter((k) => k >= 0);
    const rot = wantCpu.length ? t % wantCpu.length : 0;
    const onCore = new Set([...wantCpu.slice(rot), ...wantCpu.slice(0, rot)].slice(0, CORES));

    const inIo = reqs.map((r, i) => (r.phase === 1 ? i : -1)).filter((i) => i >= 0);
    ioWaiting.push(inIo.filter((i) => reqs[i].thread === null).length);

    for (let k = 0; k < threads; k++) {
      const r = th[k];
      if (r === null) rows[k].push({ kind: "idle", req: null });
      else if (reqs[r].phase === 1) {
        rows[k].push({ kind: "blocked", req: r });
        blockedTicks++;
      } else if (onCore.has(k)) {
        rows[k].push({ kind: "cpu", req: r });
        reqs[r].left[reqs[r].phase]--;
      } else rows[k].push({ kind: "nocore", req: r });
    }
    for (const i of inIo) reqs[i].left[1]--;

    // End of tick: advance phases.
    reqs.forEach((r, i) => {
      if (r.phase < 3 && r.left[r.phase] === 0) {
        r.phase++;
        if (r.phase === 3) {
          if (r.thread !== null) th[r.thread] = null;
          r.thread = null;
        } else if (r.phase === 1 && asyncMode) {
          // await on an incomplete task: the thread goes back to the pool.
          th[r.thread!] = null;
          r.thread = null;
        } else if (r.phase === 2 && r.thread === null) {
          // The database answered: queue the continuation for any free thread.
          queue.push(i);
        }
      }
    });
    t++;
  }
  return { rows, ioWaiting, ticks: t, blockedTicks };
}

const AWAIT_CODE = [
  "async Task<string> GetUserNameAsync(int id)",
  "{",
  '    Log("start");',
  "    User user = await _db.FindUserAsync(id);",
  '    Log("got user");',
  "    return user.Name;",
  "}",
];

const AWAIT_STEPS: { line: number | null; thread: string; text: string }[] = [
  { line: 0, thread: "pool thread 7", text: "A request handler on thread 7 calls GetUserNameAsync(42). An async method starts running synchronously, on the caller's thread, like any other method." },
  { line: 2, thread: "pool thread 7", text: "Log runs on thread 7. Nothing asynchronous has happened yet." },
  { line: 3, thread: "pool thread 7", text: "FindUserAsync sends the query and returns a Task<User> that isn't complete yet. The query is now on the network: no thread is waiting for it." },
  { line: 3, thread: "(none)", text: "await sees the task is incomplete. The compiler-generated state machine saves id and its position, registers \"run the rest of me\" as a continuation on the task, and returns an incomplete Task<string> to the caller. Thread 7 goes back to the pool and serves another request." },
  { line: null, thread: "(none)", text: "20 ms pass. The database replies, the OS signals that the socket read finished (I/O completion port on Windows, epoll on Linux), and the runtime queues the continuation to the thread pool." },
  { line: 4, thread: "pool thread 3", text: "Whichever pool thread is free, thread 3 here, picks up the continuation and resumes right after the await, with user filled in. In ASP.NET Core there's no SynchronizationContext, so it doesn't need to be thread 7." },
  { line: 5, thread: "pool thread 3", text: "return completes the Task<string>. Whoever awaited GetUserNameAsync now has its own continuation queued, and so on up the chain. If the task had already been complete at the await, the method would simply have carried on, with no thread change at all." },
];

export function AsyncAwait() {
  const [work, setWork] = useState<Workload>("io");
  const [asyncMode, setAsync] = useState(false);
  const [threads, setThreads] = useState(4);
  const [tick, setTick] = useState(999);
  const [awaitStep, setAwaitStep] = useState(0);

  const res = useMemo(() => simulate(work, asyncMode, threads), [work, asyncMode, threads]);
  const other = useMemo(() => simulate(work, !asyncMode, threads), [work, asyncMode, threads]);
  const now = Math.min(tick, res.ticks - 1);

  const rows: TimelineRow[] = res.rows.map((cells, k) => ({
    label: `thread ${k + 1}`,
    cells: cells.map((c) => ({
      text: c.req === null ? "" : String(c.req + 1),
      cls: { cpu: "cm-cpu", blocked: "cm-blocked", nocore: "cm-nocore", idle: "cm-idle" }[c.kind],
      title: { cpu: "running on a core", blocked: "blocked, waiting for the database", nocore: "ready, but all cores busy", idle: "idle" }[c.kind],
    })),
  }));
  if (asyncMode) {
    rows.push({
      label: "awaiting",
      cells: res.ioWaiting.map((n) => ({ text: n ? String(n) : "", cls: n ? "cm-awaiting" : "cm-empty", title: `${n} requests waiting on the database, holding no thread` })),
    });
  }
  const st = AWAIT_STEPS[awaitStep];
  const [cpuA, ioB, cpuC] = PHASES[work];

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>12 requests, a thread pool, 4 cores</h3>
        <div className="sql-presets">
          <button className={work === "io" ? "active" : ""} onClick={() => { setWork("io"); setTick(999); }}>
            I/O-bound request
          </button>
          <button className={work === "cpu" ? "active" : ""} onClick={() => { setWork("cpu"); setTick(999); }}>
            CPU-bound request
          </button>
        </div>
        <div className="sql-presets">
          <button className={!asyncMode ? "active" : ""} onClick={() => { setAsync(false); setTick(999); }}>
            Blocking: db.FindUser(id)
          </button>
          <button className={asyncMode ? "active" : ""} onClick={() => { setAsync(true); setTick(999); }}>
            async: await db.FindUserAsync(id)
          </button>
        </div>
        <div className="cache-controls">
          <label>
            Pool threads: <strong>{threads}</strong>
            <input type="range" min={1} max={8} value={threads} onChange={(e) => { setThreads(Number(e.target.value)); setTick(999); }} />
          </label>
        </div>
        <p className="mq-small">
          Each request: {cpuA} tick{cpuA > 1 ? "s" : ""} of CPU, {ioB} tick{ioB > 1 ? "s" : ""} waiting on the database, {cpuC} tick of CPU. Cells show
          the request number.
        </p>
        <Timeline rows={rows} upTo={now} ariaLabel="What each pool thread is doing at each tick" />
        <ul className="cm-legend cm-legend-inline">
          <li><span className="cm-swatch cm-cpu" /> on a core</li>
          <li><span className="cm-swatch cm-blocked" /> blocked on the database</li>
          <li><span className="cm-swatch cm-nocore" /> ready, no free core</li>
          {asyncMode && <li><span className="cm-swatch cm-awaiting" /> awaiting, no thread held</li>}
        </ul>
        <label className="cm-slider">
          Tick <strong>{now}</strong> of {res.ticks - 1}
          <input type="range" min={0} max={res.ticks - 1} value={now} onChange={(e) => setTick(Number(e.target.value))} />
        </label>
        <div className="tool-readout">
          <div className="readout-cell">
            <span className="readout-label">All 12 done after</span>
            <span className="readout-value">{res.ticks} ticks</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">{asyncMode ? "Blocking would take" : "async would take"}</span>
            <span className="readout-value">{other.ticks} ticks</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Thread-ticks spent blocked</span>
            <span className="readout-value">{res.blockedTicks}</span>
          </div>
        </div>
        <p className="gate-note">
          {work === "io"
            ? asyncMode
              ? "The threads only ever do CPU work. While a request waits on the database it holds no thread at all, so 4 threads keep 12 requests in flight and the cores stay busy."
              : "Each thread spends most of its time blocked, doing nothing but holding its stack. Try raising the thread count: it helps, which is exactly what the thread pool does when it sees blocked threads, but every extra thread costs memory and the pool adds them slowly. async gets more done with fewer threads."
            : asyncMode
              ? "Barely any better than blocking: there's almost no waiting to give back. CPU-bound throughput is capped by the 4 cores, and no amount of await changes that."
              : "Try more threads: past 4 they just queue for a core (the striped cells). CPU-bound work is limited by cores. Split it across cores with Parallel.For or Task.Run; await alone does nothing for it."}
        </p>
      </div>

      <div className="crypto-section">
        <h3>What one await actually does</h3>
        <CodeListing lines={AWAIT_CODE} active={st.line} />
        <div className="arch-detail">
          <strong>
            Step {awaitStep + 1} of {AWAIT_STEPS.length} · running on: {st.thread}
          </strong>
          <p>{st.text}</p>
        </div>
        <div className="cm-actions">
          <button disabled={awaitStep === 0} onClick={() => setAwaitStep(awaitStep - 1)}>
            ◀ Back
          </button>
          <button disabled={awaitStep === AWAIT_STEPS.length - 1} onClick={() => setAwaitStep(awaitStep + 1)}>
            Next ▶
          </button>
        </div>
        <pre className="algo-code">{`// Sequential: about 3 x 50 ms
var a = await GetProfileAsync(id);
var b = await GetOrdersAsync(id);
var c = await GetRecommendationsAsync(id);

// Concurrent: about 50 ms. Start all three, then await them together.
var pa = GetProfileAsync(id);
var pb = GetOrdersAsync(id);
var pc = GetRecommendationsAsync(id);
await Task.WhenAll(pa, pb, pc);

// CPU-bound: move it to the pool so it runs on another core
var hash = await Task.Run(() => ComputeHash(bigFile));

// Never in async code: blocks a thread, can deadlock under a SynchronizationContext
var user = _db.FindUserAsync(id).Result;`}</pre>
      </div>
    </div>
  );
}
