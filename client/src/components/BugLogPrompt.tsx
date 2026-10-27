import { useState } from "react";
import { openLesson } from "../api";
import { BUG_CATEGORIES, bugsFor } from "../bugLogData";
import { addCustomBugCategory, loadBugLog, loadCustomBugCategories, recordBug } from "../practiceHistory";

// Asked after a run fails and a later run passes: what was the bug? One tap on a category, an
// optional note, or skip. Entries go to the personal bug log (tools/BugLog.tsx).
export function BugLogPrompt({ lessonId, language, failedRuns }: { lessonId: string; language: string; failedRuns: number }) {
  const [state, setState] = useState<"asking" | "saved" | "skipped">("asking");
  const [category, setCategory] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [note, setNote] = useState("");
  const categories = [...BUG_CATEGORIES, ...loadCustomBugCategories()];

  function save() {
    const chosen = custom.trim() || category;
    if (!chosen) return;
    if (custom.trim()) addCustomBugCategory(custom.trim());
    recordBug({ lessonId, language, category: chosen, note: note.trim() });
    setState("saved");
  }

  if (state === "skipped") return null;
  if (state === "saved")
    return (
      <p className="gate-note bug-prompt">
        Saved to your{" "}
        <button className="link-button" onClick={() => openLesson("bug-log")}>
          bug log
        </button>
        .
      </p>
    );

  return (
    <div className="drill-feedback bug-prompt">
      <p>
        <strong>What was the bug?</strong> It took {failedRuns + 1} runs. Note what went wrong so you can see which bugs
        keep coming back.
      </p>
      <div className="bug-chips">
        {categories.map((c) => (
          <button
            key={c}
            className={c === category && !custom.trim() ? "active" : ""}
            aria-pressed={c === category && !custom.trim()}
            onClick={() => {
              setCategory(c);
              setCustom("");
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <label className="bug-field">
        Or your own category
        <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="e.g. compared values instead of indices" />
      </label>
      <label className="bug-field">
        Note (optional)
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="what exactly happened" />
      </label>
      <div className="darr-actions">
        <button onClick={save} disabled={!custom.trim() && !category}>
          Save
        </button>
        <button onClick={() => setState("skipped")}>Skip</button>
      </div>
    </div>
  );
}

// "Your past bugs here": the latest entries for this lesson, shown before you start.
export function PastBugs({ lessonId }: { lessonId: string }) {
  const [bugs] = useState(() => bugsFor(loadBugLog(), lessonId).slice(-5).reverse());
  if (bugs.length === 0) return null;
  return (
    <div className="pattern-note pattern-note-gotchas past-bugs">
      <h3>Your past bugs here</h3>
      <ul>
        {bugs.map((b) => (
          <li key={b.id}>
            {b.category}
            {b.note && `: ${b.note}`} <span className="gate-note">({new Date(b.at).toLocaleDateString()})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
