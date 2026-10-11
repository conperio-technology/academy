import { useMemo, useState } from "react";

// A hash ring with 200 keys. Every server is hashed onto the ring (once per virtual node),
// every key is hashed onto the same ring, and a key belongs to the first server point
// clockwise from it. Adding or removing a server and comparing owners before and after
// gives the "keys moved" number, next to what plain hash(key) mod N would have moved.

// FNV-1a, 32-bit: tiny, deterministic, good enough to scatter points on a ring.
function fnv1a(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // A final avalanche step: raw FNV of short, similar strings ("S1#1", "S1#2") clusters.
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

const KEY_COUNT = 200;
const KEYS = Array.from({ length: KEY_COUNT }, (_, i) => ({ name: `user:${i}`, pos: fnv1a(`user:${i}`) }));
const COLORS = ["#7dd3a8", "#60a5fa", "#fbbf24", "#f87171", "#c084fc", "#f472b6", "#2dd4bf", "#fb923c", "#a3e635", "#94a3b8"];
const MAX_SERVERS = 10;

interface Point {
  pos: number;
  server: number;
}

function buildRing(servers: number[], vnodes: number): Point[] {
  const pts: Point[] = [];
  for (const s of servers) for (let v = 0; v < vnodes; v++) pts.push({ pos: fnv1a(`S${s}#${v}`), server: s });
  return pts.sort((a, b) => a.pos - b.pos);
}

// Index of the first ring point at or after pos, wrapping to 0 past the top.
function firstPointAfter(ring: Point[], pos: number) {
  let lo = 0;
  let hi = ring.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (ring[mid].pos < pos) lo = mid + 1;
    else hi = mid;
  }
  return lo % ring.length;
}

function owners(servers: number[], vnodes: number) {
  const ring = buildRing(servers, vnodes);
  return KEYS.map((k) => ring[firstPointAfter(ring, k.pos)].server);
}

// Walk clockwise collecting the next `count` distinct servers: the key's replica set.
function replicasFor(ring: Point[], pos: number, count: number) {
  const out: number[] = [];
  for (let i = firstPointAfter(ring, pos), steps = 0; out.length < count && steps < ring.length; i = (i + 1) % ring.length, steps++) {
    if (!out.includes(ring[i].server)) out.push(ring[i].server);
  }
  return out;
}

const modOwners = (servers: number[]) => KEYS.map((k) => servers[k.pos % servers.length]);

interface Change {
  text: string;
  ringMoved: number;
  modMoved: number;
}

const R = 120;
const C = 150;
function xy(pos: number, radius: number) {
  const a = (pos / 4294967296) * 2 * Math.PI - Math.PI / 2; // 0 at the top, clockwise
  return [C + radius * Math.cos(a), C + radius * Math.sin(a)];
}

export function ConsistentHashing() {
  const [servers, setServers] = useState([1, 2, 3, 4]);
  const [vnodes, setVnodes] = useState(1);
  const [change, setChange] = useState<Change | null>(null);
  const [picked, setPicked] = useState(17);

  const ring = useMemo(() => buildRing(servers, vnodes), [servers, vnodes]);
  const own = useMemo(() => owners(servers, vnodes), [servers, vnodes]);

  const apply = (next: number[], text: string) => {
    const before = owners(servers, vnodes);
    const after = owners(next, vnodes);
    const mb = modOwners(servers);
    const ma = modOwners(next);
    setChange({
      text,
      ringMoved: KEYS.filter((_, i) => before[i] !== after[i]).length,
      modMoved: KEYS.filter((_, i) => mb[i] !== ma[i]).length,
    });
    setServers(next);
  };

  const addServer = () => {
    const id = [...Array(MAX_SERVERS)].map((_, i) => i + 1).find((i) => !servers.includes(i));
    if (id !== undefined) apply([...servers, id].sort((a, b) => a - b), `Added S${id}`);
  };
  const removeServer = (s: number) => apply(servers.filter((x) => x !== s), `Removed S${s}`);

  const counts = servers.map((s) => own.filter((o) => o === s).length);
  const ideal = KEY_COUNT / servers.length;
  const stdDev = Math.sqrt(counts.reduce((sum, c) => sum + (c - ideal) ** 2, 0) / servers.length);
  const busiest = Math.max(...counts);
  const pickedKey = KEYS[picked];
  const replicaSet = replicasFor(ring, pickedKey.pos, Math.min(3, servers.length));
  const color = (s: number) => COLORS[(s - 1) % COLORS.length];

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>The ring: {servers.length} servers, {KEY_COUNT} keys</h3>
        <div className="darr-actions ch-actions">
          <button onClick={addServer} disabled={servers.length >= MAX_SERVERS}>Add a server</button>
          <label>
            Virtual nodes per server: <strong>{vnodes}</strong>
            <input type="range" min={1} max={50} value={vnodes} onChange={(e) => { setVnodes(Number(e.target.value)); setChange(null); }} />
          </label>
        </div>

        <div className="ch-layout">
          <svg className="ch-ring" viewBox="0 0 300 300" role="img" aria-label="Hash ring with servers and keys">
            <circle cx={C} cy={C} r={R} className="ch-circle" />
            {KEYS.map((k, i) => {
              const [x, y] = xy(k.pos, R - 12);
              return <circle key={k.name} cx={x} cy={y} r={i === picked ? 5 : 2.6} fill={color(own[i])} className={i === picked ? "ch-picked" : ""} onClick={() => setPicked(i)} />;
            })}
            {ring.map((p, i) => {
              const [x1, y1] = xy(p.pos, R - 4);
              const [x2, y2] = xy(p.pos, R + 8);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color(p.server)} strokeWidth={vnodes > 20 ? 1.5 : 3} />;
            })}
            {vnodes <= 3 &&
              ring.map((p, i) => {
                const [x, y] = xy(p.pos, R + 20);
                return (
                  <text key={`t${i}`} x={x} y={y} className="ch-label" textAnchor="middle" dominantBaseline="middle" fill={color(p.server)}>
                    S{p.server}
                  </text>
                );
              })}
            <text x={C} y={C - 6} textAnchor="middle" className="ch-center">{pickedKey.name}</text>
            <text x={C} y={C + 12} textAnchor="middle" className="ch-center-sub">→ S{own[picked]}</text>
          </svg>

          <div className="ch-side">
            <table className="bigo-table ch-table">
              <thead>
                <tr><th>Server</th><th>Keys</th><th /></tr>
              </thead>
              <tbody>
                {servers.map((s, i) => (
                  <tr key={s}>
                    <td><span className="ch-swatch" style={{ background: color(s) }} /> S{s}</td>
                    <td className="mono">{counts[i]}{counts[i] === busiest && servers.length > 1 ? " (busiest)" : ""}</td>
                    <td><button className="ch-remove" onClick={() => removeServer(s)} disabled={servers.length <= 1}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={stdDev / ideal > 0.35 ? "constraint-fail" : "constraint-ok"}>
              Even share {ideal.toFixed(0)} keys. Standard deviation {stdDev.toFixed(1)} ({((stdDev / ideal) * 100).toFixed(0)}% of even). Busiest
              server holds {((busiest / ideal) * 100).toFixed(0)}% of its share.
            </p>
          </div>
        </div>

        {change && (
          <div className="ch-compare">
            <p className="constraint-ok">
              {change.text}. Consistent hashing: keys moved {change.ringMoved} of {KEY_COUNT} ({((change.ringMoved / KEY_COUNT) * 100).toFixed(0)}%).
            </p>
            <p className="constraint-fail">
              Plain hash mod N for the same change: {change.modMoved} of {KEY_COUNT} ({((change.modMoved / KEY_COUNT) * 100).toFixed(0)}%).
            </p>
          </div>
        )}
        <p className="gate-note">
          {change
            ? change.text.startsWith("Added")
              ? "The new server only takes the keys that fall just before its points on the ring; every other key keeps its owner. With mod N, changing N reshuffles most keys, which for a cache means most lookups miss at once."
              : "Only the removed server's keys move, each to the next server clockwise. Everyone else's keys stay where they are."
            : vnodes === 1
              ? "Each colored tick is a server; each dot is a key, colored by the first server clockwise from it. With one point per server, the gaps between servers are random, so some servers own far more of the ring than others. Raise the virtual nodes."
              : vnodes < 20
                ? `Each server now sits at ${vnodes} places on the ring, so its share is the sum of many small arcs and the random gaps average out. Watch the standard deviation fall as you go higher.`
                : `At ${vnodes} points per server the load is close to even, and when a server leaves, its keys scatter over all the others instead of landing on one neighbor.`}
        </p>
      </div>

      <div className="crypto-section">
        <h3>Replication: walk clockwise to the next 3 distinct servers</h3>
        <div className="darr-actions">
          <button onClick={() => setPicked((picked + 37) % KEY_COUNT)}>Pick another key</button>
        </div>
        <code className="sql-snippet">
          {pickedKey.name} hashes to {pickedKey.pos.toString(16).padStart(8, "0")} → stored on {replicaSet.map((s) => `S${s}`).join(", ")}
        </code>
        <p className="gate-note">
          Systems like Dynamo and Cassandra keep each key on the first server clockwise and copy it to the next distinct servers after
          that. Skipping repeat virtual nodes of the same server matters: three copies on one machine wouldn't survive it failing. You can
          also click any dot on the ring.
        </p>
      </div>
    </div>
  );
}
