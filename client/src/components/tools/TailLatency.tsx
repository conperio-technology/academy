import { useMemo, useState } from "react";
import { openLesson } from "../../api";

// Teaching model of tail latency under fan-out, with hedged and tied requests. Every call is a
// short queue wait plus 5 to 15 ms of work; with chance q it also hits a 100 to 1,000 ms
// hiccup, half of them while queued (a busy server) and half during the work (a GC pause).
// A user request fans out to N calls in parallel and waits for all of them. Every call also
// draws a second, independent call up front (the copy a hedge or tie would go to), so all
// policies see the same random numbers and the comparison is fair. Duplicated work raises
// utilization, and queue waits stretch by (1 - u0) / (1 - u), the shape of a simple queue.

const USERS = 4000;
const HICCUP_CHANCES = [0.001, 0.005, 0.01, 0.02, 0.05];
const FAN_OUTS = [1, 5, 10, 20, 50, 100];
const TIE_DELAY = 1; // ms between the two tied sends
const TIE_CANCEL = 0.5; // ms for a cancel message to arrive
const SLOW_MS = 50; // a call or request slower than this hit a hiccup

type Policy = "none" | "hedgeDelay" | "hedgeP95" | "tied" | "double";

const POLICIES: { id: Policy; label: string }[] = [
  { id: "none", label: "No hedging" },
  { id: "hedgeP95", label: "Hedge at the p95" },
  { id: "hedgeDelay", label: "Hedge after a delay you pick" },
  { id: "tied", label: "Tied requests" },
  { id: "double", label: "Always send two" },
];

interface Raw {
  w1: Float32Array; // queue wait, first copy
  s1: Float32Array; // work, first copy
  w2: Float32Array;
  s2: Float32Array;
}

function mulberry(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function draw(q: number, n: number): Raw {
  const rnd = mulberry(1234);
  const size = USERS * n;
  const raw: Raw = { w1: new Float32Array(size), s1: new Float32Array(size), w2: new Float32Array(size), s2: new Float32Array(size) };
  const one = (w: Float32Array, s: Float32Array, i: number) => {
    let wait = rnd() < 0.6 ? 0 : rnd() * 3;
    let work = 5 + rnd() * 10;
    if (rnd() < q) {
      const hiccup = 100 + rnd() * 900;
      if (rnd() < 0.5) wait += hiccup;
      else work += hiccup;
    }
    w[i] = wait;
    s[i] = work;
  };
  for (let i = 0; i < size; i++) {
    one(raw.w1, raw.s1, i);
    one(raw.w2, raw.s2, i);
  }
  return raw;
}

interface Outcome {
  call: number[]; // sorted latencies of one call (the first call of each user request)
  user: number[]; // sorted user request latencies
  extra: number; // extra executed calls per call
  util: number;
}

function run(raw: Raw, n: number, policy: Policy, delay: number, u0: number): Outcome {
  let f = 1;
  let out: Outcome = { call: [], user: [], extra: 0, util: u0 };
  // Duplicated work raises utilization, which stretches waits, which can change how much is
  // duplicated: iterate a few times to settle.
  for (let iter = 0; iter < (policy === "none" ? 1 : 4); iter++) {
    const call: number[] = [];
    const user: number[] = [];
    let extra = 0;
    for (let u = 0; u < USERS; u++) {
      let worst = 0;
      for (let j = 0; j < n; j++) {
        const i = u * n + j;
        const l1 = raw.w1[i] * f + raw.s1[i];
        const l2 = raw.w2[i] * f + raw.s2[i];
        let l = l1;
        if (policy === "hedgeDelay" || policy === "hedgeP95") {
          if (l1 > delay) {
            extra++;
            l = Math.min(l1, delay + l2);
          }
        } else if (policy === "double") {
          extra++;
          l = Math.min(l1, l2);
        } else if (policy === "tied") {
          const start1 = raw.w1[i] * f;
          const start2 = TIE_DELAY + raw.w2[i] * f;
          if (Math.abs(start1 - start2) < TIE_CANCEL) extra++; // both started before the cancel arrived
          l = start1 <= start2 ? start1 + raw.s1[i] : start2 + raw.s2[i];
        }
        if (j === 0) call.push(l);
        if (l > worst) worst = l;
      }
      user.push(worst);
    }
    call.sort((a, b) => a - b);
    user.sort((a, b) => a - b);
    const e = extra / (USERS * n);
    const util = Math.min(0.97, u0 * (1 + e));
    out = { call, user, extra: e, util };
    f = (1 - u0) / (1 - util);
  }
  return out;
}

// Nearest-rank percentile: the smallest value with at least p of the samples at or below it.
function pct(sorted: number[], p: number) {
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1))];
}

const ROWS: { p: number; label: string }[] = [
  { p: 0.5, label: "p50" },
  { p: 0.9, label: "p90" },
  { p: 0.99, label: "p99" },
  { p: 0.999, label: "p99.9" },
];

const fmt = (ms: number) => (ms >= 100 ? `${Math.round(ms)} ms` : `${ms.toFixed(1)} ms`);
const pctText = (x: number) => (x >= 0.1 ? `${(100 * x).toFixed(0)}%` : `${(100 * x).toFixed(1)}%`);
// Bars on a log scale from 5 ms to 2,000 ms so both 10 ms and 1 s are visible.
const barWidth = (ms: number) => `${Math.max(2, Math.min(100, (100 * Math.log(Math.max(ms, 5) / 5)) / Math.log(400)))}%`;

export function TailLatency() {
  const [q, setQ] = useState(0.01);
  const [n, setN] = useState(100);
  const [u0, setU0] = useState(0.5);
  const [policy, setPolicy] = useState<Policy>("hedgeP95");
  const [delay, setDelay] = useState(20);

  const raw = useMemo(() => draw(q, n), [q, n]);
  const base = useMemo(() => run(raw, n, "none", 0, u0), [raw, n, u0]);
  const p95 = pct(base.call, 0.95);
  const effectiveDelay = policy === "hedgeP95" ? p95 : delay;
  const chosen = useMemo(() => run(raw, n, policy, effectiveDelay, u0), [raw, n, policy, effectiveDelay, u0]);

  const theory = 1 - Math.pow(1 - q, n);
  const measured = base.user.filter((x) => x > SLOW_MS).length / base.user.length;
  const measuredAfter = chosen.user.filter((x) => x > SLOW_MS).length / chosen.user.length;
  const p99Before = pct(base.user, 0.99);
  const p99After = pct(chosen.user, 0.99);

  let note: string;
  if (policy === "none") {
    note =
      n === 1
        ? `With no fan-out a user request is one call, so the tail is just the call's own: ${pctText(q)} of requests hit a hiccup. Raise the fan-out.`
        : `Each call is slow only ${pctText(q)} of the time, but a user request waits for all ${n}, so ${pctText(theory)} of user requests are slow. The user's p50 is ${fmt(pct(base.user, 0.5))} while a single call's p50 is ${fmt(pct(base.call, 0.5))}. Pick a hedging policy.`;
  } else if (policy === "double") {
    note = `Sending two copies of every call doubles the work. At ${pctText(u0)} utilization that pushes the servers to ${pctText(chosen.util)}, and queue waits stretch by ${((1 - u0) / (1 - chosen.util)).toFixed(1)}x. ${
      p99After < p99Before ? "Here it still pays off, but only because the servers had spare capacity." : "The extra queueing eats the gain: the p99 got worse."
    } Try raising the utilization.`;
  } else if (policy === "tied") {
    note = `Tied requests cut the queue-wait hiccups (the request runs on whichever server starts it first) while executing only ${pctText(chosen.extra)} extra calls. They can't help with the pauses that happen during the work, which is why some tail remains: compare with hedging.`;
  } else {
    note = `Hedging after ${fmt(effectiveDelay)} sends a second copy for the ${pctText(chosen.extra)} of calls that are still running then, and takes whichever finishes first. The user p99 goes from ${fmt(p99Before)} to ${fmt(p99After)}${
      chosen.extra > 0.2 ? `, but a delay that short duplicates a lot of work: utilization rises to ${pctText(chosen.util)}.` : ` for ${pctText(chosen.extra)} more load.`
    }`;
  }

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Fan-out and hedging</h3>
        <div className="tl-controls">
          <div>
            <span className="tl-label">Chance one call hits a hiccup</span>
            <div className="sql-presets">
              {HICCUP_CHANCES.map((x) => (
                <button key={x} className={x === q ? "active" : ""} onClick={() => setQ(x)}>
                  {pctText(x)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="tl-label">Fan-out: calls per user request</span>
            <div className="sql-presets">
              {FAN_OUTS.map((x) => (
                <button key={x} className={x === n ? "active" : ""} onClick={() => setN(x)}>
                  {x}
                </button>
              ))}
            </div>
          </div>
          <label className="tl-slider">
            Servers already {Math.round(u0 * 100)}% busy
            <input type="range" min={0.2} max={0.9} step={0.05} value={u0} onChange={(e) => setU0(Number(e.target.value))} />
          </label>
        </div>
        <span className="tl-label">Policy</span>
        <div className="sql-presets">
          {POLICIES.map((p) => (
            <button key={p.id} className={p.id === policy ? "active" : ""} onClick={() => setPolicy(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
        {policy === "hedgeDelay" && (
          <label className="tl-slider">
            Send the backup after {delay} ms
            <input type="range" min={2} max={200} step={1} value={delay} onChange={(e) => setDelay(Number(e.target.value))} />
          </label>
        )}

        <div className="tool-readout">
          <div className="readout-cell">
            <span className="readout-label">Slow user requests, theory</span>
            <span className="readout-value">{pctText(theory)}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Measured, no hedging</span>
            <span className="readout-value">{pctText(measured)}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Measured, this policy</span>
            <span className="readout-value">{pctText(measuredAfter)}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Extra calls executed</span>
            <span className="readout-value">{pctText(chosen.extra)}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Utilization</span>
            <span className="readout-value">
              {pctText(u0)} to {pctText(chosen.util)}
            </span>
          </div>
        </div>
        <p className="gate-note">
          Theory: 1 - (1 - {q}){n > 1 ? <sup>{n}</sup> : null} = {pctText(theory)} of user requests include at least one hiccup.
          &quot;Slow&quot; in the readouts means over {SLOW_MS} ms.
        </p>

        <div className="tl-table" role="table" aria-label="Latency percentiles">
          <div className="tl-row tl-head" role="row">
            <span role="columnheader">Percentile</span>
            <span role="columnheader">One call</span>
            <span role="columnheader">User request, no hedging</span>
            <span role="columnheader">User request, {POLICIES.find((p) => p.id === policy)!.label.toLowerCase()}</span>
          </div>
          {ROWS.map((r) => {
            const a = pct(base.call, r.p);
            const b = pct(base.user, r.p);
            const c = pct(chosen.user, r.p);
            return (
              <div className="tl-row" role="row" key={r.label}>
                <span role="cell" className="tl-p">{r.label}</span>
                <span role="cell" className="tl-cell">
                  <span className="tl-bar tl-bar-call" style={{ width: barWidth(a) }} />
                  <span>{fmt(a)}</span>
                </span>
                <span role="cell" className="tl-cell">
                  <span className="tl-bar tl-bar-before" style={{ width: barWidth(b) }} />
                  <span>{fmt(b)}</span>
                </span>
                <span role="cell" className="tl-cell">
                  <span className={c <= b ? "tl-bar tl-bar-after" : "tl-bar tl-bar-worse"} style={{ width: barWidth(c) }} />
                  <span>{fmt(c)}</span>
                </span>
              </div>
            );
          })}
        </div>
        <p className="gate-note">Bars use a log scale from 5 ms to 2 s. One call&apos;s p95 here is {fmt(p95)}.</p>
        <p className={policy === "double" && p99After > p99Before ? "constraint-fail" : "gate-note"}>{note}</p>
        <p className="gate-note">
          {USERS.toLocaleString()} user requests per setting, seeded, so the same settings always give the same numbers. Related:{" "}
          <button className="link-button" onClick={() => openLesson("sd-load-balancing")}>
            Load Balancing
          </button>{" "}
          ·{" "}
          <button className="link-button" onClick={() => openLesson("sd-resilience")}>
            Timeouts, Retries, Circuit Breakers and Load Shedding
          </button>
        </p>
      </div>
    </div>
  );
}
