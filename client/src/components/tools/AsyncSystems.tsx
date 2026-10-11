import { useState } from "react";
import { openLesson } from "../../api";

// Three teaching models, no real broker: a Kafka-style topic with a consumer group, a dual
// write versus a transactional outbox, and an order saga. Everything is deterministic.

// ---- Part 1: a Kafka-style topic ----

const CUSTOMERS = ["alice", "bob", "carol", "dave", "erin", "frank"];

// FNV-1a, a stand-in for Kafka's murmur2: any stable hash gives the same key -> partition idea.
function hash(key: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

interface Msg {
  offset: number;
  key: string;
  id: string; // order id, also the idempotency key
}

interface Topic {
  partitions: Msg[][];
  nextOrder: number;
  billing: number[]; // committed offset per partition
  consumers: number; // live consumers in the billing group
  analytics: number[];
  analyticsRead: number;
  seen: string[]; // order ids the billing consumer has charged
  log: { text: string; kind: "ok" | "dup" | "skip" | "lost" | "info" }[];
  charges: Record<string, number>;
  lost: number;
}

function newTopic(p: number, consumers: number): Topic {
  return {
    partitions: Array.from({ length: p }, () => []),
    nextOrder: 1001,
    billing: Array(p).fill(0),
    consumers,
    analytics: Array(p).fill(0),
    analyticsRead: 0,
    seen: [],
    log: [],
    charges: {},
    lost: 0,
  };
}

const assigned = (t: Topic, c: number) => t.partitions.map((_, p) => p).filter((p) => p % t.consumers === c);

function KafkaTopic() {
  const [p, setP] = useState(3);
  const [t, setT] = useState<Topic>(() => newTopic(3, 2));
  const [commitAfter, setCommitAfter] = useState(true);
  const [idempotent, setIdempotent] = useState(false);
  const [keyIdx, setKeyIdx] = useState(0);

  const say = (x: Topic, text: string, kind: Topic["log"][number]["kind"]) => {
    x.log = [{ text, kind }, ...x.log].slice(0, 12);
  };

  const produce = (key: string, count = 1) =>
    setT((prev) => {
      const x = { ...prev, partitions: prev.partitions.map((q) => [...q]) };
      for (let i = 0; i < count; i++) {
        const k = count === 1 ? key : CUSTOMERS[(prev.nextOrder + i * 5) % CUSTOMERS.length];
        const part = hash(k) % x.partitions.length;
        x.partitions[part].push({ offset: x.partitions[part].length, key: k, id: `o${x.nextOrder}` });
        x.nextOrder++;
      }
      return x;
    });

  // Charge the card for one message: the side effect a duplicate would repeat.
  const charge = (x: Topic, m: Msg) => {
    if (x.seen.includes(m.id)) {
      if (idempotent) return say(x, `${m.id}: already charged, skipped (idempotent consumer)`, "skip");
      x.charges = { ...x.charges, [m.id]: (x.charges[m.id] ?? 0) + 1 };
      return say(x, `${m.id}: charged ${m.key} AGAIN, a duplicate charge`, "dup");
    }
    x.seen = [...x.seen, m.id];
    x.charges = { ...x.charges, [m.id]: 1 };
    say(x, `${m.id}: charged ${m.key}`, "ok");
  };

  const poll = () =>
    setT((prev) => {
      const x = { ...prev, billing: [...prev.billing] };
      let did = false;
      for (let c = 0; c < x.consumers; c++) {
        for (const part of assigned(x, c)) {
          const m = x.partitions[part][x.billing[part]];
          if (!m) continue;
          did = true;
          charge(x, m);
          x.billing[part]++;
        }
      }
      if (!did) say(x, "Nothing new to read. Produce some orders.", "info");
      return x;
    });

  const crash = () =>
    setT((prev) => {
      const x = { ...prev, billing: [...prev.billing] };
      if (x.consumers <= 1) {
        say(x, "Only one consumer left; add one back before crashing another.", "info");
        return x;
      }
      const part = assigned(x, 0).find((q) => x.partitions[q][x.billing[q]]);
      if (part === undefined) {
        say(x, "Consumer 1 has nothing to work on. Produce some orders first.", "info");
        return x;
      }
      const m = x.partitions[part][x.billing[part]];
      if (commitAfter) {
        charge(x, m);
        say(x, `Consumer 1 crashed after charging ${m.id} but before committing offset ${m.offset + 1} on partition ${part}`, "info");
      } else {
        x.billing[part]++;
        x.lost++;
        say(x, `Consumer 1 committed offset ${m.offset + 1} on partition ${part}, then crashed before charging ${m.id}: lost`, "lost");
      }
      x.consumers--;
      say(x, `Rebalance: ${x.consumers} consumer${x.consumers === 1 ? "" : "s"} now share ${x.partitions.length} partitions`, "info");
      return x;
    });

  const analyticsRead = () =>
    setT((prev) => {
      const read = prev.partitions.reduce((n, q, i) => n + q.length - prev.analytics[i], 0);
      return { ...prev, analytics: prev.partitions.map((q) => q.length), analyticsRead: prev.analyticsRead + read };
    });

  const dupCount = Object.values(t.charges).reduce((n, c) => n + Math.max(0, c - 1), 0);
  const idle = Math.max(0, t.consumers - t.partitions.length);

  return (
    <div className="crypto-section">
      <h3>Part 1: a Kafka-style topic and two consumer groups</h3>
      <p className="gate-note">
        Topic <code>orders</code>. The key is the customer, so each customer&apos;s orders land in one partition, in order. The billing group
        charges cards; the analytics group reads the same messages independently.
      </p>
      <div className="cdn-row">
        <span className="cdn-row-label">Partitions (resets the topic)</span>
        <div className="sql-presets">
          {[1, 2, 3, 4, 6].map((n) => (
            <button
              key={n}
              className={n === p ? "active" : ""}
              onClick={() => {
                setP(n);
                setT(newTopic(n, t.consumers));
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <div className="cdn-row">
        <span className="cdn-row-label">Produce an order for</span>
        <div className="sql-presets">
          {CUSTOMERS.map((c, i) => (
            <button key={c} className={i === keyIdx ? "active" : ""} onClick={() => setKeyIdx(i)}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="darr-actions">
        <button onClick={() => produce(CUSTOMERS[keyIdx])}>Produce 1</button>
        <button onClick={() => produce("", 6)}>Produce 6 mixed</button>
        <button onClick={poll}>Billing: poll and process</button>
        <button onClick={crash}>Crash billing consumer 1 mid-message</button>
        <button disabled={t.consumers >= 6} onClick={() => setT((x) => ({ ...x, consumers: x.consumers + 1 }))}>
          Add a billing consumer
        </button>
        <button onClick={analyticsRead}>Analytics: read to the end</button>
        <button onClick={() => setT((x) => ({ ...x, analytics: x.analytics.map(() => 0) }))}>Analytics: reset offsets to 0</button>
        <button onClick={() => setT(newTopic(p, 2))}>Reset</button>
      </div>
      <div className="rs-toggles">
        <label className="tool-checkbox">
          <input type="checkbox" checked={commitAfter} onChange={(e) => setCommitAfter(e.target.checked)} /> Commit the offset after processing
          (unticked: before)
        </label>
        <label className="tool-checkbox">
          <input type="checkbox" checked={idempotent} onChange={(e) => setIdempotent(e.target.checked)} /> Idempotent consumer (skip order ids
          already charged)
        </label>
      </div>

      <div className="as-partitions">
        {t.partitions.map((msgs, i) => {
          const owner = i % t.consumers;
          return (
            <div key={i} className="as-partition">
              <div className="as-partition-head">
                <strong>Partition {i}</strong>
                <span className="cache-small">billing consumer {owner + 1}</span>
              </div>
              <div className="as-log">
                {msgs.length === 0 && <span className="cache-small">empty</span>}
                {msgs.map((m) => (
                  <span
                    key={m.offset}
                    className={m.offset < t.billing[i] ? "as-msg as-msg-done" : "as-msg"}
                    title={`offset ${m.offset}, key ${m.key}, ${m.id}`}
                  >
                    <span className="as-offset">{m.offset}</span>
                    {m.key}:{m.id}
                  </span>
                ))}
              </div>
              <span className="cache-small">
                billing committed {t.billing[i]} · analytics at {t.analytics[i]}
              </span>
            </div>
          );
        })}
      </div>
      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">Billing consumers</span>
          <span className="readout-value">
            {t.consumers}
            {idle > 0 ? ` (${idle} idle)` : ""}
          </span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Duplicate charges</span>
          <span className="readout-value">{dupCount}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Lost orders</span>
          <span className="readout-value">{t.lost}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Analytics has read</span>
          <span className="readout-value">{t.analyticsRead}</span>
        </div>
      </div>
      <ul className="as-events">
        {t.log.map((l, i) => (
          <li key={i} className={`as-ev as-ev-${l.kind}`}>
            {l.text}
          </li>
        ))}
      </ul>
      <p className="gate-note">
        {idle > 0
          ? `There are more consumers than partitions, so ${idle} sit idle: a partition is read by exactly one consumer in a group, which keeps it in order.`
          : dupCount > 0
            ? "The crashed consumer charged the card but never committed, so the next owner of that partition started from the last committed offset and charged again. That is at-least-once delivery. Tick the idempotent consumer and try again."
            : t.lost > 0
              ? "Committing before processing is at-most-once: the crash skipped an order for good. Most systems commit after processing and make the consumer idempotent instead."
              : t.analyticsRead > t.partitions.reduce((n, q) => n + q.length, 0)
                ? "The analytics group re-read messages after resetting its offsets: the log keeps messages for the retention period, and each group keeps its own position. Billing was not affected."
                : "Produce a few orders, poll, then crash a consumer. Watch the hash put each customer in the same partition every time."}
      </p>
    </div>
  );
}

// ---- Part 2: dual write versus transactional outbox ----

type Pattern = "saveThenPublish" | "publishThenSave" | "outbox";

const CRASHES: Record<Pattern, { id: string; label: string }[]> = {
  saveThenPublish: [
    { id: "none", label: "No crash" },
    { id: "between", label: "Crash after the save, before the publish" },
  ],
  publishThenSave: [
    { id: "none", label: "No crash" },
    { id: "between", label: "Crash after the publish, before the save" },
  ],
  outbox: [
    { id: "none", label: "No crash" },
    { id: "txFails", label: "The transaction fails" },
    { id: "beforeRelay", label: "Crash before the relay runs" },
    { id: "beforeMark", label: "Relay crashes after publishing, before marking the row sent" },
  ],
};

interface Step {
  text: string;
  ok: boolean | null; // null: didn't happen
}

function runPattern(pattern: Pattern, crash: string): { steps: Step[]; order: boolean; events: number; verdict: string; good: boolean } {
  if (pattern === "saveThenPublish") {
    const crashed = crash === "between";
    return {
      steps: [
        { text: "INSERT order 1042 and COMMIT", ok: true },
        { text: "Publish OrderPlaced(1042) to the broker", ok: crashed ? null : true },
      ],
      order: true,
      events: crashed ? 0 : 1,
      good: !crashed,
      verdict: crashed
        ? "Inconsistent: the order exists but no event was ever published. Shipping and email never hear about it, and nothing will retry, because the service doesn't know it forgot."
        : "Fine this time. But any crash, deploy or broker timeout between the two steps loses the event.",
    };
  }
  if (pattern === "publishThenSave") {
    const crashed = crash === "between";
    return {
      steps: [
        { text: "Publish OrderPlaced(1042) to the broker", ok: true },
        { text: "INSERT order 1042 and COMMIT", ok: crashed ? null : true },
      ],
      order: !crashed,
      events: 1,
      good: !crashed,
      verdict: crashed
        ? "Inconsistent the other way: shipping is now preparing a parcel for order 1042, which doesn't exist. The same happens if the insert fails a constraint."
        : "Fine this time. But the event went out before the order was durable, so any failure of the insert leaves a phantom event.",
    };
  }
  const steps: Step[] = [
    { text: "BEGIN; INSERT order 1042; INSERT outbox row OrderPlaced(1042); COMMIT", ok: crash !== "txFails" },
    { text: "Relay reads unsent outbox rows", ok: crash === "txFails" ? null : true },
    { text: "Relay publishes OrderPlaced(1042)", ok: crash === "txFails" ? null : true },
    { text: "Relay marks the outbox row sent", ok: crash === "txFails" ? null : crash === "beforeMark" ? false : true },
  ];
  if (crash === "beforeRelay") steps.splice(1, 0, { text: "Service crashes; relay restarts later", ok: false });
  if (crash === "beforeMark") steps.push({ text: "Relay restarts, finds the row still unsent, publishes again", ok: true }, { text: "Marks the row sent", ok: true });
  return {
    steps,
    order: crash !== "txFails",
    events: crash === "txFails" ? 0 : crash === "beforeMark" ? 2 : 1,
    good: true,
    verdict:
      crash === "txFails"
        ? "Consistent: the order and its event live or die together, because they are one database transaction. No order, no event."
        : crash === "beforeRelay"
          ? "Consistent: the outbox row was committed with the order, so the relay publishes it whenever it next runs. The event is late, not lost."
          : crash === "beforeMark"
            ? "Consistent, with one duplicate: the event was published twice. That is at-least-once again, and consumers handle it by recording the event id and skipping repeats."
            : "Consistent: one order, one event. The relay can poll the outbox table, or read the database's change log (change data capture, for example Debezium).",
  };
}

function Outbox() {
  const [pattern, setPattern] = useState<Pattern>("saveThenPublish");
  const [crash, setCrash] = useState("between");
  const r = runPattern(pattern, crash);
  const choose = (p: Pattern) => {
    setPattern(p);
    setCrash(CRASHES[p][1].id);
  };
  return (
    <div className="crypto-section">
      <h3>Part 2: saving an order and announcing it</h3>
      <div className="sql-presets">
        <button className={pattern === "saveThenPublish" ? "active" : ""} onClick={() => choose("saveThenPublish")}>
          Dual write: save, then publish
        </button>
        <button className={pattern === "publishThenSave" ? "active" : ""} onClick={() => choose("publishThenSave")}>
          Dual write: publish, then save
        </button>
        <button className={pattern === "outbox" ? "active" : ""} onClick={() => choose("outbox")}>
          Transactional outbox
        </button>
      </div>
      <div className="sql-presets">
        {CRASHES[pattern].map((c) => (
          <button key={c.id} className={c.id === crash ? "active" : ""} onClick={() => setCrash(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      <ol className="as-steps">
        {r.steps.map((s, i) => (
          <li key={i} className={s.ok === null ? "as-step-skipped" : s.ok ? "as-step-ok" : "as-step-fail"}>
            {s.ok === null ? "(never happened) " : ""}
            {s.text}
          </li>
        ))}
      </ol>
      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">Order in the database</span>
          <span className="readout-value">{r.order ? "yes" : "no"}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">OrderPlaced events published</span>
          <span className="readout-value">{r.events}</span>
        </div>
      </div>
      <p className={r.good ? "gate-note" : "constraint-fail"}>{r.verdict}</p>
    </div>
  );
}

// ---- Part 3: an order saga ----

const SAGA = [
  { action: "Inventory: reserve 2 units", undo: "Inventory: release the 2 units", event: "StockReserved", failEvent: "StockUnavailable", undoneEvent: "StockReleased" },
  { action: "Payments: charge $40", undo: "Payments: refund $40", event: "PaymentCaptured", failEvent: "PaymentDeclined", undoneEvent: "PaymentRefunded" },
  { action: "Shipping: book a courier", undo: "Shipping: cancel the booking", event: "CourierBooked", failEvent: "NoCourierAvailable", undoneEvent: "CourierCancelled" },
  { action: "Orders: mark the order confirmed", undo: "", event: "OrderConfirmed", failEvent: "", undoneEvent: "" },
];

const FAILURES = [
  { at: -1, label: "Everything succeeds", why: "" },
  { at: 1, label: "The card is declined", why: "card declined" },
  { at: 2, label: "No courier available", why: "no courier available" },
];

function Saga() {
  const [failAt, setFailAt] = useState(1);
  const [orchestrated, setOrchestrated] = useState(true);
  const fail = FAILURES.find((f) => f.at === failAt)!;
  const lines: { text: string; kind: "ok" | "fail" | "undo" }[] = [];
  for (let i = 0; i < SAGA.length; i++) {
    const s = SAGA[i];
    const who = orchestrated ? "Orchestrator tells " : i === 0 ? "Orders publishes OrderPlaced; " : `On ${SAGA[i - 1].event}, `;
    if (i === failAt) {
      lines.push({ text: `${who}${s.action}: fails (${fail.why})${orchestrated ? "" : `, publishes ${s.failEvent}`}`, kind: "fail" });
      let trigger = s.failEvent;
      for (let j = i - 1; j >= 0; j--) {
        lines.push({
          text: orchestrated ? `Orchestrator tells ${SAGA[j].undo}` : `On ${trigger}, ${SAGA[j].undo}, publishes ${SAGA[j].undoneEvent}`,
          kind: "undo",
        });
        trigger = SAGA[j].undoneEvent;
      }
      lines.push({
        text: orchestrated ? "Orchestrator marks the order cancelled and tells the customer" : `On ${trigger}, Orders marks the order cancelled and tells the customer`,
        kind: "fail",
      });
      break;
    }
    lines.push({ text: `${who}${s.action}`, kind: "ok" });
  }
  return (
    <div className="crypto-section">
      <h3>Part 3: an order saga</h3>
      <div className="sql-presets">
        {FAILURES.map((f) => (
          <button key={f.at} className={f.at === failAt ? "active" : ""} onClick={() => setFailAt(f.at)}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="sql-presets">
        <button className={orchestrated ? "active" : ""} onClick={() => setOrchestrated(true)}>
          Orchestration
        </button>
        <button className={!orchestrated ? "active" : ""} onClick={() => setOrchestrated(false)}>
          Choreography
        </button>
      </div>
      <ol className="as-steps">
        {lines.map((l, i) => (
          <li key={i} className={l.kind === "ok" ? "as-step-ok" : l.kind === "fail" ? "as-step-fail" : "as-step-undo"}>
            {l.text}
          </li>
        ))}
      </ol>
      <p className="gate-note">
        {failAt < 0
          ? "Each step is a local transaction in one service; there is no lock across services."
          : "No distributed transaction rolls anything back. Each completed step is undone by a compensating action, in reverse order. Compensations must themselves be idempotent and retried until they succeed, and some effects can't be undone at all (an email already sent), so put those last."}{" "}
        {orchestrated
          ? "With orchestration one component owns the sequence and records each step, so you can see where every order is."
          : "With choreography each service reacts to the previous event and nobody owns the whole flow: simple for a few steps, hard to follow and change for many."}
      </p>
    </div>
  );
}

export function AsyncSystems() {
  return (
    <div className="tool-widget">
      <KafkaTopic />
      <Outbox />
      <Saga />
      <p className="gate-note">
        Related:{" "}
        <button className="link-button" onClick={() => openLesson("sd-message-queues")}>
          Message Queues
        </button>{" "}
        ·{" "}
        <button className="link-button" onClick={() => openLesson("sql-transactions")}>
          SQL Transactions and ACID
        </button>{" "}
        ·{" "}
        <button className="link-button" onClick={() => openLesson("sd-interview-payment-system")}>
          Design a Payment System
        </button>
      </p>
    </div>
  );
}
