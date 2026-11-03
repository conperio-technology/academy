import Editor from "@monaco-editor/react";
import { useEffect, useMemo, useState } from "react";
import { withInlineCode } from "../../inlineCode";
import { loadJoinLadder, recordJoinLadderAttempt, setWorkedThrough, type JoinLadderProgress } from "../../practiceHistory";
import { compareResults, type RowsResult } from "../../sqlCompare";
import { getSqlJs, type SqlJsDatabase } from "../../sqljsLoader";
import { LADDER_RUNGS, PASSES_TO_CLEAR, usableQuestions, type LadderQuestion } from "../../sqlLadder";
import { LADDER_SCHEMA } from "../../sqlLadderData";
import { ResultTable } from "./SqlPractice";

// The SQL Join Ladder: generated SELECT questions over the ladder database, eight rungs of
// rising join difficulty (questions in sqlLadder.ts). Each check runs the learner's query and the
// reference query on a fresh copy of the data and compares the rows. Passing PASSES_TO_CLEAR
// different questions clears a rung; clearing all eight marks the lesson done.

const LESSON_ID = "sql-join-ladder";
const STARTER = "-- Your query here\n";

type Outcome = { kind: "pass" } | { kind: "fail"; reason: string } | { kind: "error"; message: string };

function freshDb(SQL: { Database: new () => SqlJsDatabase }): SqlJsDatabase {
  const db = new SQL.Database();
  db.run(LADDER_SCHEMA);
  return db;
}

function lastResult(db: SqlJsDatabase, sql: string): RowsResult {
  const results = db.exec(sql);
  return results.length ? results[results.length - 1] : { columns: [], values: [] };
}

// Unpassed questions first, so a rung doesn't repeat until it has to; never the one just shown.
function pickQuestion(questions: LadderQuestion[], passed: Record<string, string>, avoid?: string): LadderQuestion | null {
  const others = questions.filter((q) => q.id !== avoid);
  const fresh = others.filter((q) => !passed[q.id]);
  const from = fresh.length ? fresh : others.length ? others : questions;
  return from.length ? from[Math.floor(Math.random() * from.length)] : null;
}

function QuestionCard({ question, cleared, onAttempt, onNext }: { question: LadderQuestion; cleared: boolean; onAttempt: (passed: boolean) => void; onNext: () => void }) {
  const [query, setQuery] = useState(STARTER);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RowsResult | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  async function check() {
    setBusy(true);
    try {
      const SQL = await getSqlJs();
      const want = lastResult(freshDb(SQL), question.solution);
      let got: RowsResult;
      try {
        got = lastResult(freshDb(SQL), query);
      } catch (err) {
        setResult(null);
        setOutcome({ kind: "error", message: err instanceof Error ? err.message : "The query failed." });
        onAttempt(false);
        return;
      }
      setResult(got);
      const reason = compareResults(got, want, false);
      setOutcome(reason ? { kind: "fail", reason } : { kind: "pass" });
      onAttempt(reason === null);
    } catch {
      setOutcome({ kind: "error", message: "Couldn't load the SQL engine. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="drill-card sqlp-card">
      <h4>{question.title}</h4>
      <p className="lt-p">{withInlineCode(question.prompt)}</p>
      <p className="gate-note">Columns: {question.columns}. Any row order.</p>
      <div className="editor-wrap">
        <Editor
          height="190px"
          language="sql"
          theme="vs-dark"
          value={query}
          onChange={(v) => setQuery(v ?? "")}
          options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: "on", scrollBeyondLastLine: false }}
        />
      </div>
      <div className="darr-actions">
        <button onClick={check} disabled={busy}>
          {busy ? "Running…" : "Run and check"}
        </button>
        <button onClick={() => setShowHint((h) => !h)}>{showHint ? "Hide hint" : "Hint"}</button>
        <button onClick={() => setShowSolution((s) => !s)}>{showSolution ? "Hide solution" : "Show a solution"}</button>
        <button onClick={onNext}>{outcome?.kind === "pass" ? "Next question" : "Skip"}</button>
      </div>
      {showHint && <p className="lt-p sqlp-hint">{withInlineCode(question.hint)}</p>}
      {outcome?.kind === "pass" && (
        <p className="sqlp-pass">Correct: your rows match the expected result.{cleared ? " This rung is cleared." : ""}</p>
      )}
      {outcome?.kind === "fail" && <p className="sqlp-fail">Not yet. {outcome.reason}</p>}
      {outcome?.kind === "error" && <pre className="compile-error">{outcome.message}</pre>}
      {result && <ResultTable result={result} />}
      {showSolution && (
        <div className="sqlp-solution">
          <pre className="algo-code lt-code">{question.solution}</pre>
          <p className="lt-p">{withInlineCode(question.why)}</p>
        </div>
      )}
    </div>
  );
}

export function JoinLadder() {
  const [pool, setPool] = useState<LadderQuestion[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [progress, setProgress] = useState<JoinLadderProgress>(() => loadJoinLadder());
  const [rung, setRung] = useState<number | null>(null);
  const [current, setCurrent] = useState<LadderQuestion | null>(null);

  // Generate the questions once: run every reference query on one copy of the data and keep
  // the usable ones (see usableQuestions).
  useEffect(() => {
    let cancelled = false;
    getSqlJs()
      .then((SQL) => {
        const db = freshDb(SQL);
        const questions = usableQuestions((sql) => lastResult(db, sql));
        if (cancelled) return;
        // Start on the lowest rung not yet cleared.
        const passed = loadJoinLadder().passed;
        const onRung = (r: number) => questions.filter((q) => q.rung === r);
        const start = LADDER_RUNGS.find((r) => onRung(r.rung).filter((q) => passed[q.id]).length < PASSES_TO_CLEAR)?.rung ?? 1;
        setPool(questions);
        setRung(start);
        setCurrent(pickQuestion(onRung(start), passed));
      })
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const byRung = useMemo(() => {
    const m = new Map<number, LadderQuestion[]>();
    for (const q of pool ?? []) m.set(q.rung, [...(m.get(q.rung) ?? []), q]);
    return m;
  }, [pool]);

  const passesOn = (r: number) => (byRung.get(r) ?? []).filter((q) => progress.passed[q.id]).length;
  const isCleared = (r: number) => passesOn(r) >= PASSES_TO_CLEAR;
  const clearedCount = LADDER_RUNGS.filter((r) => isCleared(r.rung)).length;

  useEffect(() => {
    if (pool && clearedCount === LADDER_RUNGS.length) setWorkedThrough(LESSON_ID, true);
  }, [pool, clearedCount]);

  if (loadError) return <p className="sqlp-fail">Couldn't load the SQL engine. Check your connection and reload the page.</p>;
  if (!pool || rung === null) return <p className="status-text">Loading the SQL engine and generating questions…</p>;

  const info = LADDER_RUNGS.find((r) => r.rung === rung)!;
  const questions = byRung.get(rung) ?? [];

  function goTo(r: number) {
    setRung(r);
    setCurrent(pickQuestion(byRung.get(r) ?? [], progress.passed));
  }

  return (
    <div className="sqlp jl">
      <p className="gate-note">
        {clearedCount} of {LADDER_RUNGS.length} rungs cleared. Pass {PASSES_TO_CLEAR} different questions on a rung to clear it. {pool.length} questions in all, each checked on a fresh copy of the
        ladder database.
      </p>
      <div className="jl-rungs" role="tablist" aria-label="Rungs">
        {LADDER_RUNGS.map((r) => (
          <button key={r.rung} role="tab" aria-selected={r.rung === rung} className={`jl-rung${r.rung === rung ? " active" : ""}${isCleared(r.rung) ? " cleared" : ""}`} onClick={() => goTo(r.rung)}>
            <span className="jl-rung-num">{isCleared(r.rung) ? "✓" : r.rung}</span> {r.name}
            <span className="jl-rung-count">
              {Math.min(passesOn(r.rung), PASSES_TO_CLEAR)}/{PASSES_TO_CLEAR}
            </span>
          </button>
        ))}
      </div>
      <p className="lt-p">
        <strong>
          Rung {info.rung}: {info.name}.
        </strong>{" "}
        {info.blurb} {passesOn(rung)} of {questions.length} questions passed here.
      </p>
      {isCleared(rung) && rung < LADDER_RUNGS.length && (
        <p className="sqlp-solved">
          Rung cleared. <button onClick={() => goTo(rung + 1)}>Move up to rung {rung + 1}</button>
        </p>
      )}
      {current && (
        <QuestionCard
          key={current.id}
          question={current}
          cleared={isCleared(rung)}
          onAttempt={(passed) => setProgress(recordJoinLadderAttempt(current.id, passed))}
          onNext={() => setCurrent(pickQuestion(questions, progress.passed, current.id))}
        />
      )}
    </div>
  );
}
