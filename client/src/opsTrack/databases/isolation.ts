import { type OpsLessonData } from "../types.ts";

export const dbIsolation: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "The I in ACID, isolation, promises that concurrent transactions don't trip over each other. Perfect isolation (serializable: the result is as if transactions ran one at a time) costs throughput, so databases offer weaker isolation levels and let you choose. Each weaker level allows a specific, named anomaly.",
        "Most databases default to read committed (PostgreSQL, SQL Server, Oracle) or repeatable read (MySQL InnoDB). Neither prevents every race, so knowing which anomalies your level allows is how you avoid bugs that only appear under load, like two customers buying the last item.",
      ],
    },
    {
      kind: "table",
      title: "The anomalies",
      head: ["Anomaly", "What happens", "Classic damage"],
      rows: [
        ["Dirty read", "you read another transaction's change before it commits, and it then rolls back", "acting on data that never existed"],
        ["Non-repeatable read", "you read a row twice in one transaction and get different values, because someone committed in between", "a report whose numbers don't add up"],
        ["Phantom read", "you run the same range query twice and new rows appear", "a check like \"no booking overlaps\" passes, then a new overlapping booking appears"],
        ["Lost update", "two transactions read, modify and write the same row; the second overwrites the first", "stock or a balance silently wrong"],
        ["Write skew", "two transactions each read the same data, then change different rows, breaking a rule that involves both", "two doctors both go off call; a username taken twice"],
      ],
    },
    {
      kind: "widget",
      widget: "isolationLab",
      title: "Try it: race two sessions",
      intro: "Pick an anomaly and an isolation level. The timeline shows what each session runs and sees, then whether the anomaly happens. The rows follow how PostgreSQL and MySQL behave, and note where they differ.",
    },
    {
      kind: "table",
      title: "Which level stops what (SQL standard, and in practice)",
      head: ["Level", "Dirty read", "Non-repeatable read", "Phantom", "Lost update", "Write skew"],
      rows: [
        ["Read uncommitted", "possible (PostgreSQL treats it as read committed)", "possible", "possible", "possible", "possible"],
        ["Read committed", "prevented", "possible", "possible", "possible", "possible"],
        ["Repeatable read", "prevented", "prevented", "standard: possible; PostgreSQL and MySQL: prevented for plain reads", "PostgreSQL: prevented (aborts); MySQL: possible", "possible"],
        ["Serializable", "prevented", "prevented", "prevented", "prevented", "prevented"],
      ],
      notes: ["Oracle and SQL Server's snapshot isolation behave like PostgreSQL's repeatable read: a consistent snapshot, with write skew still possible."],
    },
    {
      kind: "text",
      title: "Locks versus MVCC",
      paragraphs: [
        "There are two ways to keep transactions apart. Locking makes readers and writers wait: a writer locks the row and others queue behind it (two-phase locking holds every lock until commit, which gives serializability at the price of waiting and deadlocks). MVCC, multi-version concurrency control, keeps old versions of each row instead, so each transaction reads a consistent snapshot as of its start and readers never block writers.",
        "PostgreSQL, MySQL InnoDB, Oracle and SQL Server's snapshot modes all use MVCC. The cost is cleaning up old versions (PostgreSQL's VACUUM) and the fact that a snapshot alone doesn't stop write skew; PostgreSQL's serializable level adds conflict detection on top (serializable snapshot isolation) and aborts one of the transactions.",
      ],
    },
    {
      kind: "code",
      title: "Fixes that work at any level",
      blocks: [
        {
          lang: "sql",
          label: "Atomic update instead of read, modify, write",
          code: "UPDATE products\nSET stock = stock - 1\nWHERE id = 7 AND stock > 0;\n-- check the affected row count: 0 means sold out",
        },
        {
          lang: "sql",
          label: "Pessimistic: lock the rows you will decide on",
          code: "BEGIN;\nSELECT stock FROM products WHERE id = 7 FOR UPDATE;  -- others wait here\nUPDATE products SET stock = 9 WHERE id = 7;\nCOMMIT;",
        },
        {
          lang: "sql",
          label: "Optimistic: a version column",
          code: "UPDATE products\nSET stock = 9, version = version + 1\nWHERE id = 7 AND version = 3;\n-- 0 rows updated means someone changed it first: reload and retry",
        },
      ],
      notes: [
        "Constraints are the strongest fix of all: a UNIQUE index on usernames makes \"taken twice\" impossible whatever the isolation level, and a CHECK (stock >= 0) refuses a negative stock.",
        "If you choose serializable, the database will abort some transactions with a serialization failure. That is normal; the application must catch it and retry the whole transaction.",
      ],
    },
  ],
  quiz: [
    {
      question: "Two requests both run `SELECT balance` (100), add 10 in code, and `UPDATE ... SET balance = 110`. The final balance is 110, not 120. What happened, and what is the simplest fix?",
      answer: "A lost update; use `UPDATE ... SET balance = balance + 10` so the database does the arithmetic atomically",
      distractors: ["A dirty read; raise the level to read committed", "A phantom; add an index", "Write skew; add a foreign key"],
      why: "Read, modify, write in application code races. Doing the change in one UPDATE removes the window, and works at read committed.",
    },
    {
      question: "What does MVCC let a reader do?",
      answer: "Read a consistent snapshot without waiting for writers",
      distractors: ["Skip the write-ahead log", "Read uncommitted changes faster", "Avoid ever needing transactions"],
      why: "Writers create new row versions while readers keep seeing the version that was current when they started.",
    },
    {
      question: "Under snapshot isolation (PostgreSQL repeatable read), which anomaly can still happen?",
      answer: "Write skew",
      distractors: ["Dirty read", "Non-repeatable read", "Lost update on the same row"],
      why: "Each transaction sees a consistent snapshot and conflicting writes to the same row are caught, but two transactions writing different rows based on the same read are not. Serializable, explicit locks or a constraint fix it.",
    },
    {
      question: "Your app runs at serializable and sometimes gets \"could not serialize access\" errors. What should it do?",
      answer: "Retry the whole transaction",
      distractors: ["Lower the isolation level until the errors stop", "Retry only the failed statement", "Ignore the error; the data is fine"],
      why: "The database aborted the transaction to keep the result serializable. Retrying from BEGIN re-reads the new state.",
    },
  ],
  pitfalls: [
    "Assuming the default level is serializable. It almost never is.",
    "Checking a rule with SELECT and then writing, without a lock or constraint. That is the shape of every lost update and write skew.",
    "Long transactions under MVCC: they keep old row versions alive and block cleanup.",
    "Catching a deadlock or serialization error and giving up instead of retrying.",
  ],
  next: [
    { id: "db-storage-engines", label: "How a Database Stores Data: Pages, B-Trees, LSM Trees and the WAL" },
    { id: "sd-cap", label: "CAP and Consistency" },
  ],
};
