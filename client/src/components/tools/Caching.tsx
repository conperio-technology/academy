import { useEffect, useMemo, useState } from "react";

// Three small models, no real cache or database. Part 1 is cache-aside in front of a
// database: requests pick keys with Zipf-like popularity (a few keys are very hot), a
// miss costs a DB read (~50 ms) and fills the cache, a hit costs ~1 ms. Part 2 is a
// scripted invalidation scenario on one cached user profile with a TTL that ticks in
// real time. Part 3 is a back-of-the-envelope cache stampede calculation.

// Seeded PRNG so the same settings always give the same numbers.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- 1. Cache-aside, hit rate and eviction ------------------------------------------------

const KEYS = 60;
const HIT_MS = 1;
const DB_MS = 50;
const BATCH = 1000;

type Policy = "LRU" | "LFU" | "random";

const POLICIES: { id: Policy; label: string }[] = [
  { id: "LRU", label: "LRU (evict least recently used)" },
  { id: "LFU", label: "LFU (evict least frequently used)" },
  { id: "random", label: "Random eviction" },
];

interface Entry {
  lastUsed: number;
  uses: number;
}

interface Stats {
  requests: number;
  hits: number;
  batches: number;
}

// Zipf-like weights: key k (0 is most popular) gets weight 1 / (k + 1)^skew.
function cumulativeWeights(skew: number) {
  const w = Array.from({ length: KEYS }, (_, k) => 1 / Math.pow(k + 1, skew));
  const total = w.reduce((a, b) => a + b, 0);
  let acc = 0;
  return w.map((x) => (acc += x / total));
}

function pickKey(cdf: number[], r: number) {
  const i = cdf.findIndex((c) => r <= c);
  return i === -1 ? KEYS - 1 : i;
}

// Runs one batch of requests against the cache. Cache-aside: check the cache; on a miss,
// read the DB and put the value in the cache, evicting one entry if it is full.
function runBatch(cache: Map<number, Entry>, size: number, policy: Policy, cdf: number[], seed: number, clockStart: number) {
  const rnd = mulberry32(seed);
  const next = new Map(cache);
  let hits = 0;
  let clock = clockStart;
  for (let i = 0; i < BATCH; i++) {
    const key = pickKey(cdf, rnd());
    clock++;
    const e = next.get(key);
    if (e) {
      hits++;
      next.set(key, { lastUsed: clock, uses: e.uses + 1 });
      continue;
    }
    if (next.size >= size) {
      const entries = [...next.entries()];
      let victim: number;
      if (policy === "random") victim = entries[Math.floor(rnd() * entries.length)][0];
      else if (policy === "LRU") victim = entries.reduce((a, b) => (b[1].lastUsed < a[1].lastUsed ? b : a))[0];
      else victim = entries.reduce((a, b) => (b[1].uses < a[1].uses ? b : a))[0];
      next.delete(victim);
    }
    next.set(key, { lastUsed: clock, uses: 1 });
  }
  return { cache: next, hits, clock };
}

function CacheAside() {
  const [size, setSize] = useState(10);
  const [skew, setSkew] = useState(1.0);
  const [policy, setPolicy] = useState<Policy>("LRU");
  const [cache, setCache] = useState(new Map<number, Entry>());
  const [stats, setStats] = useState<Stats>({ requests: 0, hits: 0, batches: 0 });
  const [last, setLast] = useState<{ hits: number } | null>(null);
  const [clock, setClock] = useState(0);
  const cdf = useMemo(() => cumulativeWeights(skew), [skew]);

  // Changing a setting starts over with an empty (cold) cache.
  const reset = () => {
    setCache(new Map());
    setStats({ requests: 0, hits: 0, batches: 0 });
    setLast(null);
    setClock(0);
  };
  useEffect(reset, [size, skew, policy]);

  const run = () => {
    const r = runBatch(cache, size, policy, cdf, 1234 + stats.batches * 7919, clock);
    setCache(r.cache);
    setClock(r.clock);
    setLast({ hits: r.hits });
    setStats((s) => ({ requests: s.requests + BATCH, hits: s.hits + r.hits, batches: s.batches + 1 }));
  };

  const hitRate = last ? last.hits / BATCH : 0;
  const avgMs = last ? (last.hits * HIT_MS + (BATCH - last.hits) * (HIT_MS + DB_MS)) / BATCH : 0;
  const top10Share = cdf[9];

  return (
    <div className="crypto-section">
      <h3>1. Cache-aside: check the cache, fall back to the database</h3>
      <code className="sql-snippet">
        value = cache.get(key); if (value == null) {"{"} value = db.read(key); cache.set(key, value); {"}"}
      </code>
      <div className="cache-controls">
        <label>
          Cache size: <strong>{size}</strong> of {KEYS} keys
          <input type="range" min={1} max={40} value={size} onChange={(e) => setSize(Number(e.target.value))} />
        </label>
        <label>
          Popularity skew: <strong>{skew.toFixed(1)}</strong> {skew === 0 ? "(every key equally popular)" : ""}
          <input type="range" min={0} max={2} step={0.1} value={skew} onChange={(e) => setSkew(Number(e.target.value))} />
        </label>
      </div>
      <div className="sql-presets">
        {POLICIES.map((p) => (
          <button key={p.id} className={p.id === policy ? "active" : ""} onClick={() => setPolicy(p.id)}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="darr-actions cache-actions">
        <button onClick={run}>Run {BATCH.toLocaleString()} requests</button>
        <button onClick={reset}>Empty the cache</button>
      </div>

      {last && (
        <table className="bigo-table">
          <thead>
            <tr>
              <th>Last {BATCH.toLocaleString()} requests</th>
              <th>With cache</th>
              <th>No cache</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Hit rate</td>
              <td className="mono">{(hitRate * 100).toFixed(1)}%</td>
              <td className="mono">0%</td>
            </tr>
            <tr>
              <td>Average latency</td>
              <td className="mono">{avgMs.toFixed(1)} ms</td>
              <td className="mono">{DB_MS} ms</td>
            </tr>
            <tr>
              <td>DB reads (DB load)</td>
              <td className="mono">{BATCH - last.hits}</td>
              <td className="mono">{BATCH}</td>
            </tr>
          </tbody>
        </table>
      )}
      {stats.batches > 1 && (
        <p className="gate-note">
          All {stats.requests.toLocaleString()} requests so far: {((stats.hits / stats.requests) * 100).toFixed(1)}% hits.
        </p>
      )}

      <p className="cache-legend">Keys by popularity (key 0 is the hottest). Outlined keys are in the cache right now.</p>
      <div className="cache-keys">
        {Array.from({ length: KEYS }, (_, k) => {
          const p = k === 0 ? cdf[0] : cdf[k] - cdf[k - 1];
          const e = cache.get(k);
          return (
            <span
              key={k}
              className={e ? "cache-key cache-key-in" : "cache-key"}
              style={{ opacity: 0.35 + Math.min(1, p / cdf[0]) * 0.65 }}
              title={`key ${k}: ${(p * 100).toFixed(1)}% of requests${e ? `, cached, used ${e.uses} times since it was loaded` : ""}`}
            >
              {k}
            </span>
          );
        })}
      </div>

      <p className="gate-note">
        {!last
          ? `The cache starts empty (cold). With this skew the 10 hottest keys get ${(top10Share * 100).toFixed(0)}% of all requests. Run a batch.`
          : skew === 0
            ? `With no skew every key is equally likely, so a cache holding ${size} of ${KEYS} keys can only hit about ${((size / KEYS) * 100).toFixed(0)}% of the time. Caches pay off because real traffic is skewed.`
            : hitRate > 0.8
              ? `${(hitRate * 100).toFixed(0)}% of requests never touch the database: the hot keys fit in the cache, average latency drops from ${DB_MS} ms to ${avgMs.toFixed(1)} ms and the DB does ${(BATCH / Math.max(1, BATCH - last.hits)).toFixed(1)}x less work.`
              : policy === "random"
                ? "Random eviction sometimes throws out a hot key, which then misses on its next request. Compare it with LRU and LFU at the same size."
                : `Only ${(hitRate * 100).toFixed(0)}% hits: the cache is too small for the working set, so keys get evicted before they are reused. Make it bigger or raise the skew.`}
        {last && stats.batches === 1 ? " The first batch includes the cold-start misses; run another to see the warm hit rate." : ""}
      </p>
    </div>
  );
}

// ---- 2. Invalidation and TTL --------------------------------------------------------------

const TTL = 20; // seconds
const NAMES = ["Ana Silva", "Ana Costa", "Ana Ribeiro", "Ana Moreira"];

type Mode = "none" | "delete";

interface Profile {
  now: number;
  db: string;
  cached: { value: string; expiresAt: number } | null;
  served: { value: string; from: "cache" | "db"; stale: boolean } | null;
  log: string[];
  updates: number;
}

const initialProfile = (): Profile => ({ now: 0, db: NAMES[0], cached: null, served: null, log: [], updates: 0 });

function Invalidation() {
  const [mode, setMode] = useState<Mode>("none");
  const [p, setP] = useState(initialProfile);

  // The clock ticks one simulated second per real second; expired entries drop out.
  useEffect(() => {
    const timer = setInterval(
      () =>
        setP((s) => {
          const now = s.now + 1;
          if (s.cached && now >= s.cached.expiresAt) return { ...s, now, cached: null, log: [`t=${now}s TTL expired, cache entry removed`, ...s.log].slice(0, 7) };
          return { ...s, now };
        }),
      1000,
    );
    return () => clearInterval(timer);
  }, []);

  const read = () =>
    setP((s) => {
      if (s.cached) {
        const stale = s.cached.value !== s.db;
        return { ...s, served: { value: s.cached.value, from: "cache", stale }, log: [`t=${s.now}s read: cache hit, "${s.cached.value}"${stale ? " (stale)" : ""}`, ...s.log].slice(0, 7) };
      }
      return {
        ...s,
        cached: { value: s.db, expiresAt: s.now + TTL },
        served: { value: s.db, from: "db", stale: false },
        log: [`t=${s.now}s read: miss, DB returned "${s.db}", cached for ${TTL}s`, ...s.log].slice(0, 7),
      };
    });

  const write = () =>
    setP((s) => {
      const db = NAMES[(s.updates + 1) % NAMES.length];
      const del = mode === "delete" && s.cached !== null;
      return {
        ...s,
        db,
        updates: s.updates + 1,
        cached: mode === "delete" ? null : s.cached,
        log: [`t=${s.now}s update: DB now says "${db}"${del ? ", cache key deleted" : ""}`, ...s.log].slice(0, 7),
      };
    });

  const left = p.cached ? p.cached.expiresAt - p.now : 0;

  return (
    <div className="crypto-section">
      <h3>2. Invalidation: what happens to the cache when the data changes</h3>
      <div className="sql-presets">
        <button className={mode === "none" ? "active" : ""} onClick={() => setMode("none")}>
          No invalidation (TTL only)
        </button>
        <button className={mode === "delete" ? "active" : ""} onClick={() => setMode("delete")}>
          Delete on write
        </button>
      </div>
      <div className="darr-actions cache-actions">
        <button onClick={read}>Read profile</button>
        <button onClick={write}>Update name in DB</button>
        <button onClick={() => setP(initialProfile())}>Reset</button>
      </div>
      <div className="cache-boxes">
        <div className="cache-box">
          <strong>Database</strong>
          <span className="mono">user:42 = "{p.db}"</span>
        </div>
        <div className="cache-box">
          <strong>Cache</strong>
          {p.cached ? (
            <>
              <span className="mono">user:42 = "{p.cached.value}"</span>
              <span className="cache-ttl">
                <span style={{ width: `${(left / TTL) * 100}%` }} />
              </span>
              <span className="cache-small">TTL {left}s left</span>
            </>
          ) : (
            <span className="cache-small">empty</span>
          )}
        </div>
      </div>
      {p.served && (
        <p className={p.served.stale ? "constraint-fail" : "constraint-ok"}>
          Last read served "{p.served.value}" from the {p.served.from === "cache" ? "cache" : "database"}
          {p.served.stale ? `, but the database says "${p.db}": stale.` : ", which is current."}
        </p>
      )}
      <ul className="k8s-events">
        {p.log.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
      <p className="gate-note">
        {mode === "none"
          ? `Read, update, read again. Nothing tells the cache the data changed, so every read serves the old name until the ${TTL}s TTL runs out. The TTL is the upper bound on how stale data can get.`
          : "On every write the app deletes the cache key, so the next read misses and loads the new value. Deleting is safer than updating the cache in place: two concurrent writers can't leave the older value behind."}
      </p>
    </div>
  );
}

// ---- 3. Cache stampede ----------------------------------------------------------------------

const CONCURRENT = 200;
const DB_PARALLEL = 20; // queries the DB can run at once before the rest queue up

function Stampede() {
  const [coalesce, setCoalesce] = useState(false);
  const dbQueries = coalesce ? 1 : CONCURRENT;
  const waves = Math.ceil(dbQueries / DB_PARALLEL);
  const worstMs = HIT_MS + waves * DB_MS;

  return (
    <div className="crypto-section">
      <h3>3. Cache stampede (thundering herd)</h3>
      <div className="sql-presets">
        <button className={!coalesce ? "active" : ""} onClick={() => setCoalesce(false)}>
          Every miss reads the DB
        </button>
        <button className={coalesce ? "active" : ""} onClick={() => setCoalesce(true)}>
          Request coalescing
        </button>
      </div>
      <p className={coalesce ? "constraint-ok" : "constraint-fail"}>
        The homepage key expires while {CONCURRENT} requests are in flight: {dbQueries} identical DB quer{dbQueries === 1 ? "y" : "ies"}, slowest
        request waits about {worstMs} ms.
      </p>
      <p className="gate-note">
        {coalesce
          ? "The first miss takes a lock (or a shared in-flight promise) and goes to the DB; the other 199 wait for its result. One query, everyone served in about 51 ms. Refreshing hot keys a little before they expire, with some random jitter on TTLs, avoids the herd too."
          : `All ${CONCURRENT} requests miss at the same moment and all of them query the DB for the same row. The DB runs ${DB_PARALLEL} at a time, so the rest queue up in ${waves} waves. On a real system this spike can take the database down, and then nothing refills the cache.`}
      </p>
    </div>
  );
}

export function Caching() {
  return (
    <div className="tool-widget">
      <CacheAside />
      <Invalidation />
      <Stampede />
    </div>
  );
}
