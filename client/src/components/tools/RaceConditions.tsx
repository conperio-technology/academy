import { useState } from "react";
import { CodeTabs } from "./concurrencyShared";

// You are the scheduler. Each thread runs count++ once, as the three machine-level steps
// the CPU actually performs, and you choose whose step runs next. With the lock on, each
// thread must take the lock first, and a thread that reaches LOCK while the other holds it
// is blocked: it can't be scheduled until the lock is released.

type Instr = "LOCK" | "LOAD" | "ADD" | "STORE" | "UNLOCK";
type Tid = 0 | 1;
const NAMES = ["A", "B"] as const;

const PLAIN: Instr[] = ["LOAD", "ADD", "STORE"];
const LOCKED: Instr[] = ["LOCK", "LOAD", "ADD", "STORE", "UNLOCK"];

interface State {
  pc: [number, number];
  reg: [number | null, number | null];
  count: number;
  owner: Tid | null;
  log: string[];
}

const START: State = { pc: [0, 0], reg: [null, null], count: 0, owner: null, log: [] };

function describe(i: Instr): string {
  return { LOCK: "lock (gate)", LOAD: "r = count", ADD: "r = r + 1", STORE: "count = r", UNLOCK: "release gate" }[i];
}

function canRun(s: State, t: Tid, prog: Instr[]): boolean {
  if (s.pc[t] >= prog.length) return false;
  return !(prog[s.pc[t]] === "LOCK" && s.owner !== null && s.owner !== t);
}

function run(s: State, t: Tid, prog: Instr[]): State {
  if (!canRun(s, t, prog)) return s;
  const n = { ...s, pc: [...s.pc] as [number, number], reg: [...s.reg] as [number | null, number | null], log: [...s.log] };
  const instr = prog[s.pc[t]];
  const who = NAMES[t];
  switch (instr) {
    case "LOCK":
      n.owner = t;
      n.log.push(`${who}: takes the lock`);
      break;
    case "LOAD":
      n.reg[t] = s.count;
      n.log.push(`${who}: loads count (${s.count}) into its register`);
      break;
    case "ADD":
      n.reg[t] = (s.reg[t] ?? 0) + 1;
      n.log.push(`${who}: adds 1 in its register, now ${n.reg[t]}`);
      break;
    case "STORE":
      n.count = s.reg[t] ?? 0;
      n.log.push(`${who}: stores ${n.count} to count${s.count === n.count ? " (it was already " + s.count + ": that increment is lost)" : ""}`);
      break;
    case "UNLOCK":
      n.owner = null;
      n.log.push(`${who}: releases the lock`);
      break;
  }
  n.pc[t]++;
  return n;
}

// Every order the scheduler could pick, to count how many lose an update.
function allOutcomes(prog: Instr[]): { total: number; lost: number } {
  let total = 0;
  let lost = 0;
  const go = (s: State) => {
    const a = canRun(s, 0, prog);
    const b = canRun(s, 1, prog);
    if (!a && !b) {
      total++;
      if (s.count !== 2) lost++;
      return;
    }
    if (a) go(run(s, 0, prog));
    if (b) go(run(s, 1, prog));
  };
  go(START);
  return { total, lost };
}

const OUTCOMES = { plain: allOutcomes(PLAIN), lock: allOutcomes(LOCKED) };

const PRESETS: { label: string; seq: Tid[] }[] = [
  { label: "A runs to the end, then B", seq: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1] },
  { label: "Both load before either stores", seq: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1] },
];

const CODE = [
  {
    label: "Broken",
    code: `class Counter
{
    private int _count;

    public void Work()
    {
        for (int i = 0; i < 1_000_000; i++)
            _count++;      // load, add, store: not atomic
    }

    public int Count => _count;
}

var c = new Counter();
var t1 = new Thread(c.Work);
var t2 = new Thread(c.Work);
t1.Start(); t2.Start();
t1.Join();  t2.Join();
Console.WriteLine(c.Count);  // usually well under 2,000,000`,
    note: "The result changes from run to run. In theory it can be as low as 2: with the right (unlucky) interleaving, one thread's stale store wipes out almost all of the other's work.",
  },
  {
    label: "lock",
    code: `class Counter
{
    private readonly object _gate = new();
    private int _count;

    public void Work()
    {
        for (int i = 0; i < 1_000_000; i++)
        {
            lock (_gate)   // Monitor.Enter ... finally Monitor.Exit
            {
                _count++;
            }
        }
    }
}
// always 2,000,000`,
    note: "Correct, and needed whenever the critical section touches more than one variable. An uncontended lock costs tens of nanoseconds; a contended one can put the thread to sleep.",
  },
  {
    label: "Interlocked",
    code: `class Counter
{
    private int _count;

    public void Work()
    {
        for (int i = 0; i < 1_000_000; i++)
            Interlocked.Increment(ref _count);  // one atomic instruction
    }
}
// always 2,000,000, no lock object, no blocking`,
    note: "Best for a single counter. Faster still: let each thread count in a local variable and add its total once at the end.",
  },
];

export function RaceConditions() {
  const [locked, setLocked] = useState(false);
  const [s, setS] = useState<State>(START);
  const prog = locked ? LOCKED : PLAIN;
  const done = s.pc[0] >= prog.length && s.pc[1] >= prog.length;
  const o = locked ? OUTCOMES.lock : OUTCOMES.plain;

  const switchMode = (l: boolean) => {
    setLocked(l);
    setS(START);
  };

  const preset = (seq: Tid[]) => {
    let st = START;
    for (const t of seq) st = run(st, t, prog);
    // Finish whatever is left, so a preset always ends with both threads done.
    while (canRun(st, 0, prog) || canRun(st, 1, prog)) st = run(st, canRun(st, 0, prog) ? 0 : 1, prog);
    setS(st);
  };

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Two threads, one count++ each</h3>
        <div className="sql-presets">
          <button className={!locked ? "active" : ""} onClick={() => switchMode(false)}>
            count++ (no lock)
          </button>
          <button className={locked ? "active" : ""} onClick={() => switchMode(true)}>
            lock (gate) {"{ count++; }"}
          </button>
        </div>

        <div className="cm-shared-mem">
          <span>shared memory:</span>
          <strong className="mono">count = {s.count}</strong>
          {locked && <span className="mq-small">lock: {s.owner === null ? "free" : `held by ${NAMES[s.owner]}`}</span>}
        </div>

        <div className="cm-threads">
          {([0, 1] as Tid[]).map((t) => {
            const blocked = !canRun(s, t, prog) && s.pc[t] < prog.length;
            return (
              <div key={t} className={`cm-card ${blocked ? "cm-card-blocked" : ""}`}>
                <strong>Thread {NAMES[t]}</strong>
                <span className="mono mq-small">register r = {s.reg[t] ?? "?"}</span>
                <ol className="cm-instrs">
                  {prog.map((ins, k) => (
                    <li key={k} className={k < s.pc[t] ? "cm-ins-done" : k === s.pc[t] ? "cm-ins-next" : ""}>
                      <code>{describe(ins)}</code>
                    </li>
                  ))}
                </ol>
                <button disabled={!canRun(s, t, prog)} onClick={() => setS(run(s, t, prog))}>
                  {s.pc[t] >= prog.length ? "finished" : blocked ? `blocked: ${NAMES[s.owner!]} holds the lock` : `Run ${NAMES[t]}'s next step`}
                </button>
              </div>
            );
          })}
        </div>

        <div className="cm-actions">
          {PRESETS.map((p) => (
            <button key={p.label} onClick={() => preset(p.seq)}>
              {p.label}
            </button>
          ))}
          <button onClick={() => setS(START)}>Reset</button>
        </div>

        {done && s.count === 2 && <p className="constraint-ok">count = 2. Both increments landed.</p>}
        {done && s.count !== 2 && (
          <p className="constraint-fail">
            count = {s.count}, but two increments ran. Both threads loaded the same old value, so the second store overwrote the first: a lost update.
          </p>
        )}
        {!done && locked && s.owner !== null && s.pc[s.owner === 0 ? 1 : 0] === 0 && (
          <p className="gate-note">Now try to run the other thread: it can't get past LOCK until {NAMES[s.owner]} releases it.</p>
        )}

        {s.log.length > 0 && (
          <ol className="sql-txn-log">
            {s.log.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ol>
        )}

        <p className="gate-note">
          {locked
            ? `With the lock, all ${o.total} orders the scheduler could legally pick end with count = 2. The lock turns load, add, store into one unit no other thread can split.`
            : `There are ${o.total} different orders the scheduler could run these six steps in, and ${o.lost} of them lose an update. Only the two where one thread finishes before the other starts are correct.`}
        </p>
      </div>

      <div className="crypto-section">
        <h3>The same thing in C#</h3>
        <CodeTabs samples={CODE} />
      </div>
    </div>
  );
}
