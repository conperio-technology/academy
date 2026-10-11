// The static site's stand-in for the API (docs/adr/0010-static-hosting-mode.md). api.ts calls
// these instead of fetch("/api/...") when STATIC_MODE is set. Lesson content is the JSON the
// server exported at build time (ContentExport.cs: the API's own responses for a user with
// no progress); the per-user fields are filled in here from progress kept in this browser,
// the way Program.cs fills them in from the database.
import type { ExerciseMode } from "./bareStarter";
import * as core from "./progressCore";
import type { ProgressRow } from "./progressCore";
import { readRows, replaceRows, updateRows } from "./progressStore";
import { siteUrl } from "./staticMode";
import type { ConceptDetail, LessonEvidence, NavItem, ReviewItem, ToolDetail } from "./types";

async function getContent<T>(path: string, what: string): Promise<T> {
  const res = await fetch(siteUrl(`content/${path}`));
  if (!res.ok) throw new Error(`Failed to load ${what}: ${res.status}`);
  return res.json();
}

// The lesson list never changes while the page is open.
let navPromise: Promise<NavItem[]> | null = null;
function nav(): Promise<NavItem[]> {
  navPromise ??= getContent<NavItem[]>("lessons.json", "lessons").catch((err) => {
    navPromise = null;
    throw err;
  });
  return navPromise;
}

async function requirePractice(lessonId: string) {
  const items = await nav();
  if (!items.some((i) => i.kind === "practice" && i.id === lessonId)) throw new Error(`No graded lesson ${lessonId}`);
}

// GET /api/lessons
export async function fetchLessons(): Promise<NavItem[]> {
  const [items, rows] = await Promise.all([nav(), readRows()]);
  const completed = new Set(rows.filter((r) => r.completedAt !== null).map((r) => r.conceptId));
  return items.map((i) => ({ ...i, completed: i.kind === "practice" && completed.has(i.id) }));
}

// GET /api/lessons/{id}
export async function fetchLesson(id: string): Promise<ConceptDetail> {
  const [detail, rows] = await Promise.all([getContent<ConceptDetail>(`lessons/${id}.json`, `lesson ${id}`), readRows()]);
  const mine = rows.filter((r) => r.conceptId === id);
  return {
    ...detail,
    completed: mine.some((r) => r.completedAt !== null),
    attempts: mine.reduce((sum, r) => sum + r.attempts, 0),
    evidence: core.evidence(id, mine),
  };
}

// GET /api/tools/{id}
export function fetchTool(id: string): Promise<ToolDetail> {
  return getContent<ToolDetail>(`tools/${id}.json`, `tool ${id}`);
}

// GET /api/review: titles and tracks from the lesson list, like Program.cs does from the registry.
export async function fetchReview(): Promise<ReviewItem[]> {
  const [items, rows] = await Promise.all([nav(), readRows()]);
  const byId = new Map(items.filter((i) => i.kind === "practice").map((i) => [i.id, i]));
  return core.getDue(rows, Date.now()).flatMap((d) => {
    const item = byId.get(d.conceptId);
    return item ? [{ conceptId: d.conceptId, title: item.title, section: item.section, track: item.track, dueSince: d.dueSince, stage: d.stage, daysOverdue: d.daysOverdue }] : [];
  });
}

// GET /api/progress/evidence
export async function fetchEvidence(): Promise<LessonEvidence[]> {
  const rows = await readRows();
  return [...core.groupByConcept(rows)].map(([id, g]) => core.evidence(id, g));
}

// POST /api/progress/record
export async function recordProgress(lessonId: string, language: string, code: string, passed: boolean, mode: ExerciseMode) {
  await requirePractice(lessonId);
  await updateRows((rows) => {
    core.recordAttempt(rows, lessonId, language, code, passed, mode, Date.now());
  });
}

// POST /api/progress/reveal
export async function recordReveal(lessonId: string, language: string) {
  await requirePractice(lessonId);
  await updateRows((rows) => {
    core.recordReveal(rows, lessonId, language, Date.now());
  });
}

// DELETE /api/progress/{id} and DELETE /api/progress
export function resetLessonProgress(lessonId: string) {
  return updateRows((rows) => rows.filter((r) => r.conceptId !== lessonId));
}

export function resetAllProgress() {
  return updateRows(() => []);
}

// ---- Export and import (the dashboard's "Your progress" panel) ----

export const BACKUP_FORMAT = "conperio-academy-progress";

// Browser storage the app's other features use (tool lessons marked worked through, drill
// history, study plan choices, notes), saved with the graded progress so a backup restores the
// readiness views too. Prefixes of the keys set in components/ and practiceHistory.ts.
const LOCAL_KEY_PREFIXES = [
  "history:",
  "prep-plan",
  "study-path:",
  "mixed-set:",
  "behavioral:",
  "glossary:",
  "interview-notes:",
  "sd-interview:",
  "plc:",
  "exercise-mode",
];

function localEntries(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && LOCAL_KEY_PREFIXES.some((p) => key.startsWith(p))) out[key] = localStorage.getItem(key) ?? "";
    }
  } catch {
    // Blocked storage: nothing to add.
  }
  return out;
}

export async function exportProgress(): Promise<string> {
  const entries = await readRows();
  return JSON.stringify({ format: BACKUP_FORMAT, version: 1, exportedAt: new Date().toISOString(), entries, localStorage: localEntries() }, null, 2);
}

// A date the server wrote (SQLite keeps no time zone, so GET /api/progress has none) is UTC.
function date(value: unknown): string | null {
  if (typeof value !== "string" || value === "") return null;
  const t = Date.parse(/[zZ]|[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

// Accepts this site's own export, or the array GET /api/progress returns on the server.
// Replaces all graded progress; browser storage keys in the file are written over.
export async function importProgress(text: string): Promise<{ entries: number; keys: number }> {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file isn't JSON.");
  }
  const wrapper = data as { format?: unknown; entries?: unknown; localStorage?: unknown };
  const list = Array.isArray(data) ? data : wrapper?.format === BACKUP_FORMAT && Array.isArray(wrapper.entries) ? wrapper.entries : null;
  if (!list) throw new Error("That file isn't an Academy progress export.");

  const rows: ProgressRow[] = [];
  const seen = new Set<string>();
  for (const raw of list as Record<string, unknown>[]) {
    if (typeof raw?.conceptId !== "string" || typeof raw.language !== "string") throw new Error("An entry in the file has no conceptId or language.");
    const key = `${raw.conceptId}\n${raw.language}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      id: rows.length + 1,
      conceptId: raw.conceptId,
      language: raw.language,
      lastSubmittedCode: typeof raw.lastSubmittedCode === "string" ? raw.lastSubmittedCode : null,
      attempts: Number.isInteger(raw.attempts) ? (raw.attempts as number) : 0,
      completedAt: date(raw.completedAt),
      updatedAt: date(raw.updatedAt) ?? new Date().toISOString(),
      reviewStage: Number.isInteger(raw.reviewStage) ? Math.min(Math.max(raw.reviewStage as number, 0), core.REVIEW_DAYS.length - 1) : 0,
      nextReviewAt: date(raw.nextReviewAt),
      solutionRevealedAt: date(raw.solutionRevealedAt),
      assistedPassedAt: date(raw.assistedPassedAt),
      independentPassedAt: date(raw.independentPassedAt),
      timedPassedAt: date(raw.timedPassedAt),
    });
  }

  let keys = 0;
  if (!Array.isArray(data) && wrapper.localStorage && typeof wrapper.localStorage === "object") {
    for (const [key, value] of Object.entries(wrapper.localStorage as Record<string, unknown>)) {
      if (typeof value !== "string" || !LOCAL_KEY_PREFIXES.some((p) => key.startsWith(p))) continue;
      try {
        localStorage.setItem(key, value);
        keys++;
      } catch {
        // Blocked storage: the graded progress still imports.
      }
    }
  }
  await replaceRows(rows);
  return { entries: rows.length, keys };
}
