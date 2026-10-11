import { useEffect, useState } from "react";
import type { NavItem } from "../types";

interface Props {
  items: NavItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  dueIds: Set<string>;
}

const DSA_SECTION = "Data Structures & Algorithms";
const STORAGE_KEY = "nav-expanded-sections";

function loadExpanded(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function LessonList({ items, selectedId, onSelect, dueIds }: Props) {
  const bySection = groupBy(items, (i) => i.section);
  // Collapsed by default: with six sections and ~100 lessons an always-open list is a long
  // scroll. Which sections are open is remembered per browser; picking a lesson (from the
  // dashboard, say) always opens the section it lives in so the selection is never hidden.
  const [expanded, setExpanded] = useState<Set<string>>(loadExpanded);

  function persist(next: Set<string>) {
    setExpanded(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      // Storage blocked: the state still works for this session, it just won't be remembered.
    }
  }

  const selectedSection = items.find((i) => i.id === selectedId)?.section;
  useEffect(() => {
    if (selectedSection && !expanded.has(selectedSection)) persist(new Set(expanded).add(selectedSection));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSection]);

  function toggle(section: string) {
    const next = new Set(expanded);
    if (next.has(section)) next.delete(section);
    else next.add(section);
    persist(next);
  }

  return (
    <nav className="lesson-list">
      {Object.entries(bySection).map(([section, sectionItems]) => {
        const open = expanded.has(section);
        const practice = sectionItems.filter((i) => i.kind === "practice");
        const completed = practice.filter((i) => i.completed).length;
        const dueCount = sectionItems.filter((i) => dueIds.has(i.id)).length;
        return (
          <div key={section} className="lesson-section">
            <button className="section-toggle" onClick={() => toggle(section)} aria-expanded={open}>
              <span className="section-chevron">{open ? "▾" : "▸"}</span>
              <span className="section-toggle-title">{section}</span>
              <span className="section-count">
                {dueCount > 0 && <span className="due-badge" title="Lessons due for review">{dueCount}</span>}
                {practice.length > 0 ? `${completed}/${practice.length}` : `${sectionItems.length}`}
              </span>
            </button>
            {open &&
              Object.entries(groupBy(sectionItems, (i) => i.track)).map(([track, trackItems]) => (
                <div key={track} className="lesson-track">
                  <h3>{track}</h3>
                  <ul>
                    {trackItems.map((item) => (
                      <li key={item.id}>
                        <button
                          className={`lesson-list-item ${selectedId === item.id ? "selected" : ""}`}
                          onClick={() => onSelect(item.id)}
                        >
                          <span className="lesson-check">
                            {item.kind === "tool" ? "🛠" : item.completed ? "✅" : "○"}
                          </span>
                          <span>{item.title}</span>
                          {dueIds.has(item.id) && (
                            <span className="due-flag" title="Due for review">
                              🔁
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            {open && section === DSA_SECTION && !sectionItems.some((i) => i.track === "patterns") && (
              <div className="lesson-track lesson-track-future">
                <h3>patterns (coming later)</h3>
                <p className="future-note">
                  Two pointers, sliding window, backtracking &amp; more — unlocked once the fundamentals
                  track has enough building blocks underneath it.
                </p>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = keyFn(item);
    (acc[key] ??= []).push(item);
    return acc;
  }, {});
}
