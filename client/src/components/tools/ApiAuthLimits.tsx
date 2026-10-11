import { useState } from "react";
import { LessonLink } from "./netSecShared";

// Part 1 walks one request through the gates of a photo API: authenticate, rate limit and
// quota, scope, object ownership, handler. Part 2 runs a token-bucket limit against a client
// that retries 429s immediately and one that honours Retry-After, in 100 ms steps. Deterministic.

type CallerId = "anon" | "expired" | "thirdParty" | "ownApp" | "overLimit";
type ReqId = "getOwn" | "upload" | "getOther" | "deleteOther";

const CALLERS: { id: CallerId; label: string; who: string; scopes: string[] }[] = [
  { id: "anon", label: "No credentials", who: "unknown", scopes: [] },
  { id: "expired", label: "Expired access token", who: "unknown", scopes: [] },
  { id: "thirdParty", label: "Print-shop app, token for Alice", who: "Alice via PrintShop", scopes: ["photos:read"] },
  { id: "ownApp", label: "Alice's mobile app", who: "Alice", scopes: ["photos:read", "photos:write"] },
  { id: "overLimit", label: "Alice's app, over its rate limit", who: "Alice", scopes: ["photos:read", "photos:write"] },
];

const REQS: { id: ReqId; line: string; scope: string; owner: "alice" | "bob" | null; ok: string }[] = [
  { id: "getOwn", line: "GET /v1/photos/123", scope: "photos:read", owner: "alice", ok: "200 OK" },
  { id: "upload", line: "POST /v1/photos", scope: "photos:write", owner: null, ok: "201 Created" },
  { id: "getOther", line: "GET /v1/photos/124 (Bob's private photo)", scope: "photos:read", owner: "bob", ok: "200 OK" },
  { id: "deleteOther", line: "DELETE /v1/photos/124 (Bob's photo)", scope: "photos:write", owner: "bob", ok: "204 No Content" },
];

const GATES = ["Authenticate", "Rate limit and quota", "Scope", "Object ownership", "Handler"];

function Gates() {
  const [caller, setCaller] = useState<CallerId>("thirdParty");
  const [req, setReq] = useState<ReqId>("upload");
  const [objectCheck, setObjectCheck] = useState(true);
  const c = CALLERS.find((x) => x.id === caller)!;
  const r = REQS.find((x) => x.id === req)!;

  let stop = 4;
  let status = r.ok;
  let headers = "";
  let why = "";
  if (caller === "anon") {
    stop = 0;
    status = "401 Unauthorized";
    headers = 'WWW-Authenticate: Bearer realm="api"';
    why = "No credentials at all. 401 means \"authenticate first\", and the header says how.";
  } else if (caller === "expired") {
    stop = 0;
    status = "401 Unauthorized";
    headers = 'WWW-Authenticate: Bearer error="invalid_token", error_description="token expired"';
    why = "The token was valid an hour ago. The client should use its refresh token to get a new access token and retry once.";
  } else if (caller === "overLimit") {
    stop = 1;
    status = "429 Too Many Requests";
    headers = "Retry-After: 3\nRateLimit-Limit: 100\nRateLimit-Remaining: 0\nRateLimit-Reset: 3";
    why = "Authenticated, so the limit is counted per user and app rather than per IP. The gateway rejects it cheaply, before any service does work.";
  } else if (!c.scopes.includes(r.scope)) {
    stop = 2;
    status = "403 Forbidden";
    headers = `WWW-Authenticate: Bearer error="insufficient_scope", scope="${r.scope}"`;
    why = `Alice granted PrintShop only ${c.scopes.join(", ")}. The token is valid, but it can't ${r.scope === "photos:write" ? "write" : "read"}, whatever Alice herself may do.`;
  } else if (r.owner === "bob" && objectCheck) {
    stop = 3;
    status = "404 Not Found";
    why = "The scope allows this kind of action, but not on Bob's photo. The service answers 404 rather than 403 so callers can't discover which private photo ids exist.";
  } else if (r.owner === "bob") {
    stop = 4;
    status = r.ok;
    why = "Broken object level authorization (BOLA): the token is valid and has the scope, and nothing checked who owns photo 124. Anyone can walk the ids and read or delete other people's photos. It is number one on the OWASP API Security Top 10.";
  } else {
    why = "Every gate passed. The gateway handled the first two; the service checked the scope and ownership and ran the handler.";
  }
  const bad = r.owner === "bob" && stop === 4;

  return (
    <div className="crypto-section">
      <h3>Part 1: a request goes through the gates</h3>
      <div className="cdn-row">
        <span className="cdn-row-label">Caller</span>
        <div className="sql-presets">
          {CALLERS.map((x) => (
            <button key={x.id} className={x.id === caller ? "active" : ""} onClick={() => setCaller(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
      </div>
      <div className="cdn-row">
        <span className="cdn-row-label">Request</span>
        <div className="sql-presets">
          {REQS.map((x) => (
            <button key={x.id} className={x.id === req ? "active" : ""} onClick={() => setReq(x.id)}>
              {x.line}
            </button>
          ))}
        </div>
      </div>
      <label className="tool-checkbox">
        <input type="checkbox" checked={objectCheck} onChange={(e) => setObjectCheck(e.target.checked)} /> The service checks who owns the photo
      </label>
      <p className="cache-small">
        Caller: {c.who}
        {c.scopes.length > 0 ? `, scopes: ${c.scopes.join(" ")}` : ""}
      </p>
      <ol className="as-steps">
        {GATES.map((g, i) => (
          <li key={g} className={i < stop ? "as-step-ok" : i === stop ? (bad || i < 4 ? "as-step-fail" : "as-step-ok") : "as-step-skipped"}>
            {g}
            {i < 2 ? " (API gateway)" : " (service)"}
            {i < stop ? ": passed" : i === stop ? (i === 4 ? `: ran, ${status}` : `: stopped, ${status}`) : ""}
          </li>
        ))}
      </ol>
      <pre className="algo-code api-http">
        {`HTTP/1.1 ${status}${headers ? "\n" + headers : ""}`}
      </pre>
      <p className={bad ? "constraint-fail" : "gate-note"}>{why}</p>
    </div>
  );
}

const PLANS = {
  free: { label: "Free: burst 10, 2/s, 1,000/day", burst: 10, rate: 2, daily: 1000 },
  pro: { label: "Pro: burst 50, 20/s, 100,000/day", burst: 50, rate: 20, daily: 100000 },
};
type PlanId = keyof typeof PLANS;

interface SimResult {
  perSecond: { sent: number; ok: number; limited: number }[];
  sent: number;
  limited: number;
  finished: number | null;
  lastHeaders: string;
}

function simulate(plan: PlanId, polite: boolean, jobs: number): SimResult {
  const p = PLANS[plan];
  let tokens = p.burst;
  let pending = jobs;
  let resumeAt = 0;
  let sent = 0;
  let limited = 0;
  let finished: number | null = null;
  let lastHeaders = "";
  const perSecond: SimResult["perSecond"] = [];
  let quotaUsed = 0;
  for (let step = 0; step <= 400 && pending > 0; step++) {
    const t = step / 10;
    if (step > 0) tokens = Math.min(p.burst, tokens + p.rate / 10);
    const sec = Math.floor(t);
    perSecond[sec] ??= { sent: 0, ok: 0, limited: 0 };
    if (t + 1e-9 < resumeAt) continue;
    // The naive client fires every pending request each step; the polite one stops at the
    // first 429 and waits for Retry-After.
    const burst = pending;
    for (let i = 0; i < burst; i++) {
      sent++;
      perSecond[sec].sent++;
      if (tokens >= 1) {
        tokens -= 1;
        pending--;
        quotaUsed++;
        perSecond[sec].ok++;
        lastHeaders = `HTTP/1.1 200 OK\nRateLimit-Limit: ${p.burst}\nRateLimit-Remaining: ${Math.floor(tokens)}\nRateLimit-Reset: ${Math.ceil((p.burst - tokens) / p.rate)}\nX-Quota-Remaining: ${p.daily - quotaUsed}`;
        if (pending === 0) finished = t;
      } else {
        limited++;
        perSecond[sec].limited++;
        const retryAfter = Math.max(1, Math.ceil((1 - tokens) / p.rate));
        lastHeaders = `HTTP/1.1 429 Too Many Requests\nRetry-After: ${retryAfter}\nRateLimit-Limit: ${p.burst}\nRateLimit-Remaining: 0\nRateLimit-Reset: ${retryAfter}`;
        if (polite) {
          resumeAt = t + retryAfter;
          break;
        }
      }
    }
  }
  return { perSecond: perSecond.map((x) => x ?? { sent: 0, ok: 0, limited: 0 }), sent, limited, finished, lastHeaders };
}

function Limits() {
  const [plan, setPlan] = useState<PlanId>("free");
  const [polite, setPolite] = useState(false);
  const jobs = 40;
  const r = simulate(plan, polite, jobs);
  const other = simulate(plan, !polite, jobs);
  const max = Math.max(1, ...r.perSecond.map((x) => x.sent));
  return (
    <div className="crypto-section">
      <h3>Part 2: a client sends {jobs} requests at once</h3>
      <div className="sql-presets">
        {(Object.keys(PLANS) as PlanId[]).map((k) => (
          <button key={k} className={k === plan ? "active" : ""} onClick={() => setPlan(k)}>
            {PLANS[k].label}
          </button>
        ))}
      </div>
      <div className="sql-presets">
        <button className={!polite ? "active" : ""} onClick={() => setPolite(false)}>
          Client retries 429s immediately
        </button>
        <button className={polite ? "active" : ""} onClick={() => setPolite(true)}>
          Client waits for Retry-After
        </button>
      </div>
      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">Requests sent</span>
          <span className="readout-value">{r.sent}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">429 responses</span>
          <span className="readout-value">{r.limited}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">All {jobs} done at</span>
          <span className="readout-value">{r.finished === null ? "-" : `${r.finished.toFixed(1)} s`}</span>
        </div>
      </div>
      <div className="api-bars" aria-label="Requests per second">
        {r.perSecond.map((x, i) => (
          <div key={i} className="api-bar-row">
            <span className="mono api-bar-t">{i}s</span>
            <span className="api-bar-track">
              <span className="api-bar-ok" style={{ width: `${(x.ok / max) * 100}%` }} />
              <span className="api-bar-429" style={{ width: `${(x.limited / max) * 100}%` }} />
            </span>
            <span className="mono api-bar-n">
              {x.ok} ok{x.limited ? `, ${x.limited} × 429` : ""}
            </span>
          </div>
        ))}
      </div>
      <span className="readout-label">Last response headers</span>
      <pre className="algo-code api-http">{r.lastHeaders}</pre>
      <p className="gate-note">
        {r.limited === 0 && other.limited === 0
          ? `A burst allowance of ${PLANS[plan].burst} covers all ${jobs} requests at once, so neither client sees a 429. Switch to the free plan.`
          : polite
          ? `The polite client finishes at about the same time (${r.finished?.toFixed(1)} s vs ${other.finished?.toFixed(1)} s) while sending ${other.sent - r.sent} fewer requests. The limit, not the client's eagerness, sets the pace; hammering only adds load to the gateway.`
          : `Retrying immediately doesn't finish any sooner: the bucket refills at ${PLANS[plan].rate} a second whatever the client does. It just sends ${r.sent - other.sent} extra requests that all get 429, which is exactly the retry storm the limit exists to stop.`}
      </p>
    </div>
  );
}

export function ApiAuthLimits() {
  return (
    <div className="tool-widget">
      <Gates />
      <Limits />
      <p className="gate-note">
        Related: <LessonLink id="sd-rate-limiting">Rate Limiting</LessonLink> · <LessonLink id="sd-interview-rate-limiter">Design a Rate Limiter</LessonLink> ·{" "}
        <LessonLink id="security-authn-authz">Authentication and Authorization</LessonLink> ·{" "}
        <LessonLink id="sec-access-control-ssrf-csrf">Access Control Attacks</LessonLink>
      </p>
    </div>
  );
}
