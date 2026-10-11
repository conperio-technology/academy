import { useState } from "react";
import { openLesson } from "../../api";

// ---- Part 1: error budget and burn rate ----

const SLOS = [99, 99.5, 99.9, 99.95, 99.99, 99.999];
const WINDOWS = [7, 28, 30];
// Google SRE Workbook multiwindow alerts, defined for a 30-day window.
const ALERTS = [
  { burn: 14.4, window: "1 hour", budget: 2, action: "Page" },
  { burn: 6, window: "6 hours", budget: 5, action: "Page" },
  { burn: 1, window: "3 days", budget: 10, action: "Ticket" },
];

function fmtMinutes(min: number) {
  if (min >= 1440) return `${(min / 1440).toFixed(1)} days`;
  if (min >= 60) return `${(min / 60).toFixed(1)} hours`;
  if (min >= 1) return `${min.toFixed(1)} minutes`;
  return `${(min * 60).toFixed(0)} seconds`;
}

function ErrorBudget() {
  const [slo, setSlo] = useState(99.9);
  const [days, setDays] = useState(30);
  const [perDay, setPerDay] = useState(10_000_000);
  const [errPct, setErrPct] = useState(0.5);
  const budget = 1 - slo / 100;
  const windowMin = days * 24 * 60;
  const allowedMin = windowMin * budget;
  const allowedFailures = perDay * days * budget;
  const burn = budget > 0 ? errPct / 100 / budget : 0;
  const exhaustMin = burn > 0 ? windowMin / burn : Infinity;
  const alert = days === 30 ? ALERTS.find((a) => burn >= a.burn) : undefined;

  return (
    <div className="crypto-section">
      <h3>Part 1: error budget and burn rate</h3>
      <div className="cdn-row">
        <span className="cdn-row-label">SLO</span>
        <div className="sql-presets">
          {SLOS.map((s) => (
            <button key={s} className={s === slo ? "active" : ""} onClick={() => setSlo(s)}>
              {s}%
            </button>
          ))}
        </div>
      </div>
      <div className="cdn-row">
        <span className="cdn-row-label">Window</span>
        <div className="sql-presets">
          {WINDOWS.map((d) => (
            <button key={d} className={d === days ? "active" : ""} onClick={() => setDays(d)}>
              {d} days
            </button>
          ))}
        </div>
      </div>
      <div className="tool-inputs">
        <label>
          Requests per day
          <input type="number" min={1000} step={1000} value={perDay} onChange={(e) => setPerDay(Math.max(0, Number(e.target.value) || 0))} />
        </label>
        <label>
          Current error rate (%)
          <input type="number" min={0} max={100} step={0.01} value={errPct} onChange={(e) => setErrPct(Math.min(100, Math.max(0, Number(e.target.value) || 0)))} />
        </label>
      </div>
      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">Error budget</span>
          <span className="readout-value">{(100 * budget).toPrecision(2)}%</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">As downtime per window</span>
          <span className="readout-value">{fmtMinutes(allowedMin)}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Failed requests allowed</span>
          <span className="readout-value">{Math.round(allowedFailures).toLocaleString()}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Burn rate</span>
          <span className="readout-value">{burn.toFixed(burn < 10 ? 2 : 1)}x</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Budget gone in</span>
          <span className="readout-value">{Number.isFinite(exhaustMin) ? fmtMinutes(exhaustMin) : "never"}</span>
        </div>
      </div>
      <p className="gate-note">
        Arithmetic: budget = 100% - {slo}% = {(100 * budget).toPrecision(2)}%. Window = {days} x 24 x 60 = {windowMin.toLocaleString()} minutes, so{" "}
        {fmtMinutes(allowedMin)} of full downtime. Burn rate = error rate / budget = {errPct}% / {(100 * budget).toPrecision(2)}% ={" "}
        {burn.toFixed(2)}. At that rate the whole budget lasts {days} / {burn.toFixed(2)} days.
      </p>
      <div className="ob-alerts">
        {ALERTS.map((a) => (
          <div key={a.burn} className={alert === a ? "ob-alert ob-alert-on" : "ob-alert"}>
            <strong>
              {a.action}: burn rate {a.burn} over {a.window}
            </strong>
            <span className="cache-small">
              spends {a.budget}% of a 30-day budget in {a.window}
            </span>
          </div>
        ))}
      </div>
      <p className={alert?.action === "Page" ? "constraint-fail" : "gate-note"}>
        {days !== 30
          ? "The SRE Workbook thresholds shown are for a 30-day window; for other windows, scale them so each alert still means the same share of budget."
          : alert
            ? `${alert.action === "Page" ? "This pages someone" : "This opens a ticket"} if it lasts ${alert.window} (and is still happening over a short confirmation window): at burn rate ${burn.toFixed(1)} the budget is gone in ${fmtMinutes(exhaustMin)}.`
            : burn > 0
              ? "Below every alert threshold: you are spending the budget no faster than the window allows. No one needs waking up."
              : "No errors, no burn."}
      </p>
    </div>
  );
}

// ---- Part 2: read a trace ----

interface Span {
  name: string;
  service: string;
  start: number; // ms from the start of the trace
  ms: number;
  depth: number;
  error?: boolean;
  culprit?: boolean;
}

interface TraceCase {
  title: string;
  symptom: string;
  spans: Span[];
  answer: string;
}

const n1Queries: Span[] = Array.from({ length: 15 }, (_, i) => ({
  name: "SELECT * FROM order_items WHERE order_id = ?",
  service: "orders-db",
  start: 30 + i * 46,
  ms: 44,
  depth: 2,
  culprit: true,
}));

const TRACES: TraceCase[] = [
  {
    title: "GET /orders is slow",
    symptom: "The p99 of GET /orders went from 150 ms to 800 ms after a release. CPU and database load look normal.",
    spans: [
      { name: "GET /orders", service: "gateway", start: 0, ms: 760, depth: 0 },
      { name: "OrdersController.List", service: "orders", start: 8, ms: 745, depth: 1 },
      { name: "SELECT * FROM orders WHERE user_id = ?", service: "orders-db", start: 12, ms: 16, depth: 2 },
      ...n1Queries,
    ],
    answer:
      "The 15 identical queries, one after another. The new code loads the orders and then runs one query per order for its items: the N+1 query problem. No single query is slow, which is why the database dashboards look fine; the time is in the number of round trips. Fix it with one query that joins or uses WHERE order_id IN (...).",
  },
  {
    title: "Product pages are slow",
    symptom: "Product page p99 is 1.9 s. Every service's own dashboard shows normal CPU.",
    spans: [
      { name: "GET /product/42", service: "gateway", start: 0, ms: 1900, depth: 0 },
      { name: "auth.Verify", service: "auth", start: 5, ms: 12, depth: 1 },
      { name: "product.Get", service: "catalog", start: 20, ms: 40, depth: 1 },
      { name: "pricing.Quote", service: "pricing", start: 20, ms: 35, depth: 1 },
      { name: "recs.ForProduct", service: "recommendations", start: 62, ms: 1820, depth: 1 },
      { name: "featurestore.GET user:9/embeddings", service: "feature-store", start: 70, ms: 1790, depth: 2, culprit: true },
      { name: "reviews.Top", service: "reviews", start: 62, ms: 30, depth: 1 },
    ],
    answer:
      "Follow the critical path down: the request waits on recommendations, and recommendations spends almost all of its time waiting on the feature store. Its own CPU is idle while it waits, which is why no dashboard looked busy. Look at the feature store first, and give the recommendations call a timeout and a fallback so one slow dependency can't hold the page for 1.8 seconds.",
  },
  {
    title: "Checkout returns 502",
    symptom: "1% of checkouts fail with 502 Bad Gateway after about 3 seconds.",
    spans: [
      { name: "POST /checkout", service: "gateway", start: 0, ms: 3120, depth: 0, error: true },
      { name: "CheckoutService.Place", service: "checkout", start: 6, ms: 3105, depth: 1, error: true },
      { name: "INSERT INTO orders", service: "orders-db", start: 10, ms: 9, depth: 2 },
      { name: "payments.Charge (attempt 1)", service: "payments", start: 22, ms: 1000, depth: 2, error: true, culprit: true },
      { name: "payments.Charge (attempt 2)", service: "payments", start: 1050, ms: 1000, depth: 2, error: true, culprit: true },
      { name: "payments.Charge (attempt 3)", service: "payments", start: 2080, ms: 1000, depth: 2, error: true, culprit: true },
    ],
    answer:
      "The three payment calls, each cut off by a 1-second timeout, retried back to back with no backoff. The payment provider is slow for some requests, and the retries tripled the wait before the gateway gave up. Two questions to ask next: did any of those timed-out charges actually succeed (do the retries carry an idempotency key?), and should checkout wait for the charge at all, or accept the order and confirm payment asynchronously?",
  },
];

function TraceView() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const tc = TRACES[idx];
  const total = Math.max(...tc.spans.map((s) => s.start + s.ms));
  const pick = picked !== null ? tc.spans[picked] : null;
  return (
    <div className="crypto-section">
      <h3>Part 2: find the problem in the trace</h3>
      <div className="sql-presets">
        {TRACES.map((t, i) => (
          <button
            key={t.title}
            className={i === idx ? "active" : ""}
            onClick={() => {
              setIdx(i);
              setPicked(null);
            }}
          >
            {t.title}
          </button>
        ))}
      </div>
      <p className="gate-note">{tc.symptom} Click the span you would investigate first.</p>
      <div className="ob-trace" role="list">
        {tc.spans.map((s, i) => (
          <button
            key={i}
            role="listitem"
            className={`ob-span${picked === i ? (s.culprit ? " ob-span-right" : " ob-span-wrong") : ""}`}
            onClick={() => setPicked(i)}
          >
            <span className="ob-span-name" style={{ paddingLeft: `${s.depth * 12}px` }}>
              <span className="ob-span-service">{s.service}</span> {s.name}
            </span>
            <span className="ob-span-track">
              <span
                className={s.error ? "ob-span-bar ob-span-bar-error" : "ob-span-bar"}
                style={{ left: `${(100 * s.start) / total}%`, width: `${Math.max(0.6, (100 * s.ms) / total)}%` }}
              />
            </span>
            <span className="ob-span-ms">{s.ms} ms</span>
          </button>
        ))}
      </div>
      {pick && (
        <p className={pick.culprit ? "gate-note" : "constraint-fail"}>
          {pick.culprit
            ? tc.answer
            : pick.depth === 0
              ? "That is the whole request; it tells you the symptom, not the cause. Look at where its time goes."
              : "Not this one: it is quick, or it is only slow because something beneath it is. Follow the longest bars down to the deepest span that accounts for the time."}
        </p>
      )}
    </div>
  );
}

// ---- Part 3: RED or USE ----

const CATEGORIES = ["Rate", "Errors (RED)", "Duration", "Utilization", "Saturation", "Errors (USE)"] as const;
type Category = (typeof CATEGORIES)[number];

const METRICS: { metric: string; answer: Category; why: string }[] = [
  { metric: "HTTP requests per second to /checkout", answer: "Rate", why: "Traffic a request-serving endpoint handles: RED's R." },
  { metric: "p99 latency of /search", answer: "Duration", why: "How long requests take, as a distribution: RED's D." },
  { metric: "Share of API responses with a 5xx status", answer: "Errors (RED)", why: "Failed requests for a service: RED's E." },
  { metric: "CPU busy % on the database host", answer: "Utilization", why: "How much of a resource's time it is busy: USE's U." },
  { metric: "Threads waiting for a connection from the pool", answer: "Saturation", why: "Work queued because a resource is full: USE's S, often the first sign of trouble." },
  { metric: "Disk I/O errors reported by the kernel", answer: "Errors (USE)", why: "Errors from a resource rather than a request: USE's E." },
  { metric: "Run queue length (threads waiting for a CPU)", answer: "Saturation", why: "Waiting for a full CPU: saturation, even when utilization looks merely high." },
  { metric: "Messages processed per second by the billing consumer", answer: "Rate", why: "A queue consumer is a request-driven service too; its throughput is RED's R." },
  { metric: "Network link bandwidth used, % of link speed", answer: "Utilization", why: "A resource's capacity in use: USE's U." },
  { metric: "Time from enqueue to processed, p95", answer: "Duration", why: "Latency of the work, end to end: RED's D for an asynchronous service." },
];

function RedUse() {
  const [answers, setAnswers] = useState<Record<number, Category>>({});
  const score = Object.entries(answers).filter(([i, a]) => METRICS[Number(i)].answer === a).length;
  return (
    <div className="crypto-section">
      <h3>Part 3: RED or USE?</h3>
      <p className="gate-note">
        RED (rate, errors, duration) is for services that handle requests; USE (utilization, saturation, errors) is for resources. Pick the
        letter each metric belongs to.
      </p>
      <div className="ob-quiz">
        {METRICS.map((m, i) => {
          const a = answers[i];
          return (
            <div key={m.metric} className="ob-q">
              <strong>{m.metric}</strong>
              <div className="sql-presets">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    className={a === c ? (c === m.answer ? "active" : "ai-wrong") : ""}
                    onClick={() => setAnswers((prev) => ({ ...prev, [i]: c }))}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {a && <span className={a === m.answer ? "cache-small" : "constraint-fail"}>{a === m.answer ? m.why : `Not quite. ${m.why}`}</span>}
            </div>
          );
        })}
      </div>
      <p className="gate-note">
        {score} of {Object.keys(answers).length} answered correctly ({METRICS.length} metrics).{" "}
        {Object.keys(answers).length > 0 && (
          <button className="link-button" onClick={() => setAnswers({})}>
            Start over
          </button>
        )}
      </p>
    </div>
  );
}

export function Observability() {
  return (
    <div className="tool-widget">
      <ErrorBudget />
      <TraceView />
      <RedUse />
      <p className="gate-note">
        Related:{" "}
        <button className="link-button" onClick={() => openLesson("sd-tail-latency")}>
          Tail Latency and Request Hedging
        </button>{" "}
        ·{" "}
        <button className="link-button" onClick={() => openLesson("sd-scale-lab")}>
          Scale It Yourself
        </button>
      </p>
    </div>
  );
}
