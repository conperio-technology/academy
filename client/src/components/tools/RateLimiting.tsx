import { useEffect, useState } from "react";

// Four rate-limiting algorithms judging the same list of request timestamps, all with the
// same limit: 10 requests per 10 seconds. Each algorithm is a small pure function from
// timestamps to allowed/rejected, so the timeline is fully deterministic. "Live" mode
// runs a clock and lets you send requests yourself.

const LIMIT = 10;
const WINDOW = 10; // seconds
const REFILL = LIMIT / WINDOW; // token bucket: 1 token per second, bucket holds 10

type AlgoId = "fixed" | "log" | "counter" | "bucket";

const ALGOS: { id: AlgoId; name: string; how: string }[] = [
  { id: "fixed", name: "Fixed window counter", how: "One counter per clock window (0-10 s, 10-20 s...). Reset at each boundary." },
  { id: "log", name: "Sliding window log", how: "Keep the timestamp of every allowed request; allow if fewer than 10 in the last 10 s." },
  { id: "counter", name: "Sliding window counter", how: "Current window's count plus the previous window's count, weighted by how much of it still overlaps." },
  { id: "bucket", name: "Token bucket", how: "A bucket of 10 tokens refills at 1 per second. Each request takes a token, or is rejected." },
];

function decide(algo: AlgoId, times: number[]): boolean[] {
  const out: boolean[] = [];
  const windows = new Map<number, number>(); // fixed window index -> allowed count
  const log: number[] = [];
  let tokens = LIMIT;
  let last = 0;
  for (const t of times) {
    let ok: boolean;
    const w = Math.floor(t / WINDOW);
    if (algo === "fixed") {
      ok = (windows.get(w) ?? 0) < LIMIT;
    } else if (algo === "log") {
      while (log.length && log[0] <= t - WINDOW) log.shift();
      ok = log.length < LIMIT;
    } else if (algo === "counter") {
      const overlap = 1 - (t - w * WINDOW) / WINDOW;
      ok = (windows.get(w - 1) ?? 0) * overlap + (windows.get(w) ?? 0) < LIMIT;
    } else {
      tokens = Math.min(LIMIT, tokens + (t - last) * REFILL);
      last = t;
      ok = tokens >= 1;
      if (ok) tokens -= 1;
    }
    if (ok) {
      windows.set(w, (windows.get(w) ?? 0) + 1);
      log.push(t);
    }
    out.push(ok);
  }
  return out;
}

// The most requests an algorithm let through in any 10-second span.
function worstSpan(times: number[], allowed: boolean[]) {
  const ok = times.filter((_, i) => allowed[i]);
  let best = 0;
  for (let i = 0, j = 0; i < ok.length; i++) {
    while (ok[i] - ok[j] >= WINDOW) j++;
    best = Math.max(best, i - j + 1);
  }
  return best;
}

type Pattern = "steady" | "boundary" | "abuse" | "live";

const range = (n: number, f: (i: number) => number) => Array.from({ length: n }, (_, i) => Number(f(i).toFixed(2)));

const PATTERNS: { id: Pattern; label: string; times: number[]; view: [number, number] }[] = [
  { id: "steady", label: "Steady (1 every 1.2 s)", times: range(25, (i) => 0.5 + i * 1.2), view: [0, 30] },
  { id: "boundary", label: "Burst at a window boundary", times: [...range(10, (i) => 9 + i * 0.09), ...range(10, (i) => 10.02 + i * 0.09)], view: [5, 15] },
  { id: "abuse", label: "Sustained abuse (3 per second)", times: range(75, (i) => 0.2 + i / 3), view: [0, 25] },
  { id: "live", label: "Live: send your own", times: [], view: [0, 30] },
];

const NOTES: Record<Pattern, string> = {
  steady:
    "Traffic under the limit: every algorithm allows every request. That's the point -- a rate limiter should be invisible to normal users.",
  boundary:
    "Ten requests just before 10 s and ten just after. The fixed window sees two separate windows with 10 each and allows all 20 within about 2 seconds, twice the limit. The sliding window log looks back a full 10 seconds and rejects the whole second burst; the sliding window counter, an approximation, lets one extra through. The token bucket was emptied by the first burst and has refilled only about one token.",
  abuse:
    "A client sending 3 requests per second, three times the limit. Every algorithm caps it near 1 per second over time. The fixed window allows 10 at the start of each window and then nothing until the boundary. The token bucket allows an initial burst of 10 and then 1 per second as tokens refill, so its first 10 seconds hold 19: a token bucket deliberately permits a burst of its capacity on top of the steady rate.",
  live: "The clock is running. Click to send requests and watch each algorithm decide. Try sending 10 quickly just before a dashed boundary and 10 just after.",
};

export function RateLimiting() {
  const [pattern, setPattern] = useState<Pattern>("boundary");
  const [liveTimes, setLiveTimes] = useState<number[]>([]);
  const [start, setStart] = useState(0);
  const [now, setNow] = useState(0);

  // In live mode a clock ticks every 100 ms; the timeline scrolls once it passes 30 s.
  useEffect(() => {
    if (pattern !== "live") return;
    const timer = setInterval(() => setNow((Date.now() - start) / 1000), 100);
    return () => clearInterval(timer);
  }, [pattern, start]);

  const goLive = () => {
    setPattern("live");
    setLiveTimes([]);
    setStart(Date.now());
    setNow(0);
  };
  const send = (n: number) => {
    const t = (Date.now() - start) / 1000;
    setLiveTimes((ts) => [...ts, ...range(n, (i) => t + i * 0.05)]);
  };

  const preset = PATTERNS.find((p) => p.id === pattern)!;
  const times = pattern === "live" ? liveTimes : preset.times;
  const [v0, v1] = pattern === "live" ? [Math.max(0, now - 30), Math.max(30, now)] : preset.view;
  const x = (t: number) => ((t - v0) / (v1 - v0)) * 600;
  const boundaries = range(Math.floor(v1 / WINDOW) + 1, (i) => i * WINDOW).filter((b) => b >= v0 && b <= v1);

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Same traffic, four algorithms, limit 10 requests per 10 seconds</h3>
        <div className="sql-presets">
          {PATTERNS.map((p) => (
            <button key={p.id} className={p.id === pattern ? "active" : ""} onClick={() => (p.id === "live" ? goLive() : setPattern(p.id))}>
              {p.label}
            </button>
          ))}
        </div>
        {pattern === "live" && (
          <div className="darr-actions rl-actions">
            <button onClick={() => send(1)}>Send request</button>
            <button onClick={() => send(5)}>Send 5 at once</button>
            <button onClick={goLive}>Restart clock</button>
            <span className="mono">t = {now.toFixed(1)} s</span>
          </div>
        )}
        <p className="gate-note">{NOTES[pattern]}</p>

        {ALGOS.map((a) => {
          const allowed = decide(a.id, times);
          const ok = allowed.filter(Boolean).length;
          const worst = worstSpan(times, allowed);
          return (
            <div key={a.id} className="rl-row">
              <div className="rl-head">
                <strong>{a.name}</strong>
                <span>
                  <span className="constraint-ok">{ok} allowed</span> · <span className="constraint-fail">{times.length - ok} rejected</span> ·{" "}
                  <span className={worst > LIMIT ? "rl-over" : ""}>most in any 10 s: {worst}</span>
                </span>
              </div>
              <svg className="rl-timeline" viewBox="0 0 600 34" preserveAspectRatio="none">
                <line x1={0} y1={17} x2={600} y2={17} className="rl-axis" />
                {boundaries.map((b) => (
                  <line key={b} x1={x(b)} y1={0} x2={x(b)} y2={34} className="rl-boundary" />
                ))}
                {times.map((t, i) =>
                  t < v0 || t > v1 ? null : (
                    <rect key={i} x={x(t) - 1.5} y={allowed[i] ? 4 : 19} width={3} height={11} className={allowed[i] ? "rl-ok" : "rl-no"} />
                  ),
                )}
              </svg>
              <span className="rl-how">{a.how}</span>
            </div>
          );
        })}
        <div className="rl-scale">
          <span>{v0.toFixed(0)} s</span>
          <span>top row: allowed, bottom row: rejected, dashed lines: fixed window boundaries</span>
          <span>{v1.toFixed(0)} s</span>
        </div>
        {pattern === "boundary" && (
          <p className="constraint-fail">
            The fixed window let {worstSpan(times, decide("fixed", times))} requests through in about 2 seconds. That's the boundary problem: up to
            2 x the limit across one boundary.
          </p>
        )}
      </div>
    </div>
  );
}
