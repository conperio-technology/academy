import { useEffect, useState } from "react";
import {
  COMPETENCIES,
  QUESTIONS,
  RUBRIC,
  STAR_EXAMPLES,
  STAR_LABELS,
  STYLES,
  type BehavioralQuestion,
  type CompetencyId,
  type InterviewStyle,
} from "../../behavioralData";
import { recordMockRound } from "../../practiceHistory";
import { shuffle } from "../../random";

// The three Behavioral Interviews tools. Stories are the learner's own writing, so they
// stay in this browser (localStorage) like interview notes do; the mock round reads the
// same stories so you can pick which one you'd tell for each question.

// ---- Shared story storage ---------------------------------------------------------------

export interface Story {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  learning: string;
  competencies: CompetencyId[];
}

const STORIES_KEY = "behavioral:stories";

function loadStories(): Story[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORIES_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStories(stories: Story[]) {
  try {
    localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
  } catch {
    // Blocked storage: stories last until the page is closed.
  }
}

function newStory(): Story {
  return {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    title: "",
    situation: "",
    task: "",
    action: "",
    result: "",
    learning: "",
    competencies: [],
  };
}

function clock(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

const competencyLabel = (id: CompetencyId) => COMPETENCIES.find((c) => c.id === id)?.label ?? id;

// ---- 1. STAR examples ---------------------------------------------------------------------

export function BehavioralStar() {
  const [index, setIndex] = useState(0);
  const [showProblems, setShowProblems] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const example = STAR_EXAMPLES[index];

  function pick(i: number) {
    setIndex(i);
    setShowProblems(false);
    setShowNotes(false);
  }

  return (
    <div className="tool-widget">
      <div className="sql-presets">
        {STAR_EXAMPLES.map((ex, i) => (
          <button key={ex.question} className={i === index ? "active" : ""} onClick={() => pick(i)}>
            {ex.question}
          </button>
        ))}
      </div>

      <div className="crypto-section">
        <h3>A weak answer</h3>
        <p className="beh-quote">{example.weak.text}</p>
        {showProblems ? (
          <ul className="beh-problems">
            {example.weak.problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        ) : (
          <div className="darr-actions">
            <button onClick={() => setShowProblems(true)}>What's wrong with it?</button>
          </div>
        )}
        {!showProblems && <p className="gate-note">Try to name the problems yourself before you look.</p>}
      </div>

      <div className="crypto-section">
        <h3>A strong answer to the same question</h3>
        <div className="beh-star">
          {example.strong.map((seg) => (
            <div key={seg.part} className={`beh-seg beh-seg-${seg.part}`}>
              <span className="beh-tag">{STAR_LABELS[seg.part]}</span>
              <p>{seg.text}</p>
              {showNotes && <p className="beh-note">{seg.note}</p>}
            </div>
          ))}
        </div>
        <div className="darr-actions">
          <button onClick={() => setShowNotes(!showNotes)}>{showNotes ? "Hide" : "Show"} why each part works</button>
        </div>
        <p className="gate-note">
          Read it aloud and time it: about two minutes. Notice how much of it is the Action part, and that the result has
          numbers in it.
        </p>
      </div>
    </div>
  );
}

// ---- 2. Story bank ------------------------------------------------------------------------

const FIELDS: { key: keyof Pick<Story, "situation" | "task" | "action" | "result" | "learning">; label: string; placeholder: string; rows: number }[] = [
  { key: "situation", label: "Situation", placeholder: "Where and when, in one or two sentences. What was at stake?", rows: 2 },
  { key: "task", label: "Task", placeholder: "Your role and what you had to achieve.", rows: 2 },
  { key: "action", label: "Action", placeholder: "What YOU did, step by step, and why you chose it. This should be the longest part.", rows: 5 },
  { key: "result", label: "Result", placeholder: "What happened. Numbers if you have them: time saved, errors cut, revenue, users.", rows: 2 },
  { key: "learning", label: "Learning", placeholder: "What you learned or would do differently, and what you've done since.", rows: 2 },
];

export function StoryBank() {
  const [stories, setStories] = useState<Story[]>(loadStories);
  const [openId, setOpenId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => saveStories(stories), [stories]);

  const covered = new Set(stories.flatMap((s) => s.competencies));
  const open = stories.find((s) => s.id === openId) ?? null;

  function update(id: string, patch: Partial<Story>) {
    setStories((all) => all.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function add() {
    const s = newStory();
    setStories((all) => [...all, s]);
    setOpenId(s.id);
  }

  function remove(id: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    setStories((all) => all.filter((s) => s.id !== id));
    setConfirmDelete(null);
    if (openId === id) setOpenId(null);
  }

  async function copyAll() {
    const text = stories
      .map((s) =>
        [
          `## ${s.title || "Untitled story"}`,
          `Covers: ${s.competencies.map(competencyLabel).join(", ") || "nothing tagged"}`,
          ...FIELDS.map((f) => `${f.label}: ${s[f.key]}`),
        ].join("\n"),
      )
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Coverage</h3>
        <p className="gate-note">
          Aim for at least one story per competency. One good story can cover two or three, but you'll want a second option
          for the common ones (conflict, failure, impact) so you don't tell the same story twice in one loop.
        </p>
        <div className="beh-coverage">
          {COMPETENCIES.map((c) => {
            const count = stories.filter((s) => s.competencies.includes(c.id)).length;
            return (
              <div key={c.id} className={count > 0 ? "beh-chip beh-chip-ok" : "beh-chip"} title={c.hint}>
                <span>{c.label}</span>
                <span className="mono">{count}</span>
              </div>
            );
          })}
        </div>
        <p className={covered.size === COMPETENCIES.length ? "constraint-ok" : "status-text"}>
          {covered.size} of {COMPETENCIES.length} competencies covered by {stories.length} {stories.length === 1 ? "story" : "stories"}.
        </p>
      </div>

      <div className="crypto-section">
        <h3>Your stories</h3>
        {stories.length === 0 && <p className="gate-note">No stories yet. Start with the project you're proudest of; it usually covers several competencies.</p>}
        <ul className="beh-story-list">
          {stories.map((s) => (
            <li key={s.id} className={s.id === openId ? "beh-story active" : "beh-story"}>
              <button className="link-button" onClick={() => setOpenId(s.id === openId ? null : s.id)}>
                {s.title || "Untitled story"}
              </button>
              <span className="status-text">{s.competencies.map(competencyLabel).join(", ")}</span>
            </li>
          ))}
        </ul>
        <div className="darr-actions">
          <button onClick={add}>Add a story</button>
          {stories.length > 0 && <button onClick={copyAll}>{copied ? "Copied" : "Copy all as text"}</button>}
        </div>
      </div>

      {open && (
        <div className="crypto-section">
          <h3>Edit story</h3>
          <label className="beh-field">
            <span>Short title</span>
            <input
              type="text"
              value={open.title}
              placeholder="e.g. Migrating orders off SQL Server before the holiday peak"
              onChange={(e) => update(open.id, { title: e.target.value })}
            />
          </label>
          {FIELDS.map((f) => (
            <label key={f.key} className="beh-field">
              <span>{f.label}</span>
              <textarea
                className="sdi-notes"
                rows={f.rows}
                placeholder={f.placeholder}
                value={open[f.key]}
                onChange={(e) => update(open.id, { [f.key]: e.target.value })}
              />
            </label>
          ))}
          <p className="beh-field-label">Which competencies does it show?</p>
          <div className="beh-coverage">
            {COMPETENCIES.map((c) => {
              const on = open.competencies.includes(c.id);
              return (
                <label key={c.id} className={on ? "beh-chip beh-chip-ok" : "beh-chip"} title={c.hint}>
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() =>
                      update(open.id, {
                        competencies: on ? open.competencies.filter((x) => x !== c.id) : [...open.competencies, c.id],
                      })
                    }
                  />
                  <span>{c.label}</span>
                </label>
              );
            })}
          </div>
          <div className="darr-actions">
            <button onClick={() => setOpenId(null)}>Done</button>
            <button className="sdi-reset" onClick={() => remove(open.id)} onBlur={() => setConfirmDelete(null)}>
              {confirmDelete === open.id ? "Click again to delete" : "Delete story"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- 3. Mock round ------------------------------------------------------------------------

const ROUND_SIZES = [3, 5];
const TARGET_SECONDS = 150;

interface Turn {
  question: BehavioralQuestion;
  storyId: string; // "" = improvised
  notes: string;
  seconds: number;
  answered: boolean;
  ticks: string[];
}

function pickQuestions(style: InterviewStyle, count: number): BehavioralQuestion[] {
  // "Tell me about yourself" and "questions for me" bookend real rounds rather than
  // filling a practice slot.
  const pool = QUESTIONS.filter((q) => q.styles.includes(style) && q.id !== "tell-me-about-yourself" && q.id !== "questions-for-us");
  // Prefer covering different competencies, the way a real loop spreads them out.
  const chosen: BehavioralQuestion[] = [];
  const seen = new Set<CompetencyId>();
  for (const q of shuffle(pool)) {
    if (chosen.length === count) break;
    if (q.competencies.every((c) => seen.has(c))) continue;
    chosen.push(q);
    q.competencies.forEach((c) => seen.add(c));
  }
  for (const q of shuffle(pool)) {
    if (chosen.length === count) break;
    if (!chosen.includes(q)) chosen.push(q);
  }
  return chosen;
}

export function BehavioralMock() {
  const [style, setStyle] = useState<InterviewStyle>("general");
  const [size, setSize] = useState(3);
  const [turns, setTurns] = useState<Turn[] | null>(null);
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [stories] = useState<Story[]>(loadStories);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(
      () => setTurns((t) => t && t.map((turn, i) => (i === index ? { ...turn, seconds: turn.seconds + 1 } : turn))),
      1000,
    );
    return () => window.clearInterval(id);
  }, [running, index]);

  function start() {
    setTurns(pickQuestions(style, size).map((question) => ({ question, storyId: "", notes: "", seconds: 0, answered: false, ticks: [] })));
    setIndex(0);
    setRunning(false);
  }

  function patch(p: Partial<Turn>) {
    setTurns((t) => t && t.map((turn, i) => (i === index ? { ...turn, ...p } : turn)));
  }

  if (turns === null) {
    const styleInfo = STYLES.find((s) => s.id === style)!;
    return (
      <div className="tool-widget">
        <h3>Set up the round</h3>
        <div className="sql-presets">
          {STYLES.map((s) => (
            <button key={s.id} className={s.id === style ? "active" : ""} onClick={() => setStyle(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
        <p className="gate-note">{styleInfo.blurb}</p>
        <div className="sql-presets">
          {ROUND_SIZES.map((n) => (
            <button key={n} className={n === size ? "active" : ""} onClick={() => setSize(n)}>
              {n} questions (about {n * 5} min)
            </button>
          ))}
        </div>
        <p className="gate-note">
          {stories.length === 0
            ? "Tip: write a few stories in Your Story Bank first, so you can practise choosing which one to tell."
            : `You have ${stories.length} ${stories.length === 1 ? "story" : "stories"} in your bank to choose from.`}{" "}
          Answer out loud, ideally to someone else or a recording. The notes box is for a quick outline, not a script.
        </p>
        <button onClick={start}>Start the round</button>
      </div>
    );
  }

  if (index >= turns.length) {
    const unused = COMPETENCIES.filter(
      (c) => turns.some((t) => t.question.competencies.includes(c.id)) && !stories.some((s) => s.competencies.includes(c.id)),
    );
    return (
      <div className="tool-widget">
        <h3>How it went</h3>
        <table className="bigo-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Time</th>
              <th>Checklist</th>
            </tr>
          </thead>
          <tbody>
            {turns.map((t) => (
              <tr key={t.question.id}>
                <td>{t.question.text}</td>
                <td className={`mono ${t.seconds > TARGET_SECONDS + 30 ? "complexity-bad" : ""}`}>{clock(t.seconds)}</td>
                <td className="mono">
                  {t.ticks.length} of {RUBRIC.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(() => {
          const misses = RUBRIC.map((r) => ({ r, n: turns.filter((t) => !t.ticks.includes(r.id)).length }))
            .filter((x) => x.n > 0)
            .sort((a, b) => b.n - a.n)
            .slice(0, 2);
          return misses.length > 0 ? (
            <p className="gate-note">
              Most often missed: {misses.map((m) => m.r.label.toLowerCase()).join("; ")}. Rehearse with those in mind next time.
            </p>
          ) : (
            <p className="constraint-ok">Every checklist item, every answer. Try a different company style next.</p>
          );
        })()}
        {unused.length > 0 && (
          <p className="gate-note">
            No story in your bank covers: {unused.map((c) => c.label).join(", ")}. Worth adding one for each.
          </p>
        )}
        <div className="darr-actions">
          <button onClick={start}>Another round</button>
          <button onClick={() => setTurns(null)}>Change settings</button>
        </div>
      </div>
    );
  }

  const turn = turns[index];
  const q = turn.question;
  const matching = stories.filter((s) => s.competencies.some((c) => q.competencies.includes(c)));
  const others = stories.filter((s) => !matching.includes(s));

  return (
    <div className="tool-widget">
      <p className="drill-progress">
        Question {index + 1} of {turns.length} · {q.competencies.map(competencyLabel).join(", ")}
        {q.principle && style === "amazon" ? ` · Leadership Principle: ${q.principle}` : ""}
      </p>
      <p className="drill-statement">"{q.text}"</p>

      {stories.length > 0 && (
        <label className="beh-field">
          <span>Which story will you tell?</span>
          <select value={turn.storyId} onChange={(e) => patch({ storyId: e.target.value })} disabled={turn.answered}>
            <option value="">None fits, I'll improvise</option>
            {matching.length > 0 && (
              <optgroup label="Tagged for this question">
                {matching.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title || "Untitled story"}
                  </option>
                ))}
              </optgroup>
            )}
            {others.length > 0 && (
              <optgroup label="Your other stories">
                {others.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title || "Untitled story"}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>
      )}

      <div className="interview-timer-row">
        <span className={`interview-timer ${turn.seconds > TARGET_SECONDS + 30 ? "over" : ""}`}>{clock(turn.seconds)}</span>
        <span className="gate-note mixed-meta">aim for 2:00 to 3:00</span>
        {!turn.answered && (
          <button onClick={() => setRunning(!running)}>{running ? "Pause" : turn.seconds === 0 ? "Start answering" : "Resume"}</button>
        )}
      </div>

      <textarea
        className="sdi-notes"
        rows={4}
        placeholder="Optional outline: situation in a line, the 2-3 actions, the result with a number, the lesson."
        value={turn.notes}
        onChange={(e) => patch({ notes: e.target.value })}
      />

      {!turn.answered ? (
        <div className="darr-actions">
          <button
            onClick={() => {
              setRunning(false);
              patch({ answered: true });
            }}
          >
            I've finished answering
          </button>
        </div>
      ) : (
        <>
          <div className="drill-feedback">
            <p>
              <strong>What they're listening for:</strong> {q.lookingFor}
            </p>
            {q.followUps.length > 0 && (
              <>
                <p>
                  <strong>Likely follow-ups</strong> (answer these out loud too):
                </p>
                <ul>
                  {q.followUps.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <h3 className="sdi-sub">Check your answer honestly</h3>
          <ul className="sdi-points">
            {RUBRIC.map((r) => (
              <li key={r.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={turn.ticks.includes(r.id)}
                    onChange={() => patch({ ticks: turn.ticks.includes(r.id) ? turn.ticks.filter((x) => x !== r.id) : [...turn.ticks, r.id] })}
                  />
                  <span>{r.label}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="darr-actions">
            <button
              onClick={() => {
                if (index === turns.length - 1)
                  recordMockRound({
                    at: new Date().toISOString(),
                    style,
                    questions: turns.length,
                    rubricHits: turns.reduce((n, t) => n + t.ticks.length, 0),
                    rubricTotal: turns.length * RUBRIC.length,
                  });
                setIndex(index + 1);
              }}
            >{index === turns.length - 1 ? "See how it went" : "Next question"}</button>
          </div>
        </>
      )}
    </div>
  );
}
