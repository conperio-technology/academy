import { useEffect, useRef, useState } from "react";

// Two small models, no real Docker or cluster involved. The first shows image layers and
// the build cache; the second is a toy Kubernetes control loop: you change what you want
// (replicas, version) or break something (a pod, a node), and every tick the loop nudges
// what's running toward what you asked for.

// ---- 1. Images and layers -------------------------------------------------------------

interface Layer {
  line: string;
  dependsOn: "base" | "project" | "source" | null;
}

const DOCKERFILE: Layer[] = [
  { line: "FROM mcr.microsoft.com/dotnet/sdk:10.0", dependsOn: "base" },
  { line: "WORKDIR /src", dependsOn: null },
  { line: "COPY server.csproj .", dependsOn: "project" },
  { line: "RUN dotnet restore", dependsOn: null },
  { line: "COPY . .", dependsOn: "source" },
  { line: "RUN dotnet publish -c Release -o /app", dependsOn: null },
];

type Change = "none" | "source" | "project" | "base";

const CHANGES: { id: Change; label: string }[] = [
  { id: "none", label: "Build again, nothing changed" },
  { id: "source", label: "Edit Program.cs" },
  { id: "project", label: "Add a NuGet package" },
  { id: "base", label: "Move to a newer SDK image" },
];

// Docker reuses a cached layer until the first step whose inputs changed; from there on,
// every step re-runs, because each layer is built on top of the one before it.
function rebuiltFrom(change: Change) {
  if (change === "none") return DOCKERFILE.length;
  return DOCKERFILE.findIndex((l) => l.dependsOn === change);
}

function ImageLayers() {
  const [change, setChange] = useState<Change | null>(null);
  const firstRebuilt = change === null ? 0 : rebuiltFrom(change);
  const seconds = DOCKERFILE.slice(firstRebuilt).reduce((sum, l) => sum + (l.line.includes("restore") ? 25 : l.line.includes("publish") ? 20 : l.line.startsWith("FROM") ? 15 : 1), 0);

  return (
    <div className="crypto-section">
      <h3>1. An image is a stack of cached layers</h3>
      <div className="sql-presets">
        {CHANGES.map((c) => (
          <button key={c.id} className={c.id === change ? "active" : ""} onClick={() => setChange(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      <ol className="k8s-layers">
        {DOCKERFILE.map((l, i) => {
          const rebuilt = i >= firstRebuilt;
          return (
            <li key={l.line} className={rebuilt ? "k8s-layer k8s-layer-rebuilt" : "k8s-layer"}>
              <code>{l.line}</code>
              <span>{change === null ? "built" : rebuilt ? "rebuilt" : "cached"}</span>
            </li>
          );
        })}
      </ol>
      <p className="gate-note">
        {change === null
          ? "The first build runs every step. Each step's result is saved as a layer. Now change something."
          : change === "none"
            ? "Nothing changed, so every layer comes from the cache and the build takes a second."
            : `Everything from "${DOCKERFILE[firstRebuilt].line}" down re-runs (about ${seconds}s here). ` +
              (change === "source"
                ? "Copying the project file and restoring packages before copying the rest of the code means an ordinary code edit skips the slow restore."
                : change === "project"
                  ? "A package change has to re-run the restore, and everything after it."
                  : "Changing the base image invalidates every layer built on top of it.")}
      </p>
    </div>
  );
}

// ---- 2. The cluster ---------------------------------------------------------------------

type Phase = "pending" | "starting" | "running" | "terminating";

interface Pod {
  id: string;
  version: string;
  node: string | null;
  phase: Phase;
  age: number;
  served: number;
}

interface Cluster {
  nodes: { name: string; up: boolean }[];
  pods: Pod[];
  replicas: number;
  version: string;
  events: string[];
  nextId: number;
  failedRequests: number;
}

const START_TICKS = 2; // how long a container takes to become ready

function podName(n: number) {
  return `web-${((n * 2654435761) >>> 0).toString(36).slice(0, 5)}`;
}

function initialCluster(): Cluster {
  const nodes = ["node-1", "node-2", "node-3"].map((name) => ({ name, up: true }));
  const pods: Pod[] = [0, 1, 2].map((i) => ({
    id: podName(i + 1),
    version: "v1",
    node: nodes[i].name,
    phase: "running",
    age: 10,
    served: 0,
  }));
  return { nodes, pods, replicas: 3, version: "v1", events: [], nextId: 4, failedRequests: 0 };
}

function leastLoadedNode(c: Cluster, pods: Pod[]) {
  const up = c.nodes.filter((n) => n.up);
  if (up.length === 0) return null;
  return up.reduce((best, n) =>
    pods.filter((p) => p.node === n.name).length < pods.filter((p) => p.node === best.name).length ? n : best,
  ).name;
}

// One pass of the Deployment controller, with a rolling update that adds at most one
// extra pod and never drops below the requested count of ready pods.
function reconcile(c: Cluster): Cluster {
  const events: string[] = [];
  let nextId = c.nextId;
  let pods = c.pods
    .filter((p) => p.phase !== "terminating")
    .map((p) => {
      const age = p.age + 1;
      if (p.phase === "pending") {
        const node = leastLoadedNode(c, c.pods);
        if (node) {
          events.push(`Scheduled ${p.id} onto ${node}`);
          return { ...p, node, phase: "starting" as Phase, age: 0 };
        }
        return { ...p, age };
      }
      if (p.phase === "starting" && age >= START_TICKS) {
        events.push(`${p.id} (${p.version}) is ready and receiving traffic`);
        return { ...p, phase: "running" as Phase, age };
      }
      return { ...p, age };
    });

  const live = () => pods.filter((p) => p.phase !== "terminating");
  const create = () => {
    const node = leastLoadedNode(c, pods);
    const pod: Pod = { id: podName(nextId++), version: c.version, node, phase: node ? "starting" : "pending", age: 0, served: 0 };
    pods = [...pods, pod];
    events.push(node ? `Created ${pod.id} (${pod.version}) on ${node}` : `Created ${pod.id}, but no node is available: Pending`);
  };
  const terminate = (pod: Pod) => {
    pods = pods.map((p) => (p.id === pod.id ? { ...p, phase: "terminating" as Phase } : p));
    events.push(`Terminating ${pod.id} (${pod.version})`);
  };

  const old = live().filter((p) => p.version !== c.version);
  const ready = live().filter((p) => p.phase === "running");
  const newStarting = live().some((p) => p.version === c.version && p.phase !== "running");

  if (live().length < c.replicas) {
    create();
  } else if (old.length > 0 && c.replicas > 0) {
    // Rolling update: surge one new pod, and retire an old one only once there are more
    // ready pods than requested, so capacity never dips during the rollout.
    if (ready.length > c.replicas) terminate(old[0]);
    else if (!newStarting && live().length <= c.replicas) create();
  } else if (live().length > c.replicas) {
    terminate(live()[live().length - 1]);
  }

  return { ...c, pods, nextId, events: [...events, ...c.events].slice(0, 8) };
}

function ClusterSim() {
  const [cluster, setCluster] = useState(initialCluster);
  const [paused, setPaused] = useState(false);
  const rr = useRef(0);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setCluster(reconcile), 900);
    return () => clearInterval(timer);
  }, [paused]);

  const update = (fn: (c: Cluster) => Cluster) => setCluster(fn);

  const killPod = () =>
    update((c) => {
      const victim = c.pods.find((p) => p.phase === "running");
      if (!victim) return c;
      return { ...c, pods: c.pods.filter((p) => p !== victim), events: [`${victim.id} crashed`, ...c.events].slice(0, 8) };
    });

  const toggleNode = (name: string) =>
    update((c) => {
      const node = c.nodes.find((n) => n.name === name)!;
      if (node.up) {
        const lost = c.pods.filter((p) => p.node === name);
        return {
          ...c,
          nodes: c.nodes.map((n) => (n.name === name ? { ...n, up: false } : n)),
          pods: c.pods.filter((p) => p.node !== name),
          events: [`${name} went down, taking ${lost.length} pod${lost.length === 1 ? "" : "s"} with it`, ...c.events].slice(0, 8),
        };
      }
      return {
        ...c,
        nodes: c.nodes.map((n) => (n.name === name ? { ...n, up: true } : n)),
        events: [`${name} is back`, ...c.events].slice(0, 8),
      };
    });

  const sendRequests = () =>
    update((c) => {
      const ready = c.pods.filter((p) => p.phase === "running");
      if (ready.length === 0) return { ...c, failedRequests: c.failedRequests + 10, events: ["10 requests failed: 503, no ready pods", ...c.events].slice(0, 8) };
      const served = new Map<string, number>();
      for (let i = 0; i < 10; i++) {
        const pod = ready[rr.current++ % ready.length];
        served.set(pod.id, (served.get(pod.id) ?? 0) + 1);
      }
      return { ...c, pods: c.pods.map((p) => ({ ...p, served: p.served + (served.get(p.id) ?? 0) })) };
    });

  const ready = cluster.pods.filter((p) => p.phase === "running").length;
  const nextVersion = `v${Number(cluster.version.slice(1)) + 1}`;

  return (
    <div className="crypto-section">
      <h3>2. Kubernetes keeps what's running matched to what you asked for</h3>
      <code className="sql-snippet">
        Deployment "web": replicas {cluster.replicas}, image academy:{cluster.version} · Service "web" → {ready} ready pod
        {ready === 1 ? "" : "s"}
      </code>

      <div className="darr-actions k8s-actions">
        <label>
          Replicas{" "}
          <input
            type="number"
            min={0}
            max={6}
            value={cluster.replicas}
            onChange={(e) => update((c) => ({ ...c, replicas: Math.max(0, Math.min(6, Number(e.target.value))) }))}
          />
        </label>
        <button onClick={() => update((c) => ({ ...c, version: nextVersion, events: [`Rolling out academy:${nextVersion}`, ...c.events].slice(0, 8) }))}>
          Roll out {nextVersion}
        </button>
        <button onClick={killPod}>Crash a pod</button>
        <button onClick={sendRequests}>Send 10 requests</button>
        <button onClick={() => setPaused(!paused)}>{paused ? "Resume" : "Pause"} the controller</button>
      </div>

      <div className="k8s-nodes">
        {cluster.nodes.map((n) => (
          <div key={n.name} className={n.up ? "k8s-node" : "k8s-node k8s-node-down"}>
            <div className="k8s-node-head">
              <strong>{n.name}</strong>
              <button onClick={() => toggleNode(n.name)}>{n.up ? "Fail node" : "Bring back"}</button>
            </div>
            {!n.up && <p className="status-text">down</p>}
            {cluster.pods
              .filter((p) => p.node === n.name)
              .map((p) => (
                <div key={p.id} className={`k8s-pod k8s-${p.phase}`}>
                  <span className="mono">{p.id}</span>
                  <span>
                    {p.version} · {p.phase}
                    {p.served > 0 && ` · ${p.served} req`}
                  </span>
                </div>
              ))}
          </div>
        ))}
      </div>
      {cluster.pods.some((p) => p.phase === "pending") && (
        <p className="constraint-fail">
          {cluster.pods.filter((p) => p.phase === "pending").length} pod(s) Pending: no healthy node has room.
        </p>
      )}

      <ul className="k8s-events">
        {cluster.events.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>
    </div>
  );
}

export function ContainersK8s() {
  return (
    <div className="tool-widget">
      <ImageLayers />
      <ClusterSim />
    </div>
  );
}
