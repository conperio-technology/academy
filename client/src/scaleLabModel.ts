// The "Scale It Yourself" lab's traffic model (ScaleLab.tsx draws it). A teaching model, not a
// benchmark: every tier is treated as a simple queue whose average time is
// service time / (1 - utilization), and anything offered past 100% of a tier's capacity is
// rejected or times out. Each simulated second also draws a fixed number of sample requests
// from a seeded generator to get latency percentiles, so the same settings always give the
// same numbers. All capacities and prices are round made-up figures chosen to be easy to
// reason about.

export interface LabConfig {
  loadBalancer: boolean;
  appServers: number; // only 1 is usable without a load balancer
  cdn: boolean;
  cache: boolean;
  cacheHitRate: number; // 0.5 to 0.99, the hit rate once the cache is warm
  replicas: number;
  queue: boolean;
  workers: number;
  rateLimiter: boolean;
  timeouts: boolean; // timeout plus circuit breaker on the recommendations call
}

export interface Mix {
  static: number; // images, scripts, stylesheets
  read: number; // API reads (product pages)
  write: number; // API writes (orders, sign-ups); each also triggers side work
}

export interface LabEvents {
  serverDownAt?: number; // one app server dies at this second
  cacheColdAt?: number; // the cache restarts empty at this second
  slowDependency?: { from: number; to: number; ms: number };
  bot?: { from: number; rps: number };
}

export interface Goal {
  p99Ms: number;
  errorPct: number;
  budget?: number; // monthly cost limit
  maxJobDelayS?: number;
}

export interface Scenario {
  id: string;
  title: string;
  brief: string;
  goal: Goal;
  mix: Mix;
  traffic: (t: number) => number; // legitimate requests per second at second t
  events: LabEvents;
  start: LabConfig;
  solution?: LabConfig;
  lesson?: string; // what fixed it and why, shown once solved or on request
}

export const DURATION = 120; // simulated seconds
const SAMPLES_PER_SECOND = 200;

// Capacities and costs, all per second unless noted.
export const APP_CPU_MS = 4000; // 4 cores per app server
export const APP_CONCURRENCY = 100; // requests one app server can hold open at once
export const DB_QPS = 3000; // queries per second per database node
export const WORKER_CPU_MS = 4000;
const CPU = { static: 2, read: 6, write: 8, sideWork: 60, enqueue: 1 }; // ms of app CPU
const QUERIES = { read: 3, write: 2 }; // queries per uncached read or per write
const DB_MS = { read: 2, write: 4 }; // service time per query
const NET_ORIGIN_MS = 60; // user to your datacenter and back
const NET_EDGE_MS = 15; // user to a nearby CDN PoP and back
const CDN_HIT = 0.95;
const CACHE_MS = 1;
const DEP_NORMAL_MS = 40;
const DEP_SHARE = 0.5; // share of reads that call the recommendations service
const DEP_TIMEOUT_MS = 150;
const CLIENT_TIMEOUT_MS = 3000;
const BOT_CACHE_FACTOR = 0.3; // scrapers walk the long tail, so the cache helps them less
const RATE_LIMIT_PASS = 0.05; // share of scraper traffic that fits under its per-client limit
const CACHE_WARMUP_S = 25;
const BREAKER_AFTER_S = 3;
const MAX_UTIL = 0.98;

export const PRICES = {
  appServer: 150,
  loadBalancer: 25,
  cdn: 120,
  cache: 250,
  database: 600,
  replica: 600,
  queue: 30,
  worker: 150,
  rateLimiter: 20,
};

export function monthlyCost(c: LabConfig) {
  return (
    PRICES.database +
    usableServers(c) * PRICES.appServer +
    (c.loadBalancer ? PRICES.loadBalancer : 0) +
    (c.cdn ? PRICES.cdn : 0) +
    (c.cache ? PRICES.cache : 0) +
    c.replicas * PRICES.replica +
    (c.queue ? PRICES.queue + c.workers * PRICES.worker : 0) +
    (c.rateLimiter ? PRICES.rateLimiter : 0)
  );
}

export const usableServers = (c: LabConfig) => (c.loadBalancer ? c.appServers : 1);

export type Tier = "app" | "primary" | "replicas" | "workers";

export interface Second {
  t: number;
  rps: number; // legitimate traffic
  botRps: number; // scraper traffic offered at the front door
  p50: number;
  p99: number;
  errorRate: number; // share of legitimate requests that failed
  util: Record<Tier, number | null>; // null when the tier doesn't exist
  appCpu: number;
  appThreads: number;
  jobDelayS: number;
  breakerOpen: boolean;
  degraded: number; // share of requests served with a fallback
  serversUp: number;
  hitRate: number;
}

export interface RunResult {
  seconds: Second[];
  p50: number;
  p95: number;
  p99: number;
  errorPct: number;
  maxJobDelayS: number;
  cost: number;
  peak: Record<Tier, number | null>;
  degradedPct: number;
  botRejected: number;
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

// Time spent in a tier with this mean: exponential, the response time of a simple queue.
const expo = (rnd: () => number, mean: number) => -mean * Math.log(1 - rnd());
const stretch = (u: number) => 1 / (1 - Math.min(u, MAX_UTIL));
const overflow = (u: number) => (u > 1 ? 1 - 1 / u : 0);

export function percentile(sorted: number[], p: number) {
  if (sorted.length === 0) return 0;
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1))];
}

export function simulate(sc: Pick<Scenario, "mix" | "traffic" | "events">, c: LabConfig, seed = 7): RunResult {
  const rnd = rng(seed);
  const servers = usableServers(c);
  const ev = sc.events;
  let backlog = 0; // queued side jobs
  let maxJobDelayS = 0;
  let slowStreak = 0;
  let botRejected = 0;
  const all: number[] = [];
  let failed = 0;
  let total = 0;
  let degradedCount = 0;
  const seconds: Second[] = [];
  const peak: Record<Tier, number | null> = { app: 0, primary: 0, replicas: c.replicas > 0 ? 0 : null, workers: c.queue ? 0 : null };

  for (let t = 0; t < DURATION; t++) {
    const rps = sc.traffic(t);
    const botOffered = ev.bot && t >= ev.bot.from ? ev.bot.rps : 0;
    const bot = c.rateLimiter ? botOffered * RATE_LIMIT_PASS : botOffered;
    botRejected += botOffered - bot;
    const up = ev.serverDownAt !== undefined && t >= ev.serverDownAt ? servers - 1 : servers;

    const depMs = ev.slowDependency && t >= ev.slowDependency.from && t < ev.slowDependency.to ? ev.slowDependency.ms : DEP_NORMAL_MS;
    slowStreak = depMs > DEP_TIMEOUT_MS ? slowStreak + 1 : 0;
    const breakerOpen = c.timeouts && slowStreak > BREAKER_AFTER_S;
    // Time the recommendations call adds to a request that makes it.
    const depWait = !c.timeouts ? depMs : breakerOpen ? 0 : Math.min(depMs, DEP_TIMEOUT_MS);
    const depFallback = c.timeouts && depMs > DEP_TIMEOUT_MS;

    let hit = c.cache ? c.cacheHitRate : 0;
    if (c.cache && ev.cacheColdAt !== undefined && t >= ev.cacheColdAt) hit *= Math.min(1, (t - ev.cacheColdAt) / CACHE_WARMUP_S);
    const botHit = hit * BOT_CACHE_FACTOR;

    const staticRps = rps * sc.mix.static;
    const readRps = rps * sc.mix.read;
    const writeRps = rps * sc.mix.write;
    const staticAtOrigin = c.cdn ? staticRps * (1 - CDN_HIT) : staticRps;

    // Database load. Reads go to the replicas when there are any, otherwise to the primary.
    const readQueries = (readRps * (1 - hit) + bot * (1 - botHit)) * QUERIES.read;
    const writeQueries = writeRps * QUERIES.write;
    const uPrimary = (writeQueries + (c.replicas > 0 ? 0 : readQueries)) / DB_QPS;
    const uReplicas = c.replicas > 0 ? readQueries / (c.replicas * DB_QPS) : null;
    const uReadDb = uReplicas ?? uPrimary;
    const readQueryMs = DB_MS.read * stretch(uReadDb);
    const writeQueryMs = DB_MS.write * stretch(uPrimary);

    // App CPU and the requests each server holds open (Little's law: in flight = rate x time).
    const writeCpu = CPU.write + (c.queue ? CPU.enqueue : CPU.sideWork);
    const cpuWork = staticAtOrigin * CPU.static + (readRps + bot) * CPU.read + writeRps * writeCpu;
    const uCpu = up > 0 ? cpuWork / (up * APP_CPU_MS) : Infinity;
    const cpuStretch = stretch(uCpu);
    const readDbMs = (1 - hit) * QUERIES.read * readQueryMs + hit * CACHE_MS;
    const botDbMs = (1 - botHit) * QUERIES.read * readQueryMs + botHit * CACHE_MS;
    const inFlight =
      (staticAtOrigin * CPU.static * cpuStretch +
        readRps * (CPU.read * cpuStretch + readDbMs + DEP_SHARE * depWait) +
        bot * (CPU.read * cpuStretch + botDbMs) +
        writeRps * (writeCpu * cpuStretch + QUERIES.write * writeQueryMs)) /
      1000;
    const uThreads = up > 0 ? inFlight / (up * APP_CONCURRENCY) : Infinity;
    const uApp = Math.max(uCpu, uThreads);
    const appStretch = stretch(uApp);
    const eApp = up > 0 ? overflow(uApp) : 1;
    const eRead = overflow(uReadDb);
    const ePrimary = overflow(uPrimary);

    // Side jobs: done inline (above) or queued for the workers.
    let jobDelayS = 0;
    let uWorkers: number | null = null;
    if (c.queue) {
      const jobsPerSecond = (c.workers * WORKER_CPU_MS) / CPU.sideWork;
      uWorkers = writeRps / jobsPerSecond;
      backlog = Math.max(0, backlog + writeRps - jobsPerSecond);
      jobDelayS = backlog / jobsPerSecond;
      maxJobDelayS = Math.max(maxJobDelayS, jobDelayS);
    }

    // Sample requests for latency percentiles and errors.
    const lat: number[] = [];
    let fails = 0;
    let degraded = 0;
    for (let i = 0; i < SAMPLES_PER_SECOND; i++) {
      const r = rnd();
      const net = (ms: number) => ms * (0.8 + 0.4 * rnd());
      let ms: number;
      let pFail = 0;
      if (r < sc.mix.static) {
        if (c.cdn && rnd() < CDN_HIT) ms = net(NET_EDGE_MS);
        else {
          ms = net(NET_ORIGIN_MS) + expo(rnd, CPU.static * appStretch);
          pFail = eApp;
        }
      } else if (r < sc.mix.static + sc.mix.read) {
        ms = net(NET_ORIGIN_MS) + expo(rnd, CPU.read * appStretch);
        if (rnd() < hit) ms += expo(rnd, CACHE_MS);
        else {
          for (let q = 0; q < QUERIES.read; q++) ms += expo(rnd, readQueryMs);
          pFail = eRead;
        }
        if (rnd() < DEP_SHARE) {
          if (depWait > 0) ms += c.timeouts ? Math.min(DEP_TIMEOUT_MS, expo(rnd, depWait)) : expo(rnd, depWait);
          if (depFallback) degraded++;
        }
        pFail = 1 - (1 - pFail) * (1 - eApp);
      } else {
        ms = net(NET_ORIGIN_MS) + expo(rnd, writeCpu * appStretch);
        for (let q = 0; q < QUERIES.write; q++) ms += expo(rnd, writeQueryMs);
        pFail = 1 - (1 - ePrimary) * (1 - eApp);
      }
      if (rnd() < pFail || ms > CLIENT_TIMEOUT_MS) fails++;
      else lat.push(ms);
    }
    lat.sort((a, b) => a - b);
    for (const x of lat) all.push(x);
    failed += fails * rps;
    total += SAMPLES_PER_SECOND * rps;
    degradedCount += degraded * rps;

    const util: Record<Tier, number | null> = { app: uApp, primary: uPrimary, replicas: uReplicas, workers: uWorkers };
    for (const k of Object.keys(util) as Tier[]) {
      const v = util[k];
      if (v !== null && Number.isFinite(v)) peak[k] = Math.max(peak[k] ?? 0, v);
      else if (v !== null) peak[k] = Infinity;
    }
    seconds.push({
      t, rps, botRps: botOffered, p50: percentile(lat, 0.5), p99: percentile(lat, 0.99),
      errorRate: fails / SAMPLES_PER_SECOND, util, appCpu: uCpu, appThreads: uThreads, jobDelayS, breakerOpen,
      degraded: degraded / SAMPLES_PER_SECOND, serversUp: up, hitRate: hit,
    });
  }

  // Overall percentiles weight each second by its traffic: resample by keeping every sample
  // but counting busy seconds proportionally would need weights, so instead use a weighted sort.
  const weighted: { ms: number; w: number }[] = [];
  let k = 0;
  for (const s of seconds) {
    const n = SAMPLES_PER_SECOND - Math.round(s.errorRate * SAMPLES_PER_SECOND);
    for (let i = 0; i < n; i++) weighted.push({ ms: all[k++], w: s.rps });
  }
  weighted.sort((a, b) => a.ms - b.ms);
  const totalW = weighted.reduce((sum, x) => sum + x.w, 0);
  const wp = (p: number) => {
    let acc = 0;
    for (const x of weighted) {
      acc += x.w;
      if (acc >= p * totalW) return x.ms;
    }
    return weighted.length ? weighted[weighted.length - 1].ms : 0;
  };

  return {
    seconds,
    p50: wp(0.5),
    p95: wp(0.95),
    p99: wp(0.99),
    errorPct: total ? (100 * failed) / total : 0,
    maxJobDelayS,
    cost: monthlyCost(c),
    peak,
    degradedPct: total ? (100 * degradedCount) / total : 0,
    botRejected: Math.round(botRejected),
  };
}

export interface GoalCheck {
  label: string;
  ok: boolean;
}

export function checkGoal(goal: Goal, r: RunResult): GoalCheck[] {
  const checks: GoalCheck[] = [
    { label: `p99 latency under ${goal.p99Ms} ms (now ${Math.round(r.p99)} ms)`, ok: r.p99 <= goal.p99Ms },
    { label: `Errors under ${goal.errorPct}% (now ${r.errorPct.toFixed(2)}%)`, ok: r.errorPct <= goal.errorPct },
  ];
  if (goal.budget !== undefined) checks.push({ label: `Cost at most $${goal.budget.toLocaleString("en-US")}/month (now $${r.cost.toLocaleString("en-US")})`, ok: r.cost <= goal.budget });
  if (goal.maxJobDelayS !== undefined)
    checks.push({
      label: `Background jobs never more than ${goal.maxJobDelayS} s behind (now ${Math.round(r.maxJobDelayS)} s)`,
      ok: r.maxJobDelayS <= goal.maxJobDelayS,
    });
  return checks;
}

const ramp = (t: number, from: number, to: number, t0: number, t1: number) =>
  t <= t0 ? from : t >= t1 ? to : from + ((to - from) * (t - t0)) / (t1 - t0);

const BASE: LabConfig = {
  loadBalancer: false,
  appServers: 1,
  cdn: false,
  cache: false,
  cacheHitRate: 0.9,
  replicas: 0,
  queue: false,
  workers: 2,
  rateLimiter: false,
  timeouts: false,
};

const SHOP: Mix = { static: 0.35, read: 0.55, write: 0.1 };

export const SCENARIOS: Scenario[] = [
  {
    id: "first",
    title: "1. Your first scale-up",
    brief:
      "A shop running on one app server and one database. Traffic grows from 200 to 1,200 requests a second over two minutes. One server tops out at about 370 requests a second. Keep it fast without overspending.",
    goal: { p99Ms: 600, errorPct: 1, budget: 1700 },
    mix: SHOP,
    traffic: (t) => ramp(t, 200, 1200, 10, 110),
    events: {},
    start: { ...BASE },
    solution: { ...BASE, loadBalancer: true, appServers: 5 },
    lesson:
      "The app tier is stateless, so the fix is horizontal scaling: a load balancer in front of several identical servers. Without the load balancer a second server does nothing, because nothing sends it traffic. Four servers just about cope at the peak but run at over 80% CPU, where queueing makes every request wait several times longer than on an idle server; five leave headroom. Real teams aim for 50% to 70% utilization at peak for exactly this reason. A queue for the side work on writes would also cut CPU per request a lot, which the next scenarios use.",
  },
  {
    id: "spike",
    title: "2. Survive a 10x traffic spike",
    brief:
      "A TV mention sends traffic from 300 to 3,000 requests a second for a minute. You have a load balancer, three app servers and a queue for side work. Brute force (lots of servers and replicas) works but blows the budget. What takes load off the app servers and the database most cheaply?",
    goal: { p99Ms: 600, errorPct: 1, budget: 2200 },
    mix: SHOP,
    traffic: (t) => (t < 30 ? 300 : t < 35 ? ramp(t, 300, 3000, 30, 35) : t < 90 ? 3000 : ramp(t, 3000, 300, 90, 95)),
    events: {},
    start: { ...BASE, loadBalancer: true, appServers: 3, queue: true, workers: 2 },
    solution: { ...BASE, loadBalancer: true, appServers: 5, queue: true, workers: 2, cdn: true, cache: true, cacheHitRate: 0.9 },
    lesson:
      "Two cheap components did most of the work. The CDN serves 95% of static files (a third of all requests) from the edge, so they never reach your servers and arrive faster. The cache answers 90% of reads, so the database sees a tenth of the read queries; without it 3,000 requests a second need about 5,500 queries a second against a database that manages 3,000. Then one or two more app servers cover what is left. The workers fall behind during the spike, which is fine: that is what the queue is for, and they catch up afterwards. Real spikes also need autoscaling, which takes minutes, so the edge and cache layers are what carry you through the first minute.",
  },
  {
    id: "database",
    title: "3. The database is the bottleneck",
    brief:
      "Read-heavy traffic at 1,800 requests a second. There are already eight app servers, a CDN and a queue, but about a quarter of requests fail. Try adding app servers first and watch which tier is saturated.",
    goal: { p99Ms: 500, errorPct: 1, budget: 3400 },
    mix: { static: 0.2, read: 0.75, write: 0.05 },
    traffic: () => 1800,
    events: {},
    start: { ...BASE, loadBalancer: true, appServers: 8, cdn: true, queue: true, workers: 1 },
    solution: { ...BASE, loadBalancer: true, appServers: 4, cdn: true, queue: true, workers: 1, cache: true, cacheHitRate: 0.9 },
    lesson:
      "The database needs about 4,200 queries a second and can do 3,000, so nearly 30% of reads fail whatever you do to the app tier: more app servers just send the same queries faster. Fix the tier that is saturated. A cache with a 90% hit rate removes nine in ten read queries and also makes reads faster; two read replicas also work, by spreading reads over more machines, but cost more and serve slightly stale data (replication lag). With the database fixed, the app tier turns out to be oversized, and you can give back half the servers. Find the bottleneck before you add hardware.",
  },
  {
    id: "dependency",
    title: "4. A dependency got slow",
    brief:
      "Half of all product pages call a recommendations service that normally answers in 40 ms. From t = 40 s to t = 100 s it takes 2 seconds. Nothing is down, yet requests that never call it start failing too. Why, and what stops it?",
    goal: { p99Ms: 800, errorPct: 1, budget: 2200 },
    mix: SHOP,
    traffic: () => 800,
    events: { slowDependency: { from: 40, to: 100, ms: 2000 } },
    start: { ...BASE, loadBalancer: true, appServers: 4, cdn: true, cache: true, cacheHitRate: 0.9, queue: true, workers: 1 },
    solution: { ...BASE, loadBalancer: true, appServers: 4, cdn: true, cache: true, cacheHitRate: 0.9, queue: true, workers: 1, timeouts: true },
    lesson:
      "Each app server can hold 100 requests open at once. By Little's law, requests in flight = arrival rate x time per request: 220 recommendation calls a second at 2 seconds each keep 440 requests open, more than the 400 slots of four servers, so everything queues for a slot, including static files and writes. More servers only buy slots for more waiting. A 150 ms timeout caps the damage, and the circuit breaker then stops calling the slow service altogether and serves a fallback (popular items from the cache). Pages are slightly worse for a minute instead of the site failing. A bulkhead, a separate small pool of slots for the recommendations call, is the other standard fix.",
  },
  {
    id: "sidework",
    title: "5. Slow side work on every write",
    brief:
      "A sign-up surge: 40% of requests are writes, and each write also resizes an avatar and sends a welcome email, 60 ms of CPU, inline in the request. Traffic climbs from 300 to 900 requests a second. Background jobs must also not fall more than 30 seconds behind.",
    goal: { p99Ms: 600, errorPct: 1, budget: 2400, maxJobDelayS: 30 },
    mix: { static: 0.3, read: 0.3, write: 0.4 },
    traffic: (t) => ramp(t, 300, 900, 10, 70),
    events: {},
    start: { ...BASE, loadBalancer: true, appServers: 3, cdn: true, cache: true, cacheHitRate: 0.9 },
    solution: { ...BASE, loadBalancer: true, appServers: 3, cdn: true, cache: true, cacheHitRate: 0.9, queue: true, workers: 6 },
    lesson:
      "The user doesn't need the avatar resized before the sign-up page answers, so move that work to a queue: the request just enqueues a job (1 ms) and returns, and CPU per write drops from 68 ms to 9 ms. That alone fixes latency and errors on three app servers. But the work hasn't gone away, it has moved: 360 jobs a second at 60 ms each needs 5.4 workers' worth of CPU. With fewer workers the backlog grows for as long as the surge lasts. Size consumers for the sustained rate, and watch queue age, not just queue length.",
  },
  {
    id: "scraper",
    title: "6. A scraper hits your API",
    brief:
      "Normal traffic is 600 requests a second. At t = 30 s a scraper starts pulling 2,500 pages a second from a handful of API keys, walking the long tail so the cache rarely helps. Real users start getting errors.",
    goal: { p99Ms: 600, errorPct: 1, budget: 2000 },
    mix: SHOP,
    traffic: () => 600,
    events: { bot: { from: 30, rps: 2500 } },
    start: { ...BASE, loadBalancer: true, appServers: 4, cdn: true, cache: true, cacheHitRate: 0.9, queue: true, workers: 1 },
    solution: { ...BASE, loadBalancer: true, appServers: 4, cdn: true, cache: true, cacheHitRate: 0.9, queue: true, workers: 1, rateLimiter: true },
    lesson:
      "Four times your normal traffic from a few clients is abuse, not demand, and scaling up to serve it means paying for the scraper. A rate limiter at the edge counts requests per API key and answers anything over the limit with 429 Too Many Requests before it reaches an app server or the database, so it costs almost nothing. Real users, each far under the limit, never notice. Limit per key or per user for signed-in traffic, and per IP address only for anonymous traffic.",
  },
  {
    id: "failures",
    title: "7. Lose a server, then the cache",
    brief:
      "Steady 2,000 requests a second. At t = 40 s an app server dies; at t = 70 s the cache node restarts empty and takes about 25 seconds to warm up. Everything is fine until then. Make the system survive both.",
    goal: { p99Ms: 600, errorPct: 1, budget: 3400 },
    mix: SHOP,
    traffic: () => 2000,
    events: { serverDownAt: 40, cacheColdAt: 70 },
    start: { ...BASE, loadBalancer: true, appServers: 3, cdn: true, cache: true, cacheHitRate: 0.95, queue: true, workers: 2 },
    solution: { ...BASE, loadBalancer: true, appServers: 4, cdn: true, cache: true, cacheHitRate: 0.95, queue: true, workers: 2, replicas: 2 },
    lesson:
      "Capacity planning is for the bad day, not the average one. Three servers at about 70% become two at over 100% when one dies (N+1: always have one more than you need). And a cache that absorbs 95% of reads hides how small the database really is: when it restarts cold, every read goes to the database at once, about 3,700 queries a second against 3,000. Read replicas give the database layer enough headroom to survive a cold cache. Other real fixes: warm a new cache node before it takes traffic, use a replicated cache cluster so one restart doesn't empty it, and coalesce concurrent misses for the same key.",
  },
];

export interface SandboxSettings {
  rps: number;
  spike: boolean;
  serverDown: boolean;
  coldCache: boolean;
  slowDependency: boolean;
  bot: boolean;
}

export function sandboxScenario(s: SandboxSettings): Scenario {
  return {
    id: "sandbox",
    title: "Sandbox",
    brief: "Set the traffic and switch failures on and off. There is no goal; watch which tier saturates first.",
    goal: { p99Ms: 600, errorPct: 1 },
    mix: SHOP,
    traffic: (t) => (s.spike && t >= 30 && t < 90 ? s.rps * 5 : s.rps),
    events: {
      serverDownAt: s.serverDown ? 40 : undefined,
      cacheColdAt: s.coldCache ? 70 : undefined,
      slowDependency: s.slowDependency ? { from: 40, to: 100, ms: 2000 } : undefined,
      bot: s.bot ? { from: 30, rps: 2500 } : undefined,
    },
    start: { ...BASE, loadBalancer: true, appServers: 3 },
  };
}
