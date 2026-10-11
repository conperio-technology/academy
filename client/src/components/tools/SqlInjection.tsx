import { useEffect, useState } from "react";
import { getSqlJs, type SqlJsDatabase } from "../../sqljsLoader";

// Passwords are plain text here ONLY to keep the demo to one table -- see the Hashing &
// Encryption lesson for how they should really be stored.
const SCHEMA_SQL = `
CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, role TEXT NOT NULL);
INSERT INTO users VALUES
  (1, 'admin', 'S3cure!Adm1n', 'admin'),
  (2, 'ava', 'hunter2', 'employee'),
  (3, 'ben', 'correct-horse', 'employee');
`;

const PRESETS = [
  { label: "Normal login", username: "ava", password: "hunter2" },
  { label: "Wrong password", username: "ava", password: "guess" },
  { label: "Always-true condition", username: "admin", password: "' OR '1'='1" },
  { label: "Comment out the password check", username: "admin' --", password: "anything" },
  { label: "Drop the table", username: "x'; DROP TABLE users; --", password: "x" },
];

interface Attempt {
  sql: string;
  bound?: string[];
  outcome: string;
  success: boolean;
}

function vulnerableSql(username: string, password: string) {
  // The bug: user input pasted straight into the SQL text.
  return `SELECT id, username, role FROM users WHERE username = '${username}' AND password = '${password}';`;
}

const SAFE_SQL = "SELECT id, username, role FROM users WHERE username = ? AND password = ?;";

export function SqlInjection() {
  const [db, setDb] = useState<SqlJsDatabase | null>(null);
  const [username, setUsername] = useState(PRESETS[0].username);
  const [password, setPassword] = useState(PRESETS[0].password);
  const [safe, setSafe] = useState(false);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [tableExists, setTableExists] = useState(true);

  function reset() {
    getSqlJs().then((SQL) => {
      const database = new SQL.Database();
      database.run(SCHEMA_SQL);
      setDb(database);
      setAttempt(null);
      setTableExists(true);
    });
  }

  useEffect(reset, []);

  function checkTable(database: SqlJsDatabase) {
    const rows = database.exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users';");
    setTableExists(rows.length > 0);
  }

  function logIn() {
    if (!db) return;
    if (safe) {
      const stmt = db.prepare(SAFE_SQL);
      stmt.bind([username, password]);
      const row = stmt.step() ? stmt.getAsObject() : null;
      stmt.free();
      setAttempt({
        sql: SAFE_SQL,
        bound: [username, password],
        success: row !== null,
        outcome: row ? `Logged in as ${row.username} (${row.role})` : "Login failed -- no user with that exact username and password.",
      });
    } else {
      const sql = vulnerableSql(username, password);
      try {
        // exec, like many real drivers, happily runs several ;-separated statements.
        const result = db.exec(sql);
        const row = result[0]?.values[0];
        setAttempt({
          sql,
          success: !!row,
          outcome: row ? `Logged in as ${row[1]} (${row[2]})` : "Login failed.",
        });
      } catch (err) {
        setAttempt({ sql, success: false, outcome: `Database error: ${err instanceof Error ? err.message : String(err)}` });
      }
    }
    checkTable(db);
  }

  if (!db) return <p className="status-text">Loading SQL engine…</p>;

  return (
    <div className="tool-widget">
      <div className="sql-presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setUsername(p.username);
              setPassword(p.password);
              setAttempt(null);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="login-form">
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} spellCheck={false} />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} spellCheck={false} />
        </label>
      </div>

      <label className="sql-index-toggle">
        <input type="checkbox" checked={safe} onChange={(e) => setSafe(e.target.checked)} /> Use a parameterized query
        (placeholders + bound values) instead of building the SQL string
      </label>

      <div className="darr-actions">
        <button onClick={logIn} disabled={!tableExists}>
          Log in
        </button>
        <button onClick={reset}>reset data</button>
      </div>

      {attempt && (
        <div className="sql-plan">
          <p className="gate-note">SQL the database received:</p>
          <code className="sql-snippet">{attempt.sql}</code>
          {attempt.bound && (
            <p className="gate-note">
              Bound values (sent separately, always treated as plain data):{" "}
              {attempt.bound.map((v, i) => (
                <code key={i}>{JSON.stringify(v)} </code>
              ))}
            </p>
          )}
          <p className={attempt.success ? "constraint-ok" : "constraint-fail"}>{attempt.outcome}</p>
        </div>
      )}

      {!tableExists && (
        <p className="constraint-fail">
          The users table no longer exists. Every login in the company is now broken. Hit "reset data" to restore it.
        </p>
      )}
    </div>
  );
}
