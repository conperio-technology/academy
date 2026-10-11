import { useState } from "react";
import { openLesson } from "../../api";
import { CodeTabs } from "./concurrencyShared";

// Two threads, two locks, and you pick who runs next. A thread whose next step is a lock
// held by the other thread is blocked and can't be scheduled; if both are blocked on each
// other, that's a deadlock and nothing you click can fix it. Below, dining philosophers:
// the same cycle with five threads.

type Res = "A" | "B";
type Tid = 0 | 1;
type Op = { op: "lock" | "try" | "unlock" | "work"; res?: Res };
type Mode = "naive" | "ordered" | "timeout";

const L = (res: Res): Op => ({ op: "lock", res });
const T = (res: Res): Op => ({ op: "try", res });
const U = (res: Res): Op => ({ op: "unlock", res });
const W: Op = { op: "work" };

const PROGRAMS: Record<Mode, [Op[], Op[]]> = {
  naive: [
    [L("A"), L("B"), W, U("B"), U("A")],
    [L("B"), L("A"), W, U("A"), U("B")],
  ],
  ordered: [
    [L("A"), L("B"), W, U("B"), U("A")],
    [L("A"), L("B"), W, U("B"), U("A")],
  ],
  timeout: [
    [L("A"), T("B"), W, U("B"), U("A")],
    [L("B"), T("A"), W, U("A"), U("B")],
  ],
};

const TNAME = ["T1", "T2"] as const;

function opText(o: Op, t: Tid): string {
  if (o.op === "lock") return `lock (${o.res})`;
  if (o.op === "try") return `Monitor.TryEnter(${o.res}, 100 ms)`;
  if (o.op === "unlock") return `release ${o.res}`;
  return t === 0 ? "move $10 from A to B" : "move $10 from B to A";
}

interface S {
  pc: [number, number];
  owner: Record<Res, Tid | null>;
  retries: [number, number];
  log: string[];
}

const START: S = { pc: [0, 0], owner: { A: null, B: null }, retries: [0, 0], log: [] };

function canRun(s: S, t: Tid, prog: Op[]): boolean {
  if (s.pc[t] >= prog.length) return false;
  const o = prog[s.pc[t]];
  return !(o.op === "lock" && s.owner[o.res!] !== null && s.owner[o.res!] !== t);
}

function waitsOn(s: S, t: Tid, prog: Op[]): Res | null {
  if (s.pc[t] >= prog.length) return null;
  const o = prog[s.pc[t]];
  return o.op === "lock" && s.owner[o.res!] !== null && s.owner[o.res!] !== t ? o.res! : null;
}

function step(s: S, t: Tid, prog: Op[]): S {
  if (!canRun(s, t, prog)) return s;
  const n: S = { pc: [...s.pc] as [number, number], owner: { ...s.owner }, retries: [...s.retries] as [number, number], log: [...s.log] };
  const o = prog[s.pc[t]];
  const who = TNAME[t];
  if (o.op === "lock") {
    n.owner[o.res!] = t;
    n.log.push(`${who} takes lock ${o.res}`);
  } else if (o.op === "try") {
    if (s.owner[o.res!] === null) {
      n.owner[o.res!] = t;
      n.log.push(`${who}: TryEnter(${o.res}) succeeds`);
    } else {
      // Give up: release everything held, back off, start over.
      const held = (["A", "B"] as Res[]).filter((r) => n.owner[r] === t);
      held.forEach((r) => (n.owner[r] = null));
      n.pc[t] = 0;
      n.retries[t]++;
      n.log.push(`${who}: TryEnter(${o.res}) times out after 100 ms. Releases ${held.join(", ")}, backs off, and will retry`);
      return n;
    }
  } else if (o.op === "unlock") {
    n.owner[o.res!] = null;
    n.log.push(`${who} releases ${o.res}`);
  } else {
    n.log.push(`${who} has both locks and does the transfer`);
  }
  n.pc[t]++;
  return n;
}

// A resource-allocation graph: T1 and T2 on one diagonal, A and B on the other. A solid
// arrow from a lock to a thread means "held by"; a dashed arrow from a thread to a lock
// means "waiting for". A deadlock is a cycle.
function WaitGraph({ s, progs }: { s: S; progs: [Op[], Op[]] }) {
  const pos: Record<string, { x: number; y: number }> = { T1: { x: 50, y: 40 }, A: { x: 210, y: 40 }, T2: { x: 210, y: 140 }, B: { x: 50, y: 140 } };
  const edges: { from: string; to: string; kind: "holds" | "waits" }[] = [];
  (["A", "B"] as Res[]).forEach((r) => {
    const o = s.owner[r];
    if (o !== null) edges.push({ from: r, to: TNAME[o], kind: "holds" });
  });
  ([0, 1] as Tid[]).forEach((t) => {
    const r = waitsOn(s, t, progs[t]);
    if (r) edges.push({ from: TNAME[t], to: r, kind: "waits" });
  });
  const shorten = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    const r = 24;
    return { x1: a.x + (dx / len) * r, y1: a.y + (dy / len) * r, x2: b.x - (dx / len) * r, y2: b.y - (dy / len) * r };
  };
  return (
    <svg className="cm-graph" viewBox="0 0 260 180" role="img" aria-label="Who holds and who waits for each lock">
      <defs>
        {(["hold", "wait"] as const).map((k) => (
          <marker key={k} id={`cm-arrow-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className={`cm-arrow-${k}`} />
          </marker>
        ))}
      </defs>
      {edges.map((e, i) => {
        const l = shorten(pos[e.from], pos[e.to]);
        return <line key={i} {...l} className={e.kind === "holds" ? "cm-edge-hold" : "cm-edge-wait"} markerEnd={`url(#cm-arrow-${e.kind === "holds" ? "hold" : "wait"})`} />;
      })}
      {Object.entries(pos).map(([k, p]) =>
        k.startsWith("T") ? (
          <g key={k}>
            <circle cx={p.x} cy={p.y} r={22} className="cm-node-thread" />
            <text x={p.x} y={p.y + 5} textAnchor="middle" className="cm-node-text">{k}</text>
          </g>
        ) : (
          <g key={k}>
            <rect x={p.x - 20} y={p.y - 20} width={40} height={40} rx={6} className="cm-node-lock" />
            <text x={p.x} y={p.y + 5} textAnchor="middle" className="cm-node-text">{k}</text>
          </g>
        ),
      )}
    </svg>
  );
}

const CODE = [
  {
    label: "Deadlocks",
    code: `// Thread 1: Transfer(a, b, 10)    Thread 2: Transfer(b, a, 10)
void Transfer(Account from, Account to, decimal amount)
{
    lock (from.Gate)
    {
        lock (to.Gate)     // T1 holds a, wants b; T2 holds b, wants a
        {
            from.Balance -= amount;
            to.Balance += amount;
        }
    }
}`,
  },
  {
    label: "Fix: lock ordering",
    code: `void Transfer(Account from, Account to, decimal amount)
{
    // Always lock the lower id first, whichever way the money moves.
    var (first, second) = from.Id < to.Id ? (from, to) : (to, from);

    lock (first.Gate)
    lock (second.Gate)
    {
        from.Balance -= amount;
        to.Balance += amount;
    }
}`,
    note: "Breaks circular wait: no thread can hold the higher lock while waiting for the lower one, so a cycle can't form.",
  },
  {
    label: "Fix: timeout",
    code: `void Transfer(Account from, Account to, decimal amount)
{
    while (true)
    {
        lock (from.Gate)
        {
            if (Monitor.TryEnter(to.Gate, TimeSpan.FromMilliseconds(100)))
            {
                try
                {
                    from.Balance -= amount;
                    to.Balance += amount;
                    return;
                }
                finally { Monitor.Exit(to.Gate); }
            }
        }   // gave up: from.Gate is released here

        Thread.Sleep(Random.Shared.Next(1, 20));  // random back-off
    }
}`,
    note: "A thread never waits forever while holding a lock. The random back-off matters: without it both threads can retry in lockstep forever (livelock).",
  },
];

// ---- Dining philosophers ----

const N = 5;
type Strategy = "left" | "ordered";

interface Dining {
  forks: (number | null)[];
  held: number[][];
  meals: number[];
  log: string[];
}

const DSTART: Dining = { forks: Array(N).fill(null), held: Array.from({ length: N }, () => []), meals: Array(N).fill(0), log: [] };

const leftFork = (i: number) => i;
const rightFork = (i: number) => (i + 1) % N;
function order(i: number, st: Strategy): [number, number] {
  const l = leftFork(i);
  const r = rightFork(i);
  return st === "left" ? [l, r] : [Math.min(l, r), Math.max(l, r)];
}

function wants(d: Dining, i: number, st: Strategy): number | null {
  const [a, b] = order(i, st);
  if (d.held[i].length === 0) return a;
  if (d.held[i].length === 1) return b;
  return null;
}

function canAct(d: Dining, i: number, st: Strategy): boolean {
  const w = wants(d, i, st);
  return w === null || d.forks[w] === null;
}

function act(d: Dining, i: number, st: Strategy): Dining {
  if (!canAct(d, i, st)) return d;
  const n: Dining = { forks: [...d.forks], held: d.held.map((h) => [...h]), meals: [...d.meals], log: d.log };
  const w = wants(d, i, st);
  if (w === null) {
    n.meals[i]++;
    n.held[i].forEach((f) => (n.forks[f] = null));
    n.held[i] = [];
    n.log = [`P${i} eats, then puts both forks down`, ...d.log].slice(0, 5);
  } else {
    n.forks[w] = i;
    n.held[i].push(w);
    n.log = [`P${i} picks up fork ${w}`, ...d.log].slice(0, 5);
  }
  return n;
}

export function Deadlock() {
  const [mode, setMode] = useState<Mode>("naive");
  const [s, setS] = useState<S>(START);
  const [st, setSt] = useState<Strategy>("left");
  const [d, setD] = useState<Dining>(DSTART);

  const progs = PROGRAMS[mode];
  const done = s.pc[0] >= progs[0].length && s.pc[1] >= progs[1].length;
  const w0 = waitsOn(s, 0, progs[0]);
  const w1 = waitsOn(s, 1, progs[1]);
  const deadlocked = w0 !== null && w1 !== null;

  const holdsAny = s.owner.A !== null || s.owner.B !== null;
  const holdAndWait = ([0, 1] as Tid[]).some((t) => waitsOn(s, t, progs[t]) && (s.owner.A === t || s.owner.B === t));
  const conditions = [
    { name: "Mutual exclusion", now: holdsAny, fix: "Can't usually remove it: the data really must not be changed by two threads at once." },
    { name: "Hold and wait", now: holdAndWait, fix: "Take every lock you need at once, or never wait for a lock while holding one." },
    { name: "No preemption", now: mode !== "timeout", fix: "Let a thread give up what it holds: TryEnter with a timeout, then release and retry." },
    { name: "Circular wait", now: deadlocked, fix: "One global lock order (by account id). Every thread takes A before B, so no cycle." },
  ];

  const switchMode = (m: Mode) => {
    setMode(m);
    setS(START);
  };

  const dinersStuck = !Array.from({ length: N }, (_, i) => canAct(d, i, st)).some(Boolean);
  const everyone = () => {
    let x = d;
    for (let i = 0; i < N; i++) x = act(x, i, st);
    setD(x);
  };

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Two transfers, two locks</h3>
        <div className="sql-presets">
          <button className={mode === "naive" ? "active" : ""} onClick={() => switchMode("naive")}>
            Opposite order
          </button>
          <button className={mode === "ordered" ? "active" : ""} onClick={() => switchMode("ordered")}>
            Fix: same order (A then B)
          </button>
          <button className={mode === "timeout" ? "active" : ""} onClick={() => switchMode("timeout")}>
            Fix: timeout and retry
          </button>
        </div>

        <div className="cm-threads">
          {([0, 1] as Tid[]).map((t) => {
            const blocked = !canRun(s, t, progs[t]) && s.pc[t] < progs[t].length;
            return (
              <div key={t} className={`cm-card ${blocked ? "cm-card-blocked" : ""}`}>
                <strong>
                  {TNAME[t]} {s.retries[t] > 0 && <span className="mq-small">(retried {s.retries[t]}x)</span>}
                </strong>
                <ol className="cm-instrs">
                  {progs[t].map((o, k) => (
                    <li key={k} className={k < s.pc[t] ? "cm-ins-done" : k === s.pc[t] ? "cm-ins-next" : ""}>
                      <code>{opText(o, t)}</code>
                    </li>
                  ))}
                </ol>
                <button disabled={!canRun(s, t, progs[t])} onClick={() => setS(step(s, t, progs[t]))}>
                  {s.pc[t] >= progs[t].length ? "finished" : blocked ? `blocked waiting for ${waitsOn(s, t, progs[t])}` : `Run ${TNAME[t]}'s next step`}
                </button>
              </div>
            );
          })}
        </div>

        <div className="cm-actions">
          <button onClick={() => setS(step(step(START, 0, progs[0]), 1, progs[1]))}>T1 takes its first lock, then T2 takes its first</button>
          <button onClick={() => setS(START)}>Reset</button>
        </div>

        <div className="cm-graph-row">
          <WaitGraph s={s} progs={progs} />
          <div className="cm-graph-key">
            <span><span className="cm-key-hold" /> lock is held by thread</span>
            <span><span className="cm-key-wait" /> thread waits for lock</span>
            {deadlocked && (
              <p className="constraint-fail">
                Deadlock. T1 waits for {w0}, held by T2; T2 waits for {w1}, held by T1. That's a cycle: neither button can ever be clicked again. A real
                program would just hang, using no CPU.
              </p>
            )}
            {done && <p className="constraint-ok">Both transfers completed.</p>}
            {!deadlocked && !done && mode === "ordered" && s.owner.A !== null && s.pc[s.owner.A === 0 ? 1 : 0] === 0 && (
              <p className="gate-note">The other thread now waits for A while holding nothing, so it can't be part of a cycle.</p>
            )}
            {mode === "timeout" && s.retries[0] + s.retries[1] >= 3 && !done && (
              <p className="gate-note">
                Both keep giving up and retrying: that's livelock, busy but making no progress. A random back-off makes it very unlikely they collide
                again.
              </p>
            )}
          </div>
        </div>

        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Coffman condition</th>
                <th>Now</th>
                <th>How to break it</th>
              </tr>
            </thead>
            <tbody>
              {conditions.map((c) => (
                <tr key={c.name}>
                  <td>{c.name}</td>
                  <td className={c.now ? "cm-yes" : "cm-no"}>{c.now ? "yes" : "no"}</td>
                  <td>{c.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="bigo-table-footnote">All four at once is a deadlock. Remove any one and it can't happen.</p>

        {s.log.length > 0 && (
          <ol className="sql-txn-log">
            {s.log.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ol>
        )}
        <CodeTabs samples={CODE} />
      </div>

      <div className="crypto-section">
        <h3>Dining philosophers</h3>
        <p className="gate-note">
          Five philosophers sit in a ring with one fork between each pair. Philosopher i needs fork i (left) and fork {"(i + 1) mod 5"} (right) to
          eat. Click a philosopher to let them take one action, or let everyone act once in turn.
        </p>
        <div className="sql-presets">
          <button className={st === "left" ? "active" : ""} onClick={() => { setSt("left"); setD(DSTART); }}>
            Everyone takes the left fork first
          </button>
          <button className={st === "ordered" ? "active" : ""} onClick={() => { setSt("ordered"); setD(DSTART); }}>
            Lower-numbered fork first
          </button>
        </div>
        <div className="cm-diners">
          {Array.from({ length: N }, (_, i) => {
            const w = wants(d, i, st);
            const blocked = !canAct(d, i, st);
            return (
              <button key={i} className={`cm-diner ${blocked ? "cm-card-blocked" : ""}`} disabled={blocked} onClick={() => setD(act(d, i, st))}>
                <strong>P{i}</strong>
                <span className="mq-small">holds {d.held[i].length ? d.held[i].map((f) => `F${f}`).join(", ") : "nothing"}</span>
                <span className="mq-small">
                  {w === null ? "ready to eat" : blocked ? `waits for F${w} (P${d.forks[w]} has it)` : `next: pick up F${w}`}
                </span>
                <span className="mq-small">meals: {d.meals[i]}</span>
              </button>
            );
          })}
        </div>
        <div className="cm-actions">
          <button onClick={everyone} disabled={dinersStuck}>
            Everyone acts once (P0 to P4)
          </button>
          <button onClick={() => setD(DSTART)}>Reset</button>
        </div>
        {dinersStuck && (
          <p className="constraint-fail">
            Deadlock: every philosopher holds one fork and waits for the next one's. Five threads in a cycle. Switch to lower-numbered fork first and
            try the same clicks.
          </p>
        )}
        {st === "ordered" && d.meals.some((m) => m > 0) && (
          <p className="constraint-ok">
            P4's forks are F4 and F0, so it reaches for F0 first, like P0. Their contention for F0 breaks the ring: someone always gets both forks. Keep clicking and compare the meal counts, though: ordering prevents deadlock, not unfairness. Guaranteeing everyone eats (no starvation) needs more, such as a fair queue for the forks.
          </p>
        )}
        <ul className="k8s-events">
          {d.log.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
        <p className="gate-note">
          Databases detect deadlocks instead of preventing them: they find a cycle in the wait-for graph and abort one transaction. Write that
          detector in{" "}
          <button className="link-button" onClick={() => openLesson("deadlock-detection")}>
            Detect a Deadlock in a Wait-For Graph
          </button>
          .
        </p>
      </div>
    </div>
  );
}
