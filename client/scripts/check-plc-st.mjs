// Checks for the PLC programming track. Run from client/: node scripts/check-plc-st.mjs
// (Node 22.18+ strips the TypeScript types itself.)
//   1. Unit checks of the Structured Text interpreter (src/plc/st.ts) and the IEC standard
//      function blocks (src/plc/stdFbs.ts): parsing, typing, error messages with line
//      numbers, operators, control flow, the loop guard, and timer/counter/edge semantics
//      scan by scan on the simulated clock.
//   2. Every exercise in src/plc/exercises.ts: the reference solution passes the grader,
//      the starter code fails it, and the starter at least compiles.
//   3. Every simulator program in src/plc/lessons.ts compiles and runs 200 scans without
//      a fault, and every ladder diagram only names variables that exist.
//   4. No en dash, em dash or spaced double hyphen in the track's data files.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { compile, Runtime, formatValue } from "../src/plc/st.ts";
import { buildSim } from "../src/plc/sim.ts";
import { grade } from "../src/plc/grader.ts";
import { PLC_EXERCISES } from "../src/plc/exercises.ts";
import { PLC_LESSONS, ladderVars } from "../src/plc/lessons.ts";

const here = dirname(fileURLToPath(import.meta.url));
const errors = [];
let passed = 0;

function ok(cond, msg) {
  if (cond) passed++;
  else errors.push(msg);
}

function eq(actual, expected, msg) {
  ok(Object.is(actual, expected) || actual === expected, `${msg}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

const IO = [
  { name: "A", type: "BOOL", dir: "in" },
  { name: "B", type: "BOOL", dir: "in" },
  { name: "N", type: "INT", dir: "in" },
  { name: "X", type: "REAL", dir: "in" },
  { name: "Y", type: "BOOL", dir: "out" },
  { name: "Z", type: "INT", dir: "out" },
  { name: "R", type: "REAL", dir: "out" },
];

function prog(src, io = IO) {
  const r = compile(src, io);
  if (!r.program) throw new Error(`compile failed: ${r.errors.map((e) => `line ${e.line}: ${e.message}`).join("; ")}\n${src}`);
  return new Runtime(r.program);
}

// Expect a compile error on `line` whose message matches `re`.
function compileFails(src, line, re, label) {
  const r = compile(src, IO);
  if (r.program) return errors.push(`${label}: expected a compile error, but it compiled`);
  const e = r.errors[0];
  ok(e.line === line, `${label}: error on line ${e.line}, expected line ${line} (${e.message})`);
  ok(re.test(e.message), `${label}: message "${e.message}" doesn't match ${re}`);
}

// Run `src` once with the given inputs and return the runtime.
function once(src, inputs = {}) {
  const rt = prog(src);
  for (const [k, v] of Object.entries(inputs)) rt.set(k, v);
  rt.scan(0);
  return rt;
}

// ---- 1a. Expressions and types ----

eq(once("Z := 7 / 2;").get("Z"), 3, "INT division truncates");
eq(once("Z := -7 / 2;").get("Z"), -3, "INT division truncates toward zero");
eq(once("Z := -7 MOD 3;").get("Z"), -1, "MOD keeps the dividend's sign");
eq(once("Z := 2 + 3 * 4;").get("Z"), 14, "* binds tighter than +");
eq(once("Z := (2 + 3) * 4;").get("Z"), 20, "brackets");
eq(once("Z := 32767 + 1;").get("Z"), -32768, "INT wraps at 16 bits");
eq(once("Z := 16#FF + 2#101;").get("Z"), 260, "based literals");
eq(once("Z := 1_000;").get("Z"), 1000, "underscores in literals");
eq(once("R := 7.0 / 2.0;").get("R"), 3.5, "REAL division");
eq(once("R := 0.1;").get("R"), Math.fround(0.1), "REAL is 32-bit");
eq(once("R := INT_TO_REAL(N) * 0.5;", { N: 5 }).get("R"), 2.5, "INT_TO_REAL");
eq(once("Z := REAL_TO_INT(X);", { X: 2.5 }).get("Z"), 3, "REAL_TO_INT rounds");
eq(once("Z := REAL_TO_INT(X);", { X: -2.5 }).get("Z"), -3, "REAL_TO_INT rounds half away from zero");
eq(once("Y := A AND NOT B;", { A: true, B: false }).get("Y"), true, "AND NOT");
eq(once("Y := A OR B AND FALSE;", { A: true }).get("Y"), true, "AND binds tighter than OR");
eq(once("Y := A XOR B;", { A: true, B: true }).get("Y"), false, "XOR");
eq(once("Y := A & B;", { A: true, B: true }).get("Y"), true, "& is AND");
eq(once("Y := N > 3 AND N < 10;", { N: 5 }).get("Y"), true, "comparison binds tighter than AND");
eq(once("Y := N = 5;", { N: 5 }).get("Y"), true, "= compares");
eq(once("Y := N <> 5;", { N: 5 }).get("Y"), false, "<> compares");
eq(once("Z := LIMIT(0, N, 100);", { N: 150 }).get("Z"), 100, "LIMIT");
eq(once("Z := MAX(N, 3);", { N: -1 }).get("Z"), 3, "MAX");
eq(once("Z := ABS(N);", { N: -4 }).get("Z"), 4, "ABS");
eq(once("Z := SEL(A, 1, 2);", { A: true }).get("Z"), 2, "SEL picks IN1 when G is TRUE");
eq(once("VAR t : TIME; END_VAR t := T#1m30s + T#500ms; Z := DINT_TO_INT(TIME_TO_DINT(t) / 1000);").get("Z"), 90, "TIME arithmetic");
eq(once("VAR d : DINT; END_VAR d := N; d := d * 1000; Z := DINT_TO_INT(d / 1000);", { N: 30 }).get("Z"), 30, "INT widens to DINT");
eq(once("VAR CONSTANT LIMIT_HI : INT := 9; END_VAR Z := LIMIT_HI;").get("Z"), 9, "VAR CONSTANT");
eq(once("PROGRAM Main VAR k : INT := 4; END_VAR Z := k; END_PROGRAM").get("Z"), 4, "PROGRAM wrapper and initial value");
eq(once("(* block\ncomment *) Z := 1; // line comment\n").get("Z"), 1, "comments");
eq(once("z := 3;").get("Z"), 3, "names are case-insensitive");
eq(formatValue(1500, "TIME"), "T#1s500ms", "formatTime");
eq(formatValue(2, "REAL"), "2.0", "format REAL");

// ---- 1b. Control flow ----

eq(once("IF N < 0 THEN Z := -1; ELSIF N = 0 THEN Z := 0; ELSE Z := 1; END_IF;", { N: 0 }).get("Z"), 0, "IF/ELSIF/ELSE");
const caseSrc = "CASE N OF 1: Z := 10; 2, 3: Z := 20; 4..6: Z := 30; ELSE Z := 99; END_CASE;";
eq(once(caseSrc, { N: 3 }).get("Z"), 20, "CASE list");
eq(once(caseSrc, { N: 5 }).get("Z"), 30, "CASE range");
eq(once(caseSrc, { N: 7 }).get("Z"), 99, "CASE ELSE");
eq(once("VAR i : INT; END_VAR Z := 0; FOR i := 1 TO 10 DO Z := Z + i; END_FOR;").get("Z"), 55, "FOR");
eq(once("VAR i : INT; END_VAR Z := 0; FOR i := 10 TO 1 BY -3 DO Z := Z + 1; END_FOR;").get("Z"), 4, "FOR with negative step");
eq(once("VAR i : INT; END_VAR Z := 0; FOR i := 1 TO 10 DO IF i = 4 THEN EXIT; END_IF; Z := i; END_FOR;").get("Z"), 3, "EXIT");
eq(once("Z := 0; WHILE Z < 5 DO Z := Z + 2; END_WHILE;").get("Z"), 6, "WHILE");
eq(once("Z := 0; REPEAT Z := Z + 1; UNTIL Z >= 3 END_REPEAT;").get("Z"), 3, "REPEAT");
eq(once("Z := 1; RETURN; Z := 2;").get("Z"), 1, "RETURN ends the scan");
{
  const rt = prog("WHILE A DO Z := Z + 1; END_WHILE;");
  rt.set("A", true);
  let msg = "";
  try {
    rt.scan(0);
  } catch (e) {
    msg = `${e.line}: ${e.message}`;
  }
  ok(/^1: Loop guard tripped/.test(msg), `loop guard trips with a line number (got "${msg}")`);
}
{
  const rt = prog("Z := 10 / N;");
  let msg = "";
  try {
    rt.scan(0);
  } catch (e) {
    msg = e.message;
  }
  ok(/Division by zero on line 1/.test(msg), `division by zero is a runtime error (got "${msg}")`);
}

// ---- 1c. Compile errors with line numbers ----

compileFails("Y := A;\nY = B;", 2, /Use := to assign/, "= instead of :=");
compileFails("Y := A\nZ := 1;", 1, /Missing ";"/, "missing semicolon");
compileFails("IF A THEN\n  Y := TRUE;\n", 3, /END_IF/, "missing END_IF");
compileFails("Y := Moter;", 1, /Unknown variable "Moter"/, "unknown variable");
compileFails("VAR motor_run : BOOL; END_VAR\nY := motor_rnu;", 2, /Did you mean motor_run\?/, "spelling suggestion");
compileFails("A := TRUE;", 1, /is an input/, "inputs are read-only");
compileFails("R := N;", 1, /INT_TO_REAL/, "no implicit INT to REAL");
compileFails("R := 5;", 1, /REAL literal/, "integer literal into REAL");
compileFails("Z := X;", 1, /REAL_TO_INT/, "no implicit REAL to INT");
compileFails("IF N THEN Y := TRUE; END_IF;", 1, /must be a BOOL/, "IF on an INT");
compileFails("Y := A + B;", 1, /arithmetic/, "arithmetic on BOOL");
compileFails("Y := N AND A;", 1, /needs BOOL/, "AND on INT");
compileFails("VAR t1 : TON; END_VAR\nt1(IN := A, PT := 500);", 2, /TIME/, "PT needs a TIME");
compileFails("VAR t1 : TON; END_VAR\nt1(A, T#1s);", 2, /Name each input/, "positional FB arguments");
compileFails("VAR t1 : TON; END_VAR\nY := t1;", 2, /not a value/, "FB instance used as a value");
compileFails("VAR t1 : TON; END_VAR\nt1.Q := TRUE;", 2, /output/, "writing an FB output");
compileFails("VAR t1 : TON; END_VAR\nY := t1.DONE;", 2, /no member "DONE"/, "unknown FB member");
compileFails("VAR c : CTU; END_VAR\nc(CU := A, PRESET := 5);", 2, /no input "PRESET"/, "unknown FB input");
compileFails("VAR x : UINT; END_VAR", 1, /UINT isn't supported/, "unsupported type");
compileFails("VAR Y : BOOL; END_VAR", 1, /already declared as an output/, "redeclaring an output");
compileFails("CASE N OF 1: Z := 1; 1: Z := 2; END_CASE;", 1, /overlaps/, "duplicate CASE label");
compileFails("CASE A OF 1: Z := 1; END_CASE;", 1, /whole number/, "CASE on a BOOL");
compileFails("Z := 1;\n(* never closed", 2, /never closed/, "unclosed comment");
compileFails("Z := 1;\nEND_IF;", 2, /without a matching IF/, "stray END_IF");
compileFails("VAR i : INT; END_VAR\nFOR i := 1 TO 3 DO\n i := 2;\nEND_FOR;", 3, /loop counter/, "assigning the FOR counter");
compileFails("Z := 70000;", 1, /doesn't fit in an INT/, "INT literal out of range");
compileFails("EXIT;", 1, /inside a FOR, WHILE or REPEAT/, "EXIT outside a loop");

// ---- 1d. Function blocks, scan by scan on a 10 ms clock ----

// Drives `src` scan by scan. `steps` is a list of [inputs, scans]; returns per-scan
// snapshots of the listed signals.
function drive(src, steps, signals, scanMs = 10) {
  const rt = prog(src);
  const rows = [];
  let t = 0;
  for (const [inputs, scans] of steps) {
    for (const [k, v] of Object.entries(inputs)) rt.set(k, v);
    for (let i = 0; i < scans; i++) {
      rt.scan(t);
      rows.push(Object.fromEntries([["t", t], ...signals.map((s) => [s, rt.read(s)])]));
      t += scanMs;
    }
  }
  return rows;
}

{
  // TON: Q after IN has been TRUE for PT; ET counts and holds at PT; IN FALSE resets.
  const r = drive("VAR t1 : TON; END_VAR t1(IN := A, PT := T#100ms); Y := t1.Q;", [[{ A: true }, 15], [{ A: false }, 2], [{ A: true }, 5]], ["t1.Q", "t1.ET"]);
  eq(r[0]["t1.ET"], 0, "TON ET starts at 0 on the first TRUE scan");
  eq(r[9]["t1.Q"], false, "TON Q still FALSE at 90 ms");
  eq(r[10]["t1.Q"], true, "TON Q TRUE at exactly 100 ms");
  eq(r[14]["t1.ET"], 100, "TON ET holds at PT");
  eq(r[15]["t1.Q"], false, "TON Q drops as soon as IN is FALSE");
  eq(r[15]["t1.ET"], 0, "TON ET resets when IN is FALSE");
  eq(r[21]["t1.ET"], 40, "TON starts over from 0 after a reset");
}
{
  // TON: a short dip in IN restarts the timing.
  const r = drive("VAR t1 : TON; END_VAR t1(IN := A, PT := T#50ms);", [[{ A: true }, 4], [{ A: false }, 1], [{ A: true }, 6]], ["t1.Q"]);
  eq(r.findIndex((x) => x["t1.Q"]), 10, "TON needs IN continuously TRUE for PT");
}
{
  // TOF: Q TRUE with IN, stays TRUE for PT after IN falls; ET holds at PT afterwards.
  const r = drive("VAR t1 : TOF; END_VAR t1(IN := A, PT := T#50ms);", [[{}, 2], [{ A: true }, 3], [{ A: false }, 8], [{ A: true }, 1]], ["t1.Q", "t1.ET"]);
  eq(r[0]["t1.Q"], false, "TOF Q FALSE at power-up with IN FALSE");
  eq(r[2]["t1.Q"], true, "TOF Q follows IN up immediately");
  eq(r[5]["t1.Q"], true, "TOF Q stays TRUE after IN falls");
  eq(r[5]["t1.ET"], 0, "TOF ET is 0 on the falling-edge scan");
  eq(r[9]["t1.Q"], true, "TOF Q still TRUE at 40 ms after the fall");
  eq(r[10]["t1.Q"], false, "TOF Q FALSE at 50 ms after the fall");
  eq(r[12]["t1.ET"], 50, "TOF ET holds at PT");
  eq(r[13]["t1.ET"], 0, "TOF ET resets when IN returns");
}
{
  // TP: fixed-length pulse, not retriggerable; ET holds at PT while IN stays TRUE.
  const r = drive("VAR p : TP; END_VAR p(IN := A, PT := T#50ms);", [[{ A: true }, 2], [{ A: false }, 1], [{ A: true }, 6], [{ A: false }, 1]], ["p.Q", "p.ET"]);
  eq(r[0]["p.Q"], true, "TP starts on the rising edge");
  eq(r[3]["p.Q"], true, "TP ignores a new edge during the pulse");
  eq(r[4]["p.Q"], true, "TP still on at 40 ms");
  eq(r[5]["p.Q"], false, "TP ends at exactly PT");
  eq(r[8]["p.ET"], 50, "TP ET holds at PT while IN is TRUE");
  eq(r[9]["p.ET"], 0, "TP ET resets once IN is FALSE");
}
{
  // TP: a short IN still gives the full pulse.
  const r = drive("VAR p : TP; END_VAR p(IN := A, PT := T#40ms);", [[{ A: true }, 1], [{ A: false }, 6]], ["p.Q", "p.ET"]);
  eq(r.filter((x) => x["p.Q"]).length, 4, "TP pulse is PT long even when IN is shorter");
  eq(r[5]["p.ET"], 0, "TP ET resets after the pulse when IN is already FALSE");
}
{
  // CTU: counts rising edges only; R resets and wins; Q = CV >= PV.
  const steps = [];
  for (let i = 0; i < 3; i++) steps.push([{ A: true }, 3], [{ A: false }, 2]);
  steps.push([{ A: true, B: true }, 1], [{ A: false, B: false }, 1], [{ A: true }, 1]);
  const r = drive("VAR c : CTU; END_VAR c(CU := A, R := B, PV := 3);", steps, ["c.CV", "c.Q"]);
  eq(r[2]["c.CV"], 1, "CTU counts once per rising edge, not per scan");
  eq(r[12]["c.CV"], 3, "CTU after three edges");
  eq(r[12]["c.Q"], true, "CTU Q when CV >= PV");
  eq(r[15]["c.CV"], 0, "CTU reset wins over CU");
  eq(r[17]["c.CV"], 1, "CTU counts again after reset");
}
{
  // CTU: an edge while R is TRUE is consumed, not counted later.
  const r = drive("VAR c : CTU; END_VAR c(CU := A, R := B, PV := 3);", [[{ A: true, B: true }, 1], [{ B: false }, 2]], ["c.CV"]);
  eq(r[2]["c.CV"], 0, "CTU doesn't count an edge that arrived during reset");
}
{
  // CTD: LD loads PV; counts down on rising edges; Q = CV <= 0.
  const r = drive("VAR c : CTD; END_VAR c(CD := A, LD := B, PV := 2);", [[{ B: true }, 1], [{ B: false, A: true }, 1], [{ A: false }, 1], [{ A: true }, 1], [{ A: false }, 1]], ["c.CV", "c.Q"]);
  eq(r[0]["c.CV"], 2, "CTD load");
  eq(r[1]["c.CV"], 1, "CTD counts down");
  eq(r[3]["c.Q"], true, "CTD Q at zero");
}
{
  // CTUD: simultaneous edges cancel; QU/QD.
  const r = drive("VAR c : CTUD; END_VAR c(CU := A, CD := B, PV := 2);", [[{ A: true }, 1], [{ A: false }, 1], [{ A: true, B: true }, 1], [{ A: false, B: false }, 1], [{ A: true }, 1]], ["c.CV", "c.QU", "c.QD"]);
  eq(r[0]["c.CV"], 1, "CTUD up");
  eq(r[2]["c.CV"], 1, "CTUD simultaneous edges cancel");
  eq(r[4]["c.QU"], true, "CTUD QU at PV");
}
{
  // R_TRIG / F_TRIG: exactly one scan.
  const r = drive("VAR r1 : R_TRIG; f1 : F_TRIG; END_VAR r1(CLK := A); f1(CLK := A);", [[{}, 2], [{ A: true }, 3], [{ A: false }, 3]], ["r1.Q", "f1.Q"]);
  eq(r.filter((x) => x["r1.Q"]).length, 1, "R_TRIG is TRUE for one scan");
  eq(r[2]["r1.Q"], true, "R_TRIG on the rising scan");
  eq(r.filter((x) => x["f1.Q"]).length, 1, "F_TRIG is TRUE for one scan");
  eq(r[5]["f1.Q"], true, "F_TRIG on the falling scan");
  eq(r[0]["f1.Q"], false, "F_TRIG doesn't fire on the first scan");
}
{
  const r = drive("VAR r1 : R_TRIG; END_VAR r1(CLK := A);", [[{ A: true }, 2]], ["r1.Q"]);
  eq(r[0]["r1.Q"], true, "R_TRIG sees CLK TRUE at power-up as an edge (IEC memory starts FALSE)");
}
{
  // SR set dominant, RS reset dominant.
  const r = drive("VAR s : SR; q : RS; END_VAR s(S1 := A, R := B); q(S := A, R1 := B);", [[{ A: true, B: true }, 1], [{ A: false, B: false }, 1], [{ A: true }, 1], [{ A: false }, 1]], ["s.Q1", "q.Q1"]);
  eq(r[0]["s.Q1"], true, "SR: set wins");
  eq(r[0]["q.Q1"], false, "RS: reset wins");
  eq(r[3]["s.Q1"], true, "SR latches");
  eq(r[3]["q.Q1"], true, "RS latches");
}
{
  // Inputs not given in a call keep their last value.
  const r = drive("VAR t1 : TON; END_VAR IF A THEN t1(IN := TRUE, PT := T#20ms); ELSE t1(); END_IF;", [[{ A: true }, 1], [{ A: false }, 3]], ["t1.Q"]);
  eq(r[3]["t1.Q"], true, "FB inputs keep their value between calls");
}

// ---- 1e. The scan cycle itself ----
{
  const { sim } = buildSim("Y := A;", [
    { name: "A", type: "BOOL", dir: "in", label: "A", widget: "switch" },
    { name: "Y", type: "BOOL", dir: "out", label: "Y", widget: "lamp" },
  ], 10);
  sim.stepScan();
  sim.setInput("A", true);
  sim.stepPhase(); // read
  sim.setInput("A", false); // changes after the read are not seen this scan
  sim.stepPhase(); // execute
  eq(sim.outputs.Y, false, "outputs change only in the write phase");
  sim.stepPhase(); // write
  eq(sim.outputs.Y, true, "the program used the input image read at the start of the scan");
  sim.stepPhase();
  eq(sim.clock, 20, "housekeeping advances the clock");
}

// ---- 2. Exercises ----

const exIds = new Set();
for (const ex of PLC_EXERCISES) {
  ok(!exIds.has(ex.id), `duplicate exercise id ${ex.id}`);
  exIds.add(ex.id);
  const ref = grade(ex.solution, ex.io, ex.scanMs, ex.tests, { plant: undefined, extra: ex.extra });
  if (!ref.ok) {
    const why = ref.errors.length ? ref.errors.map((e) => `line ${e.line}: ${e.message}`).join("; ") : ref.steps.map((s) => (s.ok ? "" : `${s.label}: ${s.message}`)).join("");
    errors.push(`${ex.id}: reference solution fails: ${why}`);
  } else passed++;
  const starterCompiles = compile(ex.starter, ex.io.map((d) => ({ name: d.name, type: d.type, dir: d.dir })));
  ok(!!starterCompiles.program, `${ex.id}: starter doesn't compile: ${starterCompiles.errors.map((e) => e.message).join("; ")}`);
  const st = grade(ex.starter, ex.io, ex.scanMs, ex.tests, { extra: ex.extra });
  ok(!st.ok, `${ex.id}: the starter code passes, so the tests are too weak`);
  for (const alt of ex.alsoPasses ?? []) {
    const r = grade(alt, ex.io, ex.scanMs, ex.tests, { extra: ex.extra });
    ok(r.ok, `${ex.id}: alternative solution should pass: ${r.errors.map((e) => e.message).join("; ")}${r.steps.map((s) => (s.ok ? "" : `${s.label}: ${s.message}`)).join("")}`);
  }
  for (const bad of ex.shouldFail ?? []) {
    const r = grade(bad, ex.io, ex.scanMs, ex.tests, { extra: ex.extra });
    ok(!r.ok, `${ex.id}: this wrong solution passes:\n${bad}`);
  }
}

// ---- 3. Lesson simulators and ladder diagrams ----

for (const lesson of PLC_LESSONS) {
  for (const block of lesson.blocks) {
    if (block.kind !== "sim") continue;
    const where = `${lesson.id} / ${block.title}`;
    const { sim, errors: errs } = buildSim(block.source, block.io, block.scanMs ?? 10, { plant: block.plant });
    if (!sim) {
      errors.push(`${where}: doesn't compile: ${errs.map((e) => `line ${e.line}: ${e.message}`).join("; ")}`);
      continue;
    }
    for (let i = 0; i < 200; i++) sim.stepScan();
    ok(!sim.fault, `${where}: faulted: ${sim.fault?.message}`);
    for (const name of ladderVars(block.ladder ?? [])) ok(sim.rt.read(name) !== undefined, `${where}: ladder names unknown variable ${name}`);
    for (const name of block.trend ?? []) ok(sim.rt.read(name) !== undefined, `${where}: trend names unknown signal ${name}`);
  }
}

// ---- 4. Dashes ----

for (const file of ["lessons.ts", "exercises.ts"]) {
  const src = readFileSync(join(here, "..", "src", "plc", file), "utf8");
  src.split("\n").forEach((line, i) => {
    if (/[–—]/.test(line)) errors.push(`${file}:${i + 1}: en or em dash`);
    if (/ -- /.test(line)) errors.push(`${file}:${i + 1}: spaced double hyphen`);
  });
}

console.log(`${passed} checks passed, ${PLC_EXERCISES.length} exercises, ${PLC_LESSONS.length} lessons`);
if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n${errors.join("\n")}`);
  process.exit(1);
}
console.log("All checks passed.");
