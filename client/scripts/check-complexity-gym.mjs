// Sanity checks for src/complexityGymData.ts. Run from client/: node scripts/check-complexity-gym.mjs
// (Node 22.18+ strips the TypeScript types itself.) Checks ids, categories, difficulties,
// that each answer is one of its options, options are unique, explanations are filled in,
// the bank has at least 120 snippets, and that no en dash, em dash or spaced double hyphen slipped in.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { GYM_SNIPPETS, GYM_CATEGORIES, GYM_DIFFICULTIES } from "../src/complexityGymData.ts";

const here = dirname(fileURLToPath(import.meta.url));
const errors = [];
const ids = new Set();
const categories = new Set(GYM_CATEGORIES.map((c) => c.id));
const LANGS = new Set(["C#", "Python"]);
const TEXT_FIELDS = ["title", "code", "vars", "structure", "perStep", "verdict", "spaceWhy"];

for (const s of GYM_SNIPPETS) {
  const where = s.id ?? "(no id)";
  if (!s.id || !/^[a-z0-9-]+$/.test(s.id)) errors.push(`${where}: id must be lowercase letters, digits and hyphens`);
  if (ids.has(s.id)) errors.push(`${where}: duplicate id`);
  ids.add(s.id);
  if (!categories.has(s.category)) errors.push(`${where}: unknown category "${s.category}"`);
  if (!GYM_DIFFICULTIES.includes(s.difficulty)) errors.push(`${where}: unknown difficulty "${s.difficulty}"`);
  if (!LANGS.has(s.lang)) errors.push(`${where}: unknown language "${s.lang}"`);
  for (const f of TEXT_FIELDS) if (typeof s[f] !== "string" || s[f].trim().length < 3) errors.push(`${where}: empty ${f}`);
  for (const kind of ["time", "space"]) {
    const options = s[`${kind}Options`];
    if (!Array.isArray(options) || options.length < 3) errors.push(`${where}: needs at least 3 ${kind} options`);
    else {
      if (!options.includes(s[kind])) errors.push(`${where}: ${kind} answer "${s[kind]}" is not among its options`);
      if (new Set(options).size !== options.length) errors.push(`${where}: duplicate ${kind} options`);
      for (const o of options) if (!/^O\(.+\)$/.test(o)) errors.push(`${where}: ${kind} option "${o}" is not written as O(...)`);
    }
  }
}

if (GYM_SNIPPETS.length < 120) errors.push(`Only ${GYM_SNIPPETS.length} snippets; the gym needs at least 120`);
for (const c of GYM_CATEGORIES)
  if (GYM_SNIPPETS.filter((s) => s.category === c.id).length < 5) errors.push(`Category ${c.id} has fewer than 5 snippets`);

const source = readFileSync(join(here, "..", "src", "complexityGymData.ts"), "utf8");
source.split("\n").forEach((line, i) => {
  if (/[\u2013\u2014]/.test(line)) errors.push(`complexityGymData.ts:${i + 1}: en or em dash`);
  if (/ \x2d\x2d /.test(line)) errors.push(`complexityGymData.ts:${i + 1}: spaced double dash`);
});

const pad = (x, n) => String(x).padEnd(n);
console.log(`${GYM_SNIPPETS.length} snippets\n`);
console.log(`${pad("category", 30)}${pad("easy", 6)}${pad("medium", 8)}${pad("hard", 6)}total`);
for (const c of GYM_CATEGORIES) {
  const in_ = GYM_SNIPPETS.filter((s) => s.category === c.id);
  const by = (d) => in_.filter((s) => s.difficulty === d).length;
  console.log(`${pad(c.label, 30)}${pad(by("easy"), 6)}${pad(by("medium"), 8)}${pad(by("hard"), 6)}${in_.length}`);
}
const total = (d) => GYM_SNIPPETS.filter((s) => s.difficulty === d).length;
const lang = (l) => GYM_SNIPPETS.filter((s) => s.lang === l).length;
console.log(`${pad("all", 30)}${pad(total("easy"), 6)}${pad(total("medium"), 8)}${pad(total("hard"), 6)}${GYM_SNIPPETS.length}`);
console.log(`\nC#: ${lang("C#")}, Python: ${lang("Python")}`);
if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n${errors.join("\n")}`);
  process.exit(1);
}
console.log("\nAll checks passed.");
