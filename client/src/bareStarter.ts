import { MIXED_PROBLEMS } from "./mixedSetData.ts";

// The "bare" starter for a graded exercise: the guided starter with its step-by-step hints
// removed, so the learner starts from the signature and a return stub. Derived, not written by
// hand: whole-line comments go (that's where the TODO walk-throughs live) except ones that say
// what a provided type looks like, and so do trailing "# TODO" / "// TODO" notes. Where a
// starter's helper scaffolding gives the approach away, the mixed interview set already has a
// hand-written bare signature for it, and that wins.
//
// Every lesson's bare starter must still compile (C#) and parse (Python); a starter whose body
// held only comments would not, so starters always end with a return stub or `pass`.

export type ExerciseMode = "guided" | "bare" | "timed";

const OVERRIDES: Record<string, { csharp: string; python: string }> = Object.fromEntries(
  MIXED_PROBLEMS.filter((p) => p.starter).map((p) => [p.lessonId, p.starter!]),
);

export function stripHints(code: string, language: string): string {
  const marker = language === "python" ? "#" : "//";
  const trailingTodo = language === "python" ? /\s+#\s*TODO\b.*$/ : /\s+\/\/\s*TODO\b.*$/;
  return code
    .split("\n")
    .filter((line) => {
      const t = line.trimStart();
      return !t.startsWith(marker) || /\(provided\)/i.test(t);
    })
    .map((line) => line.replace(trailingTodo, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\{\n\n/g, "{\n");
}

export function bareStarter(lessonId: string, language: string, guided: string): string {
  const override = OVERRIDES[lessonId]?.[language as "csharp" | "python"];
  return override ?? stripHints(guided, language);
}
