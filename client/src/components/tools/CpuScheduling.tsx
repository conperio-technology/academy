import { useMemo, useState } from "react";
import { openLesson } from "../../api";
import { Timeline, type TimelineRow } from "./concurrencyShared";

// A deterministic single-core scheduler. Each tick: processes arriving now join the
// ready queue, then (for round robin) the process whose quantum just expired rejoins
// behind them, then the algorithm picks who runs this tick. Waiting time is
// completion - arrival - burst; response time is first run - arrival.

type Algo = "fcfs" | "sjf" | "srtf" | "rr" | "prio" | "prioP";

interface Proc {
  arrival: number;
  burst: number;
  priority: number;
}

const ALGOS: { key: Algo; name: string; short: string }[] = [
  { key: "fcfs", name: "First-come first-served", short: "FCFS" },
  { key: "sjf", name: "Shortest job first", short: "SJF" },
  { key: "srtf", name: "Shortest remaining time first (preemptive SJF)", short: "SRTF" },
  { key: "rr", name: "Round robin", short: "RR" },
  { key: "prio", name: "Priority (non-preemptive)", short: "Priority" },
  { key: "prioP", name: "Priority (preemptive)", short: "Priority, preemptive" },
];

const PRESETS: { name: string; note: string; procs: Proc[] }[] = [
  {
    name: "Textbook mix",
    note: "The classic example: FCFS averages 8.75 ticks of waiting, SJF 7.75 and SRTF 6.5, the lowest possible for this set. Round robin waits longer on average but nobody waits long for a first turn.",
    procs: [
      { arrival: 0, burst: 8, priority: 3 },
      { arrival: 1, burst: 4, priority: 1 },
      { arrival: 2, burst: 9, priority: 4 },
      { arrival: 3, burst: 5, priority: 2 },
    ],
  },
  {
    name: "Convoy effect",
    note: "One long job arrives first. Under FCFS the three short jobs queue behind it for most of its 20 ticks. SJF can't help either, because P1 is already running when they arrive and SJF never preempts. SRTF and round robin let them through.",
    procs: [
      { arrival: 0, burst: 20, priority: 3 },
      { arrival: 1, burst: 2, priority: 3 },
      { arrival: 1, burst: 2, priority: 3 },
      { arrival: 2, burst: 2, priority: 3 },
    ],
  },
  {
    name: "Starvation",
    note: "P1 has low priority (5) and a stream of priority-1 jobs keeps arriving. Under either priority algorithm P1 runs only when the stream dries up; in a real system it might never. Turn on aging and P1's priority improves while it waits, until it gets the CPU.",
    procs: [
      { arrival: 0, burst: 3, priority: 5 },
      { arrival: 0, burst: 3, priority: 1 },
      { arrival: 2, burst: 3, priority: 1 },
      { arrival: 5, burst: 3, priority: 1 },
      { arrival: 8, burst: 3, priority: 1 },
      { arrival: 11, burst: 3, priority: 1 },
      { arrival: 14, burst: 3, priority: 1 },
      { arrival: 17, burst: 3, priority: 1 },
    ],
  },
];

const AGE_TICKS = 2;
const MAX_PROCS = 8;

interface Sim {
  timeline: (number | null)[];
  waiting: number[][];
  completion: number[];
  firstRun: number[];
  switches: number;
}

function simulate(procs: Proc[], algo: Algo, quantum: number, aging: boolean): Sim {
  const n = procs.length;
  const remaining = procs.map((p) => p.burst);
  const waited = procs.map(() => 0);
  const completion = procs.map(() => -1);
  const firstRun = procs.map(() => -1);
  const queue: number[] = [];
  const timeline: (number | null)[] = [];
  const waiting: number[][] = [];
  let cur: number | null = null;
  let used = 0;
  let requeue: number | null = null;
  let last: number | null = null;
  let switches = 0;
  let done = 0;

  const prio = (i: number) => (aging ? Math.max(0, procs[i].priority - Math.floor(waited[i] / AGE_TICKS)) : procs[i].priority);
  // Lower key wins; ties go to the running process, then earlier arrival, then lower number.
  const best = (cands: number[], key: (i: number) => number) =>
    cands.reduce((a, b) => {
      const ka = key(a), kb = key(b);
      if (ka !== kb) return ka < kb ? a : b;
      if (a === cur) return a;
      if (b === cur) return b;
      if (procs[a].arrival !== procs[b].arrival) return procs[a].arrival < procs[b].arrival ? a : b;
      return a < b ? a : b;
    });

  for (let t = 0; done < n && t < 400; t++) {
    procs.forEach((p, i) => {
      if (p.arrival === t) queue.push(i);
    });
    if (requeue !== null) {
      queue.push(requeue);
      requeue = null;
    }

    const preemptive = algo === "srtf" || algo === "prioP";
    if ((cur === null || preemptive) && (queue.length > 0 || cur !== null)) {
      const cands = cur === null ? [...queue] : [cur, ...queue];
      let pick: number;
      if (algo === "fcfs" || algo === "rr") pick = cur ?? queue[0];
      else if (algo === "sjf") pick = best(cands, (i) => procs[i].burst);
      else if (algo === "srtf") pick = best(cands, (i) => remaining[i]);
      else pick = best(cands, prio);
      if (pick !== cur) {
        if (cur !== null) queue.push(cur);
        queue.splice(queue.indexOf(pick), 1);
        cur = pick;
        used = 0;
      }
    }

    timeline.push(cur);
    waiting.push([...queue]);
    for (const q of queue) waited[q]++;
    if (cur === null) continue;
    if (firstRun[cur] < 0) firstRun[cur] = t;
    if (last !== null && last !== cur) switches++;
    last = cur;
    remaining[cur]--;
    used++;
    if (remaining[cur] === 0) {
      completion[cur] = t + 1;
      done++;
      cur = null;
    } else if (algo === "rr" && used >= quantum) {
      requeue = cur;
      cur = null;
    }
  }
  return { timeline, waiting, completion, firstRun, switches };
}

function stats(procs: Proc[], sim: Sim) {
  const n = procs.length;
  const turnaround = procs.map((p, i) => sim.completion[i] - p.arrival);
  const wait = procs.map((p, i) => turnaround[i] - p.burst);
  const response = procs.map((p, i) => sim.firstRun[i] - p.arrival);
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / n;
  return {
    turnaround,
    wait,
    response,
    avgWait: avg(wait),
    avgTurnaround: avg(turnaround),
    avgResponse: avg(response),
    maxWait: Math.max(...wait),
  };
}

const fmt = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(2));
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(v) ? Math.round(v) : lo));

export function CpuScheduling() {
  const [preset, setPreset] = useState(0);
  const [procs, setProcs] = useState<Proc[]>(PRESETS[0].procs);
  const [algo, setAlgo] = useState<Algo>("fcfs");
  const [quantum, setQuantum] = useState(2);
  const [aging, setAging] = useState(false);
  const [tick, setTick] = useState<number | null>(null);

  const sim = useMemo(() => simulate(procs, algo, quantum, aging), [procs, algo, quantum, aging]);
  const st = stats(procs, sim);
  const end = sim.timeline.length - 1;
  const now = tick === null ? end : Math.min(tick, end);

  const compare = useMemo(
    () => ALGOS.map((a) => ({ ...a, sim: simulate(procs, a.key, quantum, aging) })).map((a) => ({ ...a, st: stats(procs, a.sim) })),
    [procs, quantum, aging],
  );
  const bestWait = Math.min(...compare.map((c) => c.st.avgWait));

  function loadPreset(i: number) {
    setPreset(i);
    setProcs(PRESETS[i].procs);
    setAging(false);
    setTick(null);
    if (i === 2) setAlgo("prioP");
  }

  function edit(i: number, field: keyof Proc, value: number) {
    const lim = field === "arrival" ? [0, 20] : field === "burst" ? [1, 15] : [0, 9];
    setProcs(procs.map((p, k) => (k === i ? { ...p, [field]: clamp(value, lim[0], lim[1]) } : p)));
    setPreset(-1);
    setTick(null);
  }

  const rows: TimelineRow[] = [
    {
      label: "time",
      cells: sim.timeline.map((_, t) => ({ text: t % 5 === 0 ? String(t) : "", cls: "cm-empty" })),
    },
    ...procs.map((p, i) => ({
      label: `P${i + 1}`,
      cells: sim.timeline.map((r, t) => {
        if (r === i) return { text: String(i + 1), cls: `cm-t${i}`, title: `P${i + 1} running` };
        if (sim.waiting[t].includes(i)) return { text: "", cls: "cs-wait", title: `P${i + 1} ready, waiting` };
        return { text: "", cls: "cm-empty", title: t < p.arrival ? "not arrived" : "finished" };
      }),
    })),
    {
      label: "CPU",
      cells: sim.timeline.map((r) => (r === null ? { text: "", cls: "cm-idle", title: "idle" } : { text: String(r + 1), cls: `cm-t${r}` })),
    },
  ];

  const isPrio = algo === "prio" || algo === "prioP";

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>The workload</h3>
        <div className="sql-presets">
          {PRESETS.map((p, i) => (
            <button key={p.name} className={preset === i ? "active" : ""} onClick={() => loadPreset(i)}>
              {p.name}
            </button>
          ))}
        </div>
        <div className="cm-scroll">
          <table className="bigo-table cs-procs">
            <thead>
              <tr>
                <th>Process</th>
                <th>Arrives</th>
                <th>Burst</th>
                <th>Priority</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {procs.map((p, i) => (
                <tr key={i}>
                  <td>
                    <span className={`cm-swatch cm-t${i}`}>{i + 1}</span> P{i + 1}
                  </td>
                  {(["arrival", "burst", "priority"] as const).map((f) => (
                    <td key={f}>
                      <input type="number" aria-label={`P${i + 1} ${f}`} value={p[f]} onChange={(e) => edit(i, f, Number(e.target.value))} />
                    </td>
                  ))}
                  <td>
                    <button
                      aria-label={`Remove P${i + 1}`}
                      disabled={procs.length <= 1}
                      onClick={() => {
                        setProcs(procs.filter((_, k) => k !== i));
                        setPreset(-1);
                        setTick(null);
                      }}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="cm-actions">
          <button
            disabled={procs.length >= MAX_PROCS}
            onClick={() => {
              setProcs([...procs, { arrival: 0, burst: 3, priority: 3 }]);
              setPreset(-1);
              setTick(null);
            }}
          >
            Add a process
          </button>
        </div>
        <p className="gate-note">
          Times are in ticks. A lower priority number means more important, as with Unix nice values.
          {preset >= 0 && <> {PRESETS[preset].note}</>}
        </p>
      </div>

      <div className="crypto-section">
        <h3>Pick an algorithm</h3>
        <div className="sql-presets">
          {ALGOS.map((a) => (
            <button key={a.key} className={algo === a.key ? "active" : ""} onClick={() => { setAlgo(a.key); setTick(null); }}>
              {a.short}
            </button>
          ))}
        </div>
        <p className="gate-note">
          <strong>{ALGOS.find((a) => a.key === algo)!.name}.</strong>{" "}
          {algo === "fcfs" && "Run in arrival order; a process keeps the CPU until it finishes."}
          {algo === "sjf" && "When the CPU frees up, run the ready process with the smallest burst. No preemption."}
          {algo === "srtf" && "Always run the process with the least work left; a shorter arrival preempts the running one."}
          {algo === "rr" && "Each process runs for at most one quantum, then goes to the back of the queue (behind anything that arrived at that moment)."}
          {algo === "prio" && "When the CPU frees up, run the most important ready process. No preemption."}
          {algo === "prioP" && "Always run the most important ready process; a more important arrival preempts the running one."}
        </p>
        {(algo === "rr" || isPrio) && (
          <div className="cache-controls">
            {algo === "rr" && (
              <label>
                Quantum: <strong>{quantum} tick{quantum === 1 ? "" : "s"}</strong>
                <input type="range" min={1} max={8} value={quantum} onChange={(e) => { setQuantum(Number(e.target.value)); setTick(null); }} />
              </label>
            )}
            {isPrio && (
              <label className="tool-checkbox">
                <input type="checkbox" checked={aging} onChange={(e) => { setAging(e.target.checked); setTick(null); }} />
                Aging: every {AGE_TICKS} ticks spent waiting improves priority by one level
              </label>
            )}
          </div>
        )}

        <Timeline rows={rows} upTo={now} ariaLabel="Gantt chart: which process runs at each tick" />
        <ul className="cm-legend cm-legend-inline">
          <li><span className="cm-swatch cm-t0">1</span> running</li>
          <li><span className="cm-swatch cs-wait"></span> ready but waiting</li>
          <li><span className="cm-swatch cm-idle"></span> CPU idle</li>
        </ul>
        <label className="cm-slider">
          Tick <strong>{now}</strong> of {end}
          <input type="range" min={0} max={end} value={now} onChange={(e) => setTick(Number(e.target.value))} />
        </label>

        <div className="tool-readout">
          <div className="readout-cell">
            <span className="readout-label">Avg waiting</span>
            <span className="readout-value">{fmt(st.avgWait)}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Avg turnaround</span>
            <span className="readout-value">{fmt(st.avgTurnaround)}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Avg response</span>
            <span className="readout-value">{fmt(st.avgResponse)}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Context switches</span>
            <span className="readout-value">{sim.switches}</span>
          </div>
        </div>

        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Process</th>
                <th>Done at</th>
                <th>Turnaround</th>
                <th>Waiting</th>
                <th>Response</th>
              </tr>
            </thead>
            <tbody>
              {procs.map((_, i) => (
                <tr key={i}>
                  <td>P{i + 1}</td>
                  <td>{sim.completion[i]}</td>
                  <td>{st.turnaround[i]}</td>
                  <td>{st.wait[i]}</td>
                  <td>{st.response[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="bigo-table-footnote">
          Turnaround = done at minus arrival. Waiting = turnaround minus burst. Response = first time on the CPU minus arrival.
        </p>
      </div>

      <div className="crypto-section">
        <h3>Every algorithm on this workload</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Avg wait</th>
                <th>Worst wait</th>
                <th>Avg response</th>
                <th>Switches</th>
              </tr>
            </thead>
            <tbody>
              {compare.map((c) => (
                <tr key={c.key} className={c.key === algo ? "cm-row-on" : ""}>
                  <td>
                    <button className="link-button" onClick={() => { setAlgo(c.key); setTick(null); }}>
                      {c.short}
                    </button>
                  </td>
                  <td className={c.st.avgWait === bestWait ? "cs-best" : ""}>{fmt(c.st.avgWait)}</td>
                  <td>{c.st.maxWait}</td>
                  <td>{fmt(c.st.avgResponse)}</td>
                  <td>{c.sim.switches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          The lowest average wait is highlighted. SRTF always has it (sometimes tied), because finishing short jobs first takes them out of everyone else's wait as early as possible. Look
          at the worst wait and the response column too: the fastest average can still leave one process waiting a long time. Round robin uses
          quantum {quantum}; the priority rows use aging {aging ? "on" : "off"}. What a context switch actually saves and restores is in{" "}
          <button className="link-button" onClick={() => openLesson("threads-processes")}>
            Threads vs Processes and the Scheduler
          </button>
          .
        </p>
      </div>
    </div>
  );
}
