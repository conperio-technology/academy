import { useEffect, useState } from "react";
import { getSqlJs, type SqlJsDatabase, type SqlJsQueryResult } from "../../sqljsLoader";

// Part 1: the same orders stored two ways. The flat table repeats Ava's email on every
// order; the normalized pair stores it once.
const DESIGN_SQL = `
CREATE TABLE orders_flat (
  order_id INTEGER PRIMARY KEY,
  customer_name TEXT,
  customer_email TEXT,
  product TEXT,
  qty INTEGER
);
INSERT INTO orders_flat VALUES
  (1, 'Ava Chen', 'ava@conperio.com', 'Keyboard', 1),
  (2, 'Ben Ortiz', 'ben@conperio.com', 'Monitor', 2),
  (3, 'Ava Chen', 'ava@conperio.com', 'Mouse', 1),
  (4, 'Ava Chen', 'ava@conperio.com', 'Dock', 1);

CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  product TEXT NOT NULL,
  qty INTEGER NOT NULL CHECK (qty > 0)
);
INSERT INTO customers VALUES (1, 'Ava Chen', 'ava@conperio.com'), (2, 'Ben Ortiz', 'ben@conperio.com');
INSERT INTO orders VALUES (1, 1, 'Keyboard', 1), (2, 2, 'Monitor', 2), (3, 1, 'Mouse', 1), (4, 1, 'Dock', 1);
`;

const FLAT_SELECT = "SELECT order_id, customer_name, customer_email, product FROM orders_flat ORDER BY order_id;";
const NORMALIZED_SELECT =
  "SELECT o.id AS order_id, c.name AS customer_name, c.email AS customer_email, o.product FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY o.id;";
const FLAT_UPDATE = "UPDATE orders_flat SET customer_email = 'ava.chen@conperio.com' WHERE order_id = 1;";
const NORMALIZED_UPDATE = "UPDATE customers SET email = 'ava.chen@conperio.com' WHERE id = 1;";

// Part 2: each of these breaks exactly one rule the normalized schema declares.
const CONSTRAINT_TRIES = [
  {
    label: "A valid new customer",
    sql: "INSERT INTO customers (id, name, email) VALUES (3, 'Cara Diaz', 'cara@conperio.com');",
    rule: "Passes every rule.",
  },
  {
    label: "Reuse an existing id",
    sql: "INSERT INTO customers (id, name, email) VALUES (1, 'Someone Else', 'else@conperio.com');",
    rule: "PRIMARY KEY: every row needs its own id, so references to it are never ambiguous.",
  },
  {
    label: "Reuse an email",
    sql: "INSERT INTO customers (id, name, email) VALUES (4, 'Ben Again', 'ben@conperio.com');",
    rule: "UNIQUE: a business rule (one account per email) enforced by the database, not by hoping every app checks first.",
  },
  {
    label: "Leave out the email",
    sql: "INSERT INTO customers (id, name) VALUES (5, 'No Email');",
    rule: "NOT NULL: the column must always have a value.",
  },
  {
    label: "Order for a customer who doesn't exist",
    sql: "INSERT INTO orders (id, customer_id, product, qty) VALUES (10, 99, 'Webcam', 1);",
    rule: "FOREIGN KEY: customer_id must point at a real customers row -- no orphaned orders.",
  },
  {
    label: "Order a quantity of zero",
    sql: "INSERT INTO orders (id, customer_id, product, qty) VALUES (11, 1, 'Webcam', 0);",
    rule: "CHECK (qty > 0): any rule you can write as a true/false expression on the row.",
  },
  {
    label: "Delete a customer who has orders",
    sql: "DELETE FROM customers WHERE id = 2;",
    rule: "FOREIGN KEY again, from the other side: deleting Ben would orphan his order.",
  },
];

function freshDb(SQL: { Database: new () => SqlJsDatabase }) {
  const db = new SQL.Database();
  // SQLite only enforces foreign keys when asked; most other databases always do.
  db.run("PRAGMA foreign_keys = ON;");
  db.run(DESIGN_SQL);
  return db;
}

function ResultTable({ result, highlightColumn }: { result: SqlJsQueryResult | undefined; highlightColumn?: string }) {
  if (!result) return null;
  const col = highlightColumn ? result.columns.indexOf(highlightColumn) : -1;
  // Highlight cells that disagree with the first value in the highlighted column for the
  // same customer -- i.e. the inconsistency an update anomaly leaves behind.
  const firstByName = new Map<string, string>();
  return (
    <table className="bigo-table">
      <thead>
        <tr>
          {result.columns.map((c) => (
            <th key={c}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {result.values.map((row, i) => {
          const name = String(row[1]);
          const value = col >= 0 ? String(row[col]) : "";
          if (col >= 0 && !firstByName.has(name)) firstByName.set(name, value);
          return (
            <tr key={i}>
              {row.map((v, j) => (
                <td key={j} className={`mono ${j === col && firstByName.get(name) !== value ? "cell-conflict" : ""}`}>
                  {v === null ? "NULL" : String(v)}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function SqlSchemaDesign() {
  const [db, setDb] = useState<SqlJsDatabase | null>(null);
  const [version, setVersion] = useState(0); // bumps to re-read tables after a change
  const [updated, setUpdated] = useState(false);
  const [outcomes, setOutcomes] = useState<Record<string, string>>({});

  function reset() {
    getSqlJs().then((SQL) => {
      setDb(freshDb(SQL));
      setUpdated(false);
      setOutcomes({});
      setVersion((v) => v + 1);
    });
  }

  useEffect(reset, []);

  if (!db) return <p className="status-text">Loading SQL engine…</p>;

  const flat = db.exec(FLAT_SELECT)[0];
  const normalized = db.exec(NORMALIZED_SELECT)[0];

  function changeEmail() {
    if (!db) return;
    db.run(FLAT_UPDATE);
    db.run(NORMALIZED_UPDATE);
    setUpdated(true);
    setVersion((v) => v + 1);
  }

  function attempt(sql: string) {
    if (!db) return;
    let outcome: string;
    try {
      db.run(sql);
      outcome = "✓ accepted";
    } catch (err) {
      outcome = `✗ rejected: ${err instanceof Error ? err.message : String(err)}`;
    }
    setOutcomes((o) => ({ ...o, [sql]: outcome }));
    setVersion((v) => v + 1);
  }

  return (
    <div className="tool-widget" data-version={version}>
      <h3>1. Same data, two designs</h3>
      <p className="gate-note">
        Ava changed her email. Each design gets the update a developer would naturally write while looking at order #1.
      </p>
      <div className="sql-design-grid">
        <div>
          <h4>One flat table</h4>
          <ResultTable result={flat} highlightColumn={updated ? "customer_email" : undefined} />
          {updated && <code className="sql-snippet">{FLAT_UPDATE}</code>}
        </div>
        <div>
          <h4>customers + orders (normalized)</h4>
          <ResultTable result={normalized} highlightColumn={updated ? "customer_email" : undefined} />
          {updated && <code className="sql-snippet">{NORMALIZED_UPDATE}</code>}
        </div>
      </div>
      <div className="darr-actions">
        <button onClick={changeEmail} disabled={updated}>
          ✉ Ava changes her email
        </button>
        <button onClick={reset}>reset data</button>
      </div>
      {updated && (
        <p className="gate-note">
          The flat table now says Ava has two different emails -- an <strong>update anomaly</strong>. Which one is
          right? The database can't tell you. In the normalized design the email lives in exactly one row, so there
          is nothing to get out of sync.
        </p>
      )}

      <h3>2. Let the database enforce the rules</h3>
      <p className="gate-note">Each button tries one statement against the normalized tables above.</p>
      <ul className="sql-constraint-list">
        {CONSTRAINT_TRIES.map((t) => (
          <li key={t.sql}>
            <button onClick={() => attempt(t.sql)}>{t.label}</button>
            <code className="sql-snippet">{t.sql}</code>
            {outcomes[t.sql] && (
              <div className={outcomes[t.sql].startsWith("✓") ? "constraint-ok" : "constraint-fail"}>
                {outcomes[t.sql]} <span className="gate-note">— {t.rule}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
