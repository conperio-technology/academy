import { GLOSSARY, type GlossaryTerm } from "./glossaryData";

// Finds glossary terms in lesson prose for components/GlossaryProse.tsx. The matcher is built
// once from glossaryData.ts and reused for every lesson.

export const GLOSSARY_LESSON_ID = "glossary-terms";

// Terms that would mark half of every paragraph, or whose everyday meaning in prose usually
// isn't the glossary's meaning (a "frame" of video, a Git "tag", a "root" of a tree vs Linux's
// root user). Lower case. "Heap" and "Stack" are here because prose uses each for two different
// things (the data structure and the memory region); "Call stack", "Stack frame" and "Heap
// memory" still match.
const DENY = new Set([
  "array", "function", "variable", "string", "class", "object", "method", "loop", "bit", "byte",
  "node", "register", "heap", "stack", "queue", "tag", "coil", "rung", "pipe", "view", "join", "port", "hop",
  "spy", "fake", "mock", "stub", "root", "fork", "exec", "get", "put", "post", "frame", "eval",
  "salt", "token", "index", "commit", "branch", "pod", "tree", "graph", "parameter", "inode",
  "toil", "cron", "path", "sudo", "grep", "model", "agent", "prompt", "feature", "label", "region",
  "container", "precision", "recall", "training", "scope", "switch", "signal", "alarm", "future",
  "trigger", "mount", "temperature", "regression", "alignment", "sprint", "calibration", "leveling",
  "headcount", "escalation", "snapshot", "watermark", "encoder", "pipeline", "chunking",
]);

// Phrases prose uses for a term the glossary files under another name.
const ALIASES: Record<string, string> = {
  "hash map": "Hash table",
  "hashmap": "Hash table",
  "big o": "Big O notation",
  "floating point": "Floating-point number",
  "significand": "Mantissa (significand)",
  "memoize": "Memoization",
  "memoizing": "Memoization",
  "memoized": "Memoization",
  "amortized": "Amortized analysis",
  "modulo": "Modular arithmetic",
  "euclid's algorithm": "Euclidean algorithm",
  "binary exponentiation": "Fast exponentiation",
  "square-and-multiply": "Fast exponentiation",
  "n choose k": "Binomial coefficient",
  "bitmasks": "Bitmask",
  "binary indexed tree": "Fenwick tree",
  "lowbit": "Set bit",
  "lowest set bit": "Set bit",
  "deferred execution": "Lazy evaluation",
  "list comprehension": "Comprehension",
  "type hints": "Type hint",
  "global interpreter lock": "GIL (global interpreter lock)",
  "dunder": "Dunder method",
  "boxed": "Boxing",
  "garbage collector": "Garbage collection",
};

interface Name {
  text: string; // as it should match
  term: GlossaryTerm;
  caseSensitive: boolean; // acronyms: "TAG" is not "tag"
}

const isAcronym = (s: string) => /^[A-Z0-9][A-Za-z0-9&/.+-]*$/.test(s) && (s.match(/[A-Z]/g) ?? []).length >= 2;

interface Matcher {
  regex: RegExp;
  byLower: Map<string, Name>;
}

let matcher: Matcher | null = null;

// Built once, on the first lesson that needs it: one alternation of every usable name, longest
// first so "hash table" wins over "hash" and "binary search tree" over "binary search".
function getMatcher(): Matcher {
  if (matcher) return matcher;
  const byTerm = new Map(GLOSSARY.map((t) => [t.term, t]));
  const names: Name[] = [];
  const add = (text: string, term: GlossaryTerm) => {
    const t = text.trim();
    if (t.length < 3 || DENY.has(t.toLowerCase())) return;
    names.push({ text: t, term, caseSensitive: isAcronym(t) });
  };
  for (const term of GLOSSARY) {
    const main = term.term.replace(/\s*\([^)]*\)\s*$/, "");
    add(main, term);
    // "Binary search tree (BST)": the acronym in brackets is a second name for the same term.
    const paren = term.term.match(/\(([^)]+)\)\s*$/)?.[1];
    if (paren && isAcronym(paren)) add(paren, term);
  }
  for (const [alias, target] of Object.entries(ALIASES)) {
    const term = byTerm.get(target);
    if (term) add(alias, term);
  }

  const byLower = new Map<string, Name>();
  for (const n of names) if (!byLower.has(n.text.toLowerCase())) byLower.set(n.text.toLowerCase(), n);
  const escaped = [...byLower.values()]
    .sort((a, b) => b.text.length - a.text.length)
    .map((n) => n.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  // Whole words only, with a simple plural (s / es) allowed on the end.
  const regex = new RegExp(`(?<![A-Za-z0-9_'-])(${escaped.join("|")})(?:e?s)?(?![A-Za-z0-9_])`, "gi");
  matcher = { regex, byLower };
  return matcher;
}

export type Piece = string | { code: string } | { word: string; term: GlossaryTerm };

// Splits each paragraph into plain text, inline code and marked terms. Only the first
// occurrence of each term in the whole lesson is marked, and terms named in the lesson's own
// title are skipped (a "Deadlock" lesson underlining "deadlock" adds nothing).
export function annotate(paragraphs: string[], title: string): Piece[][] {
  const { regex, byLower } = getMatcher();
  const used = new Set<string>();
  const lowerTitle = title.toLowerCase();
  return paragraphs.map((para) => {
    const out: Piece[] = [];
    para.split("`").forEach((part, i) => {
      if (i % 2 === 1) {
        out.push({ code: part });
        return;
      }
      let last = 0;
      regex.lastIndex = 0;
      for (let m = regex.exec(part); m; m = regex.exec(part)) {
        const name = byLower.get(m[1].toLowerCase());
        if (!name || used.has(name.term.term)) continue;
        if (name.caseSensitive && m[1] !== name.text) continue;
        if (new RegExp(`(^|[^a-z])${name.text.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(lowerTitle)) {
          used.add(name.term.term);
          continue;
        }
        used.add(name.term.term);
        if (m.index > last) out.push(part.slice(last, m.index));
        out.push({ word: m[0], term: name.term });
        last = m.index + m[0].length;
      }
      if (last < part.length) out.push(part.slice(last));
    });
    return out;
  });
}

// Set by "See in glossary" and read once by the Glossary list when it mounts.
let pendingGlossaryFocus: string | null = null;
export function setPendingGlossaryFocus(term: string) {
  pendingGlossaryFocus = term;
}
export function pendingGlossaryFocusTerm(): string | null {
  return pendingGlossaryFocus;
}
export function clearPendingGlossaryFocus() {
  pendingGlossaryFocus = null;
}

