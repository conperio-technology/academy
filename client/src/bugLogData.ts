import type { BugEntry } from "./practiceHistory.ts";

// Starting categories for the personal bug log, taken from the mistakes the lessons' "Watch out
// for" lists name most often. The learner can add their own (practiceHistory.ts).
export const BUG_CATEGORIES = [
  "Off-by-one (loop bound, window shrink, inclusive range)",
  "Forgot to mark visited, or marked it at the wrong time",
  "Wrong binary search bound or update",
  "Wrong heap order or tuple order",
  "Missed the base case or the undo step",
  "Empty or single-element input",
  "Missing key or null check",
  "Changed a collection while looping over it",
  "Overflow or the wrong number type",
  "Returned the wrong value or shape",
  "Misread the problem",
  "Syntax or type error",
] as const;

export const RECENT_DAYS = 14;

export interface CategoryCount {
  category: string;
  count: number;
  lessons: string[];
}

// Category counts over the last RECENT_DAYS days, most frequent first.
export function recentCounts(bugs: BugEntry[], now: Date = new Date()): CategoryCount[] {
  const since = now.getTime() - RECENT_DAYS * 24 * 60 * 60 * 1000;
  const by = new Map<string, CategoryCount>();
  for (const b of bugs) {
    if (Date.parse(b.at) < since) continue;
    const c = by.get(b.category) ?? { category: b.category, count: 0, lessons: [] };
    c.count++;
    if (b.lessonId && !c.lessons.includes(b.lessonId)) c.lessons.push(b.lessonId);
    by.set(b.category, c);
  }
  return [...by.values()].sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
}

export function bugsFor(bugs: BugEntry[], lessonId: string): BugEntry[] {
  return bugs.filter((b) => b.lessonId === lessonId);
}
