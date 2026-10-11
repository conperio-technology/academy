// Checks that the static site's progress rules (client/src/progressCore.ts) match the
// server's (server/Data/ProgressService.cs): replays the same event sequences through both
// and compares what each reports after every event (rows, evidence, review queue).
//
//   node tools/progress-parity/check.mjs [--random 300] [--seed 1]      (from the repo root)
//
// Needs the .NET 10 SDK and Node 22.18+ (it imports the .ts file directly). Run it after
// changing either file.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as core from "../../client/src/progressCore.ts";

const here = dirname(fileURLToPath(import.meta.url));
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
};
const randomCount = Number(arg("random", "300"));
let seed = Number(arg("seed", "1"));
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = (xs) => xs[Math.floor(rand() * xs.length)];

const rec = (c, lang, passed, mode) => ({ op: "record", c, lang, passed, mode });
const reveal = (c, lang) => ({ op: "reveal", c, lang });
const adv = (hours) => ({ op: "advance", hours });

// Scenarios worth naming, then random ones.
const sequences = [
  // Review ladder: 1, 3, 7, 14, 30 days, then 30 again; early and failed runs change nothing.
  [rec("a", "csharp", true), adv(12), rec("a", "csharp", true), adv(12), rec("a", "csharp", false), rec("a", "csharp", true),
    adv(72), rec("a", "csharp", true), adv(168), rec("a", "csharp", true), adv(336), rec("a", "csharp", true),
    adv(720), rec("a", "csharp", true), adv(720), rec("a", "csharp", true), adv(800)],
  // Reveal then pass: assisted within 7 days in any language, independent after it.
  [reveal("a", "python"), rec("a", "csharp", true, "bare"), adv(167), rec("b", "csharp", true, "bare"),
    reveal("b", "csharp"), adv(168), rec("b", "python", true, "timed"), adv(1), rec("a", "python", true, "bare")],
  // Exactly at the 7 day and 1 day boundaries.
  [reveal("a", "csharp"), adv(168), rec("a", "csharp", true, "bare"), adv(24), rec("a", "csharp", true, "timed")],
  // Two languages: due only when both are; any one pass takes it off the queue.
  [rec("a", "csharp", true), adv(10), rec("a", "python", true), adv(20), adv(5), rec("a", "python", true), adv(100)],
  // Guided passes, unknown modes, resets.
  [rec("a", "csharp", true, "guided"), rec("b", "python", true, "nonsense"), rec("c", "csharp", false, "bare"),
    adv(48), { op: "reset", c: "a" }, rec("a", "csharp", true, "bare"), { op: "resetAll" }, rec("b", "csharp", true, "timed")],
];
for (let s = 0; s < randomCount; s++) {
  const events = [];
  const length = 5 + Math.floor(rand() * 30);
  for (let i = 0; i < length; i++) {
    const r = rand();
    const c = pick(["a", "b", "c"]);
    const lang = pick(["csharp", "python"]);
    if (r < 0.45) events.push(rec(c, lang, rand() < 0.7, pick([undefined, "guided", "bare", "timed"])));
    else if (r < 0.6) events.push(reveal(c, lang));
    else if (r < 0.93) events.push(adv(pick([1, 6, 12, 23, 24, 25, 48, 72, 100, 167, 168, 169, 336, 720, 1000])));
    else if (r < 0.98) events.push({ op: "reset", c });
    else events.push({ op: "resetAll" });
  }
  sequences.push(events);
}

// ---- The TypeScript port, with a clock instead of shifting stored times ----
const HOUR = 3600 * 1000;
const round = (x) => Math.sign(x) * Math.round(Math.abs(x) * 100) / 100;
function replayTs(events) {
  let rows = [];
  let now = Date.UTC(2026, 0, 1);
  const ago = (t) => (t === null ? null : round((now - Date.parse(t)) / HOUR));
  const snapshots = [];
  for (const e of events) {
    // Real time passes between two requests, so equal timestamps never happen on the server:
    // 1 ms per event keeps ties (the review queue's order) the same as there.
    now += 1;
    if (e.op === "record") core.recordAttempt(rows, e.c, e.lang, "code", e.passed, e.mode ?? null, now);
    else if (e.op === "reveal") core.recordReveal(rows, e.c, e.lang, now);
    else if (e.op === "advance") now += e.hours * HOUR;
    else if (e.op === "reset") rows = rows.filter((r) => r.conceptId !== e.c);
    else if (e.op === "resetAll") rows = [];
    const sorted = [...rows].sort((a, b) => (a.conceptId < b.conceptId ? -1 : a.conceptId > b.conceptId ? 1 : a.language < b.language ? -1 : a.language > b.language ? 1 : 0));
    const groups = [...core.groupByConcept(rows)].sort(([a], [b]) => (a < b ? -1 : 1));
    snapshots.push({
      rows: sorted.map((r) => ({
        c: r.conceptId, lang: r.language, attempts: r.attempts, code: r.lastSubmittedCode, completed: ago(r.completedAt),
        updated: ago(r.updatedAt), stage: r.reviewStage, next: ago(r.nextReviewAt), revealed: ago(r.solutionRevealedAt),
        assisted: ago(r.assistedPassedAt), independent: ago(r.independentPassedAt), timed: ago(r.timedPassedAt),
      })),
      evidence: groups.map(([c, g]) => core.evidence(c, g)).map((v) => ({
        c: v.conceptId, attempted: v.attempted, revealed: ago(v.lastRevealedAt), assisted: v.assistedPass,
        independent: v.independentPass, timed: v.timedPass, unrecorded: v.unrecordedPass,
      })),
      due: core.getDue(rows, now).map((d) => ({ c: d.conceptId, since: ago(d.dueSince), stage: d.stage, overdue: d.daysOverdue })),
    });
  }
  return snapshots;
}

const dir = mkdtempSync(join(tmpdir(), "progress-parity-"));
try {
  const input = join(dir, "sequences.json");
  writeFileSync(input, JSON.stringify(sequences));
  const stdout = execFileSync("dotnet", ["run", "--project", here, "--", input], { encoding: "utf8", maxBuffer: 1 << 28 });
  const server = JSON.parse(stdout.slice(stdout.indexOf("[")));
  let events = 0;
  const failures = [];
  sequences.forEach((seq, s) => {
    const ts = replayTs(seq);
    for (let i = 0; i < seq.length; i++) {
      events++;
      const a = JSON.stringify(server[s][i]);
      const b = JSON.stringify(ts[i]);
      if (a !== b) {
        failures.push(`sequence ${s}, after event ${i} ${JSON.stringify(seq[i])}:\n  server: ${a}\n  port:   ${b}`);
        break;
      }
    }
  });
  console.log(`${sequences.length} sequences, ${events} events replayed through ProgressService.cs and progressCore.ts`);
  if (failures.length) {
    console.log(`${failures.length} sequence(s) differ. First:\n${failures[0]}`);
    process.exit(1);
  }
  console.log("Identical after every event.");
} finally {
  rmSync(dir, { recursive: true, force: true });
}
