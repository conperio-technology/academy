import { useMemo, useState } from "react";
import { openLesson } from "../../api";

// ---- Part 1: build a Cache-Control header and read what each cache will do with it ----

type Visibility = "unset" | "public" | "private";

interface Header {
  visibility: Visibility;
  noStore: boolean;
  noCache: boolean;
  maxAge: number | null;
  sMaxAge: number | null;
  swr: number | null;
  sie: number | null;
  immutable: boolean;
}

const EMPTY: Header = { visibility: "unset", noStore: false, noCache: false, maxAge: null, sMaxAge: null, swr: null, sie: null, immutable: false };

const HEADER_PRESETS: { label: string; h: Header; why: string }[] = [
  {
    label: "Hashed static file",
    h: { ...EMPTY, visibility: "public", maxAge: 31536000, immutable: true },
    why: "app.3f9c2b.js: the name changes whenever the content does, so it can be cached for a year everywhere.",
  },
  {
    label: "HTML page",
    h: { ...EMPTY, maxAge: 0, sMaxAge: 60, swr: 30 },
    why: "Browsers always check; the CDN keeps it a minute and refreshes in the background, so a deploy shows up within about a minute.",
  },
  {
    label: "Personalised API response",
    h: { ...EMPTY, visibility: "private", noStore: true },
    why: "A user's orders or account page: never in a shared cache, and not even kept in the browser.",
  },
  {
    label: "Popular API response",
    h: { ...EMPTY, visibility: "public", maxAge: 0, sMaxAge: 5, sie: 86400 },
    why: "A product's stock badge or a scoreboard: micro-cached for 5 seconds at the edge, served stale if the origin is down.",
  },
  {
    label: "Always revalidate",
    h: { ...EMPTY, noCache: true },
    why: "Stored, but checked with the origin (ETag, 304 Not Modified) before every use.",
  },
];

const AGE_CHOICES: { v: number | null; label: string }[] = [
  { v: null, label: "unset" },
  { v: 0, label: "0" },
  { v: 5, label: "5 s" },
  { v: 60, label: "1 min" },
  { v: 3600, label: "1 h" },
  { v: 86400, label: "1 day" },
  { v: 31536000, label: "1 year" },
];
const STALE_CHOICES: { v: number | null; label: string }[] = [
  { v: null, label: "unset" },
  { v: 30, label: "30 s" },
  { v: 600, label: "10 min" },
  { v: 86400, label: "1 day" },
];

function duration(s: number) {
  if (s === 0) return "0 seconds";
  if (s >= 31536000) return `${s / 31536000} year`;
  if (s >= 86400) return `${s / 86400} day${s === 86400 ? "" : "s"}`;
  if (s >= 3600) return `${s / 3600} hour${s === 3600 ? "" : "s"}`;
  if (s >= 60) return `${s / 60} minute${s === 60 ? "" : "s"}`;
  return `${s} seconds`;
}

function headerText(h: Header) {
  const parts: string[] = [];
  if (h.visibility !== "unset") parts.push(h.visibility);
  if (h.noStore) parts.push("no-store");
  if (h.noCache) parts.push("no-cache");
  if (h.maxAge !== null) parts.push(`max-age=${h.maxAge}`);
  if (h.sMaxAge !== null) parts.push(`s-maxage=${h.sMaxAge}`);
  if (h.swr !== null) parts.push(`stale-while-revalidate=${h.swr}`);
  if (h.sie !== null) parts.push(`stale-if-error=${h.sie}`);
  if (h.immutable) parts.push("immutable");
  return parts.length ? `Cache-Control: ${parts.join(", ")}` : "(no Cache-Control header)";
}

function interpret(h: Header) {
  const browser: string[] = [];
  const cdn: string[] = [];
  const warnings: string[] = [];

  if (h.noStore) {
    browser.push("Doesn't store it. Every use is a full request to the server.");
    cdn.push("Doesn't store it. Every request goes to the origin.");
    if (h.maxAge !== null || h.sMaxAge !== null || h.swr !== null || h.immutable)
      warnings.push("no-store overrides the freshness directives here, so they do nothing. Remove them to keep the header honest.");
    return { browser, cdn, warnings };
  }

  // Browser (a private cache): s-maxage doesn't apply to it.
  if (h.noCache) browser.push("Stores it, but asks the server before every use (If-None-Match with the ETag); an unchanged file comes back as 304 Not Modified with no body.");
  else if (h.maxAge === null)
    browser.push("No explicit lifetime, so the browser may pick a heuristic one (often 10% of the time since Last-Modified). Set one explicitly.");
  else if (h.maxAge === 0) browser.push("Stores it but treats it as stale at once, so it revalidates with the server before every use.");
  else
    browser.push(
      `Reuses it without asking for ${duration(h.maxAge)}${h.immutable ? ", even when the user presses reload (immutable)" : ""}, then revalidates.`,
    );
  if (h.swr !== null && !h.noCache && h.maxAge !== null)
    browser.push(`After that it may show the old copy for up to ${duration(h.swr)} while it fetches a new one (Chromium-based browsers and Firefox support this).`);

  // CDN (a shared cache).
  if (h.visibility === "private") {
    cdn.push("Must not store it (private). Every request goes to the origin, which is right for anything personalised.");
    if (h.sMaxAge !== null) warnings.push("s-maxage only applies to shared caches, and private forbids them from storing the response, so it is ignored.");
  } else {
    const ttl = h.sMaxAge ?? h.maxAge;
    if (h.noCache) cdn.push("Stores it but revalidates with the origin on every request. Saves bytes (304s), not round trips.");
    else if (ttl === null)
      cdn.push("No explicit lifetime. CDNs fall back to their own configured default TTL (CloudFront's default is 24 hours, for example) or to not caching, so behaviour depends on settings you may not remember.");
    else if (ttl === 0) cdn.push("Stores it but it is stale at once, so every request is revalidated with the origin.");
    else cdn.push(`Serves it from the PoP for ${duration(ttl)}${h.sMaxAge !== null ? " (s-maxage overrides max-age for shared caches)" : ""}, then fetches or revalidates it from the origin.`);
    if (h.swr !== null && ttl !== null && ttl > 0 && !h.noCache)
      cdn.push(`For ${duration(h.swr)} after it expires, it may keep serving the old copy while refreshing in the background, so users never wait for the origin.`);
    if (h.sie !== null) cdn.push(`If the origin errors, it may serve a stale copy for up to ${duration(h.sie)}.`);
    if (h.visibility === "public") cdn.push("public also allows shared caches to store responses they normally wouldn't, such as ones to requests with an Authorization header. Never use it on personalised responses.");
  }
  if (h.immutable && (h.maxAge ?? 0) < 86400) warnings.push("immutable is meant for files whose name changes when their content does, with a long max-age.");
  if (h.noCache && (h.maxAge !== null || h.sMaxAge !== null)) warnings.push("no-cache already forces revalidation on every use, so the max-age values add nothing.");
  return { browser, cdn, warnings };
}

function HeaderBuilder() {
  const [h, setH] = useState<Header>(HEADER_PRESETS[0].h);
  const [why, setWhy] = useState(HEADER_PRESETS[0].why);
  const set = (patch: Partial<Header>) => {
    setH((prev) => ({ ...prev, ...patch }));
    setWhy("");
  };
  const { browser, cdn, warnings } = interpret(h);
  const ageRow = (label: string, value: number | null, onPick: (v: number | null) => void, choices = AGE_CHOICES) => (
    <div className="cdn-row">
      <span className="cdn-row-label">{label}</span>
      <div className="sql-presets">
        {choices.map((c) => (
          <button key={c.label} className={c.v === value ? "active" : ""} onClick={() => onPick(c.v)}>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
  return (
    <div className="crypto-section">
      <h3>Part 1: what will each cache do with this header?</h3>
      <div className="sql-presets">
        {HEADER_PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setH(p.h);
              setWhy(p.why);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="cdn-row">
        <span className="cdn-row-label">Who may store it</span>
        <div className="sql-presets">
          {(["unset", "public", "private"] as Visibility[]).map((v) => (
            <button key={v} className={h.visibility === v ? "active" : ""} onClick={() => set({ visibility: v })}>
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="rs-toggles">
        <label className="tool-checkbox">
          <input type="checkbox" checked={h.noStore} onChange={(e) => set({ noStore: e.target.checked })} /> no-store
        </label>
        <label className="tool-checkbox">
          <input type="checkbox" checked={h.noCache} onChange={(e) => set({ noCache: e.target.checked })} /> no-cache
        </label>
        <label className="tool-checkbox">
          <input type="checkbox" checked={h.immutable} onChange={(e) => set({ immutable: e.target.checked })} /> immutable
        </label>
      </div>
      {ageRow("max-age", h.maxAge, (v) => set({ maxAge: v }))}
      {ageRow("s-maxage (CDN only)", h.sMaxAge, (v) => set({ sMaxAge: v }))}
      {ageRow("stale-while-revalidate", h.swr, (v) => set({ swr: v }), STALE_CHOICES)}
      {ageRow("stale-if-error", h.sie, (v) => set({ sie: v }), STALE_CHOICES)}
      <pre className="algo-code cdn-header">
        <code>{headerText(h)}</code>
      </pre>
      {why && <p className="gate-note">{why}</p>}
      <div className="cache-boxes">
        <div className="cache-box">
          <strong>The user&apos;s browser</strong>
          {browser.map((b, i) => (
            <span key={i}>{b}</span>
          ))}
        </div>
        <div className="cache-box">
          <strong>The CDN (a shared cache)</strong>
          {cdn.map((b, i) => (
            <span key={i}>{b}</span>
          ))}
        </div>
      </div>
      {warnings.map((w, i) => (
        <p key={i} className="constraint-fail">
          {w}
        </p>
      ))}
    </div>
  );
}

// ---- Part 2: a seeded model of 20 minutes of traffic through 4 PoPs ----

const POPS = [
  { name: "Virginia", share: 0.35, originMs: 4 },
  { name: "Frankfurt", share: 0.25, originMs: 90 },
  { name: "São Paulo", share: 0.15, originMs: 120 },
  { name: "Sydney", share: 0.25, originMs: 200 },
];
const FILES = 300;
const RATE = 50; // requests per second, all PoPs together
const MINUTES = 20;
const USER_TO_POP_MS = 15;
const ORIGIN_WORK_MS = 30;
const SHIELD_TO_ORIGIN_MS = 4; // the shield sits in Virginia, next to the origin
const CAMPAIGNS = 20;
const TRACKED_SHARE = 0.3;
const TTLS = [10, 60, 600, 3600];

interface CdnRun {
  edgeHit: number;
  shieldHit: number;
  originRequests: number;
  p50: number;
  p95: number;
  perPop: { name: string; hit: number; requests: number }[];
  keys: number;
}

function simulateCdn(ttl: number, ignoreTracking: boolean, shield: boolean): CdnRun {
  let s = 2024;
  const rnd = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // Zipf popularity (s = 1): file k is requested in proportion to 1 / k.
  const weights = Array.from({ length: FILES }, (_, k) => 1 / (k + 1));
  const total = weights.reduce((a, b) => a + b, 0);
  const cdf: number[] = [];
  let acc = 0;
  for (const w of weights) cdf.push((acc += w / total));
  const pickFile = () => {
    const r = rnd();
    let lo = 0;
    let hi = FILES - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid] < r) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };

  const popCaches = POPS.map(() => new Map<string, number>()); // key -> expires at (s)
  const shieldCache = new Map<string, number>();
  const n = RATE * 60 * MINUTES;
  const lat: number[] = [];
  let edgeHits = 0;
  let shieldLookups = 0;
  let shieldHits = 0;
  let origin = 0;
  const perPop = POPS.map((p) => ({ name: p.name, hit: 0, requests: 0 }));
  const keys = new Set<string>();
  for (let i = 0; i < n; i++) {
    const now = i / RATE;
    const r = rnd();
    let pop = POPS.length - 1;
    let cum = 0;
    for (let a = 0; a < POPS.length; a++) {
      cum += POPS[a].share;
      if (r < cum) {
        pop = a;
        break;
      }
    }
    const file = pickFile();
    const tracked = rnd() < TRACKED_SHARE;
    const campaign = Math.floor(rnd() * CAMPAIGNS);
    const key = `/img/${file}.webp${tracked && !ignoreTracking ? `?utm_campaign=c${campaign}` : ""}`;
    keys.add(key);
    perPop[pop].requests++;
    const cache = popCaches[pop];
    let ms = USER_TO_POP_MS * (0.8 + 0.4 * rnd());
    if ((cache.get(key) ?? -1) > now) {
      edgeHits++;
      perPop[pop].hit++;
    } else {
      if (shield) {
        shieldLookups++;
        ms += POPS[pop].originMs;
        if ((shieldCache.get(key) ?? -1) > now) shieldHits++;
        else {
          origin++;
          ms += SHIELD_TO_ORIGIN_MS + ORIGIN_WORK_MS;
          shieldCache.set(key, now + ttl);
        }
      } else {
        origin++;
        ms += POPS[pop].originMs + ORIGIN_WORK_MS;
      }
      cache.set(key, now + ttl);
    }
    lat.push(ms);
  }
  lat.sort((a, b) => a - b);
  const pct = (p: number) => lat[Math.min(lat.length - 1, Math.ceil(p * lat.length) - 1)];
  return {
    edgeHit: edgeHits / n,
    shieldHit: shieldLookups ? shieldHits / shieldLookups : 0,
    originRequests: origin,
    p50: pct(0.5),
    p95: pct(0.95),
    perPop: perPop.map((p) => ({ ...p, hit: p.requests ? p.hit / p.requests : 0 })),
    keys: keys.size,
  };
}

function TrafficModel() {
  const [ttl, setTtl] = useState(60);
  const [ignoreTracking, setIgnoreTracking] = useState(false);
  const [shield, setShield] = useState(false);
  const run = useMemo(() => simulateCdn(ttl, ignoreTracking, shield), [ttl, ignoreTracking, shield]);
  const n = RATE * 60 * MINUTES;
  const noCdnOriginRate = RATE;
  const notes: string[] = [];
  if (ttl <= 10)
    notes.push("With a 10-second TTL most files expire before the next request for them reaches the same PoP, so the long tail of less popular files is almost always a miss.");
  if (!ignoreTracking)
    notes.push(
      `30% of requests carry a ?utm_campaign= parameter, and the cache key includes the query string, so the same image is stored under up to 21 keys (${run.keys.toLocaleString()} keys in total for ${FILES} files). Ignore the tracking parameters in the cache key.`,
    );
  if (!shield)
    notes.push("Each of the 4 PoPs fetches every file from the origin itself. Turn on the origin shield and compare origin requests.");
  else
    notes.push(
      `With the shield, PoP misses ask the shield first and ${(100 * run.shieldHit).toFixed(0)}% of them are answered there. Latency barely changes, because the shield sits next to the origin; the win is origin load.`,
    );
  if (ttl >= 3600 && ignoreTracking && shield)
    notes.push("This is close to the best this traffic allows. The remaining misses are first requests for rarely used files in each PoP.");

  return (
    <div className="crypto-section">
      <h3>Part 2: 20 minutes of traffic through four PoPs</h3>
      <p className="gate-note">
        {RATE} image requests a second for {MINUTES} minutes ({n.toLocaleString()} requests) over {FILES} files with skewed popularity, from users
        near Virginia, Frankfurt, São Paulo and Sydney. The origin is in Virginia. Without a CDN, all {noCdnOriginRate} requests a second would
        reach the origin.
      </p>
      <div className="cdn-row">
        <span className="cdn-row-label">TTL (s-maxage)</span>
        <div className="sql-presets">
          {TTLS.map((t) => (
            <button key={t} className={t === ttl ? "active" : ""} onClick={() => setTtl(t)}>
              {duration(t)}
            </button>
          ))}
        </div>
      </div>
      <div className="rs-toggles">
        <label className="tool-checkbox">
          <input type="checkbox" checked={ignoreTracking} onChange={(e) => setIgnoreTracking(e.target.checked)} /> Leave tracking parameters out
          of the cache key
        </label>
        <label className="tool-checkbox">
          <input type="checkbox" checked={shield} onChange={(e) => setShield(e.target.checked)} /> Origin shield (in Virginia)
        </label>
      </div>
      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">Edge hit ratio</span>
          <span className="readout-value">{(100 * run.edgeHit).toFixed(1)}%</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Origin requests</span>
          <span className="readout-value">
            {run.originRequests.toLocaleString()} ({(run.originRequests / (60 * MINUTES)).toFixed(1)}/s)
          </span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">p50 latency</span>
          <span className="readout-value">{Math.round(run.p50)} ms</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">p95 latency</span>
          <span className="readout-value">{Math.round(run.p95)} ms</span>
        </div>
      </div>
      <div className="cdn-pops">
        {run.perPop.map((p) => (
          <div key={p.name} className="cdn-pop">
            <strong>{p.name}</strong>
            <span className="cache-small">
              {p.requests.toLocaleString()} requests, {(100 * p.hit).toFixed(1)}% hits
            </span>
            <span className="cdn-hitbar">
              <span style={{ width: `${100 * p.hit}%` }} />
            </span>
          </div>
        ))}
      </div>
      {notes.map((t, i) => (
        <p key={i} className="gate-note">
          {t}
        </p>
      ))}
      <p className="gate-note">
        Teaching model: a hit costs the user about {USER_TO_POP_MS} ms; a miss adds the round trip from the PoP to Virginia (4 to 200 ms) and{" "}
        {ORIGIN_WORK_MS} ms of origin work. Caches never evict in this model, only expire. Seeded, so every run of the same settings matches.
      </p>
    </div>
  );
}

// ---- Part 3: shipping a changed file ----

const STRATEGIES = [
  {
    id: "wait",
    label: "Same name, wait for the TTL",
    outcome:
      "Users keep getting the old app.js from each PoP (and from their own browser cache) until it expires there, up to the full TTL after the deploy. Worse, the new HTML can arrive with the old script, a mismatch that breaks pages in ways that are hard to reproduce. Only acceptable for short TTLs.",
    bad: true,
  },
  {
    id: "purge",
    label: "Same name, purge after deploy",
    outcome:
      "The CDN drops its copies within seconds, but browsers that cached the file keep their copy until their own max-age runs out, because a purge can't reach them. Every PoP's next request goes to the origin at once (a small stampede). And purging is one more step in every deploy that someone will eventually forget.",
    bad: true,
  },
  {
    id: "hash",
    label: "Content hash in the file name",
    outcome:
      "The build writes app.9e1d47.js, and the new HTML (short TTL) points to it. Nothing stale can be served because the new file has a URL no cache has seen; old pages still find the old file, which stays valid. The files can be cached for a year with immutable, and no purge is needed. Vite does this by default; webpack does it when output.filename uses [contenthash].",
    bad: false,
  },
];

function Invalidation() {
  const [pick, setPick] = useState<string | null>(null);
  const s = STRATEGIES.find((x) => x.id === pick);
  return (
    <div className="crypto-section">
      <h3>Part 3: you just fixed a bug in app.js. How do users get the fix?</h3>
      <div className="sql-presets">
        {STRATEGIES.map((x) => (
          <button key={x.id} className={x.id === pick ? "active" : ""} onClick={() => setPick(x.id)}>
            {x.label}
          </button>
        ))}
      </div>
      {s && <p className={s.bad ? "constraint-fail" : "gate-note"}>{s.outcome}</p>}
    </div>
  );
}

export function Cdn() {
  return (
    <div className="tool-widget">
      <HeaderBuilder />
      <TrafficModel />
      <Invalidation />
      <p className="gate-note">
        Related:{" "}
        <button className="link-button" onClick={() => openLesson("sd-caching")}>
          Caching
        </button>{" "}
        ·{" "}
        <button className="link-button" onClick={() => openLesson("dns-and-http")}>
          DNS and HTTP
        </button>{" "}
        ·{" "}
        <button className="link-button" onClick={() => openLesson("sd-interview-video-streaming")}>
          Design a Video Streaming Service
        </button>
      </p>
    </div>
  );
}
