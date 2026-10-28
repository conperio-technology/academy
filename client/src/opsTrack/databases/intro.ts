import { type OpsLessonData } from "../types.ts";

export const dbIntro: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "A database is a program that keeps data safe on disk and lets many programs read and change it at the same time. You could keep orders in a CSV file, but the first time two people save at once, the power fails halfway through a write, or someone asks \"which customers in Austin spent over 500 last quarter?\", the file stops being enough.",
        "Every serious database gives you the same handful of things: durability (once it says \"saved\", a crash won't lose it), concurrency control (two writers don't corrupt each other), a query language or API so you ask for what you want instead of scanning files yourself, constraints that reject bad data, and indexes that find a row among millions without reading them all.",
      ],
    },
    {
      kind: "table",
      title: "The main families",
      head: ["Family", "Data looks like", "Good at", "Examples"],
      rows: [
        ["Relational (SQL)", "tables of rows and columns, linked by keys", "anything with relationships and rules: orders, accounts, inventory; ad hoc questions with joins; transactions", "PostgreSQL, SQL Server, MySQL, SQLite, Oracle"],
        ["Key-value", "a key and an opaque value", "very fast lookups by key: sessions, caches, feature flags, counters", "Redis, DynamoDB (also document), etcd"],
        ["Document", "JSON-like documents, each with its own shape", "records read and written as a whole: a product with its variants, a user profile", "MongoDB, Cosmos DB, Firestore, Couchbase"],
        ["Wide-column", "rows keyed by a partition key, each with many columns, spread over many machines", "huge write volumes with known queries: event logs, messages, IoT readings", "Cassandra, ScyllaDB, Bigtable, HBase"],
        ["Graph", "nodes and the relationships between them", "questions about connections: friends of friends, fraud rings, dependency chains", "Neo4j, Amazon Neptune"],
        ["Time-series", "timestamped measurements", "metrics and sensor data: fast appends, downsampling, time-window queries", "InfluxDB, TimescaleDB, Prometheus"],
        ["Search", "an inverted index over text", "full-text search with relevance ranking, filters and facets", "Elasticsearch, OpenSearch"],
        ["Vector", "embeddings (lists of numbers)", "finding the most similar items, for semantic search and RAG", "pgvector, Pinecone, Qdrant"],
      ],
      notes: [
        "\"NoSQL\" just means \"not only relational\": the key-value, document, wide-column and graph families. They usually give up joins or some transaction guarantees in exchange for easier horizontal scaling or a data model that fits one job very well. The NoSQL lessons later in this section cover when that trade is worth it.",
      ],
    },
    {
      kind: "text",
      title: "Two jobs: running the business and analysing it",
      paragraphs: [
        "OLTP (online transaction processing) is the database behind an app: many small reads and writes per second, each touching a few rows (\"add this item to order 42\"). It is tuned for fast, correct, concurrent changes, which is what relational databases were built for.",
        "OLAP (online analytical processing) answers big questions over a lot of history (\"revenue by region by month for three years\"). It reads millions of rows but only a few columns, so analytical databases store data by column and compress it heavily. Companies copy data from the OLTP databases into a separate data warehouse for this, so heavy reports never slow down the app.",
      ],
    },
    {
      kind: "sql",
      title: "Try it: a real database in your browser",
      intro: "This is SQLite running in the page, loaded with a small employees and departments database. Run the query, then change `Engineering` to `Sales`. The next lessons build up SQL from here.",
      query: "SELECT e.name, e.salary\nFROM employees e\nJOIN departments d ON d.id = e.department_id\nWHERE d.name = 'Engineering'\nORDER BY e.salary DESC;",
    },
    {
      kind: "terms",
      title: "Words used in every lesson in this section",
      terms: [
        { term: "Table, row, column", meaning: "a table holds one kind of thing (customers); each row is one of them; each column is one fact about it (email)." },
        { term: "Schema", meaning: "the declared shape of the data: tables, columns, their types and the rules between them." },
        { term: "Primary key", meaning: "the column (or columns) that uniquely identifies each row, such as `id`." },
        { term: "Foreign key", meaning: "a column that holds another table's primary key, such as `orders.customer_id`, and that the database can check really points somewhere." },
        { term: "Query", meaning: "a request for data, written in SQL for a relational database." },
        { term: "Index", meaning: "an extra structure, usually a B-tree, that lets the database find rows by a column without reading the whole table." },
        { term: "Transaction", meaning: "a group of changes that either all happen or none do." },
      ],
    },
  ],
  quiz: [
    {
      question: "A shop app saves orders, payments and stock levels, and an order must never be saved without its payment. Which family fits best?",
      answer: "Relational, because the data is related and the changes must happen together in a transaction",
      distractors: ["Key-value, because it is the fastest", "Search, because shoppers search for products", "Time-series, because orders have timestamps"],
      why: "Related records with rules and all-or-nothing changes are exactly what relational databases do best. A search index or cache might sit beside it, but the source of truth stays relational.",
    },
    {
      question: "The finance team runs a three-year revenue report every morning and the app slows down while it runs. What is the usual fix?",
      answer: "Copy the data into a separate analytical warehouse and run the report there",
      distractors: ["Add more columns to the orders table", "Move the app to a document database", "Run the report on the app's database at night only"],
      why: "OLTP and OLAP want different storage layouts and compete for the same machine. Separating them keeps the app fast and makes the report faster too.",
    },
    {
      question: "Which question is a graph database built for?",
      answer: "Which accounts are within three transfers of this known fraudster?",
      distractors: ["What is the total revenue per month?", "What is user 42's session data?", "Which products mention \"waterproof\"?"],
      why: "Following chains of relationships many hops deep is slow with repeated joins and natural in a graph database.",
    },
  ],
  pitfalls: [
    "Picking a database because it is fashionable. Start with a relational database unless you can name the specific problem another family solves for you.",
    "Running analytics on the production database. It works until the data grows, then it hurts every user at once.",
    "Treating a cache like Redis as the source of truth without turning on persistence and understanding what it loses on a crash.",
  ],
  next: [
    { id: "sql-basics", label: "SQL Basics: SELECT, WHERE, ORDER BY, LIMIT" },
    { id: "db-nosql-families", label: "NoSQL Families: Key-Value, Document, Wide-Column and Graph" },
  ],
};
