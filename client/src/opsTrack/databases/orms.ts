import { type OpsLessonData } from "../types.ts";

export const dbOrms: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Most application code doesn't write SQL by hand. An ORM (object-relational mapper) such as Entity Framework Core in C# or SQLAlchemy and the Django ORM in Python maps tables to classes and rows to objects, and writes the SQL for you. That saves a lot of boilerplate, and it also hides the database just enough to cause the classic performance bugs: N+1 queries, loading far more than you need, and running out of connections.",
      ],
    },
    {
      kind: "code",
      title: "The N+1 problem",
      blocks: [
        {
          lang: "csharp",
          label: "C# (EF Core): N+1",
          code: "var orders = db.Orders.Where(o => o.Status == \"shipped\").ToList();  // 1 query\nforeach (var o in orders)\n    Console.WriteLine(o.Customer.Name);  // with lazy loading: 1 query per order",
        },
        {
          lang: "csharp",
          label: "C# (EF Core): one query",
          code: "var orders = db.Orders\n    .Where(o => o.Status == \"shipped\")\n    .Include(o => o.Customer)   // JOIN in the same query\n    .ToList();",
        },
        {
          lang: "python",
          label: "Python (SQLAlchemy): batched",
          code: "stmt = (select(Order)\n        .where(Order.status == \"shipped\")\n        .options(selectinload(Order.customer)))  # 2 queries: orders, then WHERE id IN (...)\norders = session.scalars(stmt).all()",
        },
      ],
      notes: [
        "Each lazy load is a separate round trip to the database. On a page that lists 200 orders that's 201 queries, which is invisible on a laptop with a local database and painful in production where every round trip costs a millisecond or more. Turn on SQL logging in development and look at how many queries a page runs.",
      ],
    },
    {
      kind: "widget",
      widget: "nPlusOne",
      title: "Try it: what N+1 costs",
      intro: "Drag the sliders. The time shown counts network round trips only.",
    },
    {
      kind: "text",
      title: "Connection pools",
      paragraphs: [
        "Opening a database connection is expensive: a TCP connection, often TLS, authentication, and on PostgreSQL a whole new server process. So applications keep a pool of open connections and lend one to each request. ADO.NET pools by default; in Python, SQLAlchemy creates a pool per engine.",
        "The pool size is a limit, not a speed dial. A database with 8 cores can only run so many queries at once; 500 connections mostly wait on each other and use memory. If every request holds a connection while it calls a slow external API, the pool runs dry and requests queue for a connection even though the database is idle. Hold connections briefly, and with many app instances put a pooler such as PgBouncer in front of PostgreSQL.",
      ],
    },
    {
      kind: "table",
      title: "ORM habits that keep queries sane",
      head: ["Habit", "Why"],
      rows: [
        ["Select only the columns you need (projections, `.Select(o => new { o.Id, o.Total })`)", "loading whole entities with large text columns wastes I/O and memory"],
        ["Load related data deliberately (`Include`, `selectinload`, `joinedload`)", "avoids N+1; pick join for one-to-one, a batched IN for one-to-many"],
        ["Read without change tracking for reports (`AsNoTracking`)", "the ORM doesn't keep a copy of every row to detect changes"],
        ["Paginate with keyset pagination for big lists", "`OFFSET 100000` still reads and throws away 100,000 rows"],
        ["Batch inserts and updates", "one round trip per row is N+1 for writes"],
        ["Use parameters, never string-built SQL, for raw queries", "SQL injection; see the SQL Injection lesson"],
        ["Keep migrations in source control and review the SQL they generate", "an innocent-looking model change can rewrite a huge table"],
      ],
    },
    {
      kind: "text",
      title: "Schema migrations without downtime",
      paragraphs: [
        "With several app servers, old and new code run side by side during a deploy, so every schema change must work with both. The safe shape is expand and contract: first add (a nullable column, a new table) and deploy code that writes both old and new; backfill existing rows in small batches; switch reads to the new shape; and only in a later release drop the old column. Renaming a column in one step breaks whichever version doesn't know the new name.",
      ],
    },
  ],
  quiz: [
    {
      question: "A page lists 100 blog posts with their author names and runs 101 queries. What is the fix?",
      answer: "Load the authors with the posts in one join or one batched query",
      distractors: ["Add an index on the posts table", "Increase the connection pool size", "Cache each author separately"],
      why: "The 100 extra queries are the lazy loads. Eager loading removes them; indexes and pools don't change the count.",
    },
    {
      question: "Requests time out waiting for a database connection, yet the database CPU is at 10%. What is a likely cause?",
      answer: "Requests hold connections while doing slow non-database work, so the pool is exhausted",
      distractors: ["The database needs more CPU", "The pool is too small for the database's cores", "An index is missing"],
      why: "Pool exhaustion with an idle database means connections are checked out but not used. Release the connection before the slow call.",
    },
    {
      question: "You need to rename `customers.fullname` to `name` with zero downtime. What is the safe first step?",
      answer: "Add a new `name` column and have the code write both",
      distractors: ["Rename the column, then deploy the new code quickly", "Drop the old column at the same time", "Stop all app servers during the rename"],
      why: "Expand first, backfill, switch reads, then contract by dropping `fullname` once no running code uses it.",
    },
  ],
  pitfalls: [
    "Never looking at the SQL the ORM generates.",
    "Lazy loading inside a loop, or inside a template that renders a list.",
    "A connection pool far larger than the database can serve.",
    "Destructive migrations (drop, rename, type change) shipped in the same release as the code that stops using the old shape.",
  ],
  next: [
    { id: "sql-indexes", label: "SQL Indexes & Query Plans" },
    { id: "db-nosql-families", label: "NoSQL Families: Key-Value, Document, Wide-Column and Graph" },
  ],
};
