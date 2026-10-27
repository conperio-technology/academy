// What the dashboard's Today strip needs from the study paths: the goal picked on the first
// visit, and the next step on that path. The FAANG plan's task rules live here too (taskDone),
// shared with the plan itself (components/tools/PrepPlan.tsx), so the dashboard and the plan
// agree on what's done.
import { repDayCount } from "./buildingBlocksData.ts";
import { buildPlan, DEFAULT_PROFILE, LEVELS, scheduleByHours, type PlanProfile, type PlanTask } from "./prepPlanData.ts";
import { loadBlockReps, loadPatternQuizHistory, loadStoryCompetencies, loadWalkthrough, loadWorkedThrough } from "./practiceHistory.ts";
import { IT_CS_FAMILIES } from "./studyPathData.ts";
import { DESIGN_INTERVIEWS } from "./systemDesignInterviews.ts";
import type { NavItem } from "./types.ts";

export type Goal = "faang" | "it-cs" | "learn" | "browse";

const GOAL_KEY = "study-path:goal";
const GOALS: Goal[] = ["faang", "it-cs", "learn", "browse"];

export function loadGoal(): Goal | null {
  try {
    const g = localStorage.getItem(GOAL_KEY);
    return GOALS.includes(g as Goal) ? (g as Goal) : null;
  } catch {
    return null;
  }
}

export function saveGoal(goal: Goal | null) {
  try {
    if (goal) localStorage.setItem(GOAL_KEY, goal);
    else localStorage.removeItem(GOAL_KEY);
  } catch {
    // Blocked storage: the welcome card shows again next visit.
  }
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

// ---- FAANG plan tasks ----

export function walkthroughDone(design: string) {
  const interview = (DESIGN_INTERVIEWS as Record<string, { stages: { id: string }[] }>)[design];
  if (!interview) return false;
  const revealed = new Set(loadWalkthrough(design).revealedStages);
  return interview.stages.every((s) => revealed.has(s.id));
}

export interface TaskDoneContext {
  ticked: string[]; // task keys ticked by hand
  completed: (lessonId: string) => boolean; // graded lesson passed
  worked: Set<string>; // tool lessons marked done
  storyCount: number;
  fullQuizRuns: number;
  repDays: number;
}

export function taskDone(t: PlanTask, ctx: TaskDoneContext): boolean {
  if (ctx.ticked.includes(t.key)) return true;
  switch (t.doneBy?.kind) {
    case "lesson":
      return ctx.completed(t.lessonId);
    case "walkthrough":
      return walkthroughDone(t.doneBy.design);
    case "stories":
      return ctx.storyCount >= t.doneBy.target;
    case "worked":
      return ctx.worked.has(t.lessonId);
    case "patternQuiz":
      return ctx.fullQuizRuns >= t.doneBy.runs;
    case "reps":
      return ctx.repDays >= t.doneBy.sessions;
    default:
      return false;
  }
}

interface SavedFaangPlan {
  start: string;
  ticked: string[];
  profile?: PlanProfile;
}

export interface NextStep {
  lessonId: string;
  label: string;
  detail: string;
}

const WEEK_MS = 7 * 24 * 3600 * 1000;

// null when every task is done; "no-plan" before a plan was started.
export function faangNext(items: NavItem[]): NextStep | "no-plan" | null {
  const plan = readJson<SavedFaangPlan>("prep-plan");
  if (!plan?.start) return "no-plan";
  const byId = new Map(items.map((i) => [i.id, i]));
  const exists = (id: string) => byId.has(id);
  const profile = plan.profile ?? DEFAULT_PROFILE;
  const weeks = scheduleByHours(buildPlan(profile, exists), profile.hoursPerWeek, exists("building-block-reps"));
  const ctx: TaskDoneContext = {
    ticked: plan.ticked ?? [],
    completed: (id) => byId.get(id)?.completed ?? false,
    worked: new Set(loadWorkedThrough()),
    storyCount: loadStoryCompetencies().length,
    fullQuizRuns: loadPatternQuizHistory().filter((r) => r.full && r.total > 0).length,
    repDays: repDayCount(loadBlockReps()),
  };
  const current = Math.floor((Date.now() - new Date(plan.start).getTime()) / WEEK_MS);
  for (let i = 0; i < weeks.length; i++) {
    const task = weeks[i].tasks.find((t) => !taskDone(t, ctx));
    if (!task) continue;
    const when = i < current ? ", behind" : i === current ? ", this week" : "";
    return {
      lessonId: task.lessonId,
      label: task.label ?? byId.get(task.lessonId)?.title ?? task.lessonId,
      detail: `FAANG plan, week ${i + 1} of ${weeks.length}${when}`,
    };
  }
  return null;
}

const lessonDone = (i: NavItem | undefined) => i?.completed ?? false;

function firstUndone(ids: string[], items: NavItem[], detail: (id: string) => string): NextStep | null {
  const byId = new Map(items.map((i) => [i.id, i]));
  const id = ids.find((x) => byId.has(x) && !lessonDone(byId.get(x)));
  return id ? { lessonId: id, label: byId.get(id)!.title, detail: detail(id) } : null;
}

// The IT & CS path is ordered by family, so its next step is the first lesson not done.
export function itCsNext(items: NavItem[]): NextStep | null {
  const familyOf = new Map(IT_CS_FAMILIES.flatMap((f) => f.lessons.map((id) => [id, f.label] as const)));
  return firstUndone(
    IT_CS_FAMILIES.flatMap((f) => f.lessons),
    items,
    (id) => `Well-rounded IT & CS path, ${familyOf.get(id)}`,
  );
}

// Learning to program from zero follows the FAANG plan's programming prerequisites.
export const LEARN_LESSONS: string[] = (LEVELS.new.prerequisites ?? []).map((t) => t.lessonId);

export function learnNext(items: NavItem[]): NextStep | null {
  const ids = LEARN_LESSONS.filter((id) => items.some((i) => i.id === id));
  return firstUndone(ids, items, (id) => `Learn to program, step ${ids.indexOf(id) + 1} of ${ids.length}`);
}
