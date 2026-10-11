import { useMemo, useState } from "react";
import { openLesson } from "../../api";
import { Timeline, type TimelineRow } from "./concurrencyShared";

// Part 1: what a process owns versus what each thread owns.
// Part 2: a deterministic round-robin scheduler. Each thread is a list of ticks of work
// ("c" = needs the CPU, "i" = waiting on I/O). Every tick, idle cores take the next thread
// from the ready queue, running threads use one tick of CPU, and a thread leaves its core
// when its time slice runs out (back to the end of the ready queue), when it starts I/O
// (blocked, off the queue entirely) or when it finishes.

const PROGRAMS: { name: string; desc: string; ops: string }[] = [
  { name: "T1", desc: "number crunching: 6 ticks of CPU", ops: "cccccc" },
  { name: "T2", desc: "2 CPU, then 4 waiting on a disk read, then 2 CPU", ops: "cciiiicc" },
  { name: "T3", desc: "3 ticks of CPU", ops: "ccc" },
];

type Status = "ready" | "running" | "blocked" | "done";

interface TickRecord {
  cores: (number | null)[];
  blocked: number[];
  statuses: Status[];
  readyQueue: number[];
  switches: number;
}

function schedule(cores: number, slice: number): TickRecord[] {
  const pc = PROGRAMS.map(() => 0);
  const ioLeft = PROGRAMS.map(() => 0);
  const status: Status[] = PROGRAMS.map(() => "ready");
  const ready = PROGRAMS.map((_, i) => i);
  const core = Array.from({ length: cores }, () => ({ cur: null as number | null, used: 0, last: null as number | null }));
  let switches = 0;
  const out: TickRecord[] = [];

  for (let t = 0; t < 40 && status.some((s) => s !== "done"); t++) {
    // Dispatch: an idle core takes the head of the ready queue. Loading a different
    // thread than the one this core ran last is a context switch.
    for (const c of core) {
      if (c.cur === null && ready.length > 0) {
        c.cur = ready.shift()!;
        c.used = 0;
        status[c.cur] = "running";
        if (c.last !== null && c.last !== c.cur) switches++;
      }
    }
    const blockedBefore = status.map((s, i) => (s === "blocked" ? i : -1)).filter((i) => i >= 0);

    // Run one tick.
    for (const c of core) {
      if (c.cur === null) continue;
      pc[c.cur]++;
      c.used++;
    }
    for (const i of blockedBefore) ioLeft[i]--;

    out.push({
      cores: core.map((c) => c.cur),
      blocked: blockedBefore,
      statuses: [...status],
      readyQueue: [...ready],
      switches,
    });

    // End of tick: I/O completions rejoin the ready queue first, then each core decides
    // whether its thread finished, blocked, or used up its slice.
    for (const i of blockedBefore) {
      if (ioLeft[i] === 0) {
        status[i] = "ready";
        ready.push(i);
      }
    }
    for (const c of core) {
      if (c.cur === null) continue;
      const i = c.cur;
      const ops = PROGRAMS[i].ops;
      if (pc[i] >= ops.length) {
        status[i] = "done";
      } else if (ops[pc[i]] === "i") {
        let n = 0;
        while (ops[pc[i] + n] === "i") n++;
        pc[i] += n;
        ioLeft[i] = n;
        status[i] = "blocked";
      } else if (c.used >= slice) {
        status[i] = "ready";
        ready.push(i);
      } else {
        continue;
      }
      c.last = i;
      c.cur = null;
    }
  }
  return out;
}

const STATUS_TEXT: Record<Status, string> = {
  ready: "ready, waiting for a core",
  running: "running",
  blocked: "blocked on I/O (not using the CPU)",
  done: "finished",
};

export function ThreadsProcesses() {
  const [view, setView] = useState<"threads" | "processes">("threads");
  const [cores, setCores] = useState(1);
  const [slice, setSlice] = useState(2);
  const [tick, setTick] = useState(0);

  const ticks = useMemo(() => schedule(cores, slice), [cores, slice]);
  const now = Math.min(tick, ticks.length - 1);
  const rec = ticks[now];

  const rows: TimelineRow[] = [
    ...Array.from({ length: cores }, (_, c) => ({
      label: `core ${c}`,
      cells: ticks.map((r) => {
        const th = r.cores[c];
        return th === null ? { text: "", cls: "cm-idle", title: "idle" } : { text: String(th + 1), cls: `cm-t${th}`, title: PROGRAMS[th].name };
      }),
    })),
    {
      label: "I/O wait",
      cells: ticks.map((r) =>
        r.blocked.length ? { text: r.blocked.map((b) => b + 1).join(""), cls: "cm-blocked", title: "blocked on I/O" } : { text: "", cls: "cm-empty" },
      ),
    },
  ];

  const busy = ticks.reduce((n, r) => n + r.cores.filter((c) => c !== null).length, 0);
  const util = Math.round((busy / (ticks.length * cores)) * 100);

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Who owns what</h3>
        <div className="sql-presets">
          <button className={view === "threads" ? "active" : ""} onClick={() => setView("threads")}>
            One process, two threads
          </button>
          <button className={view === "processes" ? "active" : ""} onClick={() => setView("processes")}>
            Two processes
          </button>
        </div>
        {view === "threads" ? (
          <div className="cm-proc">
            <strong>Process (PID 4120)</strong>
            <div className="cm-shared">
              <span className="cm-chip">code</span>
              <span className="cm-chip">heap: every object you new up</span>
              <span className="cm-chip">static fields</span>
              <span className="cm-chip">open files and sockets</span>
              <span className="cm-chip">virtual address space</span>
            </div>
            <div className="cm-proc-threads">
              {["Thread 1", "Thread 2"].map((t) => (
                <div key={t} className="cm-thread-box">
                  <strong>{t}</strong>
                  <span className="cm-chip">own stack (locals, call frames)</span>
                  <span className="cm-chip">own registers</span>
                  <span className="cm-chip">own instruction pointer</span>
                </div>
              ))}
            </div>
            <p className="gate-note">
              Both threads read and write the same heap. A List&lt;int&gt; one thread adds to is the very same object the other sees: fast to share, and
              the reason the next lessons exist.
            </p>
          </div>
        ) : (
          <div className="cm-proc-pair">
            {["chrome (PID 4120)", "chrome (PID 4188)"].map((p) => (
              <div key={p} className="cm-proc">
                <strong>{p}</strong>
                <div className="cm-shared">
                  <span className="cm-chip">own address space: code, heap, statics</span>
                  <span className="cm-chip">own file handles</span>
                </div>
                <div className="cm-thread-box">
                  <strong>main thread</strong>
                  <span className="cm-chip">stack, registers</span>
                </div>
              </div>
            ))}
            <p className="gate-note">
              The same virtual address in each process maps to different physical memory, so neither can see the other's objects. They talk only
              through the OS: pipes, sockets, files, or explicitly shared memory. One crashing does not take down the other.
            </p>
          </div>
        )}
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th></th>
                <th>Process</th>
                <th>Thread</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Memory</td><td>private address space</td><td>shares its process's</td></tr>
              <tr><td>Stack</td><td>one per thread inside it</td><td>its own</td></tr>
              <tr><td>Create</td><td>slow: new address space</td><td>faster, but still a kernel object</td></tr>
              <tr><td>Switch</td><td>dearer: new page tables, TLB goes cold</td><td>cheaper within one process</td></tr>
              <tr><td>Talk via</td><td>IPC: pipes, sockets, files</td><td>shared memory (needs locks)</td></tr>
              <tr><td>Crash</td><td>contained to that process</td><td>an unhandled exception ends the whole process</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="crypto-section">
        <h3>The scheduler, time-slicing three threads</h3>
        <ul className="cm-legend">
          {PROGRAMS.map((p, i) => (
            <li key={p.name}>
              <span className={`cm-swatch cm-t${i}`}>{i + 1}</span> {p.name}: {p.desc}
            </li>
          ))}
        </ul>
        <div className="cache-controls">
          <label>
            CPU cores: <strong>{cores}</strong>
            <input type="range" min={1} max={2} value={cores} onChange={(e) => { setCores(Number(e.target.value)); setTick(0); }} />
          </label>
          <label>
            Time slice: <strong>{slice} tick{slice === 1 ? "" : "s"}</strong>
            <input type="range" min={1} max={6} value={slice} onChange={(e) => { setSlice(Number(e.target.value)); setTick(0); }} />
          </label>
        </div>
        <Timeline rows={rows} upTo={now} ariaLabel="Which thread each core runs at each tick" />
        <label className="cm-slider">
          Tick <strong>{now}</strong> of {ticks.length - 1}
          <input type="range" min={0} max={ticks.length - 1} value={now} onChange={(e) => setTick(Number(e.target.value))} />
        </label>
        <div className="cm-status-list">
          {PROGRAMS.map((p, i) => (
            <span key={p.name} className={`cm-status cm-status-${rec.statuses[i]}`}>
              {p.name}: {STATUS_TEXT[rec.statuses[i]]}
            </span>
          ))}
          <span className="cm-status">ready queue: {rec.readyQueue.length ? rec.readyQueue.map((i) => PROGRAMS[i].name).join(", ") : "empty"}</span>
        </div>
        <div className="tool-readout">
          <div className="readout-cell">
            <span className="readout-label">All done after</span>
            <span className="readout-value">{ticks.length} ticks</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Context switches</span>
            <span className="readout-value">{ticks[ticks.length - 1].switches}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Core busy</span>
            <span className="readout-value">{util}%</span>
          </div>
        </div>
        <p className="gate-note">
          Try a 1-tick slice: the threads take turns quickly (good for responsiveness) but every switch costs a register save and restore, and in
          real hardware colder caches. A 6-tick slice is just first-come first-served. While T2 waits on the disk it is off the ready queue, so
          the core goes to someone else rather than idling. With 2 cores, two threads truly run at the same instant: that's parallelism, not just
          concurrency. The hardware side of this is in{" "}
          <button className="link-button" onClick={() => openLesson("computer-architecture")}>
            Computer Architecture
          </button>
          .
        </p>
      </div>
    </div>
  );
}
