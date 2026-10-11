import { useEffect, useRef, useState } from "react";

// A toy message queue, no real broker. Every 100 ms tick, producers publish at the chosen
// rate, idle consumers take the next message, and each consumer needs 200 ms per message
// (5 messages/s). A taken message is invisible to others until it is acked; if it isn't
// acked within the visibility timeout (the consumer crashed), it is redelivered. Each
// message "charges a customer", so a redelivered message can charge someone twice unless
// the consumer remembers which message ids it has already processed.

const TICK_MS = 100;
const WORK_TICKS = 2; // 200 ms per message => 5 msg/s per consumer
const VISIBILITY_TICKS = 40; // 4 s visibility timeout
const SPIKE_TICKS = 30; // a 3 s spike
const RESTART_TICKS = 30; // a crashed consumer comes back after 3 s
const MAX_ATTEMPTS = 3;
const HISTORY = 120; // samples, one every 500 ms => last 60 s

interface Msg {
  id: number;
  enqueuedAt: number;
  attempts: number;
  poison: boolean;
}

interface Consumer {
  current: Msg | null;
  doneAt: number;
  downUntil: number;
}

interface Sim {
  now: number;
  carry: number; // fractional messages owed by the producer
  nextId: number;
  queue: Msg[];
  inFlight: { msg: Msg; deadline: number; consumer: number }[];
  consumers: Consumer[];
  spikeUntil: number;
  processed: number;
  charges: Map<number, number>; // order id -> times the card was charged
  seen: Set<number>; // the idempotent consumer's "already processed" table
  doubleCharged: number;
  duplicatesCaught: number;
  dlq: Msg[];
  history: number[];
  log: string[];
}

function newSim(consumers: number): Sim {
  return {
    now: 0, carry: 0, nextId: 1001, queue: [], inFlight: [],
    consumers: Array.from({ length: consumers }, () => ({ current: null, doneAt: 0, downUntil: 0 })),
    spikeUntil: 0, processed: 0, charges: new Map(), seen: new Set(),
    doubleCharged: 0, duplicatesCaught: 0, dlq: [], history: [], log: [],
  };
}

const say = (s: Sim, line: string) => {
  s.log = [`t=${(s.now / 10).toFixed(1)}s ${line}`, ...s.log].slice(0, 6);
};

// The side effect: charge the customer for this order.
function charge(s: Sim, m: Msg) {
  const n = (s.charges.get(m.id) ?? 0) + 1;
  s.charges.set(m.id, n);
  s.seen.add(m.id);
  if (n === 2) {
    s.doubleCharged++;
    say(s, `order #${m.id} charged a second time`);
  }
}

// One tick of the whole system. Mutates the sim in place (it lives in a ref).
function step(s: Sim, rate: number, idempotent: boolean) {
  s.now++;

  // Producers.
  s.carry += (rate * (s.now < s.spikeUntil ? 10 : 1) * TICK_MS) / 1000;
  while (s.carry >= 1) {
    s.queue.push({ id: s.nextId++, enqueuedAt: s.now, attempts: 0, poison: false });
    s.carry--;
  }

  // Visibility timeout: unacked messages become visible again.
  for (const f of s.inFlight.filter((f) => f.deadline <= s.now)) {
    s.inFlight = s.inFlight.filter((x) => x !== f);
    s.queue.unshift(f.msg);
    say(s, `order #${f.msg.id} was never acked, redelivered`);
  }

  s.consumers.forEach((c, i) => {
    if (s.now < c.downUntil) return;
    if (c.current && s.now >= c.doneAt) {
      const m = c.current;
      c.current = null;
      s.inFlight = s.inFlight.filter((f) => f.msg !== m);
      if (m.poison) {
        if (m.attempts >= MAX_ATTEMPTS) {
          s.dlq.push(m);
          say(s, `poison #${m.id} failed ${MAX_ATTEMPTS} times, moved to the dead-letter queue`);
        } else {
          s.queue.push(m);
          say(s, `poison #${m.id} threw an error (attempt ${m.attempts}), back on the queue`);
        }
      } else if (idempotent && s.seen.has(m.id)) {
        s.duplicatesCaught++;
        say(s, `order #${m.id} already processed, skipped and acked`);
      } else {
        charge(s, m);
        s.processed++;
      }
    }
    if (!c.current && s.queue.length > 0) {
      const m = s.queue.shift()!;
      m.attempts++;
      c.current = m;
      c.doneAt = s.now + WORK_TICKS;
      s.inFlight.push({ msg: m, deadline: s.now + VISIBILITY_TICKS, consumer: i });
    }
  });

  if (s.now % 5 === 0) s.history = [...s.history, s.queue.length].slice(-HISTORY);
}

function DepthChart({ history }: { history: number[] }) {
  const max = Math.max(10, ...history);
  const w = 300;
  const h = 80;
  const x = (i: number) => (i / (HISTORY - 1)) * w;
  const y = (d: number) => h - (d / max) * (h - 4);
  const line = history.map((d, i) => `${x(i).toFixed(1)},${y(d).toFixed(1)}`).join(" ");
  const area = history.length ? `0,${h} ${line} ${x(history.length - 1).toFixed(1)},${h}` : "";
  return (
    <div className="mq-chart">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label="Queue depth over the last 60 seconds">
        <polygon points={area} className="mq-area" />
        <polyline points={line} className="mq-line" />
      </svg>
      <div className="mq-chart-labels">
        <span>queue depth, last 60 s</span>
        <span>max on scale: {max}</span>
      </div>
    </div>
  );
}

export function MessageQueues() {
  const [rate, setRate] = useState(8);
  const [count, setCount] = useState(3);
  const [idempotent, setIdempotent] = useState(false);
  const [paused, setPaused] = useState(false);
  const sim = useRef<Sim>(newSim(3));
  const [, setFrame] = useState(0);
  const redraw = () => setFrame((f) => f + 1);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      step(sim.current, rate, idempotent);
      redraw();
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [paused, rate, idempotent]);

  // Scaling consumers down hands any message they hold straight back to the queue.
  const setConsumers = (n: number) => {
    const s = sim.current;
    while (s.consumers.length < n) s.consumers.push({ current: null, doneAt: 0, downUntil: 0 });
    while (s.consumers.length > n) {
      const c = s.consumers.pop()!;
      if (c.current) {
        s.inFlight = s.inFlight.filter((f) => f.msg !== c.current);
        s.queue.unshift(c.current);
      }
    }
    setCount(n);
  };

  const spike = () => {
    sim.current.spikeUntil = sim.current.now + SPIKE_TICKS;
    say(sim.current, `traffic spike: ${rate * 10} msg/s for 3 s`);
    redraw();
  };

  // The consumer charges the card, then dies before it can ack the message.
  const crash = () => {
    const s = sim.current;
    const c = s.consumers.find((c) => c.current && !c.current.poison && s.now >= c.downUntil);
    if (!c || !c.current) {
      say(s, "no consumer is busy right now, try again");
      return redraw();
    }
    charge(s, c.current);
    say(s, `consumer crashed after charging order #${c.current.id}, before the ack`);
    c.current = null;
    c.downUntil = s.now + RESTART_TICKS;
    redraw();
  };

  const poison = () => {
    const s = sim.current;
    s.queue.push({ id: s.nextId++, enqueuedAt: s.now, attempts: 0, poison: true });
    say(s, `published a malformed message #${s.nextId - 1}`);
    redraw();
  };

  const reset = () => {
    sim.current = newSim(count);
    redraw();
  };

  const s = sim.current;
  const capacity = count * (1000 / (TICK_MS * WORK_TICKS));
  const effectiveRate = rate * (s.now < s.spikeUntil ? 10 : 1);
  const oldest = s.queue.length ? (s.now - s.queue.reduce((a, m) => Math.min(a, m.enqueuedAt), s.now)) / 10 : 0;
  const down = s.consumers.filter((c) => s.now < c.downUntil).length;
  const recentRedelivery = s.log.some((l) => l.includes("redelivered"));

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>A queue between producers and consumers</h3>
        <div className="mq-controls">
          <label>
            Producers publish: <strong>{rate} msg/s</strong>
            <input type="range" min={1} max={30} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
          </label>
          <label>
            Consumers: <strong>{count}</strong> (5 msg/s each, {capacity} msg/s total)
            <input type="range" min={1} max={8} value={count} onChange={(e) => setConsumers(Number(e.target.value))} />
          </label>
        </div>
        <div className="darr-actions mq-actions">
          <button onClick={spike}>Traffic spike (10x for 3 s)</button>
          <button onClick={crash}>Crash a consumer mid-message</button>
          <button onClick={poison}>Publish a poison message</button>
          <button onClick={() => setPaused(!paused)}>{paused ? "Resume" : "Pause"}</button>
          <button onClick={reset}>Reset</button>
        </div>
        <div className="sql-presets">
          <button className={!idempotent ? "active" : ""} onClick={() => setIdempotent(false)}>
            Plain consumer
          </button>
          <button className={idempotent ? "active" : ""} onClick={() => setIdempotent(true)}>
            Idempotent consumer (dedupe by message id)
          </button>
        </div>

        <div className="mq-pipeline">
          <div className="mq-box">
            <strong>Producers</strong>
            <span className="mono">{effectiveRate} msg/s</span>
          </div>
          <div className="mq-box">
            <strong>Queue</strong>
            <span className="mono">{s.queue.length} waiting · {s.inFlight.length} in flight</span>
            <span className="mq-small">oldest waiting: {oldest.toFixed(1)} s</span>
          </div>
          <div className="mq-box">
            <strong>Consumers</strong>
            <div className="mq-consumers">
              {s.consumers.map((c, i) => (
                <span key={i} className={s.now < c.downUntil ? "mq-c mq-c-down" : c.current ? "mq-c mq-c-busy" : "mq-c"}>
                  {s.now < c.downUntil ? "down" : c.current ? `#${c.current.id}` : "idle"}
                </span>
              ))}
            </div>
          </div>
        </div>

        <DepthChart history={s.history} />

        <table className="bigo-table">
          <tbody>
            <tr><td>Messages processed</td><td className="mono">{s.processed}</td></tr>
            <tr><td>Customers charged twice</td><td className="mono">{s.doubleCharged}</td></tr>
            <tr><td>Duplicates caught by the idempotency check</td><td className="mono">{s.duplicatesCaught}</td></tr>
            <tr><td>Dead-letter queue</td><td className="mono">{s.dlq.length ? s.dlq.map((m) => `#${m.id}`).join(", ") : "empty"}</td></tr>
          </tbody>
        </table>
        <p className="gate-note">
          {s.now < s.spikeUntil
            ? `Spike: ${effectiveRate} msg/s arriving, ${capacity} msg/s being processed. The queue absorbs the difference, so producers never wait and consumers never get overloaded. They just fall behind for a while.`
            : rate > capacity
              ? `Producers publish ${rate} msg/s but ${count} consumer${count === 1 ? "" : "s"} can only handle ${capacity} msg/s, so the queue grows by ${rate - capacity} msg/s forever and the oldest message keeps getting older. A queue smooths bursts; it can't fix too little capacity. Add consumers or push back on producers.`
              : s.queue.length > 20
                ? `Draining at ${capacity - rate} msg/s of spare capacity. More consumers drain it faster.`
                : `Steady state: ${rate} msg/s in, up to ${capacity} msg/s of capacity, so messages wait only a fraction of a second.`}
        </p>
        {idempotent && (s.duplicatesCaught > 0 || down > 0) && (
          <p className="constraint-ok">
            The consumer records each message id and skips any id it has seen. Redelivery still happens, but the charge happens once. Here the
            charge is a write in the consumer's own database, so the id goes in the same transaction. A real card processor can't join that
            transaction, so you'd also send the processor an idempotency key derived from the order, and reconcile against its records.
          </p>
        )}
        {!idempotent && s.doubleCharged === 0 && (down > 0 || recentRedelivery) && (
          <p className="gate-note">
            The consumer charged the card and died before acking. The queue can't tell "crashed" from "slow", so it keeps the message invisible for the{" "}
            {VISIBILITY_TICKS / 10} s visibility timeout and then hands it to another consumer. Watch what that does to the customer.
          </p>
        )}
        {!idempotent && s.doubleCharged > 0 && (
          <p className="constraint-fail">
            The redelivered message was processed again and the customer was charged twice. At-least-once delivery means duplicates will happen: turn on
            the idempotent consumer and crash one again.
          </p>
        )}
        {s.dlq.length > 0 && (
          <p className="gate-note">
            A poison message fails every time. Without a limit it would be retried forever and block a consumer each time; after {MAX_ATTEMPTS} attempts it is parked in the dead-letter queue for a human to inspect, and the rest of the traffic keeps flowing.
          </p>
        )}
        <ul className="k8s-events">
          {s.log.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
