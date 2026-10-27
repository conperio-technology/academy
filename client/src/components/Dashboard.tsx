import { SECTION_INFO } from "../sectionInfo";
import { ProgressBackup } from "./ProgressBackup";
import type { NavItem, ReviewItem } from "../types";

interface Props {
  items: NavItem[];
  review: ReviewItem[];
  onSelect: (id: string) => void;
  // After a progress file was imported.
  onProgressImported?: () => void;
}

// Landing page shown when no lesson is selected: what the app covers and why each section
// exists, a "pick up where you left off" shortcut, and the spaced-repetition queue.
export function Dashboard({ items, review, onSelect, onProgressImported }: Props) {
  const sections = [...new Set(items.map((i) => i.section))];
  const practice = items.filter((i) => i.kind === "practice");
  const completedCount = practice.filter((i) => i.completed).length;
  const lessonsDone = items.filter((i) => i.completed).length;
  const nextUp = practice.find((i) => !i.completed);

  return (
    <div className="dashboard">
      <h1>Conperio Academy</h1>
      <p className="one-liner">
        {lessonsDone} of {items.length} lessons done, {completedCount} of {practice.length} graded exercises passed.
        {nextUp && (
          <>
            {" "}
            Next up:{" "}
            <button className="link-button" onClick={() => onSelect(nextUp.id)}>
              {nextUp.title}
            </button>
          </>
        )}
      </p>

      <ProgressBackup onImported={() => onProgressImported?.()} />

      {review.length > 0 && (
        <div className="review-panel">
          <h2>Due for review ({review.length})</h2>
          <p className="gate-note">
            You solved these a while ago. Re-solving one now (any language) pushes its next review further out -- the
            gaps grow 1, 3, 7, 14, then 30 days -- so it sticks instead of fading.
          </p>
          <ul>
            {review.map((r) => (
              <li key={r.conceptId}>
                <button className="link-button" onClick={() => onSelect(r.conceptId)}>
                  {r.title}
                </button>{" "}
                <span className="gate-note">
                  {r.daysOverdue > 0 ? `${r.daysOverdue} day${r.daysOverdue === 1 ? "" : "s"} overdue` : "due today"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="section-cards">
        {sections.map((section) => {
          const sectionItems = items.filter((i) => i.section === section);
          const sectionPractice = sectionItems.filter((i) => i.kind === "practice");
          const passed = sectionPractice.filter((i) => i.completed).length;
          const done = sectionItems.filter((i) => i.completed).length;
          const info = SECTION_INFO[section];
          const target = sectionItems.find((i) => !i.completed) ?? sectionItems[0];
          return (
            <div key={section} className="section-card">
              <h3>{section}</h3>
              {info && <p>{info.blurb}</p>}
              {info && <p className="gate-note">{info.why}</p>}
              <p className="section-card-stats">
                <span>
                  {done}/{sectionItems.length} done
                </span>
                {sectionPractice.length > 0 && (
                  <span>
                    {passed}/{sectionPractice.length} graded passed
                  </span>
                )}
              </p>
              <button onClick={() => onSelect(target.id)}>{done > 0 && done < sectionItems.length ? "Continue" : "Open"}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
