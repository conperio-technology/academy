import { useState } from "react";

// Two parts. The first is a back-of-the-envelope calculator: from a handful of inputs it
// works out request rates, storage and bandwidth the way you would on a whiteboard, and
// prints each line of arithmetic. Units are decimal (1 KB = 1,000 bytes) because that's
// what estimates use. The second is the classic latency table, drawn on a log scale.

// ---- 1. The calculator -------------------------------------------------------------------

interface Inputs {
  dau: number;
  actions: number; // writes per user per day (posts, uploads, messages, new links)
  readRatio: number; // reads per write
  sizeKb: number;
  peak: number;
  years: number;
  replicas: number;
}

const PRESETS: { name: string; inputs: Inputs; note: string }[] = [
  {
    name: "URL shortener",
    inputs: { dau: 100e6, actions: 1, readRatio: 100, sizeKb: 0.5, peak: 2, years: 5, replicas: 3 },
    note: "A URL shortener is read-heavy: each link is created once and clicked many times, and each record is tiny. Reads dominate the QPS, but storage stays modest.",
  },
  {
    name: "Photo sharing",
    inputs: { dau: 500e6, actions: 0.2, readRatio: 50, sizeKb: 2000, peak: 3, years: 10, replicas: 3 },
    note: "Photo sharing has a moderate write rate but huge objects, so storage and bandwidth are the hard part. Numbers like these are why photos go in object storage behind a CDN, not in a database.",
  },
  {
    name: "Chat app",
    inputs: { dau: 500e6, actions: 40, readRatio: 1, sizeKb: 0.1, peak: 5, years: 1, replicas: 3 },
    note: "Chat is write-heavy: every message is a write, and it's read about once. The write QPS is the thing to design for, and the peak factor is high because traffic follows the clock.",
  },
];

const SECONDS_PER_DAY = 86_400;

// 1234567 -> "1.23M". Three significant figures is already more precision than an estimate has.
function count(n: number) {
  const units = ["", "K", "M", "B", "T"];
  let i = 0;
  while (Math.abs(n) >= 1000 && i < units.length - 1) {
    n /= 1000;
    i++;
  }
  return `${Number(n.toPrecision(3)).toLocaleString()}${units[i]}`;
}

function bytes(n: number) {
  const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB"];
  let i = 0;
  while (Math.abs(n) >= 1000 && i < units.length - 1) {
    n /= 1000;
    i++;
  }
  return `${Number(n.toPrecision(3)).toLocaleString()} ${units[i]}`;
}

const FIELDS: { key: keyof Inputs; label: string; step: number }[] = [
  { key: "dau", label: "Daily active users", step: 1e6 },
  { key: "actions", label: "Writes per user per day", step: 0.1 },
  { key: "readRatio", label: "Reads per write (read:write)", step: 1 },
  { key: "sizeKb", label: "Average object size (KB)", step: 0.1 },
  { key: "peak", label: "Peak-to-average factor", step: 0.5 },
  { key: "years", label: "Retention (years)", step: 1 },
  { key: "replicas", label: "Replication factor", step: 1 },
];

function Calculator() {
  const [inputs, setInputs] = useState<Inputs>(PRESETS[0].inputs);
  const [preset, setPreset] = useState<string | null>(PRESETS[0].name);
  const { dau, actions, readRatio, sizeKb, peak, years, replicas } = inputs;

  const writesPerDay = dau * actions;
  const writeQps = writesPerDay / SECONDS_PER_DAY;
  const readQps = writeQps * readRatio;
  const peakQps = (writeQps + readQps) * peak;
  const sizeBytes = sizeKb * 1000;
  const perDay = writesPerDay * sizeBytes;
  const perYear = perDay * 365;
  const total = perYear * years * replicas;
  const egress = readQps * sizeBytes;

  const rows: { label: string; value: string; math: string }[] = [
    { label: "Writes per day", value: count(writesPerDay), math: `${count(dau)} users × ${actions} = ${count(writesPerDay)}` },
    {
      label: "Average write QPS",
      value: `${count(writeQps)}/s`,
      math: `${count(writesPerDay)} / 86,400 s ≈ ${count(writeQps)}/s  (rough: ${count(writesPerDay)} / 10^5 = ${count(writesPerDay / 1e5)}/s)`,
    },
    { label: "Average read QPS", value: `${count(readQps)}/s`, math: `${count(writeQps)}/s × ${readRatio} reads per write = ${count(readQps)}/s` },
    {
      label: "Peak QPS (reads + writes)",
      value: `${count(peakQps)}/s`,
      math: `(${count(writeQps)} + ${count(readQps)})/s × ${peak} = ${count(peakQps)}/s`,
    },
    { label: "New storage per day", value: bytes(perDay), math: `${count(writesPerDay)} × ${bytes(sizeBytes)} = ${bytes(perDay)}` },
    { label: "New storage per year", value: bytes(perYear), math: `${bytes(perDay)} × 365 = ${bytes(perYear)}` },
    {
      label: "Total storage",
      value: bytes(total),
      math: `${bytes(perYear)} × ${years} years × ${replicas} copies = ${bytes(total)}`,
    },
    {
      label: "Outbound bandwidth (average)",
      value: `${bytes(egress)}/s`,
      math: `${count(readQps)} reads/s × ${bytes(sizeBytes)} = ${bytes(egress)}/s ≈ ${Number(((egress * 8) / 1e9).toPrecision(3))} Gbit/s`,
    },
  ];

  const set = (key: keyof Inputs, v: number) => {
    setInputs({ ...inputs, [key]: Number.isFinite(v) && v >= 0 ? v : 0 });
    setPreset(null);
  };
  const note = PRESETS.find((p) => p.name === preset)?.note;

  return (
    <div className="crypto-section">
      <h3>1. Estimate QPS, storage and bandwidth</h3>
      <div className="sql-presets">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            className={p.name === preset ? "active" : ""}
            onClick={() => {
              setInputs(p.inputs);
              setPreset(p.name);
            }}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="tool-inputs cap-inputs">
        {FIELDS.map((f) => (
          <label key={f.key}>
            {f.label}
            <input type="number" min={0} step={f.step} value={inputs[f.key]} onChange={(e) => set(f.key, Number(e.target.value))} />
          </label>
        ))}
      </div>
      <div className="cap-results">
        {rows.map((r) => (
          <div key={r.label} className="cap-row">
            <span className="cap-label">{r.label}</span>
            <strong className="cap-value">{r.value}</strong>
            <code className="cap-math">{r.math}</code>
          </div>
        ))}
      </div>
      <p className="gate-note">
        {note ?? "You've changed the inputs. Notice which outputs move: doubling the object size doubles storage and bandwidth but leaves QPS alone; doubling users doubles everything."}{" "}
        {peakQps > 100_000
          ? `A peak of ${count(peakQps)}/s is far more than one server handles (think a few thousand to tens of thousands of simple requests per second), so this needs many servers behind a load balancer, plus caching.`
          : `A peak of ${count(peakQps)}/s is within reach of a small group of servers.`}
      </p>
    </div>
  );
}

// ---- 2. Latency numbers --------------------------------------------------------------------

// The figures popularised by Jeff Dean and Peter Norvig. Modern hardware is faster for
// memory and SSDs, but the orders of magnitude, and the gaps between them, still hold.
const LATENCIES: { op: string; ns: number }[] = [
  { op: "L1 cache reference", ns: 0.5 },
  { op: "Branch mispredict", ns: 5 },
  { op: "L2 cache reference", ns: 7 },
  { op: "Mutex lock/unlock", ns: 25 },
  { op: "Main memory (RAM) reference", ns: 100 },
  { op: "Compress 1 KB (fast codec)", ns: 3_000 },
  { op: "Send 1 KB over a 1 Gbps network", ns: 10_000 },
  { op: "SSD random read (4 KB)", ns: 150_000 },
  { op: "Read 1 MB sequentially from RAM", ns: 250_000 },
  { op: "Round trip within the same datacenter", ns: 500_000 },
  { op: "Read 1 MB sequentially from SSD", ns: 1_000_000 },
  { op: "Disk seek (spinning disk)", ns: 10_000_000 },
  { op: "Read 1 MB sequentially from spinning disk", ns: 20_000_000 },
  { op: "Packet round trip California to the Netherlands", ns: 150_000_000 },
];

function duration(ns: number) {
  if (ns < 1_000) return `${ns} ns`;
  if (ns < 1_000_000) return `${ns / 1_000} µs`;
  return `${ns / 1_000_000} ms`;
}

// "If an L1 hit took 1 second": scale every row by the same factor and say it in human terms.
function humanSeconds(s: number) {
  const steps: [number, string][] = [
    [365 * 86_400, "years"],
    [30 * 86_400, "months"],
    [86_400, "days"],
    [3_600, "hours"],
    [60, "minutes"],
    [1, "seconds"],
  ];
  for (const [size, name] of steps) {
    if (s >= size) {
      const v = Number((s / size).toPrecision(2));
      return `${v} ${v === 1 ? name.slice(0, -1) : name}`;
    }
  }
  return `${s} seconds`;
}

function LatencyTable() {
  const [picked, setPicked] = useState(4);
  const min = Math.log10(LATENCIES[0].ns);
  const max = Math.log10(LATENCIES[LATENCIES.length - 1].ns);
  const row = LATENCIES[picked];
  const ramRatio = row.ns / 100;

  return (
    <div className="crypto-section">
      <h3>2. Latency numbers every engineer should know</h3>
      <div className="cap-table-wrap">
        <table className="bigo-table cap-latency">
          <thead>
            <tr>
              <th>Operation</th>
              <th>Time</th>
              <th>Log scale</th>
              <th>If an L1 hit took 1 second</th>
            </tr>
          </thead>
          <tbody>
            {LATENCIES.map((l, i) => (
              <tr key={l.op} className={i === picked ? "cap-picked" : ""} onClick={() => setPicked(i)}>
                <td>{l.op}</td>
                <td className="mono">{duration(l.ns)}</td>
                <td className="cap-bar-cell">
                  <div className="cap-bar" style={{ width: `${4 + (96 * (Math.log10(l.ns) - min)) / (max - min)}%` }} />
                </td>
                <td>{humanSeconds(l.ns / 0.5)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="gate-note">
        Click a row to compare. {row.op} takes {duration(row.ns)}, which is{" "}
        {ramRatio >= 1 ? `${count(ramRatio)} times as long as a RAM reference` : `${count(1 / ramRatio)} times faster than a RAM reference`}.
        {" "}Each step on the bar is a factor of ten, so the bar hides how big the gaps are: a cross-continent round trip
        is 300 times a datacenter round trip, which is why you cache close to users and avoid chatty calls between regions.
      </p>
    </div>
  );
}

export function CapacityEstimation() {
  return (
    <div className="tool-widget">
      <Calculator />
      <LatencyTable />
    </div>
  );
}
