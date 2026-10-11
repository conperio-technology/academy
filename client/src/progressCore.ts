// The static site's progress rules: a line-by-line TypeScript port of
// server/Data/ProgressService.cs, so a learner's progress behaves the same with or without the
// server (docs/adr/0010-static-hosting-mode.md). Pure functions over plain rows with the
// current time passed in; progressStore.ts keeps the rows (IndexedDB) and localBackend.ts
// calls these. tools/progress-parity/ runs the same event sequences through both and
// compares the results, so change the two together.
//
// No imports on purpose: the parity script loads this file straight into Node.

// One row per (lesson, language) touched, the same fields as the server's ProgressEntry
// (camelCase, dates as ISO strings). `id` orders rows like the server's primary key.
export interface ProgressRow {
  id: number;
  conceptId: string;
  language: string;
  lastSubmittedCode: string | null;
  attempts: number;
  completedAt: string | null;
  updatedAt: string;
  reviewStage: number;
  nextReviewAt: string | null;
  solutionRevealedAt: string | null;
  assistedPassedAt: string | null;
  independentPassedAt: string | null;
  timedPassedAt: string | null;
}

export interface Evidence {
  conceptId: string;
  attempted: boolean;
  lastRevealedAt: string | null;
  assistedPass: boolean;
  independentPass: boolean;
  timedPass: boolean;
  unrecordedPass: boolean;
}

export interface DueReview {
  conceptId: string;
  dueSince: string;
  stage: number;
  daysOverdue: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export const REVIEW_DAYS = [1, 3, 7, 14, 30];
// A pass counts as independent only from the bare or timed starter with no reference
// solution shown in any language of the lesson in this long (ProgressService.RevealCooldown).
export const REVEAL_COOLDOWN_MS = 7 * DAY_MS;

const ms = (iso: string) => Date.parse(iso);
const iso = (t: number) => new Date(t).toISOString();
const addDays = (t: number, days: number) => t + days * DAY_MS;

// Latest of some optional dates, or null (LINQ's Max over DateTime?).
function maxDate(values: (string | null)[]): string | null {
  let best: string | null = null;
  for (const v of values) if (v !== null && (best === null || ms(v) > ms(best))) best = v;
  return best;
}

export function normalizeMode(mode: string | null | undefined): "guided" | "bare" | "timed" {
  return mode === "bare" || mode === "timed" ? mode : "guided";
}

// When a completed row next comes due, as epoch ms; null when not completed. A completed row
// without NextReviewAt predates review tracking: due a day after it was completed.
export function effectiveNextReview(e: ProgressRow): number | null {
  if (e.completedAt === null) return null;
  return e.nextReviewAt !== null ? ms(e.nextReviewAt) : addDays(ms(e.completedAt), REVIEW_DAYS[0]);
}

function newRow(rows: ProgressRow[], conceptId: string, language: string, now: number): ProgressRow {
  return {
    id: rows.reduce((m, r) => Math.max(m, r.id), 0) + 1,
    conceptId,
    language,
    lastSubmittedCode: null,
    attempts: 0,
    completedAt: null,
    updatedAt: iso(now),
    reviewStage: 0,
    nextReviewAt: null,
    solutionRevealedAt: null,
    assistedPassedAt: null,
    independentPassedAt: null,
    timedPassedAt: null,
  };
}

// ProgressService.RecordAttempt. Mutates `rows` (adding a row if needed) and returns the row.
export function recordAttempt(
  rows: ProgressRow[],
  conceptId: string,
  language: string,
  code: string,
  passed: boolean,
  mode: string | null | undefined,
  now: number,
): ProgressRow {
  const lessonRows = rows.filter((r) => r.conceptId === conceptId);
  let entry = lessonRows.find((r) => r.language === language);
  if (!entry) {
    entry = newRow(rows, conceptId, language, now);
    rows.push(entry);
  }

  const wasCompleted = entry.completedAt !== null;
  const wasDue = wasCompleted && effectiveNextReview(entry)! <= now;

  entry.attempts++;
  entry.lastSubmittedCode = code;
  entry.updatedAt = iso(now);

  if (passed) {
    if (!wasCompleted) {
      entry.completedAt = iso(now);
      entry.reviewStage = 0;
      entry.nextReviewAt = iso(addDays(now, REVIEW_DAYS[0]));
    } else if (wasDue) {
      entry.reviewStage = Math.min(entry.reviewStage + 1, REVIEW_DAYS.length - 1);
      entry.nextReviewAt = iso(addDays(now, REVIEW_DAYS[entry.reviewStage]));
    }

    const normalized = normalizeMode(mode);
    const lastReveal = maxDate(lessonRows.map((r) => r.solutionRevealedAt));
    const sawReference = lastReveal !== null && now - ms(lastReveal) < REVEAL_COOLDOWN_MS;
    if (normalized !== "guided" && !sawReference) {
      entry.independentPassedAt ??= iso(now);
      if (normalized === "timed") entry.timedPassedAt ??= iso(now);
    } else {
      entry.assistedPassedAt ??= iso(now);
    }
  }
  return entry;
}

// ProgressService.RecordReveal: the reference solution was opened (latest time per language).
export function recordReveal(rows: ProgressRow[], conceptId: string, language: string, now: number): ProgressRow {
  let entry = rows.find((r) => r.conceptId === conceptId && r.language === language);
  if (!entry) {
    entry = newRow(rows, conceptId, language, now);
    rows.push(entry);
  }
  entry.solutionRevealedAt = iso(now);
  entry.updatedAt = iso(now);
  return entry;
}

// ProgressService.Evidence: what one lesson's rows (all languages) show.
export function evidence(conceptId: string, rows: ProgressRow[]): Evidence {
  return {
    conceptId,
    attempted: rows.some((r) => r.attempts > 0),
    lastRevealedAt: maxDate(rows.map((r) => r.solutionRevealedAt)),
    assistedPass: rows.some((r) => r.assistedPassedAt !== null),
    independentPass: rows.some((r) => r.independentPassedAt !== null),
    timedPass: rows.some((r) => r.timedPassedAt !== null),
    unrecordedPass: rows.some((r) => r.completedAt !== null && r.assistedPassedAt === null && r.independentPassedAt === null),
  };
}

// Rows grouped by lesson, in order of each lesson's first row (LINQ's GroupBy).
export function groupByConcept(rows: ProgressRow[]): Map<string, ProgressRow[]> {
  const groups = new Map<string, ProgressRow[]>();
  for (const r of rows) {
    const g = groups.get(r.conceptId);
    if (g) g.push(r);
    else groups.set(r.conceptId, [r]);
  }
  return groups;
}

// ProgressService.GetDue: a lesson is due only when every language it was completed in is due.
export function getDue(rows: ProgressRow[], now: number): DueReview[] {
  const completed = [...rows].sort((a, b) => a.id - b.id).filter((r) => r.completedAt !== null);
  const due: { conceptId: string; next: number; stage: number }[] = [];
  for (const [conceptId, g] of groupByConcept(completed)) {
    const next = Math.max(...g.map((r) => effectiveNextReview(r)!));
    const stage = Math.max(...g.map((r) => r.reviewStage));
    if (next <= now) due.push({ conceptId, next, stage });
  }
  // Array.prototype.sort is stable, like OrderBy.
  due.sort((a, b) => a.next - b.next);
  return due.map((d) => ({
    conceptId: d.conceptId,
    dueSince: iso(d.next),
    stage: d.stage,
    daysOverdue: Math.max(0, Math.floor((now - d.next) / DAY_MS)),
  }));
}
