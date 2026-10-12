// Sanity checks for src/glossaryData.ts. Run from client/: node scripts/check-glossary.mjs
// (Node 22.18+ strips the TypeScript types itself.) Checks for duplicate terms, see-also
// entries that don't resolve, lesson ids content/ doesn't define, and dashes.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { GLOSSARY, GLOSSARY_CATEGORIES } from "../src/glossaryData.ts";

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = join(here, "..", "..", "content");

function csFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return csFiles(path);
    return name.endsWith(".cs") ? [path] : [];
  });
}

const lessonIds = new Set();
for (const file of csFiles(contentDir)) {
  for (const m of readFileSync(file, "utf8").matchAll(/\bId\s*=>\s*"([^"]+)"/g)) lessonIds.add(m[1]);
}

const errors = [];
const seen = new Map();
for (const t of GLOSSARY) {
  const key = t.term.toLowerCase();
  if (seen.has(key)) errors.push(`Duplicate term: ${t.term}`);
  seen.set(key, t);
}
for (const t of GLOSSARY) {
  for (const s of t.seeAlso ?? []) {
    if (!seen.has(s.toLowerCase()) || seen.get(s.toLowerCase()).term !== s) errors.push(`${t.term}: see-also "${s}" doesn't match a term`);
    if (s === t.term) errors.push(`${t.term}: lists itself in see-also`);
  }
  if (t.lessonId && !lessonIds.has(t.lessonId)) errors.push(`${t.term}: lesson id "${t.lessonId}" not found in content/`);
}

const source = readFileSync(join(here, "..", "src", "glossaryData.ts"), "utf8");
source.split("\n").forEach((line, i) => {
  if (/[\u2013\u2014]/.test(line)) errors.push(`glossaryData.ts:${i + 1}: en or em dash`);
  if (/ -- | - /.test(line)) errors.push(`glossaryData.ts:${i + 1}: spaced dash`);
});

const counts = GLOSSARY_CATEGORIES.map((c) => `${c.label}: ${GLOSSARY.filter((t) => t.category === c.id).length}`);
console.log(`${GLOSSARY.length} terms, ${lessonIds.size} lesson ids`);
console.log(counts.join("\n"));
if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n${errors.join("\n")}`);
  process.exit(1);
}
console.log("\nAll checks passed.");
