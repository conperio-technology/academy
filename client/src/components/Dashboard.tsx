import { useState } from "react";
import { loadBlockReps } from "../practiceHistory";
import { faangNext, itCsNext, learnNext, loadGoal, saveGoal, type Goal, type NextStep } from "../pathProgress";
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

const GOAL_CHOICES: { goal: Goal; label: string; blurb: string }[] = [
  {
    goal: "faang",
    label: "Prepare for coding interviews",
    blurb: "A week-by-week plan for coding, system design and behavioral rounds, sized to the hours you have.",
  },
  {
    goal: "it-cs",
    label: "Build broad IT and CS knowledge",
    blurb: "Hardware, programming, operating systems, networks, security, Linux, databases and AI, in order.",
  },
  {
    goal: "learn",
    label: "Learn to program from zero",
    blurb: "C# and Python side by side with small graded exercises, then the simple building blocks.",
  },
  { goal: "browse", label: "Just browsing", blurb: "Skip this. Every section is in the menu, and you can pick a path later." },
];

// Where each path's plan lives: picking a path opens it.
const PATH_LESSON: Partial<Record<Goal, string>> = { faang: "faang-study-path", "it-cs": "it-cs-study-path" };

function WelcomeCard({ first, onChoose, onCancel }: { first: boolean; onChoose: (g: Goal) => void; onCancel: () => void }) {
  return (
    <div className="welcome-card">
      <h2>{first ? "Welcome. What are you here for?" : "Pick a path"}</h2>
      <p className="gate-note">
        Your answer sets what the dashboard suggests next. Progress is kept in this browser, and you can change paths
        any time.
      </p>
      <div className="welcome-choices">
        {GOAL_CHOICES.map((c) => (
          <button key={c.goal} className="welcome-choice" onClick={() => onChoose(c.goal)}>
            <strong>{c.label}</strong>
            <span>{c.blurb}</span>
          </button>
        ))}
      </div>
      {!first && (
        <button className="link-button" onClick={onCancel}>
          Keep my current path
        </button>
      )}
    </div>
  );
}

function sameDay(iso: string, now: Date) {
  const d = new Date(iso);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

// The Today strip: the next step on the chosen path, today's reps and the review queue, one click each.
function TodayStrip({ goal, items, review, onSelect, onChangePath }: { goal: Goal; items: NavItem[]; review: ReviewItem[]; onSelect: (id: string) => void; onChangePath: () => void }) {
  const exists = (id: string) => items.some((i) => i.id === id);
  const next: NextStep | "no-plan" | null = goal === "faang" ? faangNext(items) : goal === "it-cs" ? itCsNext(items) : learnNext(items);
  const repsToday = loadBlockReps().some((r) => sameDay(r.at, new Date()));
  const showReps = goal !== "it-cs" && exists("building-block-reps");
  return (
    <div className="today-strip">
      <div className="today-head">
        <h2>Today</h2>
        <button className="link-button" onClick={onChangePath}>
          Change path
        </button>
      </div>
      <ul>
        {next === "no-plan" ? (
          <li>
            <span className="today-label">Your plan</span>
            <button className="link-button" onClick={() => onSelect("faang-study-path")}>
              Set up your interview plan: your level, target role and hours a week
            </button>
          </li>
        ) : next ? (
          <li>
            <span className="today-label">Next step</span>
            <button className="link-button" onClick={() => onSelect(next.lessonId)}>
              {next.label}
            </button>{" "}
            <span className="gate-note">{next.detail}</span>
          </li>
        ) : (
          <li>
            <span className="today-label">Next step</span>
            <span>Every step on this path is done. Pick another path, or keep your reviews going.</span>
          </li>
        )}
        {showReps && (
          <li>
            <span className="today-label">Reps</span>
            <button className="link-button" onClick={() => onSelect("building-block-reps")}>
              Today's reps
            </button>{" "}
            <span className="gate-note">{repsToday ? "done today ✅" : "15 minutes of building blocks, not done yet today"}</span>
          </li>
        )}
        {review.length > 0 && (
          <li>
            <span className="today-label">Review</span>
            <button className="link-button" onClick={() => onSelect(review[0].conceptId)}>
              {review[0].title}
            </button>{" "}
            <span className="gate-note">
              {review.length === 1 ? "due for review" : `and ${review.length - 1} more due for review, listed below`}
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}

// Landing page shown when no lesson is selected: on a first visit, a card asking what the
// learner is here for; after that, a Today strip for the chosen path. Below: overall progress,
// the spaced-repetition queue, and what each section covers and why it exists.
export function Dashboard({ items, review, onSelect, onProgressImported }: Props) {
  const [goal, setGoal] = useState<Goal | null>(loadGoal);
  const [picking, setPicking] = useState(false);
  function choose(g: Goal) {
    saveGoal(g);
    setGoal(g);
    setPicking(false);
    const open = PATH_LESSON[g] ?? (g === "learn" ? learnNext(items)?.lessonId : undefined);
    if (open) onSelect(open);
  }
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
        {(!goal || goal === "browse") && nextUp && (
          <>
            {" "}
            Next up:{" "}
            <button className="link-button" onClick={() => onSelect(nextUp.id)}>
              {nextUp.title}
            </button>
          </>
        )}
      </p>

      {items.length > 0 && (!goal || picking) && <WelcomeCard first={!goal} onChoose={choose} onCancel={() => setPicking(false)} />}
      {goal && goal !== "browse" && !picking && items.length > 0 && (
        <TodayStrip goal={goal} items={items} review={review} onSelect={onSelect} onChangePath={() => setPicking(true)} />
      )}
      {goal === "browse" && !picking && (
        <p className="gate-note">
          Browsing freely.{" "}
          <button className="link-button" onClick={() => setPicking(true)}>
            Pick a path
          </button>{" "}
          for a suggested next step each day.
        </p>
      )}

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
