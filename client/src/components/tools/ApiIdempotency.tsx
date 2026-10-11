import { useState } from "react";
import { LessonLink } from "./netSecShared";

// A small discrete-event simulation of POST /charges. The client times out after 2 s and
// retries up to 3 times (backoff 0.2, 0.4, 0.8 s); the server takes 0.3 s per charge (3 s when "slow").
// Faults hit only the first attempt. No randomness: each setting gives the same run every time.

type Fault = "none" | "requestLost" | "responseLost" | "slow" | "doubleTap" | "differentBody";
type KeyMode = "none" | "perAttempt" | "perOperation";
type ServerMode = "checkThenRecord" | "claimFirst";

const FAULTS: { id: Fault; label: string }[] = [
  { id: "none", label: "Nothing goes wrong" },
  { id: "requestLost", label: "Request lost on the way in" },
  { id: "responseLost", label: "Response lost after the charge" },
  { id: "slow", label: "Server slow (3 s): retry overlaps" },
  { id: "doubleTap", label: "User taps Pay twice" },
  { id: "differentBody", label: "Retry sends $45 by mistake" },
];

const TIMEOUT = 2;
const BACKOFF = [0.2, 0.4, 0.8];

interface Attempt {
  n: number;
  key: string | null;
  amount: number;
  sentAt: number;
  label: string;
}

interface Row {
  key: string;
  hash: string;
  status: "in progress" | "completed";
  response: string;
}

interface Ev {
  t: number;
  text: string;
  kind: "ok" | "dup" | "info" | "skip" | "lost";
}

interface Outcome {
  events: Ev[];
  rows: Row[];
  charges: { attempt: number; amount: number }[];
  clientResult: string;
}

function simulate(fault: Fault, keyMode: KeyMode, serverMode: ServerMode, retries: boolean): Outcome {
  const events: Ev[] = [];
  const rows = new Map<string, Row>();
  const charges: { attempt: number; amount: number }[] = [];
  let clientResult = "";
  let done = false;
  let retriesLeft = retries ? 3 : 0;
  let attemptNo = 0;

  // Pending timed actions, processed in time order.
  type Action = { t: number; seq: number; run: () => void };
  const queue: Action[] = [];
  let seq = 0;
  const at = (t: number, run: () => void) => queue.push({ t, seq: seq++, run });
  const log = (t: number, text: string, kind: Ev["kind"] = "info") => events.push({ t, text, kind });

  const keyFor = (n: number) => (keyMode === "none" ? null : keyMode === "perAttempt" ? `k-${n}` : "k-7f3a");

  function send(t: number, amount: number, label: string) {
    attemptNo++;
    const a: Attempt = { n: attemptNo, key: keyFor(attemptNo), amount, sentAt: t, label };
    log(t, `${label}: POST /charges $${amount}${a.key ? `, Idempotency-Key: ${a.key}` : ", no key"}`);
    const lost = a.n === 1 && fault === "requestLost";
    if (lost) log(t + 0.05, `Attempt ${a.n} lost on the network; the server never sees it`, "lost");
    else at(t + 0.05, () => arrive(a));
    // The client's own timer for this attempt.
    at(t + TIMEOUT, () => {
      if (done || answered.has(a.n)) return;
      log(t + TIMEOUT, `Attempt ${a.n}: no answer after ${TIMEOUT} s, client gives up on it`);
      retry(t + TIMEOUT);
    });
  }

  const answered = new Set<number>();
  let nextBackoff = 0;
  function retry(t: number) {
    if (done) return;
    if (retriesLeft <= 0) {
      done = true;
      clientResult = "Client shows \"Something went wrong\". It doesn't know whether the customer paid.";
      log(t, "No retries left: the client reports an unknown result", "lost");
      return;
    }
    retriesLeft--;
    const wait = BACKOFF[nextBackoff++] ?? 1;
    const amount = fault === "differentBody" ? 45 : 40;
    at(t + wait, () => {
      if (!done) send(t + wait, amount, `Retry after ${wait} s`);
    });
  }

  function respond(a: Attempt, t: number, status: string, kind: Ev["kind"] = "ok") {
    if (a.n === 1 && (fault === "responseLost" || fault === "differentBody") && status.startsWith("201")) {
      log(t, `Server sends ${status} for attempt ${a.n}, but the response is lost`, "lost");
      return;
    }
    at(t + 0.05, () => {
      answered.add(a.n);
      if (done) {
        log(t + 0.05, `Attempt ${a.n} answers ${status}, but the client already moved on`, "info");
        return;
      }
      if (status.startsWith("409")) {
        log(t + 0.05, `Client gets ${status}`, "skip");
        retry(t + 0.05);
        return;
      }
      done = true;
      clientResult = `Client gets ${status}`;
      log(t + 0.05, `Client gets ${status}: done`, kind);
    });
  }

  function arrive(a: Attempt) {
    const t = a.sentAt + 0.05;
    const hash = `$${a.amount}`;
    const proc = a.n === 1 && fault === "slow" ? 3 : 0.3;
    if (a.key) {
      const row = rows.get(a.key);
      if (row && serverMode === "claimFirst" && row.status === "in progress") {
        log(t, `Server: key ${a.key} is in progress, refuses to start a second charge`, "skip");
        return respond(a, t, "409 Conflict (still processing)", "skip");
      }
      if (row && row.status === "completed") {
        if (row.hash !== hash) {
          log(t, `Server: key ${a.key} was used for ${row.hash}, this request is ${hash}`, "skip");
          return respond(a, t, "422 key reused with different parameters", "skip");
        }
        log(t, `Server: key ${a.key} already completed, replays the stored response`, "skip");
        return respond(a, t, row.response);
      }
      if (serverMode === "claimFirst") {
        rows.set(a.key, { key: a.key, hash, status: "in progress", response: "" });
        log(t, `Server: INSERT key ${a.key} (in progress), unique constraint holds`);
      } else {
        log(t, `Server: looks up key ${a.key}, not found, starts work`);
      }
    }
    at(t + proc * 0.9, () => {
      charges.push({ attempt: a.n, amount: a.amount });
      log(t + proc * 0.9, `Card charged $${a.amount} (attempt ${a.n})`, charges.length > 1 ? "dup" : "ok");
    });
    at(t + proc, () => {
      const response = `201 Created, charge ch_${100 + a.n}`;
      if (a.key) {
        const existing = rows.get(a.key);
        if (serverMode === "checkThenRecord" && existing?.status === "completed")
          log(t + proc, `Server: records key ${a.key} again, overwriting the first record`, "dup");
        rows.set(a.key, { key: a.key, hash, status: "completed", response });
      }
      respond(a, t + proc, response);
    });
  }

  send(0, 40, "Tap Pay");
  if (fault === "doubleTap") at(0.15, () => send(0.15, 40, "Second tap"));

  // Run the queue.
  for (let guard = 0; queue.length > 0 && guard < 200; guard++) {
    queue.sort((x, y) => x.t - y.t || x.seq - y.seq);
    queue.shift()!.run();
  }
  if (!clientResult) clientResult = "No answer";
  events.sort((x, y) => x.t - y.t);
  return { events, rows: [...rows.values()], charges, clientResult };
}

export function ApiIdempotency() {
  const [fault, setFault] = useState<Fault>("responseLost");
  const [keyMode, setKeyMode] = useState<KeyMode>("none");
  const [serverMode, setServerMode] = useState<ServerMode>("claimFirst");
  const [retries, setRetries] = useState(true);
  const r = simulate(fault, keyMode, serverMode, retries);
  const total = r.charges.reduce((s, c) => s + c.amount, 0);
  const bad = r.charges.length > 1;

  let verdict: string;
  if (bad && keyMode === "none") verdict = "Without a key the server has no way to tell a retry from a new payment, so it charged again.";
  else if (bad && keyMode === "perAttempt")
    verdict = "The client sent a key, but a new one on every attempt, so every retry looked like a new payment. The key must belong to the operation and survive retries.";
  else if (bad)
    verdict =
      "Both attempts arrived before either was recorded, so both found no key and both charged. Claim the key with a unique insert before doing the work; the second attempt then gets 409.";
  else if (r.charges.length === 0)
    verdict = retries ? "Nothing was charged." : "No retries: the first attempt was lost, so the customer never paid, and the client can't tell. Retries are needed; keys make them safe.";
  else if (!retries && (fault === "responseLost" || fault === "differentBody"))
    verdict = "Charged once, but the client never learned it. Without retries the user sees an error and is likely to pay again by hand.";
  else if (fault === "differentBody" && keyMode === "perOperation")
    verdict = "The server stored a hash of the request with the key and refused a reuse with a different amount: a client bug surfaced instead of a wrong replay or a second charge.";
  else if (keyMode === "perOperation" && fault !== "none" && fault !== "requestLost")
    verdict = "Charged exactly once. Repeats with the same key got the stored response (or 409 while the first was still running), and the client ended with the real result.";
  else verdict = "Charged once. Try losing the response, or making the server slow, with and without a key.";

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Charge a card: $40</h3>
        <div className="cdn-row">
          <span className="cdn-row-label">What goes wrong</span>
          <div className="sql-presets">
            {FAULTS.map((f) => (
              <button key={f.id} className={f.id === fault ? "active" : ""} onClick={() => setFault(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="cdn-row">
          <span className="cdn-row-label">Client idempotency key</span>
          <div className="sql-presets">
            {(
              [
                ["none", "No key"],
                ["perAttempt", "New key per attempt (bug)"],
                ["perOperation", "One key per payment"],
              ] as [KeyMode, string][]
            ).map(([id, label]) => (
              <button key={id} className={id === keyMode ? "active" : ""} onClick={() => setKeyMode(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="cdn-row">
          <span className="cdn-row-label">Server key handling</span>
          <div className="sql-presets">
            {(
              [
                ["checkThenRecord", "Look up, charge, then record"],
                ["claimFirst", "Claim key first (unique insert)"],
              ] as [ServerMode, string][]
            ).map(([id, label]) => (
              <button key={id} className={id === serverMode ? "active" : ""} onClick={() => setServerMode(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <label className="tool-checkbox">
          <input type="checkbox" checked={retries} onChange={(e) => setRetries(e.target.checked)} /> Client retries on timeouts and 409s (up to 3 retries, backoff 0.2, 0.4, 0.8 s)
        </label>

        <div className="tool-readout">
          <div className="readout-cell">
            <span className="readout-label">Times charged</span>
            <span className={`readout-value ${bad ? "api-no" : ""}`}>{r.charges.length}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Customer paid</span>
            <span className={`readout-value ${bad ? "api-no" : ""}`}>${total}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Requests sent</span>
            <span className="readout-value">{r.events.filter((e) => e.text.includes("POST /charges")).length}</span>
          </div>
        </div>

        <ul className="as-events">
          {r.events.map((e, i) => (
            <li key={i} className={`as-ev as-ev-${e.kind}`}>
              t={e.t.toFixed(2)}s {e.text}
            </li>
          ))}
        </ul>
        <p className="gate-note">Client outcome: {r.clientResult}</p>

        <span className="readout-label">Server&apos;s idempotency_keys table</span>
        <div className="api-scroll">
          <table className="bigo-table api-table">
            <thead>
              <tr>
                <th>key</th>
                <th>request</th>
                <th>status</th>
                <th>stored response</th>
              </tr>
            </thead>
            <tbody>
              {r.rows.length === 0 && (
                <tr>
                  <td colSpan={4}>{keyMode === "none" ? "no keys sent, nothing to store" : "empty"}</td>
                </tr>
              )}
              {r.rows.map((row) => (
                <tr key={row.key}>
                  <td className="mono">{row.key}</td>
                  <td className="mono">{row.hash}</td>
                  <td>{row.status}</td>
                  <td>{row.response || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={bad ? "constraint-fail" : "constraint-ok"}>{verdict}</p>
        <pre className="algo-code api-http">
          {`-- Claim the key in the same database as the charge
INSERT INTO idempotency_keys (account_id, key, request_hash, status, locked_at)
VALUES (:account, :key, :hash, 'in_progress', now())
ON CONFLICT (account_id, key) DO NOTHING;
-- 0 rows inserted: read the row; completed -> replay its response,
-- in_progress -> 409, different request_hash -> 422.
-- in_progress with an expired lease (locked_at too old, the attempt
-- crashed): reclaim it, ask the provider about the forwarded key,
-- and only re-run the work if the provider never saw it.
-- 1 row inserted: do the work, then in one transaction save the
-- result and set status = 'completed' with the response.`}
        </pre>
      </div>
      <p className="gate-note">
        Related: <LessonLink id="sd-resilience">Timeouts, Retries, Circuit Breakers</LessonLink> ·{" "}
        <LessonLink id="sd-async-systems">Distributed Async Systems</LessonLink> · <LessonLink id="sd-interview-payment-system">Design a Payment System</LessonLink>
      </p>
    </div>
  );
}
