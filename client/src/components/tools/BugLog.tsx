import { useEffect, useMemo, useState } from "react";
import { fetchLessons, openLesson } from "../../api";
import { BUG_CATEGORIES, RECENT_DAYS, recentCounts } from "../../bugLogData";
import {
  addCustomBugCategory,
  deleteBug,
  loadBugLog,
  loadCustomBugCategories,
  recordBug,
  type BugEntry,
} from "../../practiceHistory";
import { ConfirmButton } from "../ConfirmButton";

// The personal bug log: what you noted after a fail-then-pass (BugLogPrompt) or added here by
// hand, with the categories that keep repeating over the last two weeks on top.

const TOP = 5;

export function BugLog() {
  const [bugs, setBugs] = useState<BugEntry[]>(loadBugLog);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [category, setCategory] = useState<string>(BUG_CATEGORIES[0]);
  const [custom, setCustom] = useState("");
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const categories = [...BUG_CATEGORIES, ...loadCustomBugCategories()];

  useEffect(() => {
    fetchLessons()
      .then((items) => setTitles(Object.fromEntries(items.map((i) => [i.id, i.title]))))
      .catch(() => {
        // Lesson ids show instead of titles.
      });
  }, []);

  const recent = useMemo(() => recentCounts(bugs), [bugs]);
  const top = recent.slice(0, TOP);
  const max = top[0]?.count ?? 0;
  const shown = [...bugs].reverse().filter((b) => filter === null || b.category === filter);
  const title = (id: string) => titles[id] ?? id;

  function add() {
    const chosen = custom.trim() || category;
    if (custom.trim()) addCustomBugCategory(custom.trim());
    recordBug({ lessonId: null, language: null, category: chosen, note: note.trim() });
    setBugs(loadBugLog());
    setCustom("");
    setNote("");
  }

  function remove(id: string) {
    deleteBug(id);
    setBugs(loadBugLog());
  }

  return (
    <div className="tool-widget">
      <h3>Your repeat bugs, last {RECENT_DAYS} days</h3>
      {top.length === 0 ? (
        <p className="gate-note">
          Nothing in the last {RECENT_DAYS} days yet. After a run fails and a later run passes, the lesson asks what the bug
          was; your answers collect here.
        </p>
      ) : (
        <ol className="bug-top">
          {top.map((c) => (
            <li key={c.category}>
              <button className="link-button" onClick={() => setFilter(filter === c.category ? null : c.category)}>
                {c.category}
              </button>{" "}
              <strong>{c.count}</strong>
              <div className="bug-bar" style={{ width: `${(100 * c.count) / max}%` }} />
              {c.lessons.length > 0 && (
                <span className="gate-note">
                  In:{" "}
                  {c.lessons.map((id, i) => (
                    <span key={id}>
                      {i > 0 && ", "}
                      <button className="link-button" onClick={() => openLesson(id)}>
                        {title(id)}
                      </button>
                    </span>
                  ))}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}

      <h3>Add one by hand</h3>
      <p className="gate-note">For a bug from a real interview, a whiteboard session, or anything outside the editor here.</p>
      <label className="bug-field">
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="bug-field">
        Or your own category
        <input value={custom} onChange={(e) => setCustom(e.target.value)} />
      </label>
      <label className="bug-field">
        Note
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="what happened, and where" />
      </label>
      <button onClick={add}>Add to the log</button>

      <h3>
        All entries ({shown.length}
        {filter && ` in "${filter}"`})
      </h3>
      {filter && (
        <button className="link-button" onClick={() => setFilter(null)}>
          Show every category
        </button>
      )}
      {shown.length === 0 ? (
        <p className="gate-note">No entries yet.</p>
      ) : (
        <ul className="bug-entries">
          {shown.map((b) => (
            <li key={b.id}>
              <span className="gate-note">{new Date(b.at).toLocaleDateString()}</span> <strong>{b.category}</strong>
              {b.lessonId && (
                <>
                  {" in "}
                  <button className="link-button" onClick={() => openLesson(b.lessonId!)}>
                    {title(b.lessonId)}
                  </button>
                </>
              )}
              {b.note && <>: {b.note}</>} <ConfirmButton label="Delete" confirmLabel="Delete this entry?" onConfirm={() => remove(b.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
