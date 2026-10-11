// Retry storm teaching model for the Timeouts, Retries and Circuit Breakers lesson
// (Resilience.tsx draws it). Clients send BASE_RATE logical requests a second to a service
// that finishes CAPACITY a second from a first-in, first-out queue. Each attempt times out
// after TIMEOUT_TICKS; a logical request gets up to MAX_ATTEMPTS attempts. From INCIDENT_FROM
// to INCIDENT_TO the service only manages INCIDENT_CAPACITY a second. A success counts only if
// the client was still waiting; work done after the client gave up is wasted. Time moves in
// 100 ms ticks and jitter comes from a seeded generator, so a run is fully repeatable.

export type RetryPolicy = "none" | "immediate" | "backoff" | "jitter";

export interface ResilienceOptions {
  policy: RetryPolicy;
  budget: boolean; // retries limited to 10% of first attempts over the last second
  breaker: boolean; // client-side circuit breaker
  boundedQueue: boolean; // server rejects when its queue holds more than half a second of work
  dropExpired: boolean; // server skips work whose client already timed out
}

export const TICK_MS = 100;
export const TICKS = 400; // 40 s
export const BASE_RATE = 80;
export const CAPACITY = 100;
export const INCIDENT_CAPACITY = 30;
export const INCIDENT_FROM = 50; // tick, t = 5 s
export const INCIDENT_TO = 100; // tick, t = 10 s
const TIMEOUT_TICKS = 10;
export const MAX_ATTEMPTS = 4;
const BACKOFF_BASE_TICKS = 2; // 200 ms, then 400, 800
const BACKOFF_CAP_TICKS = 20;
const QUEUE_LIMIT = 50; // half a second of normal capacity
const BUDGET_RATIO = 0.1;
const BREAKER_WINDOW = 10;
const BREAKER_MIN_SAMPLES = 20;
const BREAKER_THRESHOLD = 0.5;
const BREAKER_OPEN_TICKS = 20;
const BREAKER_TRIALS = 5;

interface Attempt {
  req: number;
  n: number; // 1 for the first attempt
  sentAt: number;
  settled: boolean; // succeeded or the client gave up on it
}

export interface SecondStats {
  t: number; // seconds
  offered: number; // attempts that reached the service (including ones it rejected)
  goodput: number; // logical requests that succeeded
  failed: number; // logical requests that gave up
  capacity: number;
  queue: number; // queue length at the end of the second
  breaker: "closed" | "open" | "half-open";
}

export interface ResilienceResult {
  seconds: SecondStats[];
  requests: number;
  succeeded: number;
  failed: number;
  attempts: number;
  wasted: number; // attempts processed after the client had given up
  rejectedFast: number; // failed fast by the breaker or the bounded queue
  recoveredAt: number | null; // seconds
}

function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function simulateRetries(o: ResilienceOptions): ResilienceResult {
  const rnd = rng(99);
  const queue: Attempt[] = [];
  const waiting: Attempt[] = []; // sent, not yet answered (queued or rejected this tick)
  const retries = new Map<number, Attempt[]>(); // tick -> attempts to send then
  const outcomes: { t: number; ok: boolean }[] = []; // for the breaker
  const firstSends: number[] = []; // ticks of first attempts, for the budget
  const retrySends: number[] = [];
  let breaker: "closed" | "open" | "half-open" = "closed";
  let openUntil = 0;
  let trials: boolean[] = [];
  let trialsSent = 0;
  let nextReq = 0;
  let carryArrivals = 0;
  let carryCapacity = 0;
  let requests = 0, succeeded = 0, failed = 0, attempts = 0, wasted = 0, rejectedFast = 0;
  const seconds: SecondStats[] = [];
  let sec = { offered: 0, goodput: 0, failed: 0 };

  const giveUp = () => {
    failed++;
    sec.failed++;
  };

  const recordOutcome = (t: number, ok: boolean) => {
    if (!o.breaker) return;
    if (breaker === "half-open") {
      trials.push(ok);
      if (trials.length >= BREAKER_TRIALS) {
        if (trials.filter(Boolean).length >= 3) breaker = "closed";
        else {
          breaker = "open";
          openUntil = t + BREAKER_OPEN_TICKS;
        }
        trials = [];
        outcomes.length = 0;
      }
      return;
    }
    outcomes.push({ t, ok });
  };

  const failAttempt = (a: Attempt, t: number) => {
    recordOutcome(t, false);
    if (o.policy === "none" || a.n >= MAX_ATTEMPTS) return giveUp();
    if (o.budget) {
      const recentFirst = firstSends.filter((x) => x > t - 10).length;
      const recentRetries = retrySends.filter((x) => x > t - 10).length;
      if (recentRetries >= BUDGET_RATIO * recentFirst) return giveUp();
    }
    let delay = 0;
    if (o.policy === "backoff" || o.policy === "jitter") {
      const max = Math.min(BACKOFF_CAP_TICKS, BACKOFF_BASE_TICKS * 2 ** (a.n - 1));
      delay = o.policy === "jitter" ? Math.floor(rnd() * (max + 1)) : max;
    }
    retrySends.push(t);
    const at = t + Math.max(1, delay);
    const next: Attempt = { req: a.req, n: a.n + 1, sentAt: at, settled: false };
    const list = retries.get(at) ?? [];
    list.push(next);
    retries.set(at, list);
  };

  const send = (a: Attempt, t: number) => {
    if (o.breaker) {
      if (breaker === "open" && t >= openUntil) {
        breaker = "half-open";
        trialsSent = 0;
      }
      if (breaker === "open" || (breaker === "half-open" && trialsSent >= BREAKER_TRIALS)) {
        rejectedFast++;
        return giveUp(); // fail fast, no retry while the breaker is open
      }
      if (breaker === "half-open") trialsSent++;
    }
    attempts++;
    sec.offered++;
    if (o.boundedQueue && queue.length >= QUEUE_LIMIT) {
      rejectedFast++;
      return failAttempt(a, t); // 503 straight away
    }
    queue.push(a);
    waiting.push(a);
  };

  for (let t = 0; t < TICKS; t++) {
    // New logical requests and retries due now.
    carryArrivals += BASE_RATE / 10;
    while (carryArrivals >= 1) {
      carryArrivals -= 1;
      requests++;
      firstSends.push(t);
      send({ req: nextReq++, n: 1, sentAt: t, settled: false }, t);
    }
    for (const a of retries.get(t) ?? []) send(a, t);
    retries.delete(t);

    // The service works through its queue.
    const cap = (t >= INCIDENT_FROM && t < INCIDENT_TO ? INCIDENT_CAPACITY : CAPACITY) / 10;
    carryCapacity += cap;
    while (carryCapacity >= 1 && queue.length > 0) {
      const a = queue.shift()!;
      if (a.settled) {
        if (o.dropExpired) continue; // skipped for free: nobody is waiting for it
        wasted++;
        carryCapacity -= 1;
        continue;
      }
      carryCapacity -= 1;
      a.settled = true;
      succeeded++;
      sec.goodput++;
      recordOutcome(t, true);
    }
    if (queue.length === 0) carryCapacity = Math.min(carryCapacity, 1);

    // Clients give up on attempts that have waited too long.
    for (let i = waiting.length - 1; i >= 0; i--) {
      const a = waiting[i];
      if (a.settled) {
        waiting.splice(i, 1);
      } else if (t - a.sentAt + 1 >= TIMEOUT_TICKS) {
        a.settled = true;
        waiting.splice(i, 1);
        failAttempt(a, t);
      }
    }

    // Breaker decision over the last second.
    if (o.breaker && breaker === "closed") {
      while (outcomes.length && outcomes[0].t <= t - BREAKER_WINDOW) outcomes.shift();
      const bad = outcomes.filter((x) => !x.ok).length;
      if (outcomes.length >= BREAKER_MIN_SAMPLES && bad / outcomes.length > BREAKER_THRESHOLD) {
        breaker = "open";
        openUntil = t + BREAKER_OPEN_TICKS;
        outcomes.length = 0;
      }
    }
    while (firstSends.length && firstSends[0] <= t - 10) firstSends.shift();
    while (retrySends.length && retrySends[0] <= t - 10) retrySends.shift();

    if ((t + 1) % 10 === 0) {
      seconds.push({
        t: (t + 1) / 10 - 1,
        ...sec,
        capacity: (t >= INCIDENT_FROM && t < INCIDENT_TO ? INCIDENT_CAPACITY : CAPACITY),
        queue: queue.filter((a) => !a.settled || !o.dropExpired).length,
        breaker: o.breaker ? breaker : "closed",
      });
      sec = { offered: 0, goodput: 0, failed: 0 };
    }
  }

  // Recovered: the first second after the incident from which goodput stays at 90% of the
  // offered demand for three seconds in a row.
  let recoveredAt: number | null = null;
  const end = INCIDENT_TO / 10;
  for (let s = end; s + 2 < seconds.length; s++) {
    if ([0, 1, 2].every((k) => seconds[s + k].goodput >= 0.9 * BASE_RATE)) {
      recoveredAt = s;
      break;
    }
  }

  return { seconds, requests, succeeded, failed, attempts, wasted, rejectedFast, recoveredAt };
}
