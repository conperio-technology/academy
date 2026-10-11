import type { ExerciseMode } from "./bareStarter";
import * as local from "./localBackend";
import { STATIC_MODE } from "./staticMode";
import type { ConceptDetail, ExecuteResponse, LessonEvidence, NavItem, ReviewItem, ToolDetail } from "./types";

// Dispatched on window with a lesson id as the detail; App.tsx listens and opens it.
export const OPEN_LESSON_EVENT = "academy:open-lesson";

export function openLesson(id: string) {
  window.dispatchEvent(new CustomEvent(OPEN_LESSON_EVENT, { detail: id }));
}

// In static mode (staticMode.ts) every function below goes to localBackend.ts instead: content
// from exported JSON files, progress in this browser, and no server at all.
//
// Otherwise always the page's own origin. In dev, Vite forwards /api to the API on port 5095 (see
// vite.config.ts), so the page works from any device and hostname without a cross-origin
// request. A production build is served by the API itself (see the Dockerfile).
const BASE_URL = "";

// "guest" is the honest, expected answer for any local/LAN run -- see Program.cs's
// CurrentUserId() for why. Only meaningfully different once deployed behind the
// a reverse proxy that injects a real identity header.
export async function fetchCurrentUser(): Promise<string> {
  if (STATIC_MODE) return "this browser";
  const res = await fetch(`${BASE_URL}/api/me`);
  if (!res.ok) throw new Error(`Failed to load current user: ${res.status}`);
  const data = await res.json();
  return data.userId;
}

export async function fetchLessons(): Promise<NavItem[]> {
  if (STATIC_MODE) return local.fetchLessons();
  const res = await fetch(`${BASE_URL}/api/lessons`);
  if (!res.ok) throw new Error(`Failed to load lessons: ${res.status}`);
  return res.json();
}

export async function fetchReview(): Promise<ReviewItem[]> {
  if (STATIC_MODE) return local.fetchReview();
  const res = await fetch(`${BASE_URL}/api/review`);
  if (!res.ok) throw new Error(`Failed to load review queue: ${res.status}`);
  return res.json();
}

export async function fetchLesson(id: string): Promise<ConceptDetail> {
  if (STATIC_MODE) return local.fetchLesson(id);
  const res = await fetch(`${BASE_URL}/api/lessons/${id}`);
  if (!res.ok) throw new Error(`Failed to load lesson ${id}: ${res.status}`);
  return res.json();
}

export async function fetchTool(id: string): Promise<ToolDetail> {
  if (STATIC_MODE) return local.fetchTool(id);
  const res = await fetch(`${BASE_URL}/api/tools/${id}`);
  if (!res.ok) throw new Error(`Failed to load tool ${id}: ${res.status}`);
  return res.json();
}

// `mode` says which starter the attempt was made from; the server uses it (and whether the
// reference solution was seen recently) to record a pass as assisted or independent.
export async function executeCSharp(lessonId: string, code: string, mode: ExerciseMode = "guided"): Promise<ExecuteResponse> {
  // The static site has no server to grade on; CSharpRunner.tsx says why instead of calling this.
  if (STATIC_MODE) throw new Error("This copy of the Academy is a static site with no server, so C# can only be graded in the browser.");
  const res = await fetch(`${BASE_URL}/api/execute/csharp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lessonId, code, mode }),
  });
  if (!res.ok) {
    // 429 (a run already in progress) and 503 (runner busy) carry a readable { error }.
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Failed to execute code: ${res.status}`);
  }
  return res.json();
}

// For languages that execute client-side (Python via Pyodide): the client already knows
// pass/fail, this just persists the attempt so progress survives a reload.
export async function recordProgress(
  lessonId: string,
  language: string,
  code: string,
  passed: boolean,
  mode: ExerciseMode = "guided",
): Promise<void> {
  if (STATIC_MODE) return local.recordProgress(lessonId, language, code, passed, mode);
  const res = await fetch(`${BASE_URL}/api/progress/record`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lessonId, language, code, passed, mode }),
  });
  if (!res.ok) throw new Error(`Failed to record progress: ${res.status}`);
}

// The learner opened the reference solution: passes in the next week count as assisted.
export async function recordReveal(lessonId: string, language: string): Promise<void> {
  if (STATIC_MODE) return local.recordReveal(lessonId, language);
  const res = await fetch(`${BASE_URL}/api/progress/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lessonId, language }),
  });
  if (!res.ok) throw new Error(`Failed to record the reveal: ${res.status}`);
}

// Per-lesson evidence for the readiness view; lessons never touched are absent.
export async function fetchEvidence(): Promise<LessonEvidence[]> {
  if (STATIC_MODE) return local.fetchEvidence();
  const res = await fetch(`${BASE_URL}/api/progress/evidence`);
  if (!res.ok) throw new Error(`Failed to load progress evidence: ${res.status}`);
  return res.json();
}

export async function resetLessonProgress(lessonId: string): Promise<void> {
  if (STATIC_MODE) return local.resetLessonProgress(lessonId);
  const res = await fetch(`${BASE_URL}/api/progress/${lessonId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to reset progress: ${res.status}`);
}

export async function resetAllProgress(): Promise<void> {
  if (STATIC_MODE) return local.resetAllProgress();
  const res = await fetch(`${BASE_URL}/api/progress`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to reset all progress: ${res.status}`);
}
