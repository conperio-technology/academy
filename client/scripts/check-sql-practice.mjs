// Checks the SQL in the Databases lessons with Node's built-in SQLite. Run from client/:
// node scripts/check-sql-practice.mjs (Node 22.18+). For every practice problem in
// src/sqlPracticeData.ts: the solution runs on a fresh copy of the shop database and returns
// rows, every alsoAccepted query returns the same rows, and the starter query isn't already a
// correct answer. Every live SQL block in a lesson (opsTrack parts of kind "sql") runs too.
import { DatabaseSync } from "node:sqlite";
import { SHOP_SCHEMA, SQL_PROBLEM_SETS } from "../src/sqlPracticeData.ts";
import { SQL_SAMPLE_SCHEMA } from "../src/sqlSampleData.ts";
import { compareResults } from "../src/sqlCompare.ts";
import { OPS_LESSONS } from "../src/opsTrack/index.ts";

process.removeAllListeners("warning"); // node:sqlite prints an ExperimentalWarning

function run(schema, sql) {
  const db = new DatabaseSync(":memory:");
  db.exec(schema);
  // Run every statement; the result is the last one that returns columns, like sql.js exec().
  const stmt = db.prepare(sql.trim().replace(/;\s*$/, ""));
  const columns = stmt.columns().map((c) => c.name);
  const values = stmt.all().map((row) => columns.map((c) => row[c]));
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
      const r = run(part.schema === "shop" ? SHOP_SCHEMA : SQL_SAMPLE_SCHEMA, part.query);
      if (r.values.length === 0) errors.push(`${kind}: "${part.title}" returns no rows`);
    } catch (e) {
      errors.push(`${kind}: "${part.title}" fails: ${e.message}`);
    }
  }
}

console.log(`${problems} practice problems (${queries} queries), ${blocks} live SQL blocks`);
if (errors.length) {
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log("All checks passed.");
