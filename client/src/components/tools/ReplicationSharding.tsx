import { useEffect, useState } from "react";

// Two small models, no real database involved. Part 1 is one leader and two read replicas:
// every write lands on the leader at a known time, and a replica "has" it once the
// replication lag has passed. Part 2 splits 10,000 made-up users across shards with three
// different shard keys and counts what lands where (and what moves when you add a shard).

// ---- 1. Replication -----------------------------------------------------------------------

interface Write {
  seq: number;
  value: string;
  at: number; // ms timestamp the leader accepted it
  sync: boolean; // was db-2 synchronous when this write happened?
}

interface ReadResult {
  from: string;
  got: string;
  latest: string;
}

const NODE_NAMES = ["db-1", "db-2", "db-3"];

function Replication() {
  const [lagMs, setLagMs] = useState(3000);
  const [syncFirst, setSyncFirst] = useState(false); // replica 1 replicates synchronously
  const [readOwn, setReadOwn] = useState(false); // route my reads to the leader after I write
  const [writes, setWrites] = useState<Write[]>([{ seq: 0, value: "bio v0", at: 0, sync: false }]);
  const [leader, setLeader] = useState(0); // index into NODE_NAMES
  const [down, setDown] = useState<number[]>([]);
  const [lost, setLost] = useState<Write[]>([]);
  const [read, setRead] = useState<ReadResult | null>(null);
  const [lastWriteAt, setLastWriteAt] = useState(-Infinity);
  const [now, setNow] = useState(() => Date.now());
  const [nextReplica, setNextReplica] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(timer);
  }, []);

  const replicas = NODE_NAMES.map((_, i) => i).filter((i) => i !== leader && !down.includes(i));
  // The first replica in the original setup (db-2) is the synchronous one when sync is on.
  const isSync = (i: number) => syncFirst && i === 1;
  const SYNC_NODE = 1;
  // What a node has applied: the leader has everything, a replica has what the lag allows.
  const applied = (i: number) =>
    i === leader ? writes : writes.filter((w) => w.seq === 0 || (w.sync && i === SYNC_NODE) || w.at + lagMs <= now);
  const valueOn = (i: number) => applied(i)[applied(i).length - 1].value;
  const latest = writes[writes.length - 1];

  const doWrite = () => {
    const w: Write = { seq: latest.seq + 1, value: `bio v${latest.seq + 1}`, at: Date.now(), sync: syncFirst && leader === 0 && !down.includes(SYNC_NODE) };
    setWrites([...writes, w]);
    setLastWriteAt(w.at);
    setRead(null);
  };

  const doRead = () => {
    const ownRecent = readOwn && now - lastWriteAt < lagMs;
    const target = ownRecent || replicas.length === 0 ? leader : replicas[nextReplica % replicas.length];
    setNextReplica(nextReplica + 1);
    setRead({ from: NODE_NAMES[target] + (target === leader ? " (leader)" : ""), got: valueOn(target), latest: latest.value });
  };

  // Fail the leader: the most up-to-date surviving replica is promoted, and anything it
  // hadn't received yet is gone, even though the client was told "saved".
  const failLeader = () => {
    if (replicas.length === 0) return;
    const promoted = replicas.reduce((best, i) => (applied(i).length > applied(best).length ? i : best));
    const kept = applied(promoted);
    setLost(writes.slice(kept.length));
    setWrites(kept.map((w) => ({ ...w, at: 0 })));
    setDown([...down, leader]);
    setLeader(promoted);
    setRead(null);
  };

  const reset = () => {
    setWrites([{ seq: 0, value: "bio v0", at: 0, sync: false }]);
    setLeader(0);
    setDown([]);
    setLost([]);
    setRead(null);
  };

  const stale = read !== null && read.got !== read.latest;

  return (
    <div className="crypto-section">
      <h3>1. Replication: one leader, two read replicas</h3>
      <div className="rs-controls">
        <label>
          Replication lag: <strong>{(lagMs / 1000).toFixed(1)} s</strong>
          <input type="range" min={0} max={8000} step={250} value={lagMs} onChange={(e) => setLagMs(Number(e.target.value))} />
        </label>
        <label className="rs-check">
          <input type="checkbox" checked={readOwn} onChange={(e) => setReadOwn(e.target.checked)} />
          Read your own writes from the leader
        </label>
        <label className="rs-check">
          <input type="checkbox" checked={syncFirst} onChange={(e) => setSyncFirst(e.target.checked)} />
          Make db-2 a synchronous replica
        </label>
      </div>
      <div className="darr-actions rs-actions">
        <button onClick={doWrite}>Write "bio v{latest.seq + 1}"</button>
        <button onClick={doRead}>Read my bio</button>
        <button onClick={failLeader} disabled={replicas.length === 0}>Fail the leader</button>
        <button onClick={reset}>Reset</button>
      </div>

      <div className="rs-nodes">
        {NODE_NAMES.map((name, i) => {
          const isDown = down.includes(i);
          const behind = writes.length - applied(i).length;
          return (
            <div key={name} className={`rs-node ${isDown ? "rs-down" : i === leader ? "rs-leader" : ""}`}>
              <strong>{name}</strong>
              <span>{isDown ? "down" : i === leader ? "leader (takes writes)" : isSync(i) ? "replica, synchronous" : "replica, async"}</span>
              {!isDown && <code className="mono">{valueOn(i)}</code>}
              {!isDown && i !== leader && (
                <span className={behind > 0 ? "rs-behind" : "rs-caught-up"}>{behind > 0 ? `${behind} write${behind === 1 ? "" : "s"} behind` : "caught up"}</span>
              )}
            </div>
          );
        })}
      </div>

      {read && (
        <p className={stale ? "constraint-fail" : "constraint-ok"}>
          Read from {read.from}: got "{read.got}", latest is "{read.latest}". {stale ? "Stale." : "Up to date."}
        </p>
      )}
      {lost.length > 0 && (
        <p className="constraint-fail">
          Lost on failover: {lost.map((w) => `"${w.value}"`).join(", ")}. The client was told these were saved, but they only ever reached the old leader.
        </p>
      )}
      <p className="gate-note">
        {lost.length > 0
          ? `${NODE_NAMES[leader]} was promoted because it had the most writes. With async replication the leader confirms a write before any replica has it, so a crash in that window loses it. Turn on the synchronous replica, reset, and try again: the promoted node then has every confirmed write, at the cost of each write waiting for it.`
          : stale
            ? `The write is on the leader, but this replica is still ${(lagMs / 1000).toFixed(1)} s behind, so you see your old bio. That's the read-after-write problem: users think their save failed. Turn on "read your own writes from the leader" to fix it for the writer.`
            : read && readOwn && read.from.includes("leader")
              ? "You wrote recently, so your read went to the leader and saw your own write. Other users still read from replicas and may see the old value for a few seconds, which is usually fine."
              : syncFirst && leader === 0
                ? `db-2 is now synchronous: the leader confirms a write only after db-2 has it, so each write takes about ${(lagMs / 1000).toFixed(1)} s longer to confirm here, and if db-2 goes down writes stall. db-3 stays async. Many databases run like this ("semi-synchronous").`
                : down.length > 0
                ? `${NODE_NAMES[leader]} is the new leader and the remaining replica follows it. Reset to start over with three nodes.`
                : "Write a new bio, then read it straight away. Reads go to the replicas in turn, which is how replicas take read load off the leader."}
      </p>
    </div>
  );
}

// ---- 2. Sharding ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Rough share of English first names by initial: very uneven on purpose.
const LETTER_WEIGHTS: [string, number][] = [
  ["A", 9], ["B", 5], ["C", 7], ["D", 7], ["E", 4], ["F", 2], ["G", 3], ["H", 3], ["I", 1], ["J", 11], ["K", 6],
  ["L", 5], ["M", 9], ["N", 3], ["O", 1], ["P", 3], ["Q", 0.2], ["R", 5], ["S", 7], ["T", 5], ["U", 0.2], ["V", 1],
  ["W", 2], ["X", 0.1], ["Y", 0.5], ["Z", 0.5],
];
const LETTERS = LETTER_WEIGHTS.map((l) => l[0]);

const USERS = (() => {
  const rand = mulberry32(42);
  const total = LETTER_WEIGHTS.reduce((s, l) => s + l[1], 0);
  return Array.from({ length: 10000 }, (_, i) => {
    let r = rand() * total;
    const letter = LETTER_WEIGHTS.find((l) => (r -= l[1]) < 0)?.[0] ?? "Z";
    return { id: i + 1, letter };
  });
})();
const CELEBRITY = 4242; // with the hot key on, this one user gets as many requests as everyone else combined

function hashId(id: number) {
  let h = Math.imul(id ^ 0x9e3779b9, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

type Strategy = "hash" | "idRange" | "letter";

const STRATEGIES: { id: Strategy; label: string }[] = [
  { id: "hash", label: "hash(user_id) mod N" },
  { id: "idRange", label: "Range of user_id" },
  { id: "letter", label: "First letter of name" },
];

function shardOf(u: { id: number; letter: string }, s: Strategy, n: number) {
  if (s === "hash") return hashId(u.id) % n;
  if (s === "idRange") return Math.min(n - 1, Math.floor(((u.id - 1) * n) / USERS.length));
  return Math.min(n - 1, Math.floor((LETTERS.indexOf(u.letter) * n) / LETTERS.length));
}

function shardLabel(i: number, s: Strategy, n: number) {
  if (s === "hash") return `shard ${i}`;
  if (s === "idRange") return `ids ${Math.floor((i * USERS.length) / n) + 1}-${Math.floor(((i + 1) * USERS.length) / n)}`;
  const ls = LETTERS.filter((_, k) => Math.min(n - 1, Math.floor((k * n) / LETTERS.length)) === i);
  return ls.length === 1 ? ls[0] : `${ls[0]}-${ls[ls.length - 1]}`;
}

function Sharding() {
  const [strategy, setStrategy] = useState<Strategy>("hash");
  const [n, setN] = useState(4);
  const [hot, setHot] = useState(false);
  const [moved, setMoved] = useState<{ from: number; to: number; count: number } | null>(null);

  const load = Array(n).fill(0) as number[];
  for (const u of USERS) load[shardOf(u, strategy, n)] += hot && u.id === CELEBRITY ? USERS.length : 1;
  const totalLoad = load.reduce((a, b) => a + b, 0);
  const max = Math.max(...load);
  const ideal = totalLoad / n;

  const resize = (to: number) => {
    const count = USERS.filter((u) => shardOf(u, strategy, n) !== shardOf(u, strategy, to)).length;
    setMoved({ from: n, to, count });
    setN(to);
  };

  return (
    <div className="crypto-section">
      <h3>2. Sharding: 10,000 users across {n} shards</h3>
      <div className="sql-presets">
        {STRATEGIES.map((s) => (
          <button key={s.id} className={s.id === strategy ? "active" : ""} onClick={() => { setStrategy(s.id); setMoved(null); }}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="darr-actions rs-actions">
        <button onClick={() => resize(n + 1)} disabled={n >= 10}>Add a shard</button>
        <button onClick={() => resize(n - 1)} disabled={n <= 2}>Remove a shard</button>
        <label className="rs-check">
          <input type="checkbox" checked={hot} onChange={(e) => setHot(e.target.checked)} />
          Celebrity user #{CELEBRITY} (hot key)
        </label>
      </div>

      <div className="rs-bars">
        {load.map((v, i) => (
          <div key={i} className="rs-bar-row">
            <span className="rs-bar-label mono">{shardLabel(i, strategy, n)}</span>
            <div className="rs-bar-track">
              <div className={`rs-bar ${v > ideal * 1.5 ? "rs-bar-hot" : ""}`} style={{ width: `${(v / max) * 100}%` }} />
            </div>
            <span className="rs-bar-value mono">{v.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <p className="gate-note">
        Bars show {hot ? "requests per shard (every user makes 1, the celebrity makes 10,000)" : "users per shard"}. Busiest shard:{" "}
        {((max / totalLoad) * 100).toFixed(0)}% of the total, against an even share of {(100 / n).toFixed(0)}%.
      </p>

      {moved && (
        <p className={moved.count / USERS.length > 0.3 ? "constraint-fail" : "constraint-ok"}>
          Going from {moved.from} to {moved.to} shards moved {moved.count.toLocaleString()} of 10,000 users ({((moved.count / USERS.length) * 100).toFixed(0)}%).
          {strategy === "hash" && moved.to > moved.from && ` Mod N predicts about ${moved.from}/${moved.to} = ${((moved.from / moved.to) * 100).toFixed(0)}%.`}
        </p>
      )}
      <p className="gate-note">
        {hot
          ? "One key can't be split by any shard key: whichever shard holds the celebrity takes their whole load. Real systems cache that user's data, give hot keys their own replicas, or add a random suffix to spread their writes."
          : moved && strategy === "hash"
            ? "With mod N, changing N changes almost every key's shard, so nearly all the data has to be copied between machines. The Consistent Hashing lesson shows how to move only about 1/N of it."
            : strategy === "hash"
              ? "Hashing the id spreads users almost perfectly evenly, but a range query like \"users 100 to 200\" now has to ask every shard."
              : strategy === "idRange"
                ? "Ranges of id are even today and keep range scans on one shard, but every new user gets the highest id, so all new sign-ups (the writes) hit the last shard."
                : "Splitting by first letter keeps names sorted, but names aren't evenly spread: the J and M shards are far bigger than the Q-Z one. Natural data is rarely uniform."}
      </p>
    </div>
  );
}

export function ReplicationSharding() {
  return (
    <div className="tool-widget">
      <Replication />
      <Sharding />
    </div>
  );
}
