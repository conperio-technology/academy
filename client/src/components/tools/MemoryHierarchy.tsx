import { useEffect, useMemo, useState } from "react";
import { openLesson } from "../../api";

// Three parts: latency numbers scaled to human time; a toy cache (8x8 int matrix, 4 ints
// per cache line, room for 4 lines, least-recently-used eviction) walked row by row or
// column by column; and a virtual-to-physical address translator with a 2-entry TLB and
// a page table whose pages can be resident, swapped out, untouched, or unmapped.

const LATENCY: { what: string; ns: number; note: string }[] = [
  { what: "CPU register", ns: 0.3, note: "about one clock cycle" },
  { what: "L1 cache hit", ns: 1, note: "32 to 64 KB per core" },
  { what: "L2 cache hit", ns: 4, note: "0.5 to 2 MB per core" },
  { what: "L3 cache hit", ns: 15, note: "8 to 100+ MB, shared by cores" },
  { what: "Uncontended lock", ns: 20, note: "an atomic instruction or two" },
  { what: "Main memory (RAM)", ns: 100, note: "a cache miss all the way down" },
  { what: "Thread context switch", ns: 3_000, note: "1 to 5 μs, plus colder caches" },
  { what: "NVMe SSD random read", ns: 50_000, note: "tens of μs" },
  { what: "Network round trip, same datacenter", ns: 500_000, note: "about 0.5 ms" },
  { what: "Hard disk seek", ns: 10_000_000, note: "about 10 ms" },
  { what: "Network round trip, California to the Netherlands", ns: 150_000_000, note: "speed of light in fibre" },
];

function human(seconds: number): string {
  const units: [number, string][] = [
    [365 * 86400, "years"],
    [30 * 86400, "months"],
    [86400, "days"],
    [3600, "hours"],
    [60, "minutes"],
    [1, "seconds"],
  ];
  for (const [size, name] of units) {
    if (seconds >= size) {
      const v = seconds / size;
      return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${name}`;
    }
  }
  return `${seconds.toFixed(1)} seconds`;
}

function formatNs(ns: number): string {
  if (ns >= 1_000_000) return `${ns / 1_000_000} ms`;
  if (ns >= 1_000) return `${ns / 1_000} μs`;
  return `${ns} ns`;
}

// ---- cache simulator ----

const SIZE = 8;
const LINE = 4; // ints per cache line (real hardware: 64 bytes = 16 ints)
const CACHE_LINES = 4;

interface Access {
  r: number;
  c: number;
  line: number;
  hit: boolean;
  cache: number[]; // lines in cache after this access, most recent first
}

function walk(order: "row" | "col"): Access[] {
  const out: Access[] = [];
  let cache: number[] = [];
  for (let a = 0; a < SIZE; a++) {
    for (let b = 0; b < SIZE; b++) {
      const [r, c] = order === "row" ? [a, b] : [b, a];
      const line = Math.floor((r * SIZE + c) / LINE);
      const hit = cache.includes(line);
      cache = [line, ...cache.filter((l) => l !== line)].slice(0, CACHE_LINES);
      out.push({ r, c, line, hit, cache });
    }
  }
  return out;
}

// ---- address translation ----

const PAGE = 0x1000; // 4 KB pages: the low 12 bits are the offset

type Pte =
  | { kind: "mapped"; frame: number; what: string }
  | { kind: "disk"; what: string }
  | { kind: "lazy"; what: string }
  | { kind: "unmapped"; what: string };

const INITIAL_TABLE: Pte[] = [
  { kind: "unmapped", what: "left unmapped on purpose, so a null dereference crashes" },
  { kind: "mapped", frame: 0x5, what: "code" },
  { kind: "mapped", frame: 0x9, what: "heap" },
  { kind: "mapped", frame: 0x2, what: "heap" },
  { kind: "disk", what: "heap, swapped out to disk" },
  { kind: "lazy", what: "heap, allocated but never touched" },
  { kind: "unmapped", what: "never allocated" },
  { kind: "mapped", frame: 0x1, what: "stack" },
];
const FREE_FRAMES = [0xc, 0x7, 0xe, 0x3];

interface Vm {
  table: Pte[];
  tlb: { page: number; frame: number }[];
  free: number[];
}

const VSTART: Vm = { table: INITIAL_TABLE, tlb: [], free: FREE_FRAMES };

interface Translation {
  steps: string[];
  outcome: "hit" | "walk" | "minor" | "major" | "segv";
  physical: number | null;
  vm: Vm;
}

const hex = (n: number, w = 4) => "0x" + n.toString(16).toUpperCase().padStart(w, "0");

function translate(vm: Vm, addr: number): Translation {
  const page = Math.floor(addr / PAGE);
  const offset = addr % PAGE;
  const steps = [`${hex(addr)} splits into page ${page} and offset ${hex(offset, 3)} (the low 12 bits).`];
  const touch = (tlb: Vm["tlb"], frame: number) => [{ page, frame }, ...tlb.filter((e) => e.page !== page)].slice(0, 2);

  const cached = vm.tlb.find((e) => e.page === page);
  if (cached) {
    steps.push(`TLB hit: page ${page} → frame ${hex(cached.frame, 1)}. No page table lookup needed; this costs about nothing.`);
    return { steps, outcome: "hit", physical: cached.frame * PAGE + offset, vm: { ...vm, tlb: touch(vm.tlb, cached.frame) } };
  }
  steps.push("TLB miss: walk the page table in memory (on x86-64 that's up to 4 dependent memory reads).");

  const pte = vm.table[page];
  if (!pte || pte.kind === "unmapped") {
    steps.push(`Page ${page} is not mapped (${pte ? pte.what : "beyond the end of this process's table"}).`);
    steps.push("The CPU raises a fault, the OS finds no valid mapping, and the process gets an access violation (SIGSEGV on Linux) and is killed.");
    return { steps, outcome: "segv", physical: null, vm };
  }
  if (pte.kind === "mapped") {
    steps.push(`Page table: page ${page} → frame ${hex(pte.frame, 1)} (${pte.what}). The translation is stored in the TLB for next time.`);
    return { steps, outcome: "walk", physical: pte.frame * PAGE + offset, vm: { ...vm, tlb: touch(vm.tlb, pte.frame) } };
  }

  const [frame, ...free] = vm.free.length ? vm.free : [0xf];
  const table = vm.table.map((p, i) => (i === page ? ({ kind: "mapped", frame, what: p.what.split(",")[0] } as Pte) : p));
  if (pte.kind === "lazy") {
    steps.push(`Page fault: page ${page} is valid but has never been touched, so no physical memory backs it yet.`);
    steps.push(`Minor fault: the OS grabs a zeroed frame (${hex(frame, 1)}), fills in the page table entry, and restarts the instruction. Microseconds.`);
    return { steps, outcome: "minor", physical: frame * PAGE + offset, vm: { table, free, tlb: touch(vm.tlb, frame) } };
  }
  steps.push(`Page fault: page ${page} was swapped out to disk to make room for other pages.`);
  steps.push(`Major fault: the OS reads the 4 KB page back from disk into frame ${hex(frame, 1)}, updates the table and restarts the instruction. The thread waits the whole time: tens of μs on an SSD, milliseconds on a hard disk.`);
  return { steps, outcome: "major", physical: frame * PAGE + offset, vm: { table, free, tlb: touch(vm.tlb, frame) } };
}

const ADDRESSES = [0x1234, 0x1f00, 0x2468, 0x7ff8, 0x5008, 0x4010, 0x0000, 0x6abc];

const OUTCOME_TEXT: Record<Translation["outcome"], string> = {
  hit: "TLB hit",
  walk: "TLB miss, page table hit",
  minor: "minor page fault",
  major: "major page fault",
  segv: "segmentation fault",
};

export function MemoryHierarchy() {
  const [order, setOrder] = useState<"row" | "col">("row");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [vm, setVm] = useState<Vm>(VSTART);
  const [last, setLast] = useState<Translation | null>(null);
  const [input, setInput] = useState("3A7C");

  const accesses = useMemo(() => walk(order), [order]);
  const cur = accesses[step];
  const hits = accesses.slice(0, step + 1).filter((a) => a.hit).length;
  const misses = step + 1 - hits;

  // Playback stops by itself at the last access: "running" is derived, not stored.
  const running = playing && step < SIZE * SIZE - 1;
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, SIZE * SIZE - 1)), 120);
    return () => clearInterval(timer);
  }, [running]);

  const lookup = (addr: number) => {
    const t = translate(vm, addr);
    setVm(t.vm);
    setLast(t);
  };
  const parsed = parseInt(input.replace(/^0x/i, ""), 16);
  const validInput = /^(0x)?[0-9a-f]{1,4}$/i.test(input.trim()) && parsed >= 0 && parsed <= 0xffff;

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Latency numbers, if an L1 hit took one second</h3>
        <p className="gate-note">
          The levels themselves are introduced in{" "}
          <button className="link-button" onClick={() => openLesson("computer-architecture")}>
            Computer Architecture
          </button>
          . These are rough, order-of-magnitude figures for current hardware: the ratios matter, not the digits.
        </p>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Operation</th>
                <th>Real time</th>
                <th>Scaled</th>
              </tr>
            </thead>
            <tbody>
              {LATENCY.map((l) => (
                <tr key={l.what}>
                  <td>
                    {l.what}
                    <span className="cm-sub">{l.note}</span>
                  </td>
                  <td className="mono">{formatNs(l.ns)}</td>
                  <td className="mono">{human(l.ns)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="crypto-section">
        <h3>Cache lines: row-major vs column-major</h3>
        <div className="sql-presets">
          <button className={order === "row" ? "active" : ""} onClick={() => { setOrder("row"); setStep(0); setPlaying(false); }}>
            for r, then for c: grid[r, c]
          </button>
          <button className={order === "col" ? "active" : ""} onClick={() => { setOrder("col"); setStep(0); setPlaying(false); }}>
            for c, then for r: grid[r, c]
          </button>
        </div>
        <div className="cm-matrix-wrap">
          <div className="cm-matrix" role="img" aria-label="8 by 8 matrix; highlighted cells are currently in the cache">
            {Array.from({ length: SIZE * SIZE }, (_, k) => {
              const r = Math.floor(k / SIZE);
              const c = k % SIZE;
              const line = Math.floor(k / LINE);
              const isCur = cur.r === r && cur.c === c;
              const inCache = cur.cache.includes(line);
              return (
                <span
                  key={k}
                  className={`cm-cell ${inCache ? "cm-cell-cached" : ""} ${isCur ? (cur.hit ? "cm-cell-hit" : "cm-cell-miss") : ""} ${line % 2 ? "cm-cell-odd" : ""}`}
                >
                  {r},{c}
                </span>
              );
            })}
          </div>
          <div className="cm-cache-box">
            <span className="readout-label">Cache (4 lines, LRU)</span>
            {Array.from({ length: CACHE_LINES }, (_, k) => {
              const l = cur.cache[k];
              return (
                <span key={k} className="mono cm-cache-line">
                  {l === undefined ? "empty" : `row ${Math.floor((l * LINE) / SIZE)}, cols ${(l * LINE) % SIZE}-${((l * LINE) % SIZE) + LINE - 1}`}
                </span>
              );
            })}
            <span className={cur.hit ? "constraint-ok" : "constraint-fail"}>
              grid[{cur.r}, {cur.c}]: {cur.hit ? "hit" : "miss, load its line"}
            </span>
          </div>
        </div>
        <label className="cm-slider">
          Access <strong>{step + 1}</strong> of {SIZE * SIZE}
          <input type="range" min={0} max={SIZE * SIZE - 1} value={step} onChange={(e) => { setStep(Number(e.target.value)); setPlaying(false); }} />
        </label>
        <div className="cm-actions">
          <button
            onClick={() => {
              if (running) return setPlaying(false);
              if (step >= SIZE * SIZE - 1) setStep(0);
              setPlaying(true);
            }}
          >
            {running ? "Pause" : "Play"}
          </button>
          <button onClick={() => { setStep(SIZE * SIZE - 1); setPlaying(false); }}>Jump to the end</button>
        </div>
        <div className="tool-readout">
          <div className="readout-cell">
            <span className="readout-label">Hits</span>
            <span className="readout-value">{hits}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Misses</span>
            <span className="readout-value">{misses}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Hit rate</span>
            <span className="readout-value">{Math.round((hits / (step + 1)) * 100)}%</span>
          </div>
        </div>
        <p className="gate-note">
          {order === "row"
            ? "Row by row, each miss brings in 4 neighbours and the next 3 accesses are free: 16 misses for 64 reads. With real 64-byte lines it's 1 miss per 16 ints, and the hardware prefetcher spots the pattern and fetches ahead."
            : "Column by column, every access lands on a different line. The column needs 8 lines but the cache holds 4, so by the time you come back for the next column, its line has been evicted: 64 misses for 64 reads. Same loop, same O(n²), several times slower on real hardware."}
        </p>
        <pre className="algo-code">{`const int N = 4096;
var grid = new int[N, N];     // 64 MB, stored one row after another
long sum = 0;

// Fast: the inner loop walks consecutive addresses
for (int r = 0; r < N; r++)
    for (int c = 0; c < N; c++)
        sum += grid[r, c];

// Slow: the inner loop jumps 16 KB (a whole row) every step
for (int c = 0; c < N; c++)
    for (int r = 0; r < N; r++)
        sum += grid[r, c];`}</pre>
      </div>

      <div className="crypto-section">
        <h3>Virtual address → physical address</h3>
        <p className="gate-note">A tiny process with 16-bit addresses and 4 KB pages. Look up an address and watch the TLB and page table change.</p>
        <div className="sql-presets">
          {ADDRESSES.map((a) => (
            <button key={a} onClick={() => lookup(a)}>
              {hex(a)}
            </button>
          ))}
        </div>
        <div className="cm-addr-input">
          <label>
            Address (hex):{" "}
            <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={6} spellCheck={false} />
          </label>
          <button disabled={!validInput} onClick={() => lookup(parsed)}>
            Translate
          </button>
          <button onClick={() => { setVm(VSTART); setLast(null); }}>Reset memory</button>
        </div>
        {last && (
          <div className={`arch-detail ${last.outcome === "segv" ? "cm-detail-bad" : ""}`}>
            <strong>
              {OUTCOME_TEXT[last.outcome]}
              {last.physical !== null && ` → physical ${hex(last.physical)}`}
            </strong>
            <ol className="cm-steps">
              {last.steps.map((s, k) => (
                <li key={k}>{s}</li>
              ))}
            </ol>
          </div>
        )}
        <div className="cm-vm">
          <div className="cm-scroll">
            <table className="bigo-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Virtual range</th>
                  <th>Page table entry</th>
                </tr>
              </thead>
              <tbody>
                {vm.table.map((p, i) => (
                  <tr key={i}>
                    <td className="mono">{i}</td>
                    <td className="mono">
                      {hex(i * PAGE)}-{hex(i * PAGE + PAGE - 1)}
                    </td>
                    <td>
                      {p.kind === "mapped" ? `frame ${hex(p.frame, 1)}` : p.kind === "disk" ? "not present: on disk" : p.kind === "lazy" ? "not present: untouched" : "invalid"}
                      <span className="cm-sub">{p.what}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mq-box">
            <strong>TLB (2 entries)</strong>
            {vm.tlb.length === 0 && <span className="mq-small">empty</span>}
            {vm.tlb.map((e) => (
              <span key={e.page} className="mono mq-small">
                page {e.page} → frame {hex(e.frame, 1)}
              </span>
            ))}
          </div>
        </div>
        <p className="gate-note">
          Try {hex(0x1234)} twice (miss, then hit), {hex(0x5008)} (minor fault), {hex(0x4010)} (major fault) and {hex(0)} (a null pointer). Each
          process has its own page table, so another process's page 2 maps to some completely different frame: that's the isolation from the
          Threads vs Processes lesson.
        </p>
      </div>
    </div>
  );
}
