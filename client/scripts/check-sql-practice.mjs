// Checks the SQL in the Databases lessons with Node's built-in SQLite. Run from client/:
// node scripts/check-sql-practice.mjs (Node 22.18+). For every practice problem in
// src/sqlPracticeData.ts: the solution runs on a fresh copy of the shop database and returns
// rows, every alsoAccepted query returns the same rows, and the starter query isn't already a
// correct answer. Every live SQL block in a lesson (opsTrack parts of kind "sql") runs too.
// For the SQL Join Ladder (src/sqlLadder.ts): every generated question's reference query and
// trap run on the ladder database, and every rung must keep at least MIN_PER_RUNG usable
// questions with unique ids and no dashes in the text.
import { DatabaseSync } from "node:sqlite";
import { SHOP_SCHEMA, SQL_PROBLEM_SETS } from "../src/sqlPracticeData.ts";
import { SQL_SAMPLE_SCHEMA } from "../src/sqlSampleData.ts";
import { compareResults } from "../src/sqlCompare.ts";
import { OPS_LESSONS } from "../src/opsTrack/index.ts";
import { LADDER_SCHEMA } from "../src/sqlLadderData.ts";
import { allQuestions, LADDER_RUNGS, PASSES_TO_CLEAR, usableQuestions } from "../src/sqlLadder.ts";

const MIN_PER_RUNG = 10;

process.removeAllListeners("warning"); // node:sqlite prints an ExperimentalWarning

// Rows as arrays, so two columns with the same name (c.name, p.name) both survive, as they do
// in sql.js in the browser.
function rows(db, sql) {
  const stmt = db.prepare(sql.trim().replace(/;\s*$/, ""));
  stmt.setReturnArrays(true);
  return { columns: stmt.columns().map((c) => c.name), values: stmt.all() };
}

function run(schema, sql) {
  const db = new DatabaseSync(":memory:");
  db.exec(schema);
  // Run every statement; the result is the last one that returns columns, like sql.js exec().
  const { columns, values } = rows(db, sql);
  db.close();
  return { columns, values };
}

const errors = [];
let problems = 0;
let queries = 0;
const ids = new Set();
for (const [setName, set] of Object.entries(SQL_PROBLEM_SETS)) {
  for (const p of set.problems) {
    problems++;
    if (ids.has(p.id)) errors.push(`duplicate problem id ${p.id}`);
    ids.add(p.id);
    for (const text of [p.title, p.prompt, p.hint, p.why]) {
      if (/[–—]| - | -- /.test(text)) errors.push(`${p.id}: dash in text: ${text.slice(0, 60)}`);
    }
    let want;
    try {
      want = run(SHOP_SCHEMA, p.solution);
      queries++;
    } catch (e) {
      errors.push(`${setName}/${p.id}: solution fails: ${e.message}`);
      continue;
    }
    if (want.values.length === 0) errors.push(`${p.id}: solution returns no rows`);
    for (const alt of p.alsoAccepted ?? []) {
      try {
        const got = run(SHOP_SCHEMA, alt);
        queries++;
        const diff = compareResults(got, want, p.ordered ?? false);
        if (diff) errors.push(`${p.id}: alsoAccepted disagrees (${diff}): ${alt}`);
      } catch (e) {
        errors.push(`${p.id}: alsoAccepted fails: ${e.message}`);
      }
    }
    try {
      const got = run(SHOP_SCHEMA, p.starter);
      if (!compareResults(got, want, p.ordered ?? false)) errors.push(`${p.id}: the starter is already correct`);
    } catch {
      // A starter is usually unfinished SQL; that's fine.
    }
  }
}

let blocks = 0;
for (const [kind, lesson] of Object.entries(OPS_LESSONS)) {
  for (const part of lesson.parts) {
    if (part.kind === "sqlPractice" && !SQL_PROBLEM_SETS[part.set]) errors.push(`${kind}: unknown practice set ${part.set}`);
    if (part.kind !== "sql") continue;
    blocks++;
    try {
      const schemas = { sample: SQL_SAMPLE_SCHEMA, shop: SHOP_SCHEMA, ladder: LADDER_SCHEMA };
      const r = run(schemas[part.schema ?? "sample"], part.query);
      if (r.values.length === 0) errors.push(`${kind}: "${part.title}" returns no rows`);
    } catch (e) {
      errors.push(`${kind}: "${part.title}" fails: ${e.message}`);
    }
  }
}

// The Join Ladder. One database is enough: reference queries and traps only read.
const ladderDb = new DatabaseSync(":memory:");
ladderDb.exec(LADDER_SCHEMA);
const runLadder = (sql) => {
  return rows(ladderDb, sql);
};
const generated = allQuestions();
const ladderIds = new Set();
for (const q of generated) {
  if (ladderIds.has(q.id)) errors.push(`ladder: duplicate question id ${q.id}`);
  ladderIds.add(q.id);
  for (const text of [q.title, q.prompt, q.hint, q.why]) {
    if (/[–—]| - | -- /.test(text)) errors.push(`ladder ${q.id}: dash in text: ${text.slice(0, 60)}`);
  }
  for (const [what, sql] of [["solution", q.solution], ["trap", q.trap]]) {
    if (!sql) continue;
    try {
      runLadder(sql);
    } catch (e) {
      errors.push(`ladder ${q.id}: ${what} fails: ${e.message}`);
    }
  }
}
let usable = [];
try {
  usable = usableQuestions(runLadder);
} catch (e) {
  errors.push(`ladder: usableQuestions fails: ${e.message}`);
}
const perRung = LADDER_RUNGS.map((r) => usable.filter((q) => q.rung === r.rung).length);
LADDER_RUNGS.forEach((r, i) => {
  if (perRung[i] < Math.max(MIN_PER_RUNG, PASSES_TO_CLEAR + 1)) errors.push(`ladder rung ${r.rung} has only ${perRung[i]} usable questions`);
});

console.log(`${problems} practice problems (${queries} queries), ${blocks} live SQL blocks`);
console.log(`Join Ladder: ${usable.length} usable of ${generated.length} generated questions (per rung: ${perRung.join(", ")})`);
if (errors.length) {
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log("All checks passed.");
