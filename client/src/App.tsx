import { useEffect, useState } from "react";
import { fetchLessons, fetchReview, OPEN_LESSON_EVENT, resetAllProgress } from "./api";
import { ConfirmButton } from "./components/ConfirmButton";
import { Dashboard } from "./components/Dashboard";
import { LessonList } from "./components/LessonList";
import { LessonView } from "./components/LessonView";
import { ToolView } from "./components/ToolView";
import { siteUrl } from "./siteUrl";
import type { NavItem, ReviewItem } from "./types";

// The open lesson is in the URL's hash (#/two-sum), so a link to a lesson works, a reload
// stays on it, and Back goes to the previous one. A hash, not a path, because a static host
// only has index.html to serve and can't route /two-sum to it.
function lessonFromHash(): string | null {
  try {
    return decodeURIComponent(window.location.hash.replace(/^#\/?/, "")) || null;
  } catch {
    return null; // a malformed escape in a hand-edited URL
  }
}

function App() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [review, setReview] = useState<ReviewItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(lessonFromHash);
  const [error, setError] = useState<string | null>(null);
  // Bumped on "reset all" so the open LessonView remounts and refetches instead of
  // showing stale completed/editor state for a lesson that was just wiped.
  const [viewGeneration, setViewGeneration] = useState(0);
  // Only meaningful below the mobile breakpoint (see .sidebar/.sidebar-overlay in
  // index.css) -- the sidebar is always visible above it regardless of this flag.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function reload() {
    fetchLessons()
      .then((data) => {
        setItems(data);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load the lesson list."));
    // The review queue is secondary: if it fails the rest of the app still works.
    fetchReview()
      .then(setReview)
      .catch(() => setReview([]));
  }

  useEffect(reload, []);
  // Lets a tool deep inside the view (the mixed interview set's "open the lesson" link)
  // navigate without threading a callback through ToolView.
  useEffect(() => {
    const open = (e: Event) => setSelectedId((e as CustomEvent<string>).detail);
    window.addEventListener(OPEN_LESSON_EVENT, open);
    return () => window.removeEventListener(OPEN_LESSON_EVENT, open);
  }, []);
  // Keep the hash in step with the open lesson, and follow Back/Forward and edited hashes.
  useEffect(() => {
    if (lessonFromHash() === selectedId) return;
    const url = selectedId ? `#/${encodeURIComponent(selectedId)}` : window.location.pathname + window.location.search;
    window.history.pushState(null, "", url);
  }, [selectedId]);
  useEffect(() => {
    const follow = () => setSelectedId(lessonFromHash());
    window.addEventListener("popstate", follow);
    window.addEventListener("hashchange", follow);
    return () => {
      window.removeEventListener("popstate", follow);
      window.removeEventListener("hashchange", follow);
    };
  }, []);

  // After progress changed underneath every view (reset all, or an import).
  function refreshAll() {
    setViewGeneration((g) => g + 1);
    reload();
  }

  async function handleResetAll() {
    await resetAllProgress();
    refreshAll();
  }

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  function selectAndClose(id: string | null) {
    setSelectedId(id);
    setSidebarOpen(false);
  }

  return (
    <div className="app-shell">
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="app-header" onClick={() => selectAndClose(null)} aria-label="Home">
          <div className="app-logo">
            <img src={siteUrl("conperio-logo.png")} alt="Conperio" />
          </div>
          <span className="app-title">Academy</span>
        </button>
        {error ? (
          <p className="status-text error">Couldn't load the lesson list ({error}). Try reloading the page.</p>
        ) : (
          <>
            <LessonList
              items={items}
              selectedId={selectedId}
              onSelect={selectAndClose}
              dueIds={new Set(review.map((r) => r.conceptId))}
            />
            <div className="sidebar-footer">
              <p className="current-user">Progress is saved in this browser only</p>
              <ConfirmButton
                label="Reset all progress"
                confirmLabel="Reset every lesson back to not-started?"
                onConfirm={handleResetAll}
              />
              <p className="licence-link">
                <a href={siteUrl("THIRD_PARTY_NOTICES.txt")} target="_blank" rel="noopener">
                  Licences and third-party notices
                </a>
              </p>
            </div>
          </>
        )}
      </aside>
      <main className="main-content">
        {selectedItem?.kind === "tool" && <ToolView key={`${selectedId}-${viewGeneration}`} toolId={selectedItem.id} />}
        {selectedItem?.kind === "practice" && (
          <LessonView key={`${selectedId}-${viewGeneration}`} lessonId={selectedItem.id} onCompleted={reload} />
        )}
        {!selectedItem && !error && (
          <Dashboard items={items} review={review} onSelect={selectAndClose} onProgressImported={refreshAll} />
        )}
      </main>
    </div>
  );
}

export default App;
