import { useEffect, useMemo, useState } from "react";
import { fetchEvidence, fetchLessons, fetchReview, openLesson } from "../../api";
import { COMPETENCIES } from "../../behavioralData";
import { GLOSSARY } from "../../glossaryData";
import {
  loadDrillStats,
  loadGlossaryBoxes,
  loadMixedHistory,
  loadMockHistory,
  loadOpenedLessons,
  loadPatternQuizHistory,
  loadStoryCompetencies,
  loadWalkthrough,
  loadWorkedThrough,
  setWorkedThrough,
} from "../../practiceHistory";
import {
  buildPlan,
  CODING_FAMILIES,
  DEFAULT_PROFILE,
  FOUNDATION_GLOSSARY_CATEGORIES,
  FOUNDATION_TOPICS,
  HOURS_OPTIONS,
  KNOWN_BOX,
  LEVELS,
  OOD_WALKTHROUGHS,
  scheduleByHours,
  SYSTEM_DESIGN_WALKTHROUGHS,
  TARGETS,
  type PlannedTask,
  type PlanProfile,
  type PlanTarget,
  type StartLevel,
} from "../../prepPlanData";
import { DESIGN_INTERVIEWS } from "../../systemDesignInterviews";
import type { LessonEvidence, NavItem, ReviewItem } from "../../types";
import { STUDY_PATHS, type StudyPathId } from "../../studyPathData";
import { ItCsPlan } from "./ItCsPlan";

// The interview prep plan and readiness view. Everything here is derived: lesson completion and
// how each lesson was passed (guided or bare, reference seen or not, timed) come from the progress
// store, and drill, mixed-set, mock-round, walk-through, story-bank, pattern quiz, flash card and
// "lessons opened" activity from this browser (see practiceHistory.ts). Besides the plan itself
// (learner settings, start date, tasks ticked by hand), the only thing this tool stores is which
// tool lessons the learner marked as worked through, since tools have no graded completion.
//
// Readiness is shown as separate kinds of evidence rather than one score per area: coverage
// (seen it), assisted practice (passed with help or self-assessed against a model answer),
// independent (passed from a bare starter with no reference, or a check with no answer showing)
// and timed. Each figure names what produced it, and an area with no evidence of a kind says so.

const PLAN_KEY = "prep-plan";

interface SavedPlan {
  start: string; // ISO date the plan started
  ticked: string[]; // task keys marked done by hand
  profile?: PlanProfile; // missing on plans saved before learner settings existed
  weeks?: number; // only on those older plans: the length they picked
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
const avg = (xs: number[]) => (xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length);

// Coverage of one design walk-through: the share of all "strong answer" points ticked.
function walkthroughCoverage(design: string): { attempted: boolean; coverage: number } {
  const interview = (DESIGN_INTERVIEWS as Record<string, { stages: { id: string; points: string[] }[] }>)[design];
  if (!interview) return { attempted: false, coverage: 0 };
  const progress = loadWalkthrough(design);
  const total = interview.stages.reduce((n, s) => n + s.points.length, 0);
  const ticked = interview.stages.reduce((n, s) => n + (progress.ticks[s.id] ?? []).filter(Boolean).length, 0);
  return { attempted: progress.revealedStages.length > 0, coverage: total === 0 ? 0 : ticked / total };
}

function walkthroughDone(design: string) {
  const interview = (DESIGN_INTERVIEWS as Record<string, { stages: { id: string }[] }>)[design];
  if (!interview) return false;
  const revealed = new Set(loadWalkthrough(design).revealedStages);
  return interview.stages.every((s) => revealed.has(s.id));
}

// One cell of the evidence grid: a figure (or null when nothing measures it) and what produced it.
interface Evidence {
  value: string | null;
  source: string;
}

interface AreaEvidence {
  label: string;
  coverage: Evidence;
  assisted: Evidence;
  independent: Evidence;
  timed: Evidence;
}

const EVIDENCE_KINDS: { key: "coverage" | "assisted" | "independent" | "timed"; label: string }[] = [
  { key: "coverage", label: "Coverage" },
  { key: "assisted", label: "Assisted practice" },
  { key: "independent", label: "Independent" },
  { key: "timed", label: "Timed" },
];

function ProfilePicker({ profile, onChange }: { profile: PlanProfile; onChange: (p: PlanProfile) => void }) {
  return (
    <div className="prep-profile">
      <p className="prep-profile-label">Where are you starting?</p>
      <div className="sql-presets">
        {(Object.keys(LEVELS) as StartLevel[]).map((id) => (
          <button key={id} className={profile.level === id ? "active" : ""} onClick={() => onChange({ ...profile, level: id })}>
            {LEVELS[id].label}
          </button>
        ))}
      </div>
      <p className="gate-note">{LEVELS[profile.level].blurb}</p>
      <p className="prep-profile-label">What are the interviews for?</p>
      <div className="sql-presets">
        {(Object.keys(TARGETS) as PlanTarget[]).map((id) => (
          <button key={id} className={profile.target === id ? "active" : ""} onClick={() => onChange({ ...profile, target: id })}>
            {TARGETS[id].label}
          </button>
        ))}
      </div>
      <p className="gate-note">{TARGETS[profile.target].blurb}</p>
      <p className="prep-profile-label">Hours a week you can really give it</p>
      <div className="sql-presets">
        {HOURS_OPTIONS.map((h) => (
          <button key={h} className={profile.hoursPerWeek === h ? "active" : ""} onClick={() => onChange({ ...profile, hoursPerWeek: h })}>
            {h} h
          </button>
        ))}
      </div>
    </div>
  );
}

function FaangPlan() {
  const [items, setItems] = useState<NavItem[] | null>(null);
  const [review, setReview] = useState<ReviewItem[]>([]);
  const [evidenceRows, setEvidenceRows] = useState<LessonEvidence[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<SavedPlan | null>(loadPlan);
  const [draft, setDraft] = useState<PlanProfile>(() => loadPlan()?.profile ?? DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
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
    fetchEvidence()
      .then(setEvidenceRows)
      .catch(() => setEvidenceRows([]));
  }, []);

  useEffect(() => savePlan(plan), [plan]);

  const byId = useMemo(() => new Map((items ?? []).map((i) => [i.id, i])), [items]);
  const evidenceById = useMemo(() => new Map(evidenceRows.map((e) => [e.conceptId, e])), [evidenceRows]);
  const opened = useMemo(() => new Set(loadOpenedLessons()), []);
  const exists = (id: string) => byId.has(id);
  const completed = (id: string) => byId.get(id)?.completed ?? false;
  const workedSet = new Set(worked);
  const markWorked = (id: string, on: boolean) => setWorked(setWorkedThrough(id, on));

  if (error) return <p className="constraint-fail">{error}</p>;
  if (!items) return <p className="status-text">Loading your progress…</p>;

  // ---- Readiness: coding evidence per lesson ----

  const ev = (id: string) => evidenceById.get(id);
  const covered = (id: string) => opened.has(id) || !!ev(id)?.attempted || !!ev(id)?.lastRevealedAt || completed(id);
  const independent = (id: string) => !!ev(id)?.independentPass;
  // A pass with no recorded mode predates this evidence, so it can only count as assisted.
  const assisted = (id: string) => !!ev(id)?.assistedPass || !!ev(id)?.unrecordedPass || (completed(id) && !ev(id));
  const timed = (id: string) => !!ev(id)?.timedPass;

  const families = CODING_FAMILIES.map((f) => {
    const lessons = f.lessons.filter(exists);
    const count = (pred: (id: string) => boolean) => lessons.filter(pred).length;
    return {
      ...f,
      lessons,
      covered: count(covered),
      assisted: count((id) => assisted(id) || independent(id)),
      independent: count(independent),
      timed: count(timed),
      next: lessons.find((id) => !independent(id)),
    };
  }).filter((f) => f.lessons.length > 0);
  const codingLessons = families.flatMap((f) => f.lessons);
  const codingTotal = codingLessons.length;
  const codingCovered = codingLessons.filter(covered).length;
  const codingAssistedOnly = codingLessons.filter((id) => assisted(id) && !independent(id));
  const codingIndependent = codingLessons.filter(independent).length;

  const drillStats = loadDrillStats();
  const drillSeen = Object.values(drillStats).reduce((n, s) => n + s.seen, 0);
  const drillAccuracy = drillSeen === 0 ? null : Object.values(drillStats).reduce((n, s) => n + s.correct, 0) / drillSeen;
  const mixedHistory = loadMixedHistory().slice(-30);
  const mixedSolved = mixedHistory.filter((m) => m.solved).length;
  const mixedCalls = mixedHistory.length === 0 ? null : mixedHistory.filter((m) => m.goodCall).length / mixedHistory.length;
  const weakTechniques = Object.entries(drillStats)
    .filter(([, s]) => s.seen >= 2 && s.correct / s.seen < 0.7)
    .sort((a, b) => a[1].correct / a[1].seen - b[1].correct / b[1].seen)
    .slice(0, 4)
    .map(([t]) => t);

  const designRows = (map: Record<string, string>) =>
    Object.entries(map)
      .filter(([, lessonId]) => exists(lessonId))
      .map(([design, lessonId]) => ({ design, lessonId, title: byId.get(lessonId)!.title, ...walkthroughCoverage(design) }));
  const sdRows = designRows(SYSTEM_DESIGN_WALKTHROUGHS);
  const oodRows = designRows(OOD_WALKTHROUGHS);

  const storyComps = loadStoryCompetencies();
  const coveredComps = new Set(storyComps.flat());
  const mocks = loadMockHistory();
  const recentMocks = mocks.slice(-5);
  const rubricRate = avg(recentMocks.map((m) => (m.rubricTotal ? m.rubricHits / m.rubricTotal : 0)));

  // CS foundations: tool lessons count once marked worked through, graded lessons once
  // solved. The pattern quiz and glossary flash cards are checks with the answer hidden.
  const isTool = (id: string) => byId.get(id)?.kind === "tool";
  const foundationDone = (id: string) => (isTool(id) ? workedSet.has(id) : completed(id));
  const topics = FOUNDATION_TOPICS.map((f) => {
    const lessons = f.lessons.filter(exists);
    const done = lessons.filter(foundationDone);
    return { ...f, lessons, done: done.length, next: lessons.find((id) => !foundationDone(id)) };
  }).filter((f) => f.lessons.length > 0);
  const foundationLessons = topics.reduce((n, f) => n + f.lessons.length, 0);
  const foundationDoneCount = topics.reduce((n, f) => n + f.done, 0);
  const quizExists = exists("design-pattern-quiz");
  const quizRuns = loadPatternQuizHistory().filter((r) => r.full && r.total > 0);
  const recentQuiz = quizRuns.slice(-3);
  const quizAccuracy = recentQuiz.length === 0 ? null : avg(recentQuiz.map((r) => r.correct / r.total));
  const cardsExist = exists("glossary-flash-cards");
  const glossaryBoxes = loadGlossaryBoxes();
  const foundationTerms = GLOSSARY.filter((t) => FOUNDATION_GLOSSARY_CATEGORIES.includes(t.category));
  const knownTerms = foundationTerms.filter((t) => (glossaryBoxes[t.term] ?? 0) >= KNOWN_BOX).length;

  const none = (source: string): Evidence => ({ value: null, source });
  const designArea = (label: string, rows: typeof sdRows): AreaEvidence => {
    const tried = rows.filter((r) => r.attempted);
    return {
      label,
      coverage: { value: `${tried.length} of ${rows.length}`, source: "walk-throughs where you revealed at least one stage" },
      assisted: {
        value: tried.length === 0 ? null : pct(avg(tried.map((r) => r.coverage))),
        source:
          tried.length === 0
            ? "none yet: tick the model-answer points your design covered"
            : `of the model-answer points, ticked by you, averaged over the ${tried.length} you tried (self-assessed)`,
      },
      independent: none("not measured: every walk-through compares against a model answer, so nothing here checks a design you produced alone"),
      timed: none("not measured: time a walk-through yourself, or do it in a real mock"),
    };
  };

  const areas: AreaEvidence[] = [
    {
      label: "Coding",
      coverage: { value: `${codingCovered} of ${codingTotal}`, source: "interview lessons opened in this browser, or run at least once" },
      assisted: {
        value: `${codingAssistedOnly.length} of ${codingTotal}`,
        source: "passed only from the guided starter or within a week of opening the reference solution (passes from before this was recorded count here)",
      },
      independent: { value: `${codingIndependent} of ${codingTotal}`, source: "passed from the bare starter with no reference solution in the week before" },
      timed:
        mixedHistory.length === 0
          ? none("none yet: the mixed interview set is blind and against the clock")
          : { value: `${mixedSolved} of ${mixedHistory.length}`, source: `problems solved in your last ${mixedHistory.length} mixed interview set problems (blind, timed)` },
    },
    designArea("System design", sdRows),
    ...(oodRows.length > 0 ? [designArea("Object-oriented design", oodRows)] : []),
    {
      label: "Behavioral",
      coverage: { value: `${coveredComps.size} of ${COMPETENCIES.length}`, source: "themes with at least one story in your story bank" },
      assisted:
        recentMocks.length === 0
          ? none("none yet: mock rounds have a rubric you tick yourself")
          : { value: pct(rubricRate), source: `of rubric points ticked by you in your last ${recentMocks.length} mock rounds (self-assessed)` },
      independent: none("not measured: only a real interviewer can judge an answer you give unprompted"),
      timed:
        mocks.length === 0
          ? none("none yet: mock rounds time each answer")
          : { value: `${mocks.length} ${mocks.length === 1 ? "round" : "rounds"}`, source: "mock rounds done, each answer timed against a two and a half minute target" },
    },
    ...(topics.length > 0
      ? [
          {
            label: "CS foundations",
            coverage: { value: `${foundationDoneCount} of ${foundationLessons}`, source: "lessons you marked as worked through (self-reported), or solved" },
            assisted: none("not measured separately"),
            independent:
              quizAccuracy === null && !(cardsExist && foundationTerms.length > 0)
                ? none("none yet: the design pattern quiz and flash cards test recall with the answer hidden")
                : {
                    value: quizAccuracy !== null ? pct(quizAccuracy) : `${knownTerms} of ${foundationTerms.length}`,
                    source: [
                      quizAccuracy !== null ? `average of your last ${recentQuiz.length} full design pattern quiz runs` : quizExists ? "no full pattern quiz run yet" : "",
                      cardsExist && foundationTerms.length > 0 ? `${knownTerms} of ${foundationTerms.length} OS and engineering flash cards in box ${KNOWN_BOX} or higher` : "",
                    ]
                      .filter(Boolean)
                      .join("; "),
                  },
            timed: none("not measured"),
          },
        ]
      : []),
  ];

  const focus: { text: string; lessonId: string }[] = [];
  if (review.length > 0) focus.push({ text: `${review.length} solved ${review.length === 1 ? "lesson is" : "lessons are"} due for review, starting with ${review[0].title}`, lessonId: review[0].conceptId });
  if (codingAssistedOnly.length > 0)
    focus.push({
      text: `${codingAssistedOnly.length} coding ${codingAssistedOnly.length === 1 ? "lesson is" : "lessons are"} passed only with help: redo ${byId.get(codingAssistedOnly[0])!.title} from the bare starter`,
      lessonId: codingAssistedOnly[0],
    });
  const weakFamilies = [...families].sort((a, b) => a.independent / a.lessons.length - b.independent / b.lessons.length).filter((f) => f.next);
  const familyFocus = (f: (typeof families)[number]) => ({
    text: `${f.label} has the least independent evidence: next, ${byId.get(f.next!)!.title}`,
    lessonId: f.next!,
  });
  if (weakFamilies[0]) focus.push(familyFocus(weakFamilies[0]));
  // One CS foundations suggestion: the quiz once the pattern lessons are done and the quiz
  // is untaken or shaky, otherwise the next lesson in the least covered topic.
  const patternsTopic = topics.find((t) => t.id === "patterns");
  const quizWeak = quizExists && (quizAccuracy === null || quizAccuracy < 0.8);
  const quizFocus = {
    text:
      quizAccuracy === null
        ? "Take the design pattern quiz to check you can tell the patterns apart"
        : `Your recent design pattern quiz runs average ${pct(quizAccuracy)}: run it again`,
    lessonId: "design-pattern-quiz",
  };
  const weakTopic = [...topics].sort((a, b) => a.done / a.lessons.length - b.done / b.lessons.length).find((t) => t.next);
  if (quizWeak && patternsTopic && !patternsTopic.next) focus.push(quizFocus);
  else if (weakTopic)
    focus.push({ text: `${weakTopic.label} is your least covered CS foundation: next, ${byId.get(weakTopic.next!)!.title}`, lessonId: weakTopic.next! });
  else if (quizWeak) focus.push(quizFocus);
  if (weakTechniques.length > 0) focus.push({ text: `In the drill you often miss: ${weakTechniques.join(", ")}`, lessonId: "pattern-recognition-drill" });
  if (mixedHistory.length === 0 && codingIndependent >= 5)
    focus.push({ text: "You have independent passes but no timed evidence yet: try a mixed interview set", lessonId: "mixed-interview-set" });
  const untried = sdRows.find((r) => !r.attempted);
  if (untried) focus.push({ text: `Try a system design walk-through you haven't done: ${untried.title}`, lessonId: untried.lessonId });
  const missingComp = COMPETENCIES.find((c) => !coveredComps.has(c.id));
  if (missingComp) focus.push({ text: `Write a story for "${missingComp.label}"`, lessonId: "behavioral-story-bank" });
  if (weakFamilies[1]) focus.push(familyFocus(weakFamilies[1]));

  // ---- Plan ----

  const profile = plan?.profile ?? DEFAULT_PROFILE;
  const plannedPhases = buildPlan(plan ? profile : draft, exists);
  const weeks = scheduleByHours(plannedPhases, (plan ? profile : draft).hoursPerWeek);
  const scheduled = weeks.flatMap((w) => w.tasks);
  const studyWeekCount = weeks.filter((w) => !w.slack).length;
  const optionalCount = weeks.reduce((n, w) => n + w.optional.length, 0);
  const coreMinutes = weeks.filter((w) => !w.slack).reduce((n, w) => n + w.tasks.reduce((m, t) => m + t.minutes, 0), 0);
  const storyCount = storyComps.length;
  const isDone = (t: PlannedTask) => {
    if (plan?.ticked.includes(t.key)) return true;
    if (t.doneBy?.kind === "lesson") return completed(t.lessonId);
    if (t.doneBy?.kind === "walkthrough") return walkthroughDone(t.doneBy.design);
    if (t.doneBy?.kind === "stories") return storyCount >= t.doneBy.target;
    if (t.doneBy?.kind === "worked") return workedSet.has(t.lessonId);
    if (t.doneBy?.kind === "patternQuiz") return quizRuns.length >= t.doneBy.runs;
    return false;
  };
  // "Worked through" tasks stay tickable: ticking one marks the lesson for readiness too.
  const autoDone = (t: PlannedTask) =>
    t.doneBy !== undefined && t.doneBy.kind !== "worked" && !plan?.ticked.includes(t.key) && isDone(t);

  function toggle(t: PlannedTask) {
    if (t.doneBy?.kind === "worked" && !plan?.ticked.includes(t.key)) return markWorked(t.lessonId, !workedSet.has(t.lessonId));
    setPlan((p) => p && { ...p, ticked: p.ticked.includes(t.key) ? p.ticked.filter((k) => k !== t.key) : [...p.ticked, t.key] });
  }

  const currentWeek = plan ? Math.floor((Date.now() - new Date(plan.start).getTime()) / (7 * 24 * 3600 * 1000)) : 0;
  const doneCount = scheduled.filter(isDone).length;

  const taskRow = (t: PlannedTask) => (
    <li key={t.key}>
      <label>
        <input type="checkbox" checked={isDone(t)} disabled={autoDone(t)} onChange={() => toggle(t)} />
        <span>
          <button className="link-button" onClick={() => openLesson(t.lessonId)}>
            {t.label ?? byId.get(t.lessonId)?.title ?? t.lessonId}
          </button>{" "}
          {t.tier === "prerequisite" && <span className="prep-tag">prerequisite</span>}
          {t.tier === "optional" && <span className="prep-tag prep-tag-optional">optional</span>}{" "}
          <span className="status-text">
            {t.area}, ~{t.minutes} min{autoDone(t) ? ", done" : ""}
            {t.why ? `: ${t.why}` : ""}
          </span>
        </span>
      </label>
    </li>
  );

  const summary = (p: PlanProfile) =>
    `${LEVELS[p.level].label}, ${TARGETS[p.target].label.toLowerCase()}, ${p.hoursPerWeek} h a week`;

  return (
    <div className="tool-widget">
      <div className="sql-presets">
        <button className={tab === "readiness" ? "active" : ""} onClick={() => setTab("readiness")}>
          Readiness
        </button>
        <button className={tab === "plan" ? "active" : ""} onClick={() => setTab("plan")}>
          Study plan
        </button>
      </div>

      {tab === "readiness" && (
        <>
          <p className="gate-note">
            Four kinds of evidence, kept apart on purpose. Coverage means you have seen it. Assisted practice means you
            passed with help, or marked yourself against a model answer. Independent means you passed with nothing to
            lean on. Timed means under the clock. Each figure says what produced it; a blank kind means nothing here
            measures it yet.
          </p>
          <div className="prep-evidence-areas">
            {areas.map((a) => (
              <div key={a.label} className="prep-evidence-area">
                <h3 className="prep-evidence-title">{a.label}</h3>
                <dl className="prep-evidence-grid">
                  {EVIDENCE_KINDS.map((k) => (
                    <div key={k.key} className={`prep-evidence-cell ${a[k.key].value === null ? "prep-evidence-none" : ""}`}>
                      <dt>{k.label}</dt>
                      <dd>
                        <span className="prep-evidence-value">{a[k.key].value ?? "no evidence"}</span>
                        <span className="prep-evidence-source">{a[k.key].source}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          {focus.length > 0 && (
            <div className="drill-feedback prep-focus">
              <p>
                <strong>Focus next</strong>
              </p>
              <ol>
                {focus.slice(0, 5).map((f) => (
                  <li key={f.text}>
                    <button className="link-button" onClick={() => openLesson(f.lessonId)}>
                      {f.text}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <h3 className="sdi-sub">Coding, by topic</h3>
          <div className="prep-table-scroll">
            <table className="bigo-table prep-table prep-evidence-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th title="opened or run">Seen</th>
                  <th title="passed in any way">Passed</th>
                  <th title="passed from the bare starter without the reference">Alone</th>
                  <th title="solved in a mixed interview set">Timed</th>
                </tr>
              </thead>
              <tbody>
                {families.map((f) => (
                  <tr key={f.id}>
                    <td>{f.label}</td>
                    <td className="mono">
                      {f.covered}/{f.lessons.length}
                    </td>
                    <td className="mono">
                      {f.assisted}/{f.lessons.length}
                    </td>
                    <td className="mono">
                      {f.independent}/{f.lessons.length}
                    </td>
                    <td className="mono">
                      {f.timed}/{f.lessons.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="gate-note">
            Seen: opened in this browser or run. Passed: any pass, guided or bare. Alone: passed from the bare starter
            with no reference solution in the week before. Timed: solved inside a mixed interview set. Recognition:{" "}
            {drillAccuracy === null ? "no drill answers yet" : `${pct(drillAccuracy)} right in the pattern drill`};{" "}
            {mixedCalls === null ? "no mixed sets yet" : `you named a working technique for ${pct(mixedCalls)} of your last ${mixedHistory.length} mixed-set problems`}
            .
          </p>

          {topics.length > 0 && (
            <>
              <h3 className="sdi-sub">CS foundations, by topic</h3>
              <table className="bigo-table prep-table">
                <tbody>
                  {topics.map((f) => (
                    <tr key={f.id}>
                      <td>{f.label}</td>
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
              <p className="gate-note">Coverage only: these count lessons you marked as worked through.</p>
              <details className="prep-week">
                <summary>Mark the lessons you've worked through</summary>
                <ul className="sdi-points prep-tasks">
                  {topics.flatMap((f) =>
                    f.lessons.map((id) => (
                      <li key={id}>
                        <label>
                          <input
                            type="checkbox"
                            checked={foundationDone(id)}
                            disabled={!isTool(id)}
                            onChange={() => markWorked(id, !workedSet.has(id))}
                          />
                          <span>
                            <button className="link-button" onClick={() => openLesson(id)}>
                              {byId.get(id)!.title}
                            </button>{" "}
                            <span className="status-text">
                              {f.label.toLowerCase()}
                              {isTool(id) ? "" : ", ticks itself when you solve it"}
                            </span>
                          </span>
                        </label>
                      </li>
                    )),
                  )}
                </ul>
              </details>
            </>
          )}

          {[
            { title: "System design walk-throughs", rows: sdRows },
            { title: "Object-oriented design walk-throughs", rows: oodRows },
          ]
            .filter((g) => g.rows.length > 0)
            .map((g) => (
              <div key={g.title}>
                <h3 className="sdi-sub">{g.title}</h3>
                <table className="bigo-table prep-table">
                  <tbody>
                    {g.rows.map((r) => (
                      <tr key={r.design}>
                        <td>
                          <button className="link-button" onClick={() => openLesson(r.lessonId)}>
                            {r.title}
                          </button>
                        </td>
                        <td className="mono">{r.attempted ? `${pct(r.coverage)} of points, self-ticked` : "not tried"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

          <p className="gate-note">
            These figures only count what you've done in the academy. Use them to decide what to practise next, not
            as a prediction of an interview outcome: the strongest evidence here is independent and timed, and even
            that is a small sample.
          </p>
        </>
      )}

      {tab === "plan" && (!plan || editing) && (
        <div className="crypto-section">
          <h3>{plan ? "Change your settings" : "Build a plan"}</h3>
          <ProfilePicker profile={draft} onChange={setDraft} />
          <p className="gate-note">
            With these settings: {studyWeekCount} study weeks plus {weeks.length - studyWeekCount} slack{" "}
            {weeks.length - studyWeekCount === 1 ? "week" : "weeks"} ({weeks.length} in all), about{" "}
            {Math.round(coreMinutes / 60)} hours of core material, and {optionalCount} optional{" "}
            {optionalCount === 1 ? "task" : "tasks"} listed but not scheduled. Slack weeks are for failed attempts,
            redoing assisted passes from the bare starter, catching up, and repeat mocks. Tasks you've already done are
            ticked off automatically.
          </p>
          <div className="darr-actions">
            <button
              onClick={() => {
                setPlan(plan ? { ...plan, profile: draft, weeks: undefined } : { start: new Date().toISOString(), ticked: [], profile: draft });
                setEditing(false);
              }}
            >
              {plan ? "Use these settings (keeps your ticks and start date)" : "Start the plan today"}
            </button>
            {plan && <button onClick={() => setEditing(false)}>Cancel</button>}
          </div>
        </div>
      )}

      {tab === "plan" && plan && !editing && (
        <>
          <p className="drill-statement">
            Week {Math.min(currentWeek + 1, weeks.length)} of {weeks.length}: {doneCount} of {scheduled.length} tasks done.
          </p>
          <p className="gate-note">
            {plan.profile ? summary(plan.profile) : `Built before learner settings existed (${plan.weeks ?? 8} weeks); now using ${summary(DEFAULT_PROFILE)}`}.{" "}
            <button
              className="link-button"
              onClick={() => {
                setDraft(profile);
                setEditing(true);
              }}
            >
              Change settings
            </button>
          </p>
          <div className="prep-meter prep-meter-wide">
            <div style={{ width: pct(doneCount / Math.max(1, scheduled.length)) }} />
          </div>
          {weeks.map((w, i) => {
            const weekDone = w.tasks.filter(isDone).length;
            const current = i === Math.min(currentWeek, weeks.length - 1);
            const classes = ["prep-week", current ? "prep-week-current" : "", w.slack ? "prep-week-slack" : ""].filter(Boolean).join(" ");
            return (
              <details key={i} className={classes} open={current}>
                <summary>
                  <strong>Week {i + 1}</strong> · {w.phase} ·{" "}
                  <span className="status-text">
                    {weekDone}/{w.tasks.length} done, about {Math.round(w.tasks.reduce((n, t) => n + t.minutes, 0) / 60)} h
                    {current ? " · this week" : i < currentWeek && weekDone < w.tasks.length ? " · behind" : ""}
                  </span>
                </summary>
                {w.firstOfPhase && (
                  <p className="gate-note prep-requires">
                    <strong>Before {w.firstOfPhase}:</strong> {plannedPhases.find((p) => p.name === w.firstOfPhase)?.requires}
                  </p>
                )}
                {w.slack && (
                  <p className="gate-note prep-requires">
                    No new material this week. Use it for what didn't stick: failed attempts, assisted passes, and a repeat
                    mock.
                  </p>
                )}
                <ul className="sdi-points prep-tasks">{w.tasks.map(taskRow)}</ul>
                {w.optional.length > 0 && (
                  <details className="prep-optional">
                    <summary>
                      Optional for your settings ({w.optional.length}), not counted in the hours
                    </summary>
                    <ul className="sdi-points prep-tasks">{w.optional.map(taskRow)}</ul>
                  </details>
                )}
              </details>
            );
          })}
          <p className="gate-note">
            Lessons tick themselves when you pass them, walk-throughs when you've compared every stage, story-bank goals
            when you have enough stories, and pattern quiz tasks when you've finished enough full runs. Ticking a CS
            foundations lesson also marks it worked through in the readiness view. Tick the rest yourself. Your plan is
            saved in this browser.
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

const PATH_KEY = "study-path:selected";

function loadPath(): StudyPathId {
  try {
    return localStorage.getItem(PATH_KEY) === "it-cs" ? "it-cs" : "faang";
  } catch {
    return "faang";
  }
}

// Two study paths share this tool. The FAANG plan keeps its original storage ("prep-plan"),
// so existing plans carry on unchanged; the chosen path is remembered separately.
export function PrepPlan({ initialPath }: { initialPath?: StudyPathId }) {
  const [path, setPath] = useState<StudyPathId>(() => initialPath ?? loadPath());
  function choose(id: StudyPathId) {
    setPath(id);
    try {
      localStorage.setItem(PATH_KEY, id);
    } catch {
      // Blocked storage: the choice lasts until the page closes.
    }
  }
  return (
    <>
      <div className="ns-path-picker" role="radiogroup" aria-label="Study path">
        {STUDY_PATHS.map((p) => (
          <button key={p.id} role="radio" aria-checked={p.id === path} className={`ns-path ${p.id === path ? "active" : ""}`} onClick={() => choose(p.id)}>
            <strong>{p.label}</strong>
            <span className="ns-small">{p.blurb}</span>
          </button>
        ))}
      </div>
      {path === "faang" ? <FaangPlan /> : <ItCsPlan />}
    </>
  );
}
