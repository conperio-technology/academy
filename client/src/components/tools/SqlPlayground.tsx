import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { getSqlJs, type SqlJsDatabase, type SqlJsQueryResult } from "../../sqljsLoader";

interface Props {
  schemaSql: string;
  starterQuery: string;
}

// A real, in-browser SQL engine (sql.js/WASM SQLite) rather than a canned animation --
// every query actually runs against real data, the same "genuinely execute it" bar
// every code runner in this app already holds itself to. Reusable across every SQL
// tool: only the starter query differs, since they all share one sample database
// (see sqlSampleData.ts).
export function SqlPlayground({ schemaSql, starterQuery }: Props) {
  const [query, setQuery] = useState(starterQuery);
  const [db, setDb] = useState<SqlJsDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<SqlJsQueryResult | null>(null);
  const [ranWithNoRows, setRanWithNoRows] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSqlJs().then((SQL) => {
      if (cancelled) return;
      const database = new SQL.Database();
      database.run(schemaSql);
      setDb(database);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [schemaSql]);

  function runQuery() {
    if (!db) return;
    setError(null);
    setResult(null);
    setRanWithNoRows(false);
    try {
      const results = db.exec(query);
      if (results.length === 0) {
        setRanWithNoRows(true);
      } else {
        setResult(results[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Query failed.");
    }
  }

  function resetData() {
    setLoading(true);
    getSqlJs().then((SQL) => {
      const database = new SQL.Database();
      database.run(schemaSql);
      setDb(database);
      setQuery(starterQuery);
      setResult(null);
      setRanWithNoRows(false);
      setError(null);
      setLoading(false);
    });
  }

  return (
    <div className="tool-widget">
      <div className="editor-wrap">
        <Editor
          height="160px"
          language="sql"
          theme="vs-dark"
          value={query}
          onChange={(value) => setQuery(value ?? "")}
          options={{ fontSize: 14, minimap: { enabled: false } }}
        />
      </div>

      <div className="darr-actions">
        <button onClick={runQuery} disabled={loading}>
          {loading ? "Loading SQL engine…" : "▶ Run Query"}
        </button>
        <button onClick={resetData} disabled={loading}>
          reset data
        </button>
      </div>

      {error && <pre className="compile-error">{error}</pre>}

      {result && (
        <>
          <table className="bigo-table">
            <thead>
              <tr>
                {result.columns.map((c) => (
                  <th key={c}>{c}</th>
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
          <p className="gate-note">
            {result.values.length} row{result.values.length === 1 ? "" : "s"}
          </p>
        </>
      )}

      {ranWithNoRows && <p className="gate-note">Query ran successfully -- no rows returned.</p>}
    </div>
  );
}
