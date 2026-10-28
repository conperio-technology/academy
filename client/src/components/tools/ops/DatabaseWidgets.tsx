import { useState } from "react";

// Simulators for the Databases lessons: two sessions racing under each isolation level, an
// LSM tree's write and read path, the N+1 query problem, and choosing a partition key. They
// are small models of the real behaviour, described in each lesson; timings are made up for
// teaching and say so.

// ---- Isolation levels: two sessions, one timeline ----------------------------------------

type Level = "Read uncommitted" | "Read committed" | "Repeatable read" | "Serializable";
const LEVELS: Level[] = ["Read uncommitted", "Read committed", "Repeatable read", "Serializable"];

interface Step {
  a?: string;
  b?: string;
  // What the step shows, per level, when it differs from the default `shows`.
  shows?: string;
  per?: Partial<Record<Level, string>>;
}

interface Scenario {
  name: string;
  setup: string;
  steps: Step[];
  verdict: Record<Level, { ok: boolean; text: string }>;
}

const SCENARIOS: Scenario[] = [
  {
    name: "Dirty read",
    setup: "Account 1 has a balance of 100.",
    steps: [
      { a: "BEGIN; UPDATE accounts SET balance = 50 WHERE id = 1;" },
      { b: "SELECT balance FROM accounts WHERE id = 1;", per: { "Read uncommitted": "B sees 50", "Read committed": "B sees 100", "Repeatable read": "B sees 100", Serializable: "B sees 100" } },
      { a: "ROLLBACK;" },
    ],
    verdict: {
      "Read uncommitted": { ok: false, text: "B read 50, a value that was rolled back and never existed. That is a dirty read." },
      "Read committed": { ok: true, text: "B only sees committed data, so it read 100." },
      "Repeatable read": { ok: true, text: "No dirty read." },
      Serializable: { ok: true, text: "No dirty read." },
    },
  },
  {
    name: "Non-repeatable read",
    setup: "Account 1 has a balance of 100.",
    steps: [
      { b: "BEGIN; SELECT balance FROM accounts WHERE id = 1;", shows: "B sees 100" },
      { a: "UPDATE accounts SET balance = 50 WHERE id = 1; COMMIT;" },
      { b: "SELECT balance FROM accounts WHERE id = 1;", per: { "Read uncommitted": "B sees 50", "Read committed": "B sees 50", "Repeatable read": "B sees 100", Serializable: "B sees 100" } },
    ],
    verdict: {
      "Read uncommitted": { ok: false, text: "The same SELECT gave two different answers inside one transaction." },
      "Read committed": { ok: false, text: "Each statement sees the latest committed data, so B's second read changed. That is a non-repeatable read." },
      "Repeatable read": { ok: true, text: "B keeps reading the snapshot it started with (or holds a read lock), so both reads say 100." },
      Serializable: { ok: true, text: "Both reads say 100." },
    },
  },
  {
    name: "Phantom read",
    setup: "There is one pending order.",
    steps: [
      { b: "BEGIN; SELECT COUNT(*) FROM orders WHERE status = 'pending';", shows: "B counts 1" },
      { a: "INSERT INTO orders (status) VALUES ('pending'); COMMIT;" },
      {
        b: "SELECT COUNT(*) FROM orders WHERE status = 'pending';",
        per: { "Read uncommitted": "B counts 2", "Read committed": "B counts 2", "Repeatable read": "B counts 1 in PostgreSQL and MySQL; the SQL standard allows 2", Serializable: "B counts 1" },
      },
    ],
    verdict: {
      "Read uncommitted": { ok: false, text: "A new row appeared in B's range between two reads: a phantom." },
      "Read committed": { ok: false, text: "Phantom: the second count saw A's new row." },
      "Repeatable read": { ok: true, text: "The SQL standard only promises that rows B already read don't change, so phantoms are allowed. PostgreSQL and MySQL InnoDB read from a snapshot (MySQL also locks gaps for locking reads), so in practice B still counts 1." },
      Serializable: { ok: true, text: "No phantoms: the result is as if the transactions ran one after the other." },
    },
  },
  {
    name: "Lost update",
    setup: "Product 7 has 10 in stock. Two shoppers buy one each, and the app does read, subtract, write.",
    steps: [
      { a: "BEGIN; SELECT stock FROM products WHERE id = 7;", shows: "A reads 10" },
      { b: "BEGIN; SELECT stock FROM products WHERE id = 7;", shows: "B reads 10" },
      { a: "UPDATE products SET stock = 9 WHERE id = 7; COMMIT;" },
      {
        b: "UPDATE products SET stock = 9 WHERE id = 7; COMMIT;",
        per: {
          "Read uncommitted": "B's update succeeds",
          "Read committed": "B's update succeeds",
          "Repeatable read": "PostgreSQL: B fails with a serialization error. MySQL: B's update succeeds",
          Serializable: "B fails with a serialization error (or waited and deadlocked)",
        },
      },
    ],
    verdict: {
      "Read uncommitted": { ok: false, text: "Final stock is 9 although two items were sold. A's update was lost." },
      "Read committed": { ok: false, text: "Lost update: stock 9, should be 8. Read committed does nothing about read, modify, write races." },
      "Repeatable read": {
        ok: false,
        text: "Depends on the database. PostgreSQL detects that the row changed since B's snapshot and aborts B, so the app can retry. MySQL InnoDB's repeatable read lets B overwrite A, and the update is lost.",
      },
      Serializable: { ok: true, text: "One of them is aborted and retries, reading 9 and writing 8." },
    },
  },
  {
    name: "Write skew",
    setup: "Two doctors are on call; the rule is that at least one must stay on call. Both ask to go off call at the same moment.",
    steps: [
      { a: "BEGIN; SELECT COUNT(*) FROM on_call;", shows: "A counts 2, so leaving is allowed" },
      { b: "BEGIN; SELECT COUNT(*) FROM on_call;", shows: "B counts 2, so leaving is allowed" },
      { a: "DELETE FROM on_call WHERE doctor = 'A'; COMMIT;" },
      { b: "DELETE FROM on_call WHERE doctor = 'B'; COMMIT;", per: { Serializable: "B fails with a serialization error" } },
    ],
    verdict: {
      "Read uncommitted": { ok: false, text: "Nobody is on call. Each transaction was fine alone; together they broke the rule." },
      "Read committed": { ok: false, text: "Write skew: they changed different rows, so no lock or conflict check noticed." },
      "Repeatable read": { ok: false, text: "Still broken. Snapshot isolation only catches two writes to the same row, and these were different rows." },
      Serializable: { ok: true, text: "PostgreSQL's serializable (SSI) sees that each read a row the other changed and aborts one. Without serializable, lock the rows you check with SELECT ... FOR UPDATE." },
    },
  },
];

export function IsolationLab() {
  const [si, setSi] = useState(0);
  const [level, setLevel] = useState<Level>("Read committed");
  const s = SCENARIOS[si];
  const v = s.verdict[level];
  return (
    <div>
      <div className="sql-presets" aria-label="Anomaly">
        {SCENARIOS.map((x, i) => (
          <button key={x.name} className={i === si ? "active" : ""} onClick={() => setSi(i)}>
            {x.name}
          </button>
        ))}
      </div>
      <div className="sql-presets" aria-label="Isolation level">
        {LEVELS.map((l) => (
          <button key={l} className={l === level ? "active" : ""} onClick={() => setLevel(l)}>
            {l}
          </button>
        ))}
      </div>
      <p className="lt-p">{s.setup}</p>
      <ol className="dbw-steps">
        {s.steps.map((st, i) => {
          const result = st.per?.[level] ?? st.shows;
          return (
            <li key={i} className={st.a ? "dbw-step-a" : "dbw-step-b"}>
              <span className="dbw-who">Session {st.a ? "A" : "B"}</span>
              <code className="dbw-sql">{st.a ?? st.b}</code>
              {result && <span className="dbw-result">{result}</span>}
            </li>
          );
        })}
      </ol>
      <p className={`lt-p ${v.ok ? "ops-ok" : "ops-warn"} dbw-verdict`}>
        <strong>{v.ok ? "Prevented. " : "Anomaly. "}</strong>
        {v.text}
      </p>
    </div>
  );
}

// ---- LSM tree: memtable, flushes, compaction and the read path ----------------------------

interface Run {
  id: number;
  entries: [string, string][]; // sorted by key; value "" is a tombstone
}

const MEMTABLE_LIMIT = 4;
const SAMPLE_KEYS = ["apple", "kiwi", "mango", "fig", "lime", "pear", "plum", "date", "grape", "lemon"];

export function LsmTree() {
  const [mem, setMem] = useState<Map<string, string>>(new Map());
  const [runs, setRuns] = useState<Run[]>([]);
  const [nextId, setNextId] = useState(1);
  const [key, setKey] = useState("kiwi");
  const [log, setLog] = useState<string[]>(["Write a few keys. When the memtable holds 4, it is flushed to disk as a sorted, immutable file."]);
  const [wal, setWal] = useState(0);

  function flush(m: Map<string, string>, id: number, rs: Run[]): Run[] {
    const entries = [...m.entries()].sort((x, y) => x[0].localeCompare(y[0]));
    return [{ id, entries }, ...rs];
  }

  function write(k: string, value: string) {
    const m = new Map(mem);
    m.set(k, value);
    const lines = [`${value === "" ? "DELETE" : "PUT"} ${k}: appended to the write-ahead log, then put in the memtable.`];
    setWal((w) => w + 1);
    if (m.size >= MEMTABLE_LIMIT) {
      setRuns(flush(m, nextId, runs));
      lines.push(`Memtable full: flushed as SSTable ${nextId} (sorted, never changed again). The log can be truncated.`);
      setNextId(nextId + 1);
      setMem(new Map());
      setWal(0);
    } else setMem(m);
    setLog((l) => [...lines.reverse(), ...l].slice(0, 8));
  }

  function read(k: string) {
    const lines: string[] = [];
    let checked = 1;
    if (mem.has(k)) {
      const v = mem.get(k)!;
      lines.push(`GET ${k}: found in the memtable${v === "" ? " as a tombstone, so it is deleted" : ` = ${v}`}. 1 place checked.`);
    } else {
      let found = false;
      for (const r of runs) {
        checked++;
        const e = r.entries.find(([x]) => x === k);
        if (e) {
          lines.push(`GET ${k}: not in the memtable; found in SSTable ${r.id}${e[1] === "" ? " as a tombstone, so it is deleted" : ` = ${e[1]}`}. ${checked} places checked, newest first.`);
          found = true;
          break;
        }
      }
      if (!found) lines.push(`GET ${k}: not found after checking the memtable and ${runs.length} SSTable${runs.length === 1 ? "" : "s"}. Real engines keep a Bloom filter per file to skip most of them.`);
    }
    setLog((l) => [...lines, ...l].slice(0, 8));
  }

  function compact() {
    if (runs.length < 2) return;
    const merged = new Map<string, string>();
    for (const r of [...runs].reverse()) for (const [k, v] of r.entries) merged.set(k, v);
    const before = runs.reduce((n, r) => n + r.entries.length, 0);
    const entries = [...merged.entries()].filter(([, v]) => v !== "").sort((x, y) => x[0].localeCompare(y[0]));
    setRuns([{ id: nextId, entries }]);
    setNextId(nextId + 1);
    setLog((l) => [`Compaction merged ${runs.length} SSTables (${before} entries) into SSTable ${nextId} (${entries.length} entries): old versions and tombstones dropped.`, ...l].slice(0, 8));
  }

  return (
    <div>
      <div className="darr-actions">
        <label className="dbw-label">
          Key{" "}
          <select value={key} onChange={(e) => setKey(e.target.value)}>
            {SAMPLE_KEYS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <button onClick={() => write(key, `v${Math.floor(Math.random() * 90) + 10}`)}>Put</button>
        <button onClick={() => write(key, "")}>Delete</button>
        <button onClick={() => read(key)}>Get</button>
        <button onClick={compact} disabled={runs.length < 2}>
          Compact
        </button>
        <button
          onClick={() => {
            setMem(new Map());
            setRuns([]);
            setNextId(1);
            setWal(0);
            setLog(["Reset."]);
          }}
        >
          Reset
        </button>
      </div>
      <div className="dbw-lsm">
        <div className="dbw-box">
          <h4 className="ops-subhead">In memory: memtable ({mem.size} of {MEMTABLE_LIMIT})</h4>
          <p className="gate-note">Write-ahead log: {wal} unflushed record{wal === 1 ? "" : "s"}</p>
          <ul className="dbw-entries">
            {[...mem.entries()]
              .sort((x, y) => x[0].localeCompare(y[0]))
              .map(([k, v]) => (
                <li key={k} className="mono">
                  {k} = {v === "" ? "(tombstone)" : v}
                </li>
              ))}
          </ul>
        </div>
        <div className="dbw-box">
          <h4 className="ops-subhead">On disk: SSTables, newest first</h4>
          {runs.length === 0 && <p className="gate-note">None yet.</p>}
          {runs.map((r) => (
            <div key={r.id} className="dbw-run">
              <strong>SSTable {r.id}</strong>
              <span className="mono"> {r.entries.map(([k, v]) => `${k}=${v === "" ? "x" : v}`).join(", ")}</span>
            </div>
          ))}
        </div>
      </div>
      <ul className="lt-list dbw-log">
        {log.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </div>
  );
}

// ---- N+1 queries --------------------------------------------------------------------------

export function NPlusOne() {
  const [n, setN] = useState(50);
  const [rtt, setRtt] = useState(1);
  const rows = [
    { name: "Lazy loading in a loop (N+1)", queries: n + 1, how: "1 query for the orders, then 1 per order for its customer" },
    { name: "Batched: WHERE id IN (...)", queries: 2, how: "1 query for the orders, 1 for all their customers at once" },
    { name: "One JOIN", queries: 1, how: "orders joined to customers in a single query" },
  ];
  return (
    <div>
      <div className="darr-actions">
        <label className="dbw-label">
          Orders on the page: <strong>{n}</strong>{" "}
          <input type="range" min={1} max={500} value={n} onChange={(e) => setN(Number(e.target.value))} />
        </label>
        <label className="dbw-label">
          Round trip to the database: <strong>{rtt} ms</strong>{" "}
          <input type="range" min={0.2} max={20} step={0.2} value={rtt} onChange={(e) => setRtt(Number(e.target.value))} />
        </label>
      </div>
      <div className="cm-scroll">
        <table className="bigo-table">
          <thead>
            <tr>
              <th>Approach</th>
              <th>Queries</th>
              <th>Time in round trips alone</th>
              <th>How</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td className={r.queries > 10 ? "ops-warn" : "ops-ok"}>{r.queries}</td>
                <td>{(r.queries * rtt).toFixed(1)} ms</td>
                <td>{r.how}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="gate-note">Only network round trips are counted; real queries also take time to run. Same machine is about 0.2 ms, same data centre about 1 ms, another region 20 ms or more.</p>
    </div>
  );
}

// ---- Partition keys: spreading load and keeping queries on one partition -------------------

type KeyChoice = "chat_id" | "sender_id" | "date" | "chat_id + month";

const KEY_INFO: Record<KeyChoice, { load: number[]; query: string; ok: boolean; note: string }> = {
  chat_id: {
    load: [27, 24, 26, 23],
    query: "1 partition",
    ok: true,
    note: "Messages for one chat live together, so \"latest 50 in this chat\" reads one partition, sorted by time. Thousands of chats spread evenly. A single enormous chat could still grow too big for one partition.",
  },
  sender_id: {
    load: [30, 22, 25, 23],
    query: "every partition",
    ok: false,
    note: "Load spreads fine, but a chat's messages are scattered across every sender's partition, so reading one chat asks every partition and merges the results.",
  },
  date: {
    load: [97, 1, 1, 1],
    query: "1 partition",
    ok: false,
    note: "Every write today goes to today's partition: a hot partition takes all the load while the others sit idle.",
  },
  "chat_id + month": {
    load: [25, 26, 24, 25],
    query: "1 partition for recent messages",
    ok: true,
    note: "Bucketing by month as well keeps even a huge chat's partitions bounded. Recent messages are in the current month's partition; scrolling back reads earlier months one by one.",
  },
};

export function PartitionKeyChooser() {
  const [k, setK] = useState<KeyChoice>("date");
  const info = KEY_INFO[k];
  const max = Math.max(...info.load);
  return (
    <div>
      <p className="lt-p">
        A chat app stores messages in a wide-column store spread over four nodes. The main query is &quot;the latest 50 messages in a chat&quot;. Pick the partition key.
      </p>
      <div className="sql-presets">
        {(Object.keys(KEY_INFO) as KeyChoice[]).map((c) => (
          <button key={c} className={c === k ? "active" : ""} onClick={() => setK(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="dbw-bars" role="img" aria-label={`Share of writes per node: ${info.load.join(", ")} percent`}>
        {info.load.map((v, i) => (
          <div key={i} className="dbw-bar-row">
            <span>Node {i + 1}</span>
            <div className="dbw-bar-track">
              <div className={`dbw-bar ${v === max && v > 50 ? "hot" : ""}`} style={{ width: `${v}%` }} />
            </div>
            <span>{v}%</span>
          </div>
        ))}
      </div>
      <p className="lt-p">
        Reading one chat touches: <strong>{info.query}</strong>
      </p>
      <p className={`lt-p ${info.ok ? "ops-ok" : "ops-warn"} dbw-verdict`}>{info.note}</p>
      <p className="gate-note">Write shares are illustrative, for a day of traffic over many chats.</p>
    </div>
  );
}
