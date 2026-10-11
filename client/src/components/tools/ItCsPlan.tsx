import { useEffect, useMemo, useState } from "react";
import { fetchLessons, fetchReview, openLesson } from "../../api";
import { scheduleTasks } from "../../planSchedule";
import { loadWorkedThrough, setWorkedThrough } from "../../practiceHistory";
import { IT_CS_ACTIVITIES, IT_CS_FAMILIES, IT_CS_MINUTES, IT_CS_PHASES, IT_CS_WEEK_OPTIONS } from "../../studyPathData";
import type { NavItem, ReviewItem } from "../../types";

// The "Well-rounded IT & CS" path: the same readiness and week-by-week plan views as the FAANG
// plan, built from the topic families in studyPathData.ts. Graded lessons tick themselves when
// solved on the server; tool lessons count once marked worked through, shared with the FAANG
// plan's CS foundations list (history:worked-through), so a lesson ticked in one shows in both.

const PLAN_KEY = "study-path:it-cs";

interface SavedPlan {
  weeks: number;
  start: string;
  ticked: string[]; // activity keys ticked by hand
}

interface Task {
  key: string;
  lessonId: string;
  label?: string;
  family: string;
  minutes: number;
  activity: boolean;
}

function loadPlan(): SavedPlan | null {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    return raw ? (JSON.parse(raw) as SavedPlan) : null;
  } catch {
    return null;
  }
}

function savePlan(plan: SavedPlan | null) {
  try {
    if (plan) localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
    else localStorage.removeItem(PLAN_KEY);
  } catch {
    // Blocked storage: the plan lasts until the page is closed.
  }
}

const pct = (n: number) => `${Math.round(n * 100)}%`;

export function ItCsPlan() {
  const [items, setItems] = useState<NavItem[] | null>(null);
  const [review, setReview] = useState<ReviewItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<SavedPlan | null>(loadPlan);
  const [weeksChoice, setWeeksChoice] = useState(12);
  const [tab, setTab] = useState<"readiness" | "plan">(plan ? "plan" : "readiness");
  const [confirmReset, setConfirmReset] = useState(false);
  const [worked, setWorked] = useState<string[]>(loadWorkedThrough);

  useEffect(() => {
    fetchLessons()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Couldn't load lessons."));
    fetchReview()
      .then(setReview)
      .catch(() => setReview([]));
  }, []);

  useEffect(() => savePlan(plan), [plan]);

  const byId = useMemo(() => new Map((items ?? []).map((i) => [i.id, i])), [items]);

  if (error) return <p className="constraint-fail">{error}</p>;
  if (!items) return <p className="status-text">Loading your progress…</p>;

  const workedSet = new Set(worked);
  const isTool = (id: string) => byId.get(id)?.kind === "tool";
  const lessonDone = (id: string) => (isTool(id) ? workedSet.has(id) : (byId.get(id)?.completed ?? false));
  const markWorked = (id: string, on: boolean) => setWorked(setWorkedThrough(id, on));

  // ---- Readiness ----

  const families = IT_CS_FAMILIES.map((f) => {
    const lessons = f.lessons.filter((id) => byId.has(id));
    const done = lessons.filter(lessonDone).length;
    return { ...f, lessons, done, next: lessons.find((id) => !lessonDone(id)) };
  }).filter((f) => f.lessons.length > 0);
  const totalLessons = families.reduce((n, f) => n + f.lessons.length, 0);
  const totalDone = families.reduce((n, f) => n + f.done, 0);
  const famById = new Map(families.map((f) => [f.id, f]));

  // Phase coverage for the summary tiles.
  const phaseCoverage = IT_CS_PHASES.map((p) => {
    const fs = p.families.map((id) => famById.get(id)).filter((f): f is (typeof families)[number] => f !== undefined);
    const total = fs.reduce((n, f) => n + f.lessons.length, 0);
    return { name: p.name, total, done: fs.reduce((n, f) => n + f.done, 0) };
  }).filter((p) => p.total > 0);

  const focus: { text: string; lessonId: string }[] = [];
  if (review.length > 0)
    focus.push({ text: `${review.length} solved ${review.length === 1 ? "lesson is" : "lessons are"} due for review, starting with ${review[0].title}`, lessonId: review[0].conceptId });
  // The path is ordered, so the first unfinished family is "where you are"; the least covered
  // family is the gap to close next.
  const current = families.find((f) => f.next);
  if (current) focus.push({ text: `Continue ${current.label}: ${byId.get(current.next!)!.title}`, lessonId: current.next! });
  const weakest = [...families].filter((f) => f.next && f.id !== current?.id).sort((a, b) => a.done / a.lessons.length - b.done / b.lessons.length)[0];
  if (weakest) focus.push({ text: `${weakest.label} is your least covered area: start with ${byId.get(weakest.next!)!.title}`, lessonId: weakest.next! });

  // ---- Plan ----

  const phaseTasks: Task[][] = IT_CS_PHASES.map((p) =>
    p.families.flatMap((fid) => {
      const f = famById.get(fid);
      const lessonTasks: Task[] = (f?.lessons ?? []).map((id) => ({
        key: id,
        lessonId: id,
        family: f!.label,
        minutes: isTool(id) ? IT_CS_MINUTES.tool : IT_CS_MINUTES.practice,
        activity: false,
      }));
      const extras: Task[] = IT_CS_ACTIVITIES.filter((a) => a.after === fid && byId.has(a.lessonId)).map((a) => ({
        key: a.key,
        lessonId: a.lessonId,
        label: a.label,
        family: "practice",
        minutes: a.minutes,
        activity: true,
      }));
      return [...lessonTasks, ...extras];
    }),
  );
  const nonEmpty = phaseTasks.map((t, i) => ({ t, i })).filter((x) => x.t.length > 0);
  const isDone = (t: Task) => (t.activity ? (plan?.ticked.includes(t.key) ?? false) : lessonDone(t.lessonId));
  const autoDone = (t: Task) => !t.activity && !isTool(t.lessonId);
  function toggle(t: Task) {
    if (!t.activity) {
      if (isTool(t.lessonId)) markWorked(t.lessonId, !workedSet.has(t.lessonId));
      return;
    }
    setPlan((p) => p && { ...p, ticked: p.ticked.includes(t.key) ? p.ticked.filter((k) => k !== t.key) : [...p.ticked, t.key] });
  }

  const { weeks, phase } = plan
    ? scheduleTasks(
        nonEmpty.map((x) => x.t),
        plan.weeks,
        nonEmpty.map((x) => IT_CS_PHASES[x.i].share),
      )
    : { weeks: [], phase: [] };
  const currentWeek = plan ? Math.floor((Date.now() - new Date(plan.start).getTime()) / (7 * 24 * 3600 * 1000)) : 0;
  const allTasks = phaseTasks.flat();
  const doneCount = allTasks.filter(isDone).length;
  const totalMinutes = allTasks.reduce((n, t) => n + t.minutes, 0);

  return (
    <div className="tool-widget">
      <div className="sql-presets">
        <button className={tab === "readiness" ? "active" : ""} onClick={() => setTab("readiness")}>
          Progress
        </button>
        <button className={tab === "plan" ? "active" : ""} onClick={() => setTab("plan")}>
          Study plan
        </button>
      </div>

      {tab === "readiness" && (
        <>
          <div className="prep-areas">
            <div className="prep-area">
              <span className="prep-area-label">Whole path</span>
              <span className="prep-area-score">{pct(totalDone / Math.max(1, totalLessons))}</span>
              <div className="prep-meter">
                <div style={{ width: pct(totalDone / Math.max(1, totalLessons)) }} />
              </div>
              <span className="status-text">
                {totalDone} of {totalLessons} lessons
              </span>
            </div>
            {phaseCoverage.map((p) => (
              <div key={p.name} className="prep-area">
                <span className="prep-area-label">{p.name}</span>
                <span className="prep-area-score">{pct(p.done / p.total)}</span>
                <div className="prep-meter">
                  <div style={{ width: pct(p.done / p.total) }} />
                </div>
                <span className="status-text">
                  {p.done} of {p.total}
                </span>
              </div>
            ))}
          </div>

          {focus.length > 0 && (
            <div className="drill-feedback prep-focus">
              <p>
                <strong>Focus next</strong>
              </p>
              <ol>
                {focus.map((f) => (
                  <li key={f.text}>
                    <button className="link-button" onClick={() => openLesson(f.lessonId)}>
                      {f.text}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <h3 className="sdi-sub">By topic</h3>
          <table className="bigo-table prep-table">
            <tbody>
              {families.map((f) => (
                <tr key={f.id}>
                  <td>
                    {f.label}
                    <div className="status-text ns-small">{f.blurb}</div>
                  </td>
                  <td className="prep-bar-cell">
                    <div className="prep-meter">
                      <div style={{ width: pct(f.done / f.lessons.length) }} />
                    </div>
                  </td>
                  <td className="mono">
                    {f.done}/{f.lessons.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <details className="prep-week">
            <summary>Mark the lessons you&apos;ve worked through</summary>
            {families.map((f) => (
              <div key={f.id}>
                <h3 className="sdi-sub">{f.label}</h3>
                <ul className="sdi-points prep-tasks">
                  {f.lessons.map((id) => (
                    <li key={id}>
                      <label>
                        <input type="checkbox" checked={lessonDone(id)} disabled={!isTool(id)} onChange={() => markWorked(id, !workedSet.has(id))} />
                        <span>
                          <button className="link-button" onClick={() => openLesson(id)}>
                            {byId.get(id)!.title}
                          </button>
                          {!isTool(id) && <span className="status-text">, ticks itself when you solve it</span>}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </details>
          <p className="gate-note">
            Graded exercises count when you pass them; explainer lessons count when you mark them worked through (that list is shared with the interview plan&apos;s CS
            foundations). This measures coverage, not mastery: the quizzes and drills inside each lesson are the real check.
          </p>
        </>
      )}

      {tab === "plan" && !plan && (
        <div className="crypto-section">
          <h3>Build a plan</h3>
          <p className="gate-note">
            How many weeks do you want to spread it over? The path is the same either way ({allTasks.length} tasks, about {Math.round(totalMinutes / 60)} hours, in{" "}
            {nonEmpty.length} phases); fewer weeks means more each week. Lessons you&apos;ve already done are ticked off automatically.
          </p>
          <div className="sql-presets">
            {IT_CS_WEEK_OPTIONS.map((w) => (
              <button key={w} className={w === weeksChoice ? "active" : ""} onClick={() => setWeeksChoice(w)}>
                {w} weeks (about {Math.round(totalMinutes / 60 / w)} h/week)
              </button>
            ))}
          </div>
          <button onClick={() => setPlan({ weeks: weeksChoice, start: new Date().toISOString(), ticked: [] })}>Start the plan today</button>
        </div>
      )}

      {tab === "plan" && plan && (
        <>
          <p className="drill-statement">
            Week {Math.min(currentWeek + 1, plan.weeks)} of {plan.weeks}: {doneCount} of {allTasks.length} tasks done.
          </p>
          <div className="prep-meter prep-meter-wide">
            <div style={{ width: pct(doneCount / Math.max(1, allTasks.length)) }} />
          </div>
          {weeks.map((tasks, w) => {
            const weekDone = tasks.filter(isDone).length;
            const isCurrent = w === Math.min(currentWeek, plan.weeks - 1);
            return (
              <details key={w} className={isCurrent ? "prep-week prep-week-current" : "prep-week"} open={isCurrent}>
                <summary>
                  <strong>Week {w + 1}</strong> · {IT_CS_PHASES[nonEmpty[phase[w]].i].name} ·{" "}
                  <span className="status-text">
                    {weekDone}/{tasks.length} done, about {Math.round(tasks.reduce((n, t) => n + t.minutes, 0) / 60)} h
                    {isCurrent ? " · this week" : w < currentWeek && weekDone < tasks.length ? " · behind" : ""}
                  </span>
                </summary>
                <ul className="sdi-points prep-tasks">
                  {tasks.map((t) => (
                    <li key={t.key}>
                      <label>
                        <input type="checkbox" checked={isDone(t)} disabled={autoDone(t)} onChange={() => toggle(t)} />
                        <span>
                          <button className="link-button" onClick={() => openLesson(t.lessonId)}>
                            {t.label ?? byId.get(t.lessonId)!.title}
                          </button>{" "}
                          <span className="status-text">
                            {t.family.toLowerCase()}, ~{t.minutes} min{autoDone(t) && isDone(t) ? ", done" : ""}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
          <p className="gate-note">
            Graded exercises tick themselves when you pass them. Ticking an explainer lesson marks it worked through for the progress view too. Practice sessions are
            ticked by hand. Your plan is saved in this browser.
          </p>
          <div className="darr-actions">
            <button
              className="sdi-reset"
              onClick={() => {
                if (!confirmReset) return setConfirmReset(true);
                setConfirmReset(false);
                setPlan(null);
              }}
              onBlur={() => setConfirmReset(false)}
            >
              {confirmReset ? "Click again to delete the plan" : "Start a new plan"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
