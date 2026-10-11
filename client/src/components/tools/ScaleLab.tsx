import { useMemo, useState } from "react";
import { openLesson } from "../../api";
import {
  APP_CONCURRENCY,
  DURATION,
  PRICES,
  SCENARIOS,
  checkGoal,
  sandboxScenario,
  simulate,
  usableServers,
  type LabConfig,
  type RunResult,
  type SandboxSettings,
  type Scenario,
} from "../../scaleLabModel";

const level = (u: number | null) => (u === null ? "" : u >= 0.9 ? "sl-hot" : u >= 0.7 ? "sl-warm" : "sl-ok");
const pctText = (u: number) => (Number.isFinite(u) ? `${Math.round(100 * u)}%` : "down");

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="sl-stepper">
      <span>{label}</span>
      <button aria-label={`Fewer ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
        -
      </button>
      <strong>{value}</strong>
      <button aria-label={`More ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}

const W = 600;
const BAND = { traffic: [6, 46], latency: [58, 178], errors: [190, 226] } as const;
const H = 246;
const L = 40;
const R = 8;

function Timeline({ r, cursor }: { r: RunResult; cursor: number }) {
  const secs = r.seconds;
  const x = (t: number) => L + ((W - L - R) * t) / DURATION;
  const maxRps = Math.max(1, ...secs.map((s) => s.rps + s.botRps));
  const maxLat = Math.max(500, Math.ceil(Math.max(...secs.map((s) => s.p99)) / 500) * 500);
  const yT = (v: number) => BAND.traffic[1] - ((BAND.traffic[1] - BAND.traffic[0]) * v) / maxRps;
  const yL = (v: number) => BAND.latency[1] - ((BAND.latency[1] - BAND.latency[0]) * Math.min(v, maxLat)) / maxLat;
  const yE = (v: number) => BAND.errors[1] - (BAND.errors[1] - BAND.errors[0]) * v;
  const line = (get: (i: number) => number, y: (v: number) => number) =>
    secs.map((s, i) => `${i === 0 ? "M" : "L"}${x(s.t + 0.5).toFixed(1)},${y(get(i)).toFixed(1)}`).join(" ");
  const area = (get: (i: number) => number) =>
    `M${x(0)},${BAND.traffic[1]} ` + secs.map((s, i) => `L${x(s.t + 0.5).toFixed(1)},${yT(get(i)).toFixed(1)}`).join(" ") + ` L${x(DURATION)},${BAND.traffic[1]} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="sl-chart" role="img" aria-label="Traffic, latency and errors over the run">
      <text x={4} y={BAND.traffic[0] + 10} className="rs-axis">
        traffic
      </text>
      <text x={4} y={BAND.traffic[0] + 22} className="rs-axis">
        {Math.round(maxRps)}/s
      </text>
      {secs.some((s) => s.botRps > 0) && <path d={area((i) => secs[i].rps + secs[i].botRps)} className="sl-bot-area" />}
      <path d={area((i) => secs[i].rps)} className="sl-traffic-area" />

      {[0, maxLat / 2, maxLat].map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={yL(v)} y2={yL(v)} className="rs-grid" />
          <text x={L - 4} y={yL(v) + 4} className="rs-axis" textAnchor="end">
            {v >= 1000 ? `${v / 1000}s` : `${v}`}
          </text>
        </g>
      ))}
      <path d={line((i) => secs[i].p99, yL)} className="sl-p99" />
      <path d={line((i) => secs[i].p50, yL)} className="sl-p50" />

      <text x={4} y={BAND.errors[0] + 10} className="rs-axis">
        errors
      </text>
      <line x1={L} x2={W - R} y1={BAND.errors[1]} y2={BAND.errors[1]} className="rs-grid" />
      {secs.map((s) =>
        s.errorRate > 0 ? (
          <rect key={s.t} x={x(s.t)} y={yE(s.errorRate)} width={Math.max(1, x(s.t + 1) - x(s.t) - 0.5)} height={BAND.errors[1] - yE(s.errorRate)} className="sl-err" />
        ) : null,
      )}
      {[0, 30, 60, 90, 120].map((t) => (
        <text key={t} x={x(t)} y={H - 4} className="rs-axis" textAnchor={t === 0 ? "start" : t === DURATION ? "end" : "middle"}>
          {t}s
        </text>
      ))}
      <line x1={x(cursor + 0.5)} x2={x(cursor + 0.5)} y1={BAND.traffic[0]} y2={BAND.errors[1]} className="sl-cursor" />
    </svg>
  );
}

function TierCards({ c, r, t, sc }: { c: LabConfig; r: RunResult; t: number; sc: Scenario }) {
  const s = r.seconds[t];
  const cards: { name: string; detail: string; util: number | null }[] = [];
  if (c.cdn) cards.push({ name: "CDN", detail: `${Math.round(s.rps * sc.mix.static * 0.95)}/s static files served at the edge`, util: null });
  if (c.rateLimiter && s.botRps > 0) cards.push({ name: "Rate limiter", detail: `${Math.round(s.botRps * 0.95)}/s scraper requests answered 429`, util: null });
  cards.push({
    name: `App servers (${s.serversUp} up${!c.loadBalancer && c.appServers > 1 ? `, ${c.appServers - 1} unused: no load balancer` : ""})`,
    detail: `CPU ${pctText(s.appCpu)}, request slots ${pctText(s.appThreads)} (${APP_CONCURRENCY} per server)`,
    util: s.util.app,
  });
  if (c.cache) cards.push({ name: "Cache", detail: `hit rate ${Math.round(100 * s.hitRate)}%`, util: null });
  cards.push({ name: "Database primary", detail: c.replicas > 0 ? "writes" : "reads and writes", util: s.util.primary });
  if (c.replicas > 0) cards.push({ name: `Read replicas (${c.replicas})`, detail: "uncached reads", util: s.util.replicas });
  if (c.queue)
    cards.push({
      name: `Workers (${c.workers})`,
      detail: s.jobDelayS > 0.5 ? `jobs ${Math.round(s.jobDelayS)} s behind` : "keeping up",
      util: s.util.workers,
    });
  cards.push({
    name: "Recommendations service",
    detail: s.breakerOpen ? "circuit breaker open: fallback served" : s.degraded > 0 ? "timing out at 150 ms: fallback served" : "answering normally",
    util: null,
  });
  return (
    <div className="sl-tiers">
      {cards.map((k) => (
        <div key={k.name} className={`sl-tier ${level(k.util)}`}>
          <strong>{k.name}</strong>
          {k.util !== null && (
            <span className="sl-util">
              <span style={{ width: `${Math.min(100, 100 * (Number.isFinite(k.util) ? k.util : 1))}%` }} />
            </span>
          )}
          <span className="cache-small">
            {k.util !== null ? `${pctText(k.util)} busy · ` : ""}
            {k.detail}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ScaleLab() {
  const [scIdx, setScIdx] = useState(0); // SCENARIOS.length = sandbox
  const [config, setConfig] = useState<LabConfig>(SCENARIOS[0].start);
  const [cursor, setCursor] = useState(60);
  const [revealed, setRevealed] = useState(false);
  const [sandbox, setSandbox] = useState<SandboxSettings>({ rps: 600, spike: false, serverDown: false, coldCache: false, slowDependency: false, bot: false });

  const isSandbox = scIdx === SCENARIOS.length;
  const sc = useMemo(() => (isSandbox ? sandboxScenario(sandbox) : SCENARIOS[scIdx]), [isSandbox, sandbox, scIdx]);
  const r = useMemo(() => simulate(sc, config), [sc, config]);
  const checks = checkGoal(sc.goal, r);
  const passed = checks.every((k) => k.ok);

  const pickScenario = (i: number) => {
    setScIdx(i);
    setConfig(i === SCENARIOS.length ? { ...SCENARIOS[0].start, loadBalancer: true, appServers: 3 } : SCENARIOS[i].start);
    setRevealed(false);
  };
  const set = (patch: Partial<LabConfig>) => setConfig((prev) => ({ ...prev, ...patch }));

  const hottest = (["app", "primary", "replicas", "workers"] as const)
    .map((k) => ({ k, v: r.peak[k] }))
    .filter((x) => x.v !== null)
    .sort((a, b) => (b.v ?? 0) - (a.v ?? 0))[0];
  const tierName = { app: "the app servers", primary: "the database primary", replicas: "the read replicas", workers: "the workers" };

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Scenario</h3>
        <div className="sql-presets">
          {SCENARIOS.map((s, i) => (
            <button key={s.id} className={i === scIdx ? "active" : ""} onClick={() => pickScenario(i)}>
              {s.title}
            </button>
          ))}
          <button className={isSandbox ? "active" : ""} onClick={() => pickScenario(SCENARIOS.length)}>
            Sandbox
          </button>
        </div>
        <p>{sc.brief}</p>
        {isSandbox ? (
          <div className="sl-sandbox">
            <label className="tl-slider">
              Base traffic {sandbox.rps} requests/s
              <input type="range" min={100} max={4000} step={100} value={sandbox.rps} onChange={(e) => setSandbox({ ...sandbox, rps: Number(e.target.value) })} />
            </label>
            <div className="rs-toggles">
              {(
                [
                  ["spike", "5x spike from 30 s to 90 s"],
                  ["serverDown", "An app server dies at 40 s"],
                  ["coldCache", "Cache restarts empty at 70 s"],
                  ["slowDependency", "Recommendations take 2 s from 40 s to 100 s"],
                  ["bot", "Scraper sends 2,500/s from 30 s"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="tool-checkbox">
                  <input type="checkbox" checked={sandbox[key]} onChange={(e) => setSandbox({ ...sandbox, [key]: e.target.checked })} /> {label}
                </label>
              ))}
            </div>
          </div>
        ) : (
          <ul className="sl-goals">
            {checks.map((k) => (
              <li key={k.label} className={k.ok ? "sl-goal-ok" : "sl-goal-fail"}>
                {k.ok ? "✓" : "✗"} {k.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="sl-layout">
        <div className="sl-config">
          <h3>Your architecture</h3>
          <label className="tool-checkbox">
            <input type="checkbox" checked={config.loadBalancer} onChange={(e) => set({ loadBalancer: e.target.checked })} /> Load balancer (${PRICES.loadBalancer})
          </label>
          <Stepper label="App servers" value={config.appServers} min={1} max={20} onChange={(n) => set({ appServers: n })} />
          {!config.loadBalancer && config.appServers > 1 && <p className="constraint-fail">Without a load balancer, nothing sends traffic to the extra servers.</p>}
          <label className="tool-checkbox">
            <input type="checkbox" checked={config.cdn} onChange={(e) => set({ cdn: e.target.checked })} /> CDN for static files (${PRICES.cdn})
          </label>
          <label className="tool-checkbox">
            <input type="checkbox" checked={config.cache} onChange={(e) => set({ cache: e.target.checked })} /> Cache for reads (${PRICES.cache})
          </label>
          {config.cache && (
            <label className="tl-slider">
              Hit rate when warm {Math.round(config.cacheHitRate * 100)}%
              <input type="range" min={0.5} max={0.99} step={0.01} value={config.cacheHitRate} onChange={(e) => set({ cacheHitRate: Number(e.target.value) })} />
            </label>
          )}
          <Stepper label="Read replicas" value={config.replicas} min={0} max={5} onChange={(n) => set({ replicas: n })} />
          <label className="tool-checkbox">
            <input type="checkbox" checked={config.queue} onChange={(e) => set({ queue: e.target.checked })} /> Queue for side work (${PRICES.queue})
          </label>
          {config.queue && <Stepper label="Workers" value={config.workers} min={1} max={10} onChange={(n) => set({ workers: n })} />}
          <label className="tool-checkbox">
            <input type="checkbox" checked={config.rateLimiter} onChange={(e) => set({ rateLimiter: e.target.checked })} /> Rate limiter per API key (${PRICES.rateLimiter})
          </label>
          <label className="tool-checkbox">
            <input type="checkbox" checked={config.timeouts} onChange={(e) => set({ timeouts: e.target.checked })} /> Timeout and circuit breaker on recommendations
          </label>
          <p className="gate-note">
            App server ${PRICES.appServer}, replica ${PRICES.replica}, worker ${PRICES.worker}, database primary ${PRICES.database} a month. Made-up
            round prices.
          </p>
          <div className="darr-actions">
            <button onClick={() => pickScenario(scIdx)}>Reset</button>
            {sc.solution && (
              <button
                onClick={() => {
                  setConfig(sc.solution!);
                  setRevealed(true);
                }}
              >
                Show a solution
              </button>
            )}
          </div>
        </div>

        <div className="sl-results">
          <Timeline r={r} cursor={cursor} />
          <div className="rs-legend">
            <span><i className="rs-key sl-key-traffic" /> traffic{sc.events.bot ? " (darker: scraper)" : ""}</span>
            <span><i className="rs-key sl-key-p50" /> p50</span>
            <span><i className="rs-key sl-key-p99" /> p99</span>
            <span><i className="rs-key sl-key-err" /> error rate</span>
          </div>
          <label className="tl-slider">
            Inspect t = {cursor} s: {Math.round(r.seconds[cursor].rps)} requests/s, p99 {Math.round(r.seconds[cursor].p99)} ms, errors{" "}
            {(100 * r.seconds[cursor].errorRate).toFixed(1)}%
            <input type="range" min={0} max={DURATION - 1} value={cursor} onChange={(e) => setCursor(Number(e.target.value))} />
          </label>
          <TierCards c={config} r={r} t={cursor} sc={sc} />
          <div className="tool-readout">
            <div className="readout-cell">
              <span className="readout-label">p50</span>
              <span className="readout-value">{Math.round(r.p50)} ms</span>
            </div>
            <div className="readout-cell">
              <span className="readout-label">p95</span>
              <span className="readout-value">{Math.round(r.p95)} ms</span>
            </div>
            <div className="readout-cell">
              <span className="readout-label">p99</span>
              <span className="readout-value">{Math.round(r.p99)} ms</span>
            </div>
            <div className="readout-cell">
              <span className="readout-label">Errors</span>
              <span className="readout-value">{r.errorPct.toFixed(2)}%</span>
            </div>
            <div className="readout-cell">
              <span className="readout-label">Cost</span>
              <span className="readout-value">${r.cost}/mo</span>
            </div>
            {config.queue && (
              <div className="readout-cell">
                <span className="readout-label">Worst job delay</span>
                <span className="readout-value">{Math.round(r.maxJobDelayS)} s</span>
              </div>
            )}
            {r.degradedPct > 0 && (
              <div className="readout-cell">
                <span className="readout-label">Served with fallback</span>
                <span className="readout-value">{r.degradedPct.toFixed(1)}%</span>
              </div>
            )}
          </div>
          <p className="gate-note">
            Busiest tier over the run: {hottest ? `${tierName[hottest.k]} at ${pctText(hottest.v ?? 0)}` : "none"}.{" "}
            {hottest && (hottest.v ?? 0) > 1
              ? "Over 100% means it can't keep up and turns work away; that is the tier to fix."
              : hottest && (hottest.v ?? 0) > 0.85
                ? "Close to full, so queueing is stretching its latency."
                : "Every tier has headroom."}
            {usableServers(config) === 1 && config.appServers === 1 && !config.loadBalancer ? " One app server is also a single point of failure." : ""}
          </p>
          {!isSandbox && (passed || revealed) && sc.lesson && (
            <div className={passed ? "sl-lesson sl-lesson-pass" : "sl-lesson"}>
              <strong>{passed ? "Passed. What fixed it, and why" : "What fixes it, and why"}</strong>
              <p>{sc.lesson}</p>
            </div>
          )}
          {!isSandbox && !passed && !revealed && (
            <p className="gate-note">
              Change the architecture until every goal is ticked, or{" "}
              <button className="link-button" onClick={() => setRevealed(true)}>
                read the explanation
              </button>
              .
            </p>
          )}
        </div>
      </div>
      <p className="gate-note">
        A teaching model with round numbers and a seeded random generator; see the explanation above for exactly what it assumes. Related:{" "}
        <button className="link-button" onClick={() => openLesson("sd-capacity-estimation")}>
          Back-of-the-Envelope Estimation
        </button>{" "}
        ·{" "}
        <button className="link-button" onClick={() => openLesson("sd-resilience")}>
          Timeouts, Retries, Circuit Breakers and Load Shedding
        </button>
      </p>
    </div>
  );
}
