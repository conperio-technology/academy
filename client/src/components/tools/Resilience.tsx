import { useMemo, useState } from "react";
import { openLesson } from "../../api";
import {
  BASE_RATE,
  CAPACITY,
  INCIDENT_CAPACITY,
  INCIDENT_FROM,
  INCIDENT_TO,
  simulateRetries,
  type ResilienceOptions,
  type RetryPolicy,
} from "../../resilienceModel";

const POLICIES: { id: RetryPolicy; label: string }[] = [
  { id: "none", label: "No retries" },
  { id: "immediate", label: "Retry immediately" },
  { id: "backoff", label: "Exponential backoff" },
  { id: "jitter", label: "Backoff with full jitter" },
];

const OFF = { budget: false, breaker: false, boundedQueue: false, dropExpired: false };
const PRESETS: { label: string; o: ResilienceOptions }[] = [
  { label: "No retries", o: { policy: "none", ...OFF } },
  { label: "Retry storm", o: { policy: "immediate", ...OFF } },
  { label: "Backoff, no jitter", o: { policy: "backoff", ...OFF } },
  { label: "Backoff with jitter", o: { policy: "jitter", ...OFF } },
  { label: "Jitter + retry budget", o: { policy: "jitter", ...OFF, budget: true } },
  { label: "Circuit breaker", o: { policy: "immediate", ...OFF, breaker: true } },
  { label: "Drop expired work", o: { policy: "immediate", ...OFF, dropExpired: true } },
  { label: "Bounded queue", o: { policy: "immediate", ...OFF, boundedQueue: true } },
  { label: "All of them", o: { policy: "jitter", budget: true, breaker: true, boundedQueue: true, dropExpired: true } },
];

const same = (a: ResilienceOptions, b: ResilienceOptions) =>
  a.policy === b.policy && a.budget === b.budget && a.breaker === b.breaker && a.boundedQueue === b.boundedQueue && a.dropExpired === b.dropExpired;

const W = 600;
const H = 200;
const PAD = { l: 34, r: 8, t: 8, b: 22 };

function StormChart({ r }: { r: ReturnType<typeof simulateRetries> }) {
  const secs = r.seconds;
  const maxY = Math.max(120, Math.ceil(Math.max(...secs.map((s) => s.offered)) / 50) * 50);
  const x = (t: number) => PAD.l + ((W - PAD.l - PAD.r) * t) / secs.length;
  const y = (v: number) => H - PAD.b - ((H - PAD.t - PAD.b) * v) / maxY;
  // Each second is drawn as a step from t to t + 1.
  const steps = (get: (i: number) => number) =>
    secs.map((_, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(get(i)).toFixed(1)} L${x(i + 1).toFixed(1)},${y(get(i)).toFixed(1)}`).join(" ");
  const ticks = [0, maxY / 2, maxY];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="rs-chart" role="img" aria-label="Offered load, goodput and capacity over 40 seconds">
      <rect x={x(INCIDENT_FROM / 10)} y={PAD.t} width={x(INCIDENT_TO / 10) - x(INCIDENT_FROM / 10)} height={H - PAD.t - PAD.b} className="rs-incident" />
      {ticks.map((v) => (
        <g key={v}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className="rs-grid" />
          <text x={PAD.l - 4} y={y(v) + 4} className="rs-axis" textAnchor="end">
            {v}
          </text>
        </g>
      ))}
      {[0, 10, 20, 30, 40].map((t) => (
        <text key={t} x={x(t)} y={H - 6} className="rs-axis" textAnchor={t === 0 ? "start" : t === 40 ? "end" : "middle"}>
          {t}s
        </text>
      ))}
      <path d={steps((i) => secs[i].capacity)} className="rs-capacity" />
      <path d={steps((i) => secs[i].offered)} className="rs-offered" />
      <path d={steps((i) => secs[i].goodput)} className="rs-goodput" />
      {secs.map((s, i) =>
        s.breaker !== "closed" ? <rect key={i} x={x(i)} y={H - PAD.b - 4} width={x(i + 1) - x(i)} height={4} className="rs-breaker" /> : null,
      )}
    </svg>
  );
}

function describe(o: ResilienceOptions, r: ReturnType<typeof simulateRetries>) {
  const parts: string[] = [];
  const amp = r.attempts / r.requests;
  const unprotected = !o.budget && !o.breaker && !o.boundedQueue && !o.dropExpired;
  if (o.policy === "none" && unprotected) {
    parts.push(
      `No retries, and still ${r.recoveredAt === null ? "no" : r.recoveredAt - INCIDENT_TO / 10} seconds before successes return to normal after capacity comes back. During the slowdown the queue filled with requests whose clients timed out, and the service works through them in order: every one of them is wasted work, while fresh requests wait behind them and time out too. The queue drains at only 20 a second (100 capacity minus 80 arriving).`,
    );
  } else if (o.policy !== "none" && !o.budget && !o.dropExpired && !o.boundedQueue && !o.breaker) {
    parts.push(
      `A retry storm. Every timeout becomes another attempt, so clients offer up to ${BASE_RATE * 4} attempts a second (${amp.toFixed(1)} per request on average) to a service that can finish ${CAPACITY}. The queue never drains, every attempt waits longer than its timeout, and goodput stays at zero long after capacity is back: a metastable failure.`,
    );
    if (o.policy !== "immediate")
      parts.push(
        "Backoff and jitter delay the retries but don't reduce how many there are: each failed request still tries four times. Look at the start of the incident: without jitter the extra load arrives in steps, with jitter it is smooth. Part 2 shows where jitter really matters.",
      );
  } else {
    if (o.budget)
      parts.push(
        `The retry budget allows retries worth only 10% of first attempts, so the load can't multiply (${amp.toFixed(2)} attempts per request).${o.dropExpired ? "" : " The queue of stale work still has to drain, which is why recovery takes a while."}`,
      );
    if (o.breaker)
      parts.push(
        "The circuit breaker opened when most recent calls were failing (the red marks on the time axis) and failed requests instantly instead of queueing them. With nothing arriving, the service caught up; trial calls in the half-open state succeeded and it closed again.",
      );
    if (o.dropExpired)
      parts.push(
        "The service skips work whose client already timed out (deadline propagation), so every unit of capacity goes to a request someone is still waiting for. That alone keeps goodput at the full 30 a second during the slowdown and recovers the moment capacity returns.",
      );
    if (o.boundedQueue)
      parts.push(
        "The bounded queue never holds more than half a second of work, so whatever it accepts finishes before the timeout. Everything beyond that is rejected at once with a 503, which costs the service almost nothing.",
      );
    if (o.breaker || o.boundedQueue)
      parts.push(
        "Failing fast is deliberate: some requests that might have succeeded are turned away, so the success rate can be a little lower than with deadline dropping alone, but clients get an answer in milliseconds instead of waiting a second for a timeout, and the service is never buried.",
      );
  }
  return parts;
}

// Part 2: 100 clients whose calls all failed at the same instant retry with exponential
// backoff (100, 200, 400 ms). The service accepts 20 calls per 100 ms; extra calls in a
// bucket are rejected and retried. Seeded, so the jitter is the same every time.
function jitterDemo(jitter: boolean) {
  let s = 5;
  const rnd = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const BUCKETS = 16;
  const PER_BUCKET = 20;
  const attemptsPer = Array<number>(BUCKETS).fill(0);
  const okPer = Array<number>(BUCKETS).fill(0);
  // Every client's first call failed at t = 0, so the first retry (attempt 2) is already scheduled.
  let pending = Array.from({ length: 100 }, () => ({ at: jitter ? 1 + rnd() * 100 : 100, n: 2 }));
  let ok = 0;
  let gaveUp = 0;
  let lastOk = 0;
  while (pending.length) {
    pending.sort((a, b) => a.at - b.at);
    const a = pending.shift()!;
    const b = Math.floor(a.at / 100);
    if (b < BUCKETS) attemptsPer[b]++;
    if (b < BUCKETS && okPer[b] < PER_BUCKET) {
      okPer[b]++;
      ok++;
      lastOk = Math.max(lastOk, a.at);
      continue;
    }
    if (a.n >= 4) {
      gaveUp++;
      continue;
    }
    const max = 100 * 2 ** (a.n - 1);
    const delay = jitter ? 1 + rnd() * max : max;
    pending = [...pending, { at: a.at + delay, n: a.n + 1 }];
  }
  return { attemptsPer, okPer, ok, gaveUp, lastOk, PER_BUCKET };
}

function JitterDemo() {
  const [jitter, setJitter] = useState(false);
  const d = useMemo(() => jitterDemo(jitter), [jitter]);
  const max = Math.max(...d.attemptsPer, d.PER_BUCKET);
  return (
    <div className="crypto-section">
      <h3>Part 2: why jitter matters when failures are synchronized</h3>
      <p className="gate-note">
        A server restart drops 100 clients&apos; calls at the same instant, t = 0. Each retries up to three times with exponential backoff (100,
        200, 400 ms). The service can take 20 calls per 100 ms; extra calls are rejected and retried.
      </p>
      <div className="sql-presets">
        <button className={!jitter ? "active" : ""} onClick={() => setJitter(false)}>
          Backoff, no jitter
        </button>
        <button className={jitter ? "active" : ""} onClick={() => setJitter(true)}>
          Backoff with full jitter
        </button>
      </div>
      <div className="rs-buckets" role="img" aria-label="Calls per 100 ms bucket">
        {d.attemptsPer.map((n, i) => (
          <div key={i} className="rs-bucket">
            <div className="rs-bucket-bars">
              <span className="rs-bucket-rej" style={{ height: `${(100 * (n - d.okPer[i])) / max}%` }} />
              <span className="rs-bucket-ok" style={{ height: `${(100 * d.okPer[i]) / max}%` }} />
              <span className="rs-bucket-cap" style={{ bottom: `${(100 * d.PER_BUCKET) / max}%` }} />
            </div>
            <span className="rs-bucket-label">{i % 2 === 0 ? `${i / 10}s` : ""}</span>
          </div>
        ))}
      </div>
      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">Succeeded</span>
          <span className="readout-value">{d.ok} / 100</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Gave up</span>
          <span className="readout-value">{d.gaveUp}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Last success</span>
          <span className="readout-value">{Math.round(d.lastOk)} ms</span>
        </div>
      </div>
      <p className="gate-note">
        {jitter
          ? "Full jitter picks each wait at random between 0 and the backoff value, so the retries spread over the quiet buckets and nearly everyone gets through, using capacity that was sitting idle."
          : "Without jitter every client waits exactly the same time, so each retry wave lands in a single 100 ms bucket: 20 get in, the rest fail together and come back together. The buckets in between sit idle. Green is accepted, red rejected, the line is capacity."}
      </p>
    </div>
  );
}

function Bulkheads() {
  const [slowMs, setSlowMs] = useState(2000);
  const [bulkhead, setBulkhead] = useState(false);
  const POOL = 20;
  const rateA = 50;
  const latA = 0.05;
  const rateB = 20;
  const latB = slowMs / 1000;
  const needA = rateA * latA;
  const needB = rateB * latB;
  let servedA: number, servedB: number, threadsA: number, threadsB: number;
  if (bulkhead) {
    threadsA = Math.min(needA, POOL / 2);
    threadsB = Math.min(needB, POOL / 2);
  } else if (needA + needB <= POOL) {
    threadsA = needA;
    threadsB = needB;
  } else {
    // Saturated shared pool: threads end up split in proportion to demand (rate x time held).
    threadsA = (POOL * needA) / (needA + needB);
    threadsB = (POOL * needB) / (needA + needB);
  }
  servedA = Math.min(rateA, threadsA / latA);
  servedB = Math.min(rateB, threadsB / latB);
  const aOk = servedA >= rateA - 0.01;
  return (
    <div className="crypto-section">
      <h3>Part 3: bulkheads and Little&apos;s law</h3>
      <p className="gate-note">
        One service calls dependency A (50 calls/s, 50 ms each) and dependency B (20 calls/s). It has {POOL} threads for outgoing calls.
        Threads busy = calls per second x seconds per call.
      </p>
      <label className="tl-slider">
        Dependency B takes {slowMs >= 1000 ? `${slowMs / 1000} s` : `${slowMs} ms`}
        <input type="range" min={50} max={5000} step={50} value={slowMs} onChange={(e) => setSlowMs(Number(e.target.value))} />
      </label>
      <div className="sql-presets">
        <button className={!bulkhead ? "active" : ""} onClick={() => setBulkhead(false)}>
          One shared pool of {POOL}
        </button>
        <button className={bulkhead ? "active" : ""} onClick={() => setBulkhead(true)}>
          Bulkheads: {POOL / 2} for A, {POOL / 2} for B
        </button>
      </div>
      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">Threads A needs</span>
          <span className="readout-value">{needA.toFixed(1)}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Threads B needs</span>
          <span className="readout-value">{needB.toFixed(1)}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">A calls served/s</span>
          <span className="readout-value">{servedA.toFixed(0)} of {rateA}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">B calls served/s</span>
          <span className="readout-value">{servedB.toFixed(0)} of {rateB}</span>
        </div>
      </div>
      <p className={aOk ? "gate-note" : "constraint-fail"}>
        {needA + needB <= POOL
          ? "Both dependencies fit in the pool, so it doesn't matter how it is split. Slow B down."
          : bulkhead
            ? `B wants ${needB.toFixed(0)} threads but its compartment holds ${POOL / 2}, so only ${servedB.toFixed(0)} B calls a second get through and the rest fail fast (or use a fallback). A keeps its own threads and is unaffected: one slow dependency, one degraded feature.`
            : `B's slow calls hold ${threadsB.toFixed(1)} of the ${POOL} threads, leaving A only ${threadsA.toFixed(1)}. A is perfectly healthy, yet only ${servedA.toFixed(0)} of its ${rateA} calls a second get a thread; the rest queue and time out. One slow dependency has taken everything down.`}
      </p>
    </div>
  );
}

export function Resilience() {
  const [o, setO] = useState<ResilienceOptions>(PRESETS[1].o);
  const r = useMemo(() => simulateRetries(o), [o]);
  const set = (patch: Partial<ResilienceOptions>) => setO((prev) => ({ ...prev, ...patch }));
  const notes = describe(o, r);
  const recovery =
    r.recoveredAt === null ? "Not within 40 s" : r.recoveredAt <= INCIDENT_TO / 10 ? "At once" : `${r.recoveredAt - INCIDENT_TO / 10} s after`;

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Part 1: a retry storm</h3>
        <p className="gate-note">
          {BASE_RATE} requests a second against a service that finishes {CAPACITY} a second. From 5 s to 10 s (shaded) it can only finish{" "}
          {INCIDENT_CAPACITY}. Timeout 1 s, up to 4 attempts per request.
        </p>
        <div className="sql-presets">
          {PRESETS.map((p) => (
            <button key={p.label} className={same(p.o, o) ? "active" : ""} onClick={() => setO(p.o)}>
              {p.label}
            </button>
          ))}
        </div>
        <details className="rs-custom">
          <summary>Custom settings</summary>
          <div className="sql-presets">
            {POLICIES.map((p) => (
              <button key={p.id} className={p.id === o.policy ? "active" : ""} onClick={() => set({ policy: p.id })}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="rs-toggles">
            <label className="tool-checkbox">
              <input type="checkbox" checked={o.budget} onChange={(e) => set({ budget: e.target.checked })} /> Retry budget (10%)
            </label>
            <label className="tool-checkbox">
              <input type="checkbox" checked={o.breaker} onChange={(e) => set({ breaker: e.target.checked })} /> Circuit breaker
            </label>
            <label className="tool-checkbox">
              <input type="checkbox" checked={o.dropExpired} onChange={(e) => set({ dropExpired: e.target.checked })} /> Server drops expired work
            </label>
            <label className="tool-checkbox">
              <input type="checkbox" checked={o.boundedQueue} onChange={(e) => set({ boundedQueue: e.target.checked })} /> Bounded queue (shed load)
            </label>
          </div>
        </details>

        <div className="rs-chart-wrap">
          <StormChart r={r} />
          <div className="rs-legend">
            <span><i className="rs-key rs-key-offered" /> attempts offered/s</span>
            <span><i className="rs-key rs-key-goodput" /> successful requests/s</span>
            <span><i className="rs-key rs-key-capacity" /> capacity</span>
            {o.breaker && <span><i className="rs-key rs-key-breaker" /> breaker open</span>}
          </div>
        </div>

        <div className="tool-readout">
          <div className="readout-cell">
            <span className="readout-label">Requests that succeeded</span>
            <span className="readout-value">{((100 * r.succeeded) / r.requests).toFixed(1)}%</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Attempts per request</span>
            <span className="readout-value">{(r.attempts / r.requests).toFixed(2)}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Wasted work</span>
            <span className="readout-value">{r.wasted}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Failed fast</span>
            <span className="readout-value">{r.rejectedFast}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Recovered</span>
            <span className="readout-value">{recovery}</span>
          </div>
        </div>
        {notes.map((n, i) => (
          <p key={i} className={r.recoveredAt === null && i === 0 ? "constraint-fail" : "gate-note"}>
            {n}
          </p>
        ))}
        <p className="gate-note">
          Wasted work counts attempts the service processed after the client had already given up. Recovered means goodput back to 90% of
          demand for 3 seconds in a row after capacity returns at 10 s.
        </p>
      </div>
      <JitterDemo />
      <Bulkheads />
      <p className="gate-note">
        Related:{" "}
        <button className="link-button" onClick={() => openLesson("sd-rate-limiting")}>
          Rate Limiting
        </button>{" "}
        ·{" "}
        <button className="link-button" onClick={() => openLesson("sd-message-queues")}>
          Message Queues
        </button>{" "}
        ·{" "}
        <button className="link-button" onClick={() => openLesson("sd-tail-latency")}>
          Tail Latency and Request Hedging
        </button>
      </p>
    </div>
  );
}
