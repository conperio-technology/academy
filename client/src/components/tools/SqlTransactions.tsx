import { useEffect, useState } from "react";
import { getSqlJs, type SqlJsDatabase } from "../../sqljsLoader";

const SCHEMA_SQL = `
CREATE TABLE accounts (
  id INTEGER PRIMARY KEY,
  owner TEXT NOT NULL,
  balance INTEGER NOT NULL CHECK (balance >= 0)
);
INSERT INTO accounts (id, owner, balance) VALUES (1, 'Ava', 500), (2, 'Ben', 300);
`;
const STARTING_TOTAL = 800;

interface LogLine {
  sql: string;
  outcome: "ok" | "error" | "crash" | "info";
  note?: string;
}

interface Account {
  id: number;
  owner: string;
  balance: number;
}

// A bank transfer is two UPDATEs. This runs them for real against an in-browser SQLite
// database -- with or without BEGIN/COMMIT, optionally "crashing" between them -- and
// keeps an eye on the one thing that must never change: the total money in the bank.
export function SqlTransactions() {
  const [db, setDb] = useState<SqlJsDatabase | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [amount, setAmount] = useState(100);
  const [useTransaction, setUseTransaction] = useState(false);
  const [crash, setCrash] = useState(true);
  const [log, setLog] = useState<LogLine[]>([]);

  function load(database: SqlJsDatabase) {
    const rows = database.exec("SELECT id, owner, balance FROM accounts ORDER BY id;")[0]?.values ?? [];
    setAccounts(rows.map(([id, owner, balance]) => ({ id: Number(id), owner: String(owner), balance: Number(balance) })));
  }

  function reset() {
    getSqlJs().then((SQL) => {
      const database = new SQL.Database();
      database.run(SCHEMA_SQL);
      setDb(database);
      load(database);
      setLog([]);
    });
  }

  useEffect(reset, []);

  function transfer() {
    if (!db) return;
    const steps: LogLine[] = [];
    // Runs one statement and logs it; a failure is logged against that statement and
    // stops the transfer, just like an exception would in application code.
    const exec = (sql: string) => {
      try {
        db.run(sql);
        steps.push({ sql, outcome: "ok" });
      } catch (err) {
        steps.push({ sql, outcome: "error", note: err instanceof Error ? err.message : String(err) });
        throw err;
      }
    };

    try {
      if (useTransaction) exec("BEGIN;");
      exec(`UPDATE accounts SET balance = balance - ${amount} WHERE owner = 'Ava';`);
      if (crash) {
        steps.push({ sql: "-- 💥 the server loses power here", outcome: "crash" });
        throw new Error("crash");
      }
      exec(`UPDATE accounts SET balance = balance + ${amount} WHERE owner = 'Ben';`);
      if (useTransaction) exec("COMMIT;");
    } catch {
      if (useTransaction) {
        // What a real database does on restart after a crash, or what your code does in
        // its catch block: undo everything since BEGIN.
        db.run("ROLLBACK;");
        steps.push({ sql: "ROLLBACK;", outcome: "info", note: "everything since BEGIN is undone" });
      } else {
        steps.push({ sql: "", outcome: "info", note: "no transaction, so whatever already ran stays run" });
      }
    }

    setLog(steps);
    load(db);
  }

  if (!db) return <p className="status-text">Loading SQL engine…</p>;

  const total = accounts.reduce((sum, a) => sum + a.balance, 0);
  const broken = total !== STARTING_TOTAL;

  return (
    <div className="tool-widget">
      <table className="bigo-table sql-accounts">
        <thead>
          <tr>
            <th>owner</th>
            <th>balance</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((a) => (
            <tr key={a.id}>
              <td>{a.owner}</td>
              <td className="mono">${a.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={`sql-invariant ${broken ? "broken" : ""}`}>
        Total money in the bank: <strong>${total}</strong>{" "}
        {broken ? `-- should be $${STARTING_TOTAL}. Money ${total < STARTING_TOTAL ? "vanished" : "appeared from nowhere"}!` : "✓"}
      </p>

      <div className="sql-txn-controls">
        <label>
          Move $
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 1))}
          />{" "}
          from Ava to Ben
        </label>
        <label>
          <input type="checkbox" checked={useTransaction} onChange={(e) => setUseTransaction(e.target.checked)} /> Wrap
          it in a transaction (<code>BEGIN</code> … <code>COMMIT</code>)
        </label>
        <label>
          <input type="checkbox" checked={crash} onChange={(e) => setCrash(e.target.checked)} /> Crash between the two
          UPDATEs
        </label>
      </div>

      <div className="darr-actions">
        <button onClick={transfer}>▶ Run the transfer</button>
        <button onClick={reset}>reset data</button>
      </div>

      {log.length > 0 && (
        <ol className="sql-txn-log">
          {log.map((line, i) => (
            <li key={i} className={`txn-${line.outcome}`}>
              {line.sql && <code>{line.sql}</code>}
              {line.note && (
                <span className="txn-note">
                  {line.sql ? " " : ""}
                  {line.outcome === "error" ? "✗ " : "→ "}
                  {line.note}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}

      <p className="gate-note">
        Try: crash without a transaction (money vanishes), then with one (nothing changes). Then turn the crash off and
        move more than Ava has -- the <code>CHECK (balance &gt;= 0)</code> constraint rejects it.
      </p>
    </div>
  );
}
