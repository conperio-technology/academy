import { useEffect, useState } from "react";
import { getSqlJs, type SqlJsDatabase } from "../../sqljsLoader";

// A deliberately BIG table (200,000 orders), generated inside sql.js itself with a
// recursive CTE so nothing large ships over the network. Big enough that a full table
// scan takes visibly longer than an index lookup -- the whole point of the lesson.
const ORDER_COUNT = 200_000;
const SCHEMA_SQL = `
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  total INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 5000)
INSERT INTO customers SELECT i, 'Customer ' || i,
  CASE i % 4 WHEN 0 THEN 'Austin' WHEN 1 THEN 'Chicago' WHEN 2 THEN 'Denver' ELSE 'Remote' END FROM n;
WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < ${ORDER_COUNT})
INSERT INTO orders SELECT i, (i * 7919) % 5000 + 1,
  CASE i % 10 WHEN 0 THEN 'pending' WHEN 1 THEN 'cancelled' ELSE 'shipped' END,
  (i * 31) % 500 + 5, date('2024-01-01', '+' || (i % 640) || ' days') FROM n;
`;

interface IndexDef {
  name: string;
  columns: string;
}

const INDEXES: IndexDef[] = [
  { name: "idx_orders_customer", columns: "customer_id" },
  { name: "idx_orders_status", columns: "status" },
  { name: "idx_orders_customer_date", columns: "customer_id, created_at" },
];

interface Preset {
  label: string;
  sql: string;
  hint: string;
}

const PRESETS: Preset[] = [
  {
    label: "One customer's orders",
    sql: "SELECT * FROM orders WHERE customer_id = 42;",
    hint: "The classic case: without an index on customer_id, the only way to find customer 42's 40 orders is to look at all 200,000.",
  },
  {
    label: "Look up by primary key",
    sql: "SELECT * FROM orders WHERE id = 150000;",
    hint: "Always fast, no index to create: the primary key always has an index -- in SQLite (and SQL Server/InnoDB by default) the table itself is stored sorted by it.",
  },
  {
    label: "Customer + date range",
    sql: "SELECT * FROM orders WHERE customer_id = 42 AND created_at >= '2025-06-01';",
    hint: "A composite index (customer_id, created_at) answers both conditions in one search. Compare with only the single-column customer index turned on.",
  },
  {
    label: "Date range only",
    sql: "SELECT COUNT(*) FROM orders WHERE created_at >= '2025-06-01';",
    hint: "The composite index can't help here: it's sorted by customer_id FIRST, so dates are scattered through it. Column order in an index matters.",
  },
  {
    label: "Function on the column",
    sql: "SELECT COUNT(*) FROM orders WHERE lower(status) = 'pending';",
    hint: "Wrapping the column in a function hides it from the index -- the database would have to run lower() on every row to compare. Turn on the status index and compare with the next preset.",
  },
  {
    label: "Same, without the function",
    sql: "SELECT COUNT(*) FROM orders WHERE status = 'pending';",
    hint: "Same question, but the column is compared directly, so the status index can be used.",
  },
  {
    label: "Join customers to orders",
    sql: "SELECT c.name, COUNT(*) AS orders FROM customers c JOIN orders o ON o.customer_id = c.id WHERE c.city = 'Austin' GROUP BY c.id LIMIT 5;",
    hint: "Joins are where missing indexes hurt most: with an index on orders.customer_id, each customer's orders are a quick search instead of part of a full scan.",
  },
];

interface RunResult {
  plan: string[];
  ms: number;
  rows: number;
}

function fmtMs(ms: number) {
  return ms < 1 ? `${ms.toFixed(2)} ms` : `${ms.toFixed(1)} ms`;
}

// Index on/off toggles + EXPLAIN QUERY PLAN + a stopwatch, all against a real in-browser
// SQLite. Every number shown is measured, not canned.
export function SqlIndexes() {
  const [db, setDb] = useState<SqlJsDatabase | null>(null);
  const [enabled, setEnabled] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState(PRESETS[0].sql);
  const [hint, setHint] = useState(PRESETS[0].hint);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [writeNote, setWriteNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSqlJs().then((SQL) => {
      if (cancelled) return;
      const database = new SQL.Database();
      database.run(SCHEMA_SQL);
      setDb(database);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleIndex(index: IndexDef) {
    if (!db) return;
    const next = new Set(enabled);
    if (next.has(index.name)) {
      db.run(`DROP INDEX ${index.name};`);
      next.delete(index.name);
    } else {
      db.run(`CREATE INDEX ${index.name} ON orders(${index.columns});`);
      next.add(index.name);
    }
    setEnabled(next);
    setResult(null);
  }

  function run() {
    if (!db) return;
    setError(null);
    try {
      const plan = db.exec(`EXPLAIN QUERY PLAN ${query}`)[0]?.values.map((row) => String(row[3])) ?? [];
      // Best of 5, so one slow first run (cold caches) doesn't skew the comparison.
      let best = Infinity;
      let rows = 0;
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        const res = db.exec(query);
        best = Math.min(best, performance.now() - start);
        rows = res[0]?.values.length ?? 0;
      }
      setResult({ plan, ms: best, rows });
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Query failed.");
    }
  }

  // The other side of the trade: every index is one more structure each INSERT must update.
  function measureWrites() {
    if (!db) return;
    const start = performance.now();
    db.run("BEGIN;");
    db.run(`WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 20000)
      INSERT INTO orders (customer_id, status, total, created_at)
      SELECT (i * 13) % 5000 + 1, 'pending', 10, '2025-01-01' FROM n;`);
    const ms = performance.now() - start;
    db.run("ROLLBACK;"); // keep the table the same size for the next comparison
    setWriteNote(
      `Inserting 20,000 rows took ${fmtMs(ms)} with ${enabled.size} extra index${enabled.size === 1 ? "" : "es"} to maintain. ` +
        "Toggle indexes and try again -- reads get faster, writes get slower.",
    );
  }

  if (!db) return <p className="status-text">Building a {ORDER_COUNT.toLocaleString()}-row orders table…</p>;

  return (
    <div className="tool-widget">
      <p className="gate-note">
        <code>orders</code> has {ORDER_COUNT.toLocaleString()} rows and <code>customers</code> has 5,000. Turn
        indexes on and off, run the same query, and watch the plan and the time change.
      </p>

      <div className="sql-index-toggles">
        {INDEXES.map((index) => (
          <label key={index.name} className="sql-index-toggle">
            <input type="checkbox" checked={enabled.has(index.name)} onChange={() => toggleIndex(index)} />
            <code>
              CREATE INDEX {index.name} ON orders({index.columns})
            </code>
          </label>
        ))}
      </div>

      <div className="sql-presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            className={query === p.sql ? "active" : ""}
            onClick={() => {
              setQuery(p.sql);
              setHint(p.hint);
              setResult(null);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <textarea
        className="sql-textarea"
        value={query}
        rows={3}
        spellCheck={false}
        onChange={(e) => {
          setQuery(e.target.value);
          setHint("");
        }}
      />
      {hint && <p className="gate-note">💡 {hint}</p>}

      <div className="darr-actions">
        <button onClick={run}>▶ Run with EXPLAIN QUERY PLAN</button>
        <button onClick={measureWrites}>Time 20,000 inserts</button>
      </div>

      {error && <pre className="compile-error">{error}</pre>}

      {result && (
        <div className="sql-plan">
          <div className="sql-plan-stats">
            <span>
              <strong>{fmtMs(result.ms)}</strong> (best of 5)
            </span>
            <span>{result.rows.toLocaleString()} row{result.rows === 1 ? "" : "s"} returned</span>
          </div>
          <ul>
            {result.plan.map((line, i) => (
              <li key={i} className={`mono ${line.startsWith("SCAN") ? "plan-scan" : line.startsWith("SEARCH") ? "plan-search" : ""}`}>
                {line}
              </li>
            ))}
          </ul>
          <p className="gate-note">
            <strong>SCAN</strong> = read every row (or every entry of an index) of that table, start to finish.{" "}
            <strong>SEARCH</strong> = jump straight to the matching rows through a sorted structure -- an index or the
            primary key. A SCAN of a big table is usually the line to fix.
          </p>
        </div>
      )}

      {writeNote && <p className="gate-note">⏱ {writeNote}</p>}
    </div>
  );
}
