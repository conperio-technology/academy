import { useEffect, useState } from "react";

// A toy load balancer in front of a few servers. Time moves in 100 ms ticks. Each server
// works on up to 4 requests at once and queues up to 12 more; past that it rejects (503).
// Requests cost 100-300 ms, or 2 s when "heavy". The load balancer picks a server with
// the chosen algorithm. If a server dies, only health checks tell the load balancer.
// All randomness comes from a seeded generator stored in the state, so a reset replays
// exactly the same traffic.

const TICK_MS = 100;
const SLOTS = 4;
const QUEUE_MAX = 12;
const HEALTH_EVERY = 5; // ticks between health checks (500 ms)
const HEAVY_TICKS = 20;
const MAX_SERVERS = 6;

type Algo = "rr" | "random" | "least" | "p2c";

const ALGOS: { id: Algo; label: string }[] = [
  { id: "rr", label: "Round robin" },
  { id: "random", label: "Random" },
  { id: "least", label: "Least connections" },
  { id: "p2c", label: "Power of two choices" },
];

interface Req {
  arrived: number;
  remaining: number;
  heavy: boolean;
}

interface Server {
  up: boolean;
  inPool: boolean; // what the load balancer believes
  active: Req[];
  queue: Req[];
  served: number;
}

interface Sim {
  tick: number;
  seed: number;
  rr: number;
  servers: Server[];
  latencies: number[]; // most recent completions, ms
  shortLatencies: number[]; // the same, for short requests only
  total: number;
  rejected: number; // queue full or no server in the pool
  failed: number; // sent to, or stuck on, a dead server
}

const newServer = (): Server => ({ up: true, inPool: true, active: [], queue: [], served: 0 });

function initial(): Sim {
  return { tick: 0, seed: 42, rr: 0, servers: [0, 1, 2, 3].map(newServer), latencies: [], shortLatencies: [], total: 0, rejected: 0, failed: 0 };
}

const load = (s: Server) => s.active.length + s.queue.length;

function step(sim: Sim, algo: Algo, rate: number, heavy: boolean, healthChecks: boolean): Sim {
  // mulberry32, with its state carried in sim.seed so the step stays pure.
  let seed = sim.seed;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const tick = sim.tick + 1;
  let { rr, total, rejected, failed } = sim;
  const latencies = [...sim.latencies];
  const shortLatencies = [...sim.shortLatencies];

  // Servers do one tick of work; finished requests free a slot for the next queued one.
  const servers = sim.servers.map((s) => {
    const inPool = !healthChecks ? true : tick % HEALTH_EVERY === 0 ? s.up : s.inPool;
    if (!s.up) return { ...s, inPool };
    const active: Req[] = [];
    let served = s.served;
    for (const r of s.active) {
      if (r.remaining <= 1) {
        latencies.push((tick - r.arrived) * TICK_MS);
        if (!r.heavy) shortLatencies.push((tick - r.arrived) * TICK_MS);
        served++;
      } else active.push({ ...r, remaining: r.remaining - 1 });
    }
    const queue = [...s.queue];
    while (active.length < SLOTS && queue.length > 0) active.push(queue.shift()!);
    return { ...s, inPool, active, queue, served };
  });

  // New arrivals for this tick, about rate/10 of them.
  const arrivals = Math.floor((rate / (1000 / TICK_MS)) * (0.5 + rnd()) + rnd());
  for (let i = 0; i < arrivals; i++) {
    total++;
    const isHeavy = heavy && rnd() < 0.1;
    const cost = isHeavy ? HEAVY_TICKS : 1 + Math.floor(rnd() * 3);
    const pool = servers.map((_, idx) => idx).filter((idx) => servers[idx].inPool);
    if (pool.length === 0) {
      rejected++;
      continue;
    }
    let pick: number;
    if (algo === "rr") pick = pool[rr++ % pool.length];
    else if (algo === "random") pick = pool[Math.floor(rnd() * pool.length)];
    else if (algo === "least") pick = pool.reduce((best, idx) => (load(servers[idx]) < load(servers[best]) ? idx : best));
    else {
      const a = pool[Math.floor(rnd() * pool.length)];
      const b = pool[Math.floor(rnd() * pool.length)];
      pick = load(servers[b]) < load(servers[a]) ? b : a;
    }
    const s = servers[pick];
    const req = { arrived: tick, remaining: cost, heavy: isHeavy };
    if (!s.up) failed++; // connection refused or timed out
    else if (s.active.length < SLOTS) s.active.push(req);
    else if (s.queue.length < QUEUE_MAX) s.queue.push(req);
    else rejected++;
  }

  return { tick, seed, rr, servers, latencies: latencies.slice(-400), shortLatencies: shortLatencies.slice(-400), total, rejected, failed };
}

function percentile(values: number[], p: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
}

export function LoadBalancing() {
  const [sim, setSim] = useState(initial);
  const [algo, setAlgo] = useState<Algo>("rr");
  const [rate, setRate] = useState(40);
  const [heavy, setHeavy] = useState(false);
  const [healthChecks, setHealthChecks] = useState(true);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSim((s) => step(s, algo, rate, heavy, healthChecks)), TICK_MS * 2);
    return () => clearInterval(timer);
  }, [running, algo, rate, heavy, healthChecks]);

  // Changing the setup starts the numbers over, so they describe the new setup only.
  const clearStats = () => setSim((s) => ({ ...s, latencies: [], shortLatencies: [], total: 0, rejected: 0, failed: 0 }));
  const chooseAlgo = (a: Algo) => {
    setAlgo(a);
    clearStats();
  };
  const toggleServer = (i: number) =>
    setSim((s) => {
      const target = s.servers[i];
      const lost = target.up ? load(target) : 0;
      const servers = s.servers.map((srv, idx) =>
        idx !== i ? srv : srv.up ? { ...srv, up: false, active: [], queue: [] } : { ...newServer(), inPool: srv.inPool || !healthChecks },
      );
      return { ...s, servers, failed: s.failed + lost };
    });

  const avg = sim.latencies.length ? sim.latencies.reduce((a, b) => a + b, 0) / sim.latencies.length : 0;
  const p95 = percentile(sim.latencies, 0.95);
  const p95Short = percentile(sim.shortLatencies, 0.95);
  const upCount = sim.servers.filter((s) => s.up).length;
  const avgCostSec = heavy ? 0.9 * 0.2 + 0.1 * (HEAVY_TICKS / 10) : 0.2;
  const capacity = Math.round((upCount * SLOTS) / avgCostSec);
  const dead = sim.servers.findIndex((s) => !s.up);
  const deadInPool = dead >= 0 && sim.servers[dead].inPool;

  let note: string;
  if (dead >= 0 && !healthChecks) {
    note =
      `Health checks are off, so the load balancer still believes server ${dead + 1} is fine and keeps sending it requests. Every one of them fails.` +
      (algo === "least"
        ? " Least connections makes it worse: the dead server fails requests instantly, so it always has 0 open connections and looks like the least busy server. It gets nearly everything."
        : " Turn health checks on to fix it.");
  } else if (dead >= 0 && deadInPool) {
    note = `Server ${dead + 1} is down, but the next health check hasn't run yet. Requests sent there in the meantime fail. Real checks run every few seconds, so a crash costs a few seconds of errors.`;
  } else if (dead >= 0) {
    note = `A health check found server ${dead + 1} down and took it out of the pool. The remaining ${upCount} servers absorb its share, about ${capacity} requests/s of capacity left.`;
  } else if (rate > capacity) {
    note = `You're sending ${rate} requests/s but the servers can finish only about ${capacity}/s. Queues fill up, latency climbs to seconds, and then requests are rejected. No algorithm fixes this: add a server.`;
  } else if (heavy && (algo === "rr" || algo === "random")) {
    note = `${algo === "rr" ? "Round robin" : "Random"} spreads requests evenly by count, not by cost. A server that picked up a 2 s request keeps getting its share, so short requests queue behind it. Watch the p95 of short requests: they should take 300 ms at most. Try least connections or power of two choices.`;
  } else if (heavy) {
    note =
      algo === "least"
        ? "Least connections sends each new request to the server with the fewest in flight, so servers stuck on heavy requests get skipped until they catch up. Compare the p95 of short requests with round robin."
        : "Power of two choices samples two servers at random and takes the less busy one. That's almost as good as checking every server, and it scales to load balancers that can't see global state cheaply.";
  } else {
    note = `All requests are cheap and similar, and the servers have spare capacity (about ${capacity}/s), so every algorithm does fine. Turn on heavy requests or raise the rate to see them differ.`;
  }

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Spread requests across servers</h3>
        <div className="sql-presets">
          {ALGOS.map((a) => (
            <button key={a.id} className={a.id === algo ? "active" : ""} onClick={() => chooseAlgo(a.id)}>
              {a.label}
            </button>
          ))}
        </div>
        <div className="darr-actions lb-actions">
          <label className="lb-rate">
            Rate: {rate} requests/s
            <input type="range" min={10} max={160} step={5} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
          </label>
          <label className="tool-checkbox">
            <input type="checkbox" checked={heavy} onChange={(e) => {
                setHeavy(e.target.checked);
                clearStats();
              }} /> Make 1 in 10 requests heavy (2 s)
          </label>
          <label className="tool-checkbox">
            <input type="checkbox" checked={healthChecks} onChange={(e) => setHealthChecks(e.target.checked)} /> Health checks
          </label>
        </div>
        <div className="darr-actions lb-actions">
          <button disabled={sim.servers.length >= MAX_SERVERS} onClick={() => setSim((s) => ({ ...s, servers: [...s.servers, newServer()] }))}>
            Add a server
          </button>
          <button onClick={() => setRunning(!running)}>{running ? "Pause" : "Resume"}</button>
          <button onClick={() => setSim(initial())}>Reset</button>
        </div>

        <div className="lb-servers">
          {sim.servers.map((s, i) => (
            <div key={i} className={s.up ? "lb-server" : "lb-server lb-server-down"}>
              <div className="lb-server-head">
                <strong>Server {i + 1}</strong>
                <button onClick={() => toggleServer(i)}>{s.up ? "Kill" : "Restart"}</button>
              </div>
              <div className="lb-slots">
                {Array.from({ length: SLOTS }, (_, k) => {
                  const r = s.active[k];
                  return <span key={k} className={!r ? "lb-slot" : r.heavy ? "lb-slot lb-slot-heavy" : "lb-slot lb-slot-busy"} />;
                })}
              </div>
              <div className="lb-queue" title={`${s.queue.length} queued`}>
                <div style={{ width: `${(100 * s.queue.length) / QUEUE_MAX}%` }} />
              </div>
              <span className="lb-server-meta">
                {s.up ? `${s.active.length} in flight, ${s.queue.length} queued` : "down"} · {s.served} served
                <br />
                {s.inPool ? "in the LB pool" : "removed by health check"}
              </span>
            </div>
          ))}
        </div>

        <div className="tool-readout">
          <div className="readout-cell">
            <span className="readout-label">Average latency</span>
            <span className="readout-value">{Math.round(avg)} ms</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">p95 latency</span>
            <span className="readout-value">{p95} ms</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">p95, short requests</span>
            <span className="readout-value">{p95Short} ms</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Requests</span>
            <span className="readout-value">{sim.total}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Rejected (503)</span>
            <span className="readout-value">{sim.rejected}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Failed (dead server)</span>
            <span className="readout-value">{sim.failed}</span>
          </div>
        </div>
        <p className={sim.failed > 0 && dead >= 0 && (deadInPool || !healthChecks) ? "constraint-fail" : "gate-note"}>{note}</p>
        <p className="gate-note">
          Each box is a worker slot: green is a short request, amber a heavy one. The bar below is the queue (up to {QUEUE_MAX}). The
          simulation runs at half speed so you can watch it.
        </p>
      </div>
    </div>
  );
}
