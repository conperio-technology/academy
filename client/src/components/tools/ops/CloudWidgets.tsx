import { useMemo, useState } from "react";
import { GIT_CAPTURES, TF_CAPTURES } from "./captures";

// Simulators for the Cloud & DevOps lessons. The Terraform and git widgets replay real
// captures (see captures.ts). The others are small models of how the real systems behave:
// the responsibility split, zones and regions, registries, label selectors, a pipeline and
// a latency graph. Their numbers are made up for teaching, and say so.

// ---- Shared responsibility ------------------------------------------------------------

type Model = "On-premises" | "IaaS" | "PaaS" | "SaaS";
type Owner = "you" | "provider" | "shared";

const LAYERS: { name: string; owners: Record<Model, Owner> }[] = [
  { name: "Your data, and who it's shared with", owners: { "On-premises": "you", IaaS: "you", PaaS: "you", SaaS: "you" } },
  { name: "User accounts, passwords, MFA and permissions", owners: { "On-premises": "you", IaaS: "you", PaaS: "you", SaaS: "you" } },
  { name: "Application code and its settings", owners: { "On-premises": "you", IaaS: "you", PaaS: "you", SaaS: "shared" } },
  { name: "Network rules: who can reach it", owners: { "On-premises": "you", IaaS: "you", PaaS: "shared", SaaS: "provider" } },
  { name: "Runtime and middleware (.NET, web server, database engine)", owners: { "On-premises": "you", IaaS: "you", PaaS: "provider", SaaS: "provider" } },
  { name: "Operating system and its patches", owners: { "On-premises": "you", IaaS: "you", PaaS: "provider", SaaS: "provider" } },
  { name: "Virtualisation (the hypervisor)", owners: { "On-premises": "you", IaaS: "provider", PaaS: "provider", SaaS: "provider" } },
  { name: "Physical servers, disks and network gear", owners: { "On-premises": "you", IaaS: "provider", PaaS: "provider", SaaS: "provider" } },
  { name: "The building: power, cooling, guards", owners: { "On-premises": "you", IaaS: "provider", PaaS: "provider", SaaS: "provider" } },
];

const MODEL_EXAMPLE: Record<Model, string> = {
  "On-premises": "your own servers in your own server room or a rented rack",
  IaaS: "a virtual machine: Azure Virtual Machines, Amazon EC2, Google Compute Engine",
  PaaS: "a managed platform: Azure App Service, Azure SQL Database, Amazon RDS, Google Cloud Run",
  SaaS: "finished software you sign in to: Microsoft 365, Salesforce, GitHub, Slack",
};

const INCIDENTS: { text: string; layer: number; note?: string }[] = [
  { text: "A critical security patch is released for the server's operating system", layer: 5 },
  { text: "An employee shares a folder of customer data with \"anyone with the link\"", layer: 0 },
  { text: "A disk fails in a server", layer: 7 },
  { text: "A former employee's account is still active three months after they left", layer: 1 },
  { text: "A new .NET security update needs installing on the web server", layer: 4 },
  { text: "The database port is reachable from the whole internet", layer: 3, note: "On PaaS you still choose the firewall rules and private networking; the provider runs the firewall itself." },
  { text: "The app's admin page is left with its default password", layer: 2, note: "On SaaS the provider writes the software, but its settings (sharing defaults, admin roles, retention) are yours to get right." },
];

const OWNER_LABEL: Record<Owner, string> = { you: "You", provider: "Cloud provider", shared: "Shared" };

export function SharedResponsibility() {
  const [model, setModel] = useState<Model>("IaaS");
  return (
    <div>
      <div className="sql-presets">
        {(Object.keys(MODEL_EXAMPLE) as Model[]).map((m) => (
          <button key={m} className={m === model ? "active" : ""} onClick={() => setModel(m)}>
            {m}
          </button>
        ))}
      </div>
      <p className="lt-p">
        <strong>{model}</strong>: {MODEL_EXAMPLE[model]}.
      </p>
      <div className="ops-stack" role="table" aria-label={`Who is responsible for each layer with ${model}`}>
        {LAYERS.map((l) => (
          <div key={l.name} className={`ops-layer ops-layer-${l.owners[model]}`} role="row">
            <span role="cell">{l.name}</span>
            <strong role="cell">{OWNER_LABEL[l.owners[model]]}</strong>
          </div>
        ))}
      </div>
      <h4 className="ops-subhead">Whose job is it?</h4>
      <div className="cm-scroll">
        <table className="bigo-table">
          <thead>
            <tr>
              <th>What happened</th>
              <th>With {model}</th>
            </tr>
          </thead>
          <tbody>
            {INCIDENTS.map((i) => {
              const o = LAYERS[i.layer].owners[model];
              return (
                <tr key={i.text}>
                  <td>
                    {i.text}
                    {i.note && o === "shared" && <div className="ops-note-inline">{i.note}</div>}
                  </td>
                  <td className={o === "you" ? "ops-warn" : o === "provider" ? "ops-ok" : ""}>{OWNER_LABEL[o]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="gate-note">
        The split differs a little between providers and services; each publishes its own version. Two rows never move: your data and your user accounts are
        always yours.
      </p>
    </div>
  );
}

// ---- Regions and availability zones ---------------------------------------------------

type Design = "single" | "sameZone" | "zones" | "regions";
type Failure = "vm" | "zone" | "region" | "delete";

const DESIGNS: Record<Design, { label: string; layout: string[][]; cost: string; note: string }> = {
  single: {
    label: "One VM",
    layout: [["web-1, db"], [], []],
    cost: "1x",
    note: "Cheapest, and fine for a test system. Any failure means downtime.",
  },
  sameZone: {
    label: "Two VMs, one zone",
    layout: [["web-1, web-2 behind a load balancer", "db"], [], []],
    cost: "about 2x",
    note: "Survives one server dying, but both copies share the zone's power and network.",
  },
  zones: {
    label: "Spread across zones",
    layout: [["web-1", "db (primary)"], ["web-2", "db (synchronous replica)"], ["web-3"]],
    cost: "about 2.5x, plus traffic between zones",
    note: "The usual production setup: a zone-redundant load balancer and a database replicated to another zone.",
  },
  regions: {
    label: "Second region on standby",
    layout: [["web-1", "db (primary)"], ["web-2", "db (replica)"], ["web-3"]],
    cost: "about 4x",
    note: "Everything in zones, plus a scaled-down copy in another region, a database replica there and DNS that can switch over.",
  },
};

const FAILURES: Record<Failure, string> = {
  vm: "One VM crashes",
  zone: "Zone 1 loses power",
  region: "The whole region is down",
  delete: "Someone runs DELETE FROM orders; by mistake",
};

function outcome(d: Design, f: Failure): { up: boolean; text: string } {
  if (f === "delete")
    return {
      up: false,
      text: "Every copy faithfully replicates the delete within milliseconds. Redundancy protects against hardware and site failures, not against mistakes or ransomware. Only a backup or point-in-time restore helps here, whatever the design.",
    };
  if (f === "vm") {
    if (d === "single") return { up: false, text: "The only server is gone. Down until it's restarted or rebuilt." };
    return { up: true, text: "The load balancer's health checks notice within seconds and stop sending traffic to the dead VM." };
  }
  if (f === "zone") {
    if (d === "single" || d === "sameZone") return { up: false, text: "Everything was in zone 1. Down until the zone recovers." };
    return { up: true, text: "Zones 2 and 3 carry on; the database fails over to its replica in zone 2 automatically. Users may see a few seconds of errors." };
  }
  if (d === "regions")
    return {
      up: true,
      text: "Back up after a failover to the second region: promote its database replica and switch DNS. Minutes, not seconds, and anything not yet replicated (asynchronously, so maybe the last few seconds) is lost.",
    };
  return { up: false, text: "Zones are separate buildings, but they share the region. Down until the region recovers, which is rare but has happened." };
}

export function AvailabilityZones() {
  const [design, setDesign] = useState<Design>("zones");
  const [failure, setFailure] = useState<Failure | null>(null);
  const d = DESIGNS[design];
  const res = failure ? outcome(design, failure) : null;
  const zoneDown = (z: number) => (failure === "zone" && z === 0) || failure === "region";
  return (
    <div>
      <div className="ops-filter-row">
        <span className="ops-group-label">Design</span>
        <div className="sql-presets">
          {(Object.keys(DESIGNS) as Design[]).map((k) => (
            <button key={k} className={k === design ? "active" : ""} onClick={() => setDesign(k)}>
              {DESIGNS[k].label}
            </button>
          ))}
        </div>
      </div>
      <div className="ops-region">
        <div className="ops-region-head">Region West Europe</div>
        <div className="ops-zones">
          {d.layout.map((items, z) => (
            <div key={z} className={`ops-zone ${zoneDown(z) ? "ops-zone-down" : ""}`}>
              <div className="ops-zone-head">Zone {z + 1}</div>
              {items.length === 0 && <div className="ops-note-inline">(nothing here)</div>}
              {items.map((it, i) => (
                <div key={it} className={`ops-zone-item ${failure === "vm" && z === 0 && i === 0 ? "ops-zone-down" : ""}`}>
                  {it}
                </div>
              ))}
            </div>
          ))}
        </div>
        {design === "regions" && (
          <div className="ops-zone ops-standby">
            <div className="ops-zone-head">Region North Europe (standby)</div>
            <div className="ops-zone-item">web-dr-1, db (async replica)</div>
          </div>
        )}
      </div>
      <p className="gate-note">
        {d.note} Rough cost: {d.cost}.
      </p>
      <div className="ops-filter-row">
        <span className="ops-group-label">Then</span>
        <div className="sql-presets">
          {(Object.keys(FAILURES) as Failure[]).map((k) => (
            <button key={k} className={k === failure ? "active" : ""} onClick={() => setFailure(k === failure ? null : k)}>
              {FAILURES[k]}
            </button>
          ))}
        </div>
      </div>
      {res && <p className={res.up ? "constraint-ok" : "constraint-fail"}>{(res.up ? "Still serving. " : "Down. ") + res.text}</p>}
    </div>
  );
}

// ---- Image tags and digests -----------------------------------------------------------

interface Build {
  digest: string;
  commit: string;
  note: string;
}

// Digests are made up but have the real shape: sha256 of the image manifest, 64 hex digits.
const BUILDS: Build[] = [
  { digest: "sha256:3f9a1c0e7b52d8a4f61e9c2b7d0a5e8f3c6b1d4a9e2f7c0b5a8d3e6f1c4b7a92", commit: "a1b2c3d", note: "CI build of v1.4.0" },
  { digest: "sha256:b7e4d2a9c1f05e8b3a6d9c2e7f1a4b8d5c0e3f6a9b2d7e1c4f8a5b0d3e6c9f14", commit: "e4f5a6b", note: "CI build of v1.5.0" },
  { digest: "sha256:9c0d5e2f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c58", commit: "local", note: "built on a laptop, pushed by hand" },
];

const short = (d: string) => d.slice(0, 19) + "...";

export function ImageTags() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState<Record<string, number>>({ latest: 0, "1.4.0": 0, digest: 0 });
  // Registry state after each step: tag -> build index
  const tags: Record<string, number> = useMemo(() => {
    const t: Record<string, number> = { "1.4.0": 0, latest: 0 };
    if (step >= 1) {
      t["1.5.0"] = 1;
      t.latest = 1;
    }
    if (step >= 2) t["1.4.0"] = 2;
    return t;
  }, [step]);
  const refs: { key: string; ref: string; resolve: () => number }[] = [
    { key: "latest", ref: "conperio.azurecr.io/academy:latest", resolve: () => tags.latest },
    { key: "1.4.0", ref: "conperio.azurecr.io/academy:1.4.0", resolve: () => tags["1.4.0"] },
    { key: "digest", ref: `conperio.azurecr.io/academy@${short(BUILDS[0].digest)}`, resolve: () => 0 },
  ];
  const events = [
    "CI builds v1.4.0 and pushes it as :1.4.0 and :latest. All three servers deploy it.",
    "CI builds v1.5.0 and pushes :1.5.0, and moves :latest to it.",
    "Someone builds on their laptop and pushes :1.4.0 again, overwriting the tag.",
  ];
  return (
    <div>
      <div className="sql-presets">
        {events.map((_, i) => (
          <button key={i} className={i === step ? "active" : ""} onClick={() => setStep(i)} disabled={i > step + 1}>
            {i + 1}. {["First release", "Next release", "Tag overwritten"][i]}
          </button>
        ))}
      </div>
      <p className="lt-p">{events[step]}</p>
      <h4 className="ops-subhead">
        Registry: conperio.azurecr.io/academy <span className="ops-note-inline">(digests shortened, and made up for the example)</span>
      </h4>
      <div className="cm-scroll">
        <table className="bigo-table ops-table">
          <thead>
            <tr>
              <th>Tag</th>
              <th>Points at digest</th>
              <th>Which build</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(tags).map(([t, b]) => (
              <tr key={t}>
                <td>
                  <code>:{t}</code>
                </td>
                <td>
                  <code>{short(BUILDS[b].digest)}</code>
                </td>
                <td className={b === 2 ? "ops-bad" : ""}>{BUILDS[b].note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h4 className="ops-subhead">Three servers, three ways to name the image</h4>
      <div className="cm-scroll">
        <table className="bigo-table ops-table">
          <thead>
            <tr>
              <th>Image reference</th>
              <th>Running now</th>
              <th>After a restart (pulls again)</th>
            </tr>
          </thead>
          <tbody>
            {refs.map((r) => {
              const now = running[r.key];
              const next = r.resolve();
              return (
                <tr key={r.key}>
                  <td>
                    <code>{r.ref}</code>
                  </td>
                  <td>{BUILDS[now].note}</td>
                  <td className={next !== now ? "ops-warn" : ""}>{BUILDS[next].note}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="sql-presets">
        <button onClick={() => setRunning({ latest: tags.latest, "1.4.0": tags["1.4.0"], digest: 0 })}>Restart all three servers</button>
        <button
          onClick={() => {
            setStep(0);
            setRunning({ latest: 0, "1.4.0": 0, digest: 0 });
          }}
        >
          Start over
        </button>
      </div>
      <p className="gate-note">
        A tag is a movable name, like a Git branch; a digest is the hash of the image's contents, like a commit ID, and can never point at anything else. Only the
        digest reference is guaranteed to run the same bits every time. Many registries can make tags immutable to stop step 3 happening.
      </p>
    </div>
  );
}

// ---- Kubernetes labels and selectors --------------------------------------------------

interface Pod {
  name: string;
  labels: Record<string, string>;
  ready: boolean;
  why?: string;
}

const START_PODS: Pod[] = [
  { name: "academy-api-7d9f8b6c4-2xkqp", labels: { app: "academy", tier: "api", version: "v1" }, ready: true },
  { name: "academy-api-7d9f8b6c4-m8w2t", labels: { app: "academy", tier: "api", version: "v1" }, ready: true },
  { name: "academy-api-5c47d9f8b-q4lzr", labels: { app: "academy", tier: "api", version: "v2" }, ready: false, why: "readiness probe failing: GET /api/health returned 503" },
  { name: "academy-worker-6b8c5d7f9-hn3vx", labels: { app: "academy", tier: "worker", version: "v1" }, ready: true },
  { name: "billing-api-84f6c9d7b-zr5mn", labels: { app: "billing", tier: "api", version: "v1" }, ready: true },
];

const SELECTOR_KEYS: { key: string; values: string[] }[] = [
  { key: "app", values: ["academy", "billing"] },
  { key: "tier", values: ["api", "worker"] },
  { key: "version", values: ["v1", "v2"] },
];

export function K8sSelectors() {
  const [sel, setSel] = useState<Record<string, string>>({ app: "academy" });
  const [pods, setPods] = useState(START_PODS);
  const matches = (p: Pod) => Object.entries(sel).every(([k, v]) => p.labels[k] === v);
  const endpoints = pods.filter((p) => matches(p) && p.ready);
  const yaml = ["spec:", "  selector:", ...Object.entries(sel).map(([k, v]) => `    ${k}: ${v}`)].join("\n");
  return (
    <div>
      <p className="lt-p">
        Build the Service's selector. A pod receives traffic only if it has <em>every</em> label in the selector and is ready.
      </p>
      {SELECTOR_KEYS.map(({ key, values }) => (
        <div key={key} className="ops-filter-row">
          <code className="ops-group-label">{key}</code>
          <div className="sql-presets">
            <button className={!sel[key] ? "active" : ""} onClick={() => setSel(Object.fromEntries(Object.entries(sel).filter(([k]) => k !== key)))}>
              (not in selector)
            </button>
            {values.map((v) => (
              <button key={v} className={sel[key] === v ? "active" : ""} onClick={() => setSel({ ...sel, [key]: v })}>
                {key}={v}
              </button>
            ))}
          </div>
        </div>
      ))}
      <pre className="algo-code lt-code">{Object.keys(sel).length ? yaml : "spec:\n  selector: {}   # empty: a Service with no selector gets no endpoints automatically"}</pre>
      <div className="cm-scroll">
        <table className="bigo-table ops-table">
          <thead>
            <tr>
              <th>Pod</th>
              <th>Labels</th>
              <th>Ready</th>
              <th>Gets traffic</th>
            </tr>
          </thead>
          <tbody>
            {pods.map((p, i) => {
              const m = matches(p) && Object.keys(sel).length > 0;
              return (
                <tr key={p.name} className={m && p.ready ? "cm-row-on" : m ? "" : "ops-dim"}>
                  <td>
                    <code>{p.name}</code>
                  </td>
                  <td className="ops-mono ops-small">{Object.entries(p.labels).map(([k, v]) => `${k}=${v}`).join(", ")}</td>
                  <td>
                    <button
                      className="link-button"
                      title={p.why}
                      onClick={() => setPods(pods.map((q, j) => (j === i ? { ...q, ready: !q.ready } : q)))}
                    >
                      {p.ready ? "1/1" : "0/1"}
                    </button>
                  </td>
                  <td className={m && p.ready ? "ops-ok" : ""}>{m ? (p.ready ? "yes" : "no: not ready") : "no: labels don't match"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className={endpoints.length ? "constraint-ok" : "constraint-fail"}>
        {Object.keys(sel).length === 0
          ? "No selector, no endpoints."
          : endpoints.length === 0
            ? "The Service has no endpoints: every request to it fails. Check the labels with kubectl get pods --show-labels."
            : `Endpoints: ${endpoints.length} pod${endpoints.length === 1 ? "" : "s"}.`}
        {sel.app === "academy" && !sel.tier && endpoints.some((p) => p.labels.tier === "worker") ? " The worker pod is in there too, which is a bug: it doesn't serve HTTP." : ""}
      </p>
      <p className="gate-note">Click a Ready value to make a pod's readiness probe pass or fail. The v2 pod is failing its probe; until it passes, it gets no traffic even with a matching label.</p>
    </div>
  );
}

// ---- CI/CD pipeline -------------------------------------------------------------------

type Trigger = "pr" | "main";
type StageState = "passed" | "failed" | "skipped" | "not run" | "waiting" | "rejected";

const STAGES: { id: string; name: string; job: "ci" | "cd"; mainOnly?: boolean; detail: string; fail: string }[] = [
  { id: "lint", name: "Lint and format check", job: "ci", detail: "eslint, dotnet format --verify-no-changes", fail: "src/App.tsx: 'user' is assigned a value but never used" },
  { id: "test", name: "Unit tests", job: "ci", detail: "npm test, dotnet test", fail: "OrderTotalsTests.AppliesDiscount: expected 90, got 100" },
  { id: "build", name: "Build container image", job: "ci", detail: "docker build -t academy:${GITHUB_SHA} .", fail: "npm ci: package-lock.json is out of sync with package.json" },
  { id: "scan", name: "Scan image for known vulnerabilities", job: "ci", detail: "fail on any CRITICAL finding", fail: "CRITICAL: openssl 3.0.2 has a known vulnerability, fixed in a newer version" },
  { id: "push", name: "Push image to registry", job: "cd", mainOnly: true, detail: "conperio.azurecr.io/academy:<commit sha>", fail: "unauthorized: authentication required" },
  { id: "staging", name: "Deploy to staging", job: "cd", mainOnly: true, detail: "same image, staging settings", fail: "rollout timed out: 0 of 2 new pods became ready" },
  { id: "smoke", name: "Smoke tests against staging", job: "cd", mainOnly: true, detail: "sign in, open a lesson, submit an answer", fail: "GET /api/me returned 500" },
  { id: "approve", name: "Approval for production", job: "cd", mainOnly: true, detail: "a required reviewer on the production environment", fail: "" },
  { id: "prod", name: "Deploy to production", job: "cd", mainOnly: true, detail: "the exact image that passed staging", fail: "rollout timed out: 0 of 3 new pods became ready" },
];

const STATE_MARK: Record<StageState, string> = { passed: "✓", failed: "✗", skipped: "-", "not run": "·", waiting: "…", rejected: "✗" };

export function CicdPipeline() {
  const [trigger, setTrigger] = useState<Trigger>("pr");
  const [broken, setBroken] = useState<string>("none");
  const [approval, setApproval] = useState<"pending" | "approved" | "rejected">("pending");
  const states: StageState[] = [];
  let stopped = false;
  for (const s of STAGES) {
    if (s.mainOnly && trigger === "pr") states.push("skipped");
    else if (stopped) states.push("not run");
    else if (s.id === "approve") {
      if (approval === "pending") {
        states.push("waiting");
        stopped = true;
      } else if (approval === "rejected") {
        states.push("rejected");
        stopped = true;
      } else states.push("passed");
    } else if (s.id === broken) {
      states.push("failed");
      stopped = true;
    } else states.push("passed");
  }
  const failed = STAGES.find((_, i) => states[i] === "failed");
  const summary =
    trigger === "pr"
      ? failed
        ? `The pull request shows a red ✗ and, with branch protection on, the Merge button stays disabled until a new commit fixes it.`
        : "All checks pass: the pull request shows a green ✓ and can be merged once a reviewer approves. Nothing was deployed: pull requests only build and test."
      : failed
        ? failed.job === "ci"
          ? "main is broken: the pipeline stopped before building anything deployable. Fixing main comes before anything else, because everyone branches from it."
          : "The deployment stopped. Production still runs the previous version, untouched; staging may need a rollback."
        : approval === "pending"
          ? "Staging is updated and tested. The pipeline is paused until someone approves the production deployment."
          : approval === "rejected"
            ? "Not released. The image stays in the registry, so approving a later run can still ship it."
            : "Released. The image in production is byte for byte the one that passed the tests and staging.";
  return (
    <div>
      <div className="ops-filter-row">
        <span className="ops-group-label">Triggered by</span>
        <div className="sql-presets">
          <button className={trigger === "pr" ? "active" : ""} onClick={() => setTrigger("pr")}>
            a pull request
          </button>
          <button className={trigger === "main" ? "active" : ""} onClick={() => setTrigger("main")}>
            a merge to main
          </button>
        </div>
      </div>
      <div className="ops-filter-row">
        <label>
          Make this stage fail{" "}
          <select className="ops-select" value={broken} onChange={(e) => setBroken(e.target.value)}>
            <option value="none">none</option>
            {STAGES.filter((s) => s.fail).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ol className="ops-pipe">
        {STAGES.map((s, i) => (
          <li key={s.id} className={`ops-pipe-stage ops-pipe-${states[i].replace(" ", "-")}`}>
            <span className="ops-pipe-mark" aria-hidden="true">
              {STATE_MARK[states[i]]}
            </span>
            <div className="ops-pipe-body">
              <strong>{s.name}</strong> <span className="ops-note-inline">{states[i]}</span>
              <div className="ops-note-inline ops-mono">{states[i] === "failed" ? s.fail : s.detail}</div>
              {s.id === "approve" && states[i] === "waiting" && (
                <div className="sql-presets">
                  <button onClick={() => setApproval("approved")}>Approve</button>
                  <button onClick={() => setApproval("rejected")}>Reject</button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      {approval !== "pending" && trigger === "main" && (
        <div className="sql-presets">
          <button onClick={() => setApproval("pending")}>Reset the approval</button>
        </div>
      )}
      <p className={failed || approval === "rejected" ? "constraint-fail" : "constraint-ok"}>{summary}</p>
    </div>
  );
}

// ---- Terraform plan -------------------------------------------------------------------

type TfScenario = "create" | "nochange" | "update" | "replace" | "drift" | "rename" | "moved";

const TF_SCENARIOS: { id: TfScenario; label: string; change: string; cmd: string; lesson: string }[] = [
  {
    id: "create",
    label: "First run",
    change: "Nothing exists yet and the state is empty.",
    cmd: "terraform plan -out=tfplan",
    lesson: "Every resource is new, so everything is + create. Values the provider only learns when it creates the thing, like IDs and hashes, show as (known after apply).",
  },
  {
    id: "nochange",
    label: "Plan again",
    change: "Applied. Nothing changed since.",
    cmd: "terraform plan",
    lesson: "Terraform reads the real objects (the Refreshing state lines), compares them with the code, finds nothing to do. This is what you want to see most days.",
  },
  {
    id: "update",
    label: "Change a setting",
    change: 'In terraform_data.release, version = "1.4.0" became "1.5.0".',
    cmd: "terraform plan",
    lesson: "~ update in-place: the object is changed where it stands. In a real cloud that's things like tags, a VM size or an app setting.",
  },
  {
    id: "replace",
    label: "Change something that forces a new object",
    change: "The replicas variable went from 2 to 3, which changes the file's content.",
    cmd: "terraform plan",
    lesson: "-/+ destroy and then create replacement, and the line that causes it is marked # forces replacement. A local file can't be edited in place by this provider. In a real cloud, changing a VM's image, a database's name or a storage account's region does the same, and a replaced database is an empty database. Read every -/+ before you apply.",
  },
  {
    id: "drift",
    label: "Someone changed it by hand",
    change: "Someone edited out/staging/app.json directly (replicas 5), outside Terraform.",
    cmd: "terraform plan",
    lesson: "This is drift. The local provider treats a file whose contents no longer match as gone, so the plan is to write it again from the code: Terraform puts back what the code says, undoing the hand edit. Cloud providers usually show a ~ update back to the coded value instead.",
  },
  {
    id: "rename",
    label: "Rename a resource",
    change: "terraform_data.release was renamed to terraform_data.app_release in the code.",
    cmd: "terraform plan",
    lesson: "Terraform tracks objects by their address in the code. A new address looks like a new object, and the old address is no longer in the configuration, so it plans to destroy one and create another. For a database, that's data loss from a tidy-up.",
  },
  {
    id: "moved",
    label: "Rename with a moved block",
    change: "Same rename, plus a moved { from = terraform_data.release, to = terraform_data.app_release } block.",
    cmd: "terraform plan",
    lesson: "The moved block tells Terraform it's the same object under a new name: 0 to add, 0 to change, 0 to destroy.",
  },
];

export function IacPlan() {
  const [id, setId] = useState<TfScenario>("create");
  const s = TF_SCENARIOS.find((x) => x.id === id)!;
  const out = TF_CAPTURES[id];
  const summary = out.split("\n").find((l) => l.startsWith("Plan:") || l.startsWith("No changes."));
  return (
    <div>
      <div className="sql-presets">
        {TF_SCENARIOS.map((x) => (
          <button key={x.id} className={x.id === id ? "active" : ""} onClick={() => setId(x.id)}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="lt-p">
        <strong>The change:</strong> {s.change}
      </p>
      {summary && <p className={summary.includes("destroy") && !summary.includes("0 to destroy") ? "constraint-fail" : "constraint-ok"}>{summary}</p>}
      <div className="lt-pane-head">
        <span className="lt-lang">terminal</span>
      </div>
      <pre className="algo-code lt-code ops-output ops-tf">{`$ ${s.cmd}\n${out}`}</pre>
      <p className="lt-p">{s.lesson}</p>
    </div>
  );
}

// ---- Observability: metrics, alert, trace, logs ---------------------------------------

// One synthetic hour of an API's latency, in milliseconds. A database lock between minutes
// 31 and 43 makes the slowest requests very slow while the median barely moves.
const MINUTES = 60;
const P50 = Array.from({ length: MINUTES }, (_, m) => 42 + ((m * 7) % 9) + (m >= 31 && m <= 43 ? 18 : 0));
const P99 = Array.from({ length: MINUTES }, (_, m) => {
  const base = 180 + ((m * 13) % 40);
  if (m === 12) return 690; // one noisy minute
  if (m >= 31 && m <= 43) return 1400 + ((m * 37) % 900);
  return base;
});

function alertTimeline(threshold: number, forMin: number) {
  const fired: { start: number; end: number }[] = [];
  let run = 0;
  let open: number | null = null;
  for (let m = 0; m < MINUTES; m++) {
    if (P99[m] > threshold) {
      run++;
      if (run >= forMin && open === null) open = m;
    } else {
      run = 0;
      if (open !== null) {
        fired.push({ start: open, end: m });
        open = null;
      }
    }
  }
  if (open !== null) fired.push({ start: open, end: MINUTES });
  return fired;
}

const SPANS: { name: string; service: string; start: number; dur: number; depth: number; logs: string[] }[] = [
  {
    name: "GET /api/orders/1842",
    service: "gateway",
    start: 0,
    dur: 2214,
    depth: 0,
    logs: ['{"ts":"10:38:14.002","level":"info","service":"gateway","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","msg":"request","path":"/api/orders/1842","status":200,"ms":2214}'],
  },
  { name: "check token", service: "gateway", start: 3, dur: 11, depth: 1, logs: [] },
  {
    name: "GET /orders/1842",
    service: "orders-api",
    start: 18,
    dur: 2190,
    depth: 1,
    logs: ['{"ts":"10:38:16.205","level":"warn","service":"orders-api","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","msg":"slow request","ms":2190}'],
  },
  { name: "cache GET order:1842", service: "orders-api", start: 21, dur: 2, depth: 2, logs: ['{"ts":"10:38:14.023","level":"debug","service":"orders-api","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","msg":"cache miss","key":"order:1842"}'] },
  {
    name: "SELECT ... FROM orders WHERE id = $1",
    service: "postgres",
    start: 25,
    dur: 2161,
    depth: 2,
    logs: [
      '{"ts":"10:38:16.186","level":"warn","service":"orders-api","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","msg":"query slow","ms":2161,"waited_for_lock":true}',
      "10:38:16.185 UTC [4112] LOG:  process 4112 still waiting for ShareLock on transaction 99812 after 1000.083 ms",
    ],
  },
  { name: "render JSON", service: "orders-api", start: 2188, dur: 4, depth: 2, logs: [] },
];

export function Observability() {
  const [threshold, setThreshold] = useState(500);
  const [forMin, setForMin] = useState(5);
  const [span, setSpan] = useState(4);
  const W = 600;
  const H = 180;
  const maxY = 2500;
  const x = (m: number) => 30 + (m / (MINUTES - 1)) * (W - 40);
  const y = (v: number) => H - 20 - (Math.min(v, maxY) / maxY) * (H - 30);
  const line = (arr: number[]) => arr.map((v, m) => `${m ? "L" : "M"}${x(m).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const fired = alertTimeline(threshold, forMin);
  const missed = !fired.some((f) => f.start >= 31 && f.start <= 43);
  const noisy = fired.some((f) => f.start < 31);
  const total = SPANS[0].dur;
  return (
    <div>
      <h4 className="ops-subhead">1. Metrics: the API's latency over one hour</h4>
      <div className="ops-chart">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Latency chart: p50 stays near 50 ms, p99 jumps above 1400 ms between minutes 31 and 43">
          {fired.map((f, i) => (
            <rect key={i} x={x(f.start)} y={8} width={Math.max(2, x(Math.min(f.end, MINUTES - 1)) - x(f.start))} height={H - 28} className="ops-chart-alert" />
          ))}
          {[0, 500, 1000, 1500, 2000, 2500].map((v) => (
            <g key={v}>
              <line x1={30} x2={W - 10} y1={y(v)} y2={y(v)} className="ops-chart-grid" />
              <text x={26} y={y(v) + 4} className="ops-chart-label" textAnchor="end">
                {v}
              </text>
            </g>
          ))}
          <line x1={30} x2={W - 10} y1={y(threshold)} y2={y(threshold)} className="ops-chart-threshold" />
          <path d={line(P99)} className="ops-chart-p99" />
          <path d={line(P50)} className="ops-chart-p50" />
          {[0, 15, 30, 45, 59].map((m) => (
            <text key={m} x={x(m)} y={H - 4} className="ops-chart-label" textAnchor={m === 59 ? "end" : "middle"}>
              10:{String(m).padStart(2, "0")}
            </text>
          ))}
        </svg>
        <div className="ops-chart-legend">
          <span className="ops-legend-p99">p99 (ms)</span> <span className="ops-legend-p50">p50 (ms)</span> <span className="ops-legend-th">alert threshold</span>{" "}
          <span className="ops-legend-alert">alert firing</span>
        </div>
      </div>
      <div className="ops-filter-row">
        <label className="ops-grow">
          Alert when p99 &gt; <strong>{threshold} ms</strong>
          <input type="range" min={200} max={2000} step={50} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} aria-label="Alert threshold in milliseconds" />
        </label>
        <label>
          for{" "}
          <select className="ops-select" value={forMin} onChange={(e) => setForMin(Number(e.target.value))}>
            {[1, 3, 5, 10].map((n) => (
              <option key={n} value={n}>
                {n} minute{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>
      <pre className="algo-code lt-code">{`# Prometheus alerting rule
- alert: ApiSlow
  expr: histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket{job="orders-api"}[5m]))) > ${threshold / 1000}
  for: ${forMin}m`}</pre>
      <p className={missed ? "constraint-fail" : noisy ? "ops-warn" : "constraint-ok"}>
        {fired.length === 0
          ? "The alert never fires. The incident between 10:31 and 10:43 goes unnoticed until customers complain."
          : `Fired ${fired.length} time${fired.length > 1 ? "s" : ""}: ${fired.map((f) => `10:${String(f.start).padStart(2, "0")}`).join(", ")}. ` +
            (missed ? "It missed the real incident." : noisy ? "It caught the incident, but also paged someone at night for one slow minute at 10:12. That's how alert fatigue starts." : "It caught the incident and stayed quiet otherwise.")}
      </p>
      <p className="gate-note">The median (p50) barely moved: most users were fine. Averages and medians hide exactly the problem the slowest 1% feel.</p>

      <h4 className="ops-subhead">2. Traces: one slow request from 10:38</h4>
      <div className="ops-trace">
        {SPANS.map((s, i) => (
          <button key={i} className={`ops-span ${i === span ? "active" : ""}`} onClick={() => setSpan(i)}>
            <span className="ops-span-name" style={{ paddingLeft: s.depth * 12 }}>
              {s.name} <span className="ops-note-inline">{s.service}</span>
            </span>
            <span className="ops-span-track">
              <span className="ops-span-bar" style={{ left: `${(s.start / total) * 100}%`, width: `${Math.max(0.6, (s.dur / total) * 100)}%` }} />
            </span>
            <span className="ops-span-ms">{s.dur} ms</span>
          </button>
        ))}
      </div>
      <h4 className="ops-subhead">3. Logs for that span (trace_id 4bf92f3577b34da6a3ce929d0e0e4736)</h4>
      <pre className="algo-code lt-code ops-output ops-wrap">{SPANS[span].logs.length ? SPANS[span].logs.join("\n") : "(no log lines for this span)"}</pre>
      <p className="gate-note">
        Metrics said <em>something</em> is slow; the trace said <em>where</em> (the database query, waiting for a lock); the logs said <em>why</em>. The trace ID in every
        log line is what joins them up. The data here is made up for the exercise.
      </p>
    </div>
  );
}

// ---- Git team workflows ---------------------------------------------------------------

type Strategy = "merge" | "squash" | "rebase";

const STRATEGIES: { id: Strategy; label: string; button: string; pros: string; cons: string }[] = [
  {
    id: "merge",
    label: "Merge commit",
    button: "GitHub: Create a merge commit",
    pros: "Keeps every commit exactly as it was, plus a merge commit recording when the branch came in. Nothing is rewritten.",
    cons: "History becomes a braid of parallel lines, and every \"fix typo\" commit stays forever.",
  },
  {
    id: "squash",
    label: "Squash",
    button: "GitHub: Squash and merge",
    pros: "One tidy commit per pull request on main, usually ending in the PR number. Easy to read, easy to revert as a unit.",
    cons: "The branch's individual commits aren't on main. The branch's own commits now look unmerged to Git, so delete the branch afterwards.",
  },
  {
    id: "rebase",
    label: "Rebase",
    button: "GitHub: Rebase and merge",
    pros: "A straight line, keeping each commit. Good when every commit on the branch is meaningful on its own.",
    cons: "The commits are rewritten: new hashes (fa0163a became 4795a1c). Never rebase commits that others have already built on.",
  },
];

export function GitTeamFlow() {
  const [id, setId] = useState<Strategy>("merge");
  const s = STRATEGIES.find((x) => x.id === id)!;
  return (
    <div>
      <div className="sql-presets">
        {STRATEGIES.map((x) => (
          <button key={x.id} className={x.id === id ? "active" : ""} onClick={() => setId(x.id)}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="gate-note">
        The same starting point every time: feature/export has two commits, and main has moved on by one. The button on a pull request page is <em>{s.button}</em>; the
        commands below do the same thing by hand.
      </p>
      <div className="lt-pane-head">
        <span className="lt-lang">terminal</span>
      </div>
      <pre className="algo-code lt-code ops-output">{GIT_CAPTURES[id]}</pre>
      <div className="ops-split-grid">
        <div className="ops-card">
          <strong className="ops-ok">Good</strong>
          <p className="lt-p">{s.pros}</p>
        </div>
        <div className="ops-card">
          <strong className="ops-warn">Watch out</strong>
          <p className="lt-p">{s.cons}</p>
        </div>
      </div>
    </div>
  );
}
