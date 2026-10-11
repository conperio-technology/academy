import { useMemo, useState } from "react";
import {
  GYM_CATEGORIES,
  GYM_DIFFICULTIES,
  GYM_SNIPPETS,
  SPACE_CONVENTION,
  type GymCategory,
  type GymDifficulty,
  type GymLang,
  type GymSnippet,
} from "../../complexityGymData";
import { loadGymExplainHistory, loadGymStats, recordGymAnswer, recordGymExplain, resetGymHistory } from "../../practiceHistory";
import { shuffle } from "../../random";
import { ConfirmButton } from "../ConfirmButton";

// Three modes over one bank: Practice (pick time and space, then read the model
// explanation), Explain it (write your own explanation first, then grade it against a
// rubric), and Stats (accuracy per category from this browser's history).

type Tab = "practice" | "explain" | "stats";
type Length = 10 | 20 | 0; // 0 = every matching snippet

interface Round {
  snippet: GymSnippet;
  timeOptions: string[];
  spaceOptions: string[];
}

interface Result {
  snippet: GymSnippet;
  timeOk: boolean;
  spaceOk: boolean;
}

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(GYM_CATEGORIES.map((c) => [c.id, c.label]));

const GYM_RUBRIC = [
  "Named what n is (and any other variable: m, k, L, V, E, a value like W)",
  "Counted the loop trips or the recursion branches and depth",
  "Multiplied nested work and added sequential work, then kept the biggest term",
  "Accounted for hidden costs inside library calls (copies, scans, sorts, hashing)",
  "Stated the space separately, including the call stack and any output",
];

function toRound(snippet: GymSnippet): Round {
  return { snippet, timeOptions: shuffle(snippet.timeOptions), spaceOptions: shuffle(snippet.spaceOptions) };
}

function pct(correct: number, seen: number) {
  return seen === 0 ? "" : `${Math.round((100 * correct) / seen)}%`;
}

function SnippetCard({ snippet }: { snippet: GymSnippet }) {
  return (
    <>
      <div className="cg-tags">
        <span className="cg-tag cg-lang">{snippet.lang}</span>
        <span className={`cg-tag cg-${snippet.difficulty}`}>{snippet.difficulty}</span>
        <span className="cg-tag">{CATEGORY_LABEL[snippet.category]}</span>
      </div>
      <h3 className="cg-title">{snippet.title}</h3>
      <pre className="algo-code cg-code">{snippet.code}</pre>
      <p className="gate-note cg-vars">Variables: {snippet.vars}</p>
    </>
  );
}

function OptionRow({
  label,
  options,
  answer,
  picked,
  reveal,
  onPick,
}: {
  label: string;
  options: string[];
  answer: string;
  picked: string | null;
  reveal: boolean;
  onPick: (o: string) => void;
}) {
  return (
    <div className="cg-question">
      <div className="cg-question-label">{label}</div>
      <div className="drill-options">
        {options.map((o) => {
          const state = !reveal
            ? o === picked
              ? "cg-picked"
              : ""
            : o === answer
              ? "correct"
              : o === picked
                ? "wrong"
                : "dim";
          return (
            <button key={o} className={`drill-option ${state}`} onClick={() => onPick(o)} disabled={reveal}>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ModelExplanation({ snippet }: { snippet: GymSnippet }) {
  return (
    <>
      <p>
        <strong>Model answer:</strong> time {snippet.time}, space {snippet.space}.
      </p>
      <ol>
        <li>
          <strong>How many trips:</strong> {snippet.structure}
        </li>
        <li>
          <strong>Cost per trip:</strong> {snippet.perStep}
        </li>
        <li>
          <strong>Put together:</strong> {snippet.verdict}
        </li>
      </ol>
      <p>
        <strong>Space:</strong> {snippet.spaceWhy}
      </p>
    </>
  );
}

export function ComplexityGym() {
  const [tab, setTab] = useState<Tab>("practice");
  const [cats, setCats] = useState<GymCategory[]>([]); // empty = all
  const [difficulty, setDifficulty] = useState<GymDifficulty | "all">("all");
  const [lang, setLang] = useState<GymLang | "all">("all");
  const [length, setLength] = useState<Length>(10);

  const pool = useMemo(
    () =>
      GYM_SNIPPETS.filter(
        (s) =>
          (cats.length === 0 || cats.includes(s.category)) &&
          (difficulty === "all" || s.difficulty === difficulty) &&
          (lang === "all" || s.lang === lang),
      ),
    [cats, difficulty, lang],
  );

  // ---- Practice ----
  const [rounds, setRounds] = useState<Round[] | null>(null);
  const [index, setIndex] = useState(0);
  const [pickTime, setPickTime] = useState<string | null>(null);
  const [pickSpace, setPickSpace] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [lastSet, setLastSet] = useState<GymSnippet[]>([]);

  function start(snippets: GymSnippet[]) {
    setLastSet(snippets);
    setRounds(snippets.map(toRound));
    setIndex(0);
    setPickTime(null);
    setPickSpace(null);
    setResults([]);
  }

  function startFromFilters() {
    const picked = shuffle(pool);
    start(length === 0 ? picked : picked.slice(0, length));
  }

  const round = rounds && index < rounds.length ? rounds[index] : null;
  const answered = pickTime !== null && pickSpace !== null;

  function pick(kind: "time" | "space", option: string) {
    if (!round || answered) return;
    const t = kind === "time" ? option : pickTime;
    const s = kind === "space" ? option : pickSpace;
    if (kind === "time") setPickTime(option);
    else setPickSpace(option);
    if (t !== null && s !== null) {
      const timeOk = t === round.snippet.time;
      const spaceOk = s === round.snippet.space;
      recordGymAnswer(round.snippet.category, timeOk, spaceOk);
      setResults((r) => [...r, { snippet: round.snippet, timeOk, spaceOk }]);
    }
  }

  function next() {
    setPickTime(null);
    setPickSpace(null);
    setIndex((i) => i + 1);
  }

  // ---- Explain it ----
  const [exSnippet, setExSnippet] = useState<GymSnippet | null>(null);
  const [exText, setExText] = useState("");
  const [exTime, setExTime] = useState<string | null>(null);
  const [exSpace, setExSpace] = useState<string | null>(null);
  const [exOptions, setExOptions] = useState<{ time: string[]; space: string[] }>({ time: [], space: [] });
  const [exRevealed, setExRevealed] = useState(false);
  const [exTicks, setExTicks] = useState<boolean[]>(GYM_RUBRIC.map(() => false));
  const [exSaved, setExSaved] = useState(false);

  function newExplain() {
    const candidates = pool.length > 1 && exSnippet ? pool.filter((s) => s.id !== exSnippet.id) : pool;
    if (candidates.length === 0) return;
    const s = candidates[Math.floor(Math.random() * candidates.length)];
    setExSnippet(s);
    setExOptions({ time: shuffle(s.timeOptions), space: shuffle(s.spaceOptions) });
    setExText("");
    setExTime(null);
    setExSpace(null);
    setExRevealed(false);
    setExTicks(GYM_RUBRIC.map(() => false));
    setExSaved(false);
  }

  function saveExplain() {
    if (!exSnippet || exSaved) return;
    recordGymExplain({
      at: new Date().toISOString(),
      snippetId: exSnippet.id,
      category: exSnippet.category,
      rubricHits: exTicks.filter(Boolean).length,
      rubricTotal: GYM_RUBRIC.length,
      timeCorrect: exTime === exSnippet.time,
      spaceCorrect: exSpace === exSnippet.space,
    });
    setExSaved(true);
  }

  // ---- Stats (small localStorage reads, so simply re-read on every render) ----
  const [, setStatsVersion] = useState(0);
  const stats = loadGymStats();
  const explainHistory = loadGymExplainHistory();

  const rows = GYM_CATEGORIES.map((c) => {
    const s = stats[c.id] ?? { timeSeen: 0, timeCorrect: 0, spaceSeen: 0, spaceCorrect: 0 };
    const ex = explainHistory.filter((e) => e.category === c.id);
    const exHits = ex.reduce((n, e) => n + e.rubricHits, 0);
    const exTotal = ex.reduce((n, e) => n + e.rubricTotal, 0);
    const seen = s.timeSeen + s.spaceSeen;
    const correct = s.timeCorrect + s.spaceCorrect;
    return { ...c, ...s, seen, correct, accuracy: seen === 0 ? null : correct / seen, ex: ex.length, exHits, exTotal };
  });
  const weakest = rows
    .filter((r) => r.timeSeen >= 3 && r.accuracy !== null)
    .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0))
    .filter((r) => (r.accuracy ?? 1) < 1)
    .slice(0, 3);
  const untouched = rows.filter((r) => r.timeSeen === 0);

  function toggleCat(id: GymCategory) {
    setCats((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }

  const filters = (
    <div className="cg-filters">
      <div className="cg-filter-group">
        <span className="cg-filter-label">Categories</span>
        <div className="sql-presets cg-cats">
          <button className={cats.length === 0 ? "active" : ""} onClick={() => setCats([])}>
            All
          </button>
          {GYM_CATEGORIES.map((c) => (
            <button key={c.id} className={cats.includes(c.id) ? "active" : ""} onClick={() => toggleCat(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="cg-filter-row">
        <label className="cg-select">
          Difficulty
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as GymDifficulty | "all")}>
            <option value="all">All</option>
            {GYM_DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="cg-select">
          Language
          <select value={lang} onChange={(e) => setLang(e.target.value as GymLang | "all")}>
            <option value="all">Both</option>
            <option value="C#">C#</option>
            <option value="Python">Python</option>
          </select>
        </label>
        {tab === "practice" && (
          <label className="cg-select">
            Set size
            <select value={length} onChange={(e) => setLength(Number(e.target.value) as Length)}>
              <option value={10}>10 snippets</option>
              <option value={20}>20 snippets</option>
              <option value={0}>All that match</option>
            </select>
          </label>
        )}
      </div>
      <p className="gate-note cg-pool">
        {pool.length} of {GYM_SNIPPETS.length} snippets match.
      </p>
    </div>
  );

  const timeScore = results.filter((r) => r.timeOk).length;
  const spaceScore = results.filter((r) => r.spaceOk).length;
  const misses = results.filter((r) => !r.timeOk || !r.spaceOk);

  return (
    <div className="tool-widget cg-widget">
      <div className="sql-presets cg-tabs">
        {(["practice", "explain", "stats"] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
            {t === "practice" ? "Practice" : t === "explain" ? "Explain it" : "Stats"}
          </button>
        ))}
      </div>
      <p className="gate-note">{SPACE_CONVENTION}</p>

      {tab === "practice" && !rounds && (
        <>
          {filters}
          <div className="darr-actions">
            <button onClick={startFromFilters} disabled={pool.length === 0}>
              Start {length === 0 ? pool.length : Math.min(length, pool.length)} snippets
            </button>
          </div>
        </>
      )}

      {tab === "practice" && rounds && round && (
        <div className="drill-card">
          <div className="drill-progress">
            Snippet {index + 1} of {rounds.length}. Time {timeScore} right, space {spaceScore} right so far.
          </div>
          <SnippetCard snippet={round.snippet} />
          <OptionRow
            label="Time"
            options={round.timeOptions}
            answer={round.snippet.time}
            picked={pickTime}
            reveal={answered}
            onPick={(o) => pick("time", o)}
          />
          <OptionRow
            label="Space"
            options={round.spaceOptions}
            answer={round.snippet.space}
            picked={pickSpace}
            reveal={answered}
            onPick={(o) => pick("space", o)}
          />
          {!answered && <p className="gate-note">Pick both, then the model explanation appears.</p>}
          {answered && (
            <div className="drill-feedback">
              <p>
                <strong>
                  Time: {pickTime === round.snippet.time ? "correct" : `not quite, it is ${round.snippet.time}`}. Space:{" "}
                  {pickSpace === round.snippet.space ? "correct" : `not quite, it is ${round.snippet.space}`}.
                </strong>
              </p>
              <ModelExplanation snippet={round.snippet} />
              <div className="darr-actions">
                <button onClick={next}>{index + 1 < rounds.length ? "Next snippet" : "See results"}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "practice" && rounds && !round && (
        <div className="drill-card">
          <h3>
            Time {timeScore} / {results.length}, space {spaceScore} / {results.length}
          </h3>
          {misses.length === 0 ? (
            <p className="gate-note">A clean set. Try a harder difficulty or a category you have not touched.</p>
          ) : (
            <>
              <p className="gate-note">Missed at least one half of:</p>
              <ul className="drill-misses">
                {misses.map((m) => (
                  <li key={m.snippet.id}>
                    <strong>{m.snippet.title}</strong> ({CATEGORY_LABEL[m.snippet.category]}): time {m.snippet.time}
                    {m.timeOk ? "" : " (missed)"}, space {m.snippet.space}
                    {m.spaceOk ? "" : " (missed)"}
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="darr-actions cg-actions">
            {misses.length > 0 && <button onClick={() => start(shuffle(misses.map((m) => m.snippet)))}>Retry only the misses</button>}
            <button onClick={() => start(shuffle(lastSet))}>Run this set again</button>
            <button onClick={() => setRounds(null)}>New set</button>
          </div>
        </div>
      )}

      {tab === "explain" && (
        <>
          {filters}
          {!exSnippet && (
            <div className="drill-card">
              <p className="drill-statement">
                Explain it the way you would out loud: say what n is, count the trips, price each trip, put it together, then
                the space. Write it below, pick your answers, then compare with the model and grade yourself.
              </p>
              <div className="darr-actions">
                <button onClick={newExplain} disabled={pool.length === 0}>
                  Give me a snippet
                </button>
              </div>
            </div>
          )}
          {exSnippet && (
            <div className="drill-card">
              <SnippetCard snippet={exSnippet} />
              <label className="cg-explain-label" htmlFor="cg-explain">
                Your explanation
              </label>
              <textarea
                id="cg-explain"
                className="interview-notes cg-explain"
                rows={6}
                value={exText}
                onChange={(e) => setExText(e.target.value)}
                disabled={exRevealed}
                placeholder="n is ... The loop runs ... times. Each trip costs ... because ... So the time is ... For space, ..."
              />
              <OptionRow
                label="Time"
                options={exOptions.time}
                answer={exSnippet.time}
                picked={exTime}
                reveal={exRevealed}
                onPick={setExTime}
              />
              <OptionRow
                label="Space"
                options={exOptions.space}
                answer={exSnippet.space}
                picked={exSpace}
                reveal={exRevealed}
                onPick={setExSpace}
              />
              {!exRevealed && (
                <div className="darr-actions">
                  <button onClick={() => setExRevealed(true)} disabled={exTime === null || exSpace === null}>
                    Reveal the model explanation
                  </button>
                </div>
              )}
              {exRevealed && (
                <div className="drill-feedback">
                  <p>
                    <strong>
                      Time: {exTime === exSnippet.time ? "correct" : `it is ${exSnippet.time}`}. Space:{" "}
                      {exSpace === exSnippet.space ? "correct" : `it is ${exSnippet.space}`}.
                    </strong>
                  </p>
                  {exText.trim() && (
                    <div className="cg-yours">
                      <strong>You wrote:</strong>
                      <p>{exText}</p>
                    </div>
                  )}
                  <ModelExplanation snippet={exSnippet} />
                  <p>
                    <strong>Self-check.</strong> Tick what your explanation actually did:
                  </p>
                  <div className="cg-rubric">
                    {GYM_RUBRIC.map((item, i) => (
                      <label key={item} className="tool-checkbox">
                        <input
                          type="checkbox"
                          checked={exTicks[i]}
                          disabled={exSaved}
                          onChange={() => setExTicks((t) => t.map((v, k) => (k === i ? !v : v)))}
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                  <div className="darr-actions cg-actions">
                    {!exSaved ? (
                      <button onClick={saveExplain}>
                        Save score ({exTicks.filter(Boolean).length} / {GYM_RUBRIC.length})
                      </button>
                    ) : (
                      <span className="gate-note cg-saved">Saved.</span>
                    )}
                    <button onClick={newExplain}>Next snippet</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {tab === "stats" && (
        <div className="drill-card">
          {rows.every((r) => r.timeSeen === 0 && r.ex === 0) ? (
            <p className="gate-note">No answers yet. Do a Practice set and the per-category accuracy shows up here.</p>
          ) : (
            <>
              {weakest.length > 0 && (
                <div className="cg-weakest">
                  <strong>Weakest categories:</strong>{" "}
                  {weakest.map((w) => `${w.label} (${pct(w.correct, w.seen)})`).join(", ")}.{" "}
                  <button
                    className="link-button"
                    onClick={() => {
                      setCats(weakest.map((w) => w.id));
                      setRounds(null);
                      setTab("practice");
                    }}
                  >
                    Practise these
                  </button>
                </div>
              )}
              {untouched.length > 0 && (
                <p className="gate-note">Not tried yet: {untouched.map((u) => u.label).join(", ")}.</p>
              )}
              <div className="cg-table-wrap">
                <table className="bigo-table cg-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Snippets</th>
                      <th>Time</th>
                      <th>Space</th>
                      <th>Explain it</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td>{r.label}</td>
                        <td className="mono">{r.timeSeen || ""}</td>
                        <td className="mono">{pct(r.timeCorrect, r.timeSeen)}</td>
                        <td className="mono">{pct(r.spaceCorrect, r.spaceSeen)}</td>
                        <td className="mono">{r.ex ? `${pct(r.exHits, r.exTotal)} of ${r.ex}` : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="gate-note">
                Explain it shows the average rubric score and how many explanations you graded. Weakest categories need at
                least 3 answers.
              </p>
            </>
          )}
          <div className="darr-actions">
            <ConfirmButton
              label="Reset gym history"
              onConfirm={() => {
                resetGymHistory();
                setStatsVersion((v) => v + 1);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
