// The app's data layer. There is no server (docs/adr/0013): lesson content is JSON shipped
// with the site and progress lives in this browser; localBackend.ts does both.
export {
  fetchEvidence,
  fetchLesson,
  fetchLessons,
  fetchReview,
  fetchTool,
  recordProgress,
  recordReveal,
  resetAllProgress,
  resetLessonProgress,
} from "./localBackend";

// Dispatched on window with a lesson id as the detail; App.tsx listens and opens it.
export const OPEN_LESSON_EVENT = "academy:open-lesson";

export function openLesson(id: string) {
  window.dispatchEvent(new CustomEvent(OPEN_LESSON_EVENT, { detail: id }));
}
