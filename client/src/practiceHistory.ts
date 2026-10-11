// Small records of practice that has no server-side progress (the drills, the mixed set,
// behavioral mock rounds, the design pattern quiz, the Complexity Gym, tool lessons marked as worked through), kept in this browser so the Interview Prep readiness view can
// use them. Every read tolerates missing or blocked storage and returns an empty result.

const DRILL_KEY = "history:drill";
const MIXED_KEY = "history:mixed-set";
const MOCK_KEY = "history:behavioral-mock";
const PATTERN_QUIZ_KEY = "history:pattern-quiz";
const WORKED_KEY = "history:worked-through";
const GYM_KEY = "history:complexity-gym";
const GYM_EXPLAIN_KEY = "history:complexity-gym-explain";
const PLC_KEY = "history:plc-exercises";
const LIMIT = 200;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Blocked storage: the readiness view just has less to go on.
  }
}

// ---- Pattern drill: per-technique answers ----

export type DrillStats = Record<string, { seen: number; correct: number }>;

export function loadDrillStats(): DrillStats {
  return read<DrillStats>(DRILL_KEY, {});
}

export function recordDrillAnswer(technique: string, correct: boolean) {
  const stats = loadDrillStats();
  const s = stats[technique] ?? { seen: 0, correct: 0 };
  stats[technique] = { seen: s.seen + 1, correct: s.correct + (correct ? 1 : 0) };
  write(DRILL_KEY, stats);
}

// ---- Mixed interview set: one entry per problem attempted ----

export interface MixedAttempt {
  at: string; // ISO date
  lessonId: string;
  technique: string;
  solved: boolean;
  goodCall: boolean;
}

export function loadMixedHistory(): MixedAttempt[] {
  return read<MixedAttempt[]>(MIXED_KEY, []);
}

export function recordMixedAttempts(attempts: MixedAttempt[]) {
  write(MIXED_KEY, [...loadMixedHistory(), ...attempts].slice(-LIMIT));
}

// ---- Behavioral mock rounds ----

export interface MockRound {
  at: string;
  style: string;
  questions: number;
  rubricHits: number; // ticks across all answers
  rubricTotal: number;
}

export function loadMockHistory(): MockRound[] {
  return read<MockRound[]>(MOCK_KEY, []);
}

export function recordMockRound(round: MockRound) {
  write(MOCK_KEY, [...loadMockHistory(), round].slice(-LIMIT));
}

// ---- Design walk-throughs (written by DesignInterview.tsx under "sd-interview:<id>") ----

export interface WalkthroughProgress {
  revealedStages: string[];
  ticks: Record<string, boolean[]>;
}

export function loadWalkthrough(designId: string): WalkthroughProgress {
  const saved = read<{ revealed?: Record<string, boolean>; ticks?: Record<string, boolean[]> }>(`sd-interview:${designId}`, {});
  return {
    revealedStages: Object.entries(saved.revealed ?? {})
      .filter(([, v]) => v)
      .map(([k]) => k),
    ticks: saved.ticks ?? {},
  };
}

// ---- Behavioral story bank (written by Behavioral.tsx) ----

export function loadStoryCompetencies(): string[][] {
  const stories = read<{ competencies?: string[] }[]>("behavioral:stories", []);
  return Array.isArray(stories) ? stories.map((s) => s.competencies ?? []) : [];
}

// ---- Design pattern quiz: one entry per finished run ----

export interface PatternQuizRun {
  at: string;
  correct: number;
  total: number;
  full: boolean; // false for a "retry only the misses" run, which readiness ignores
}

export function loadPatternQuizHistory(): PatternQuizRun[] {
  const runs = read<PatternQuizRun[]>(PATTERN_QUIZ_KEY, []);
  return Array.isArray(runs) ? runs : [];
}

export function recordPatternQuizRun(run: PatternQuizRun) {
  write(PATTERN_QUIZ_KEY, [...loadPatternQuizHistory(), run].slice(-LIMIT));
}

// ---- Tool lessons the learner marked as worked through (tools have no server completion) ----

export function loadWorkedThrough(): string[] {
  const ids = read<string[]>(WORKED_KEY, []);
  return Array.isArray(ids) ? ids.filter((x) => typeof x === "string") : [];
}

export function setWorkedThrough(lessonId: string, on: boolean): string[] {
  const rest = loadWorkedThrough().filter((id) => id !== lessonId);
  const next = on ? [...rest, lessonId] : rest;
  write(WORKED_KEY, next);
  return next;
}

// ---- Glossary flash cards (written by Glossary.tsx under "glossary:cards") ----

// Leitner box (1 to 5) per term the learner has graded at least once.
export function loadGlossaryBoxes(): Record<string, number> {
  const cards = read<unknown>("glossary:cards", {});
  if (!cards || typeof cards !== "object" || Array.isArray(cards)) return {};
  const boxes: Record<string, number> = {};
  for (const [term, state] of Object.entries(cards as Record<string, { box?: unknown }>))
    if (state && typeof state.box === "number") boxes[term] = state.box;
  return boxes;
}

// ---- Complexity Gym: per-category answers, and "Explain it" rubric scores ----

export interface GymCategoryStats {
  timeSeen: number;
  timeCorrect: number;
  spaceSeen: number;
  spaceCorrect: number;
}

export type GymStats = Record<string, GymCategoryStats>;

export function loadGymStats(): GymStats {
  const stats = read<GymStats>(GYM_KEY, {});
  return stats && typeof stats === "object" && !Array.isArray(stats) ? stats : {};
}

export function recordGymAnswer(category: string, timeCorrect: boolean, spaceCorrect: boolean) {
  const stats = loadGymStats();
  const s = stats[category] ?? { timeSeen: 0, timeCorrect: 0, spaceSeen: 0, spaceCorrect: 0 };
  stats[category] = {
    timeSeen: s.timeSeen + 1,
    timeCorrect: s.timeCorrect + (timeCorrect ? 1 : 0),
    spaceSeen: s.spaceSeen + 1,
    spaceCorrect: s.spaceCorrect + (spaceCorrect ? 1 : 0),
  };
  write(GYM_KEY, stats);
}

export interface GymExplainAttempt {
  at: string;
  snippetId: string;
  category: string;
  rubricHits: number;
  rubricTotal: number;
  timeCorrect: boolean;
  spaceCorrect: boolean;
}

export function loadGymExplainHistory(): GymExplainAttempt[] {
  const runs = read<GymExplainAttempt[]>(GYM_EXPLAIN_KEY, []);
  return Array.isArray(runs) ? runs : [];
}

export function recordGymExplain(attempt: GymExplainAttempt) {
  write(GYM_EXPLAIN_KEY, [...loadGymExplainHistory(), attempt].slice(-LIMIT));
}

export function resetGymHistory() {
  write(GYM_KEY, {});
  write(GYM_EXPLAIN_KEY, []);
}

// ---- PLC programming exercises (graded in the browser, so tracked here rather than on the
// server; the readiness view doesn't use them) ----

export interface PlcExerciseProgress {
  attempts: number;
  passedAt?: string; // ISO date of the first pass
}

export function loadPlcProgress(): Record<string, PlcExerciseProgress> {
  const p = read<Record<string, PlcExerciseProgress>>(PLC_KEY, {});
  return p && typeof p === "object" && !Array.isArray(p) ? p : {};
}

export function recordPlcAttempt(exerciseId: string, passed: boolean): PlcExerciseProgress {
  const all = loadPlcProgress();
  const prev = all[exerciseId] ?? { attempts: 0 };
  const next: PlcExerciseProgress = { attempts: prev.attempts + 1, passedAt: prev.passedAt ?? (passed ? new Date().toISOString() : undefined) };
  all[exerciseId] = next;
  write(PLC_KEY, all);
  return next;
}

// ---- Micro850 hands-on labs: the "check yourself" ticks per lab, by item text (so
// reordering a checklist keeps the ticks). Kept in this browser only, like the PLC
// exercise history. ----

const M850_KEY = "history:micro850-labs";

export interface Micro850LabProgress {
  checked: string[];
  completedAt?: string; // ISO date when every item was first ticked
}

export function loadMicro850Progress(): Record<string, Micro850LabProgress> {
  const p = read<Record<string, Micro850LabProgress>>(M850_KEY, {});
  return p && typeof p === "object" && !Array.isArray(p) ? p : {};
}

export function saveMicro850Checks(labId: string, checked: string[], complete: boolean): Micro850LabProgress {
  const all = loadMicro850Progress();
  const prev = all[labId];
  const next: Micro850LabProgress = { checked, completedAt: prev?.completedAt ?? (complete ? new Date().toISOString() : undefined) };
  all[labId] = next;
  write(M850_KEY, all);
  return next;
}

export function resetMicro850Checks(labId: string) {
  const all = loadMicro850Progress();
  delete all[labId];
  write(M850_KEY, all);
}

// ---- Graded lessons opened in this browser: coverage evidence for the readiness view (the
// server only learns about a lesson once code is run or the reference is opened) ----

const OPENED_KEY = "history:opened-lessons";

export function loadOpenedLessons(): string[] {
  const ids = read<string[]>(OPENED_KEY, []);
  return Array.isArray(ids) ? ids.filter((x) => typeof x === "string") : [];
}

export function recordLessonOpened(lessonId: string) {
  const ids = loadOpenedLessons();
  if (!ids.includes(lessonId)) write(OPENED_KEY, [...ids, lessonId]);
}
