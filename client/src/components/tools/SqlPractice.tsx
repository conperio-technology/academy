import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { loadSqlPractice, recordSqlPracticeAttempt, setWorkedThrough, type SqlPracticeProgress } from "../../practiceHistory";
import { compareResults, type RowsResult } from "../../sqlCompare";
import { getSqlJs, type SqlJsDatabase } from "../../sqljsLoader";
import { SHOP_SCHEMA, SQL_PROBLEM_SETS, type SqlProblem } from "../../sqlPracticeData";

// Graded SQL: each problem runs the learner's query and the reference query on a fresh copy
// of the shop database (sql.js, SQLite in the browser) and compares the rows. Passes are kept
// in this browser (practiceHistory.ts); passing every problem in a set marks its lesson done.

type Outcome = { kind: "pass" } | { kind: "fail"; reason: string } | { kind: "error"; message: string };

function freshDb(SQL: { Database: new () => SqlJsDatabase }): SqlJsDatabase {
  const db = new SQL.Database();
  db.run(SHOP_SCHEMA);
  return db;
}

function lastResult(db: SqlJsDatabase, sql: string): RowsResult {
  const results = db.exec(sql);
  return results.length ? results[results.length - 1] : { columns: [], values: [] };
}

function ResultTable({ result }: { result: RowsResult }) {
  if (result.columns.length === 0) return <p className="gate-note">The query ran and returned no rows.</p>;
  return (
    <>
      <div className="cm-scroll">
        <table className="bigo-table sqlp-table">
          <thead>
            <tr>
              {result.columns.map((c, i) => (
                <th key={i}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.values.map((row, i) => (
              <tr key={i}>
                {row.map((v, j) => (
                  <td key={j} className="mono">
                    {v === null ? "NULL" : String(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="gate-note">
        {result.values.length} row{result.values.length === 1 ? "" : "s"}
      </p>
    </>
  );
}

function ProblemCard({ problem, index, progress, onAttempt }: { problem: SqlProblem; index: number; progress?: SqlPracticeProgress; onAttempt: (passed: boolean) => void }) {
  const [query, setQuery] = useState(problem.starter);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RowsResult | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  async function check() {
    setBusy(true);
    try {
      const SQL = await getSqlJs();
      const want = lastResult(freshDb(SQL), problem.solution);
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
      const reason = compareResults(got, want, problem.ordered ?? false);
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
      <div className="sqlp-head">
        <span className="drill-progress">Problem {index + 1}</span>
        {progress?.passedAt && <span className="sqlp-solved">Solved</span>}
      </div>
      <h4>{problem.title}</h4>
      <p className="lt-p">{problem.prompt}</p>
      <p className="gate-note">
        Columns: {problem.columns}
        {problem.ordered ? ". Row order matters." : ". Any row order."}
      </p>
      <div className="editor-wrap">
        <Editor
          height="170px"
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
        <button
          onClick={() => {
            setQuery(problem.starter);
            setResult(null);
            setOutcome(null);
          }}
        >
          Reset
        </button>
      </div>
      {showHint && <p className="lt-p sqlp-hint">{problem.hint}</p>}
      {outcome?.kind === "pass" && <p className="sqlp-pass">Correct: your rows match the expected result.</p>}
      {outcome?.kind === "fail" && <p className="sqlp-fail">Not yet. {outcome.reason}</p>}
      {outcome?.kind === "error" && <pre className="compile-error">{outcome.message}</pre>}
      {result && <ResultTable result={result} />}
      {showSolution && (
        <div className="sqlp-solution">
          <pre className="algo-code lt-code">{problem.solution}</pre>
          <p className="lt-p">{problem.why}</p>
        </div>
      )}
    </div>
  );
}

export function SqlPractice({ set }: { set: string }) {
  const data = SQL_PROBLEM_SETS[set];
  const [progress, setProgress] = useState<Record<string, SqlPracticeProgress>>(() => loadSqlPractice());
  const solved = data ? data.problems.filter((p) => progress[p.id]?.passedAt).length : 0;

  useEffect(() => {
    if (data && solved === data.problems.length) setWorkedThrough(data.lessonId, true);
  }, [data, solved]);

  if (!data) return null;
  return (
    <div className="sqlp">
      <p className="gate-note">
        {solved} of {data.problems.length} solved. Every check runs on a fresh copy of the shop database, so nothing you run can break it.
      </p>
      {data.problems.map((p, i) => (
        <ProblemCard key={p.id} problem={p} index={i} progress={progress[p.id]} onAttempt={(passed) => setProgress(recordSqlPracticeAttempt(p.id, passed))} />
      ))}
    </div>
  );
}
