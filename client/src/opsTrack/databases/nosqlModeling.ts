import { type OpsLessonData } from "../types.ts";

export const dbNosqlModeling: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Relational modeling starts from the data: normalise it so each fact lives in one place, then write whatever queries you need, and joins put it back together. NoSQL modeling starts from the queries. You list the access patterns first (\"get an order with its items\", \"latest 50 messages in a chat\", \"all orders for a customer, newest first\") and shape the data so each one is a single, cheap read, even if that means storing the same fact in several places.",
      ],
    },
    {
      kind: "steps",
      title: "The process",
      steps: [
        "Write down every read and write the application does, with how often and how fast each must be.",
        "For each read, decide which record or partition answers it in one request.",
        "Choose keys: a partition key that spreads load evenly and that every query knows, and a sort key that orders items inside a partition the way the queries want.",
        "Decide what to embed and what to reference (below).",
        "Accept duplication where it serves a read, and decide how each copy is kept up to date (in the same write, with a transaction, or asynchronously from a change stream).",
        "Check the size limits: a MongoDB document is at most 16 MB, a DynamoDB item 400 KB, and Cassandra partitions should stay well under about 100 MB.",
      ],
    },
    {
      kind: "table",
      title: "Embed or reference?",
      head: ["Embed (nest inside the parent)", "Reference (store an id, fetch separately)"],
      rows: [
        ["the child is always read with the parent (an order's line items)", "the child is read on its own or by many parents (a product)"],
        ["the child belongs to one parent", "many-to-many relationships (students and courses)"],
        ["the list is bounded (a few addresses)", "the list grows without limit (every comment on a viral post)"],
        ["the child rarely changes, or a snapshot is wanted (the price at the time of the order)", "the child changes and every reader must see the new value (a user's display name)"],
      ],
      notes: ["Copying the customer's name into each order is fine when the order should show the name used at checkout. Copying a product's live stock level into every cart is not."],
    },
    {
      kind: "code",
      title: "Single-table design in DynamoDB",
      blocks: [
        {
          lang: "text",
          label: "items in one table, keyed by PK and SK",
          code: "PK              SK                         attributes\nCUSTOMER#7      PROFILE                    name=Emma Rossi, city=Austin\nCUSTOMER#7      ORDER#2025-03-15#ord_1042  status=shipped, total=105.00\nCUSTOMER#7      ORDER#2025-04-09#ord_1077  status=pending, total=45.00\nORDER#ord_1042  ITEM#LAMP-01               qty=2, price=30.00\nORDER#ord_1042  ITEM#STAND-02              qty=1, price=45.00",
        },
      ],
      notes: [
        "\"Customer 7 with their orders, newest first\" is one query: `PK = CUSTOMER#7`, sorted by SK descending. \"Order 1042 with its items\" is `PK = ORDER#ord_1042`. Putting the date at the front of the order's sort key makes \"orders since March\" a range condition on SK. A secondary index (a GSI) with a different key serves another access pattern, such as orders by status.",
      ],
    },
    {
      kind: "widget",
      widget: "partitionKey",
      title: "Try it: choose a partition key",
      intro: "A good partition key does two jobs: spreads writes across nodes, and keeps each query on one partition.",
    },
    {
      kind: "table",
      title: "Patterns you'll see",
      head: ["Pattern", "Use"],
      rows: [
        ["Bucketing (`chat_id + month`)", "cap a partition's size when one key could grow forever"],
        ["Write sharding (`counter#0` to `counter#9`)", "spread one very hot key over several partitions and add them up on read"],
        ["Materialised views / duplicate tables", "one table per query pattern, written together"],
        ["Change streams", "update copies, search indexes and caches asynchronously after a write"],
        ["Time to live (TTL)", "let the database delete old sessions, events or carts itself"],
      ],
    },
  ],
  quiz: [
    {
      question: "What do you design a DynamoDB or Cassandra table around?",
      answer: "The application's access patterns: the exact queries it must answer",
      distractors: ["Third normal form", "The entity-relationship diagram", "The number of columns per entity"],
      why: "Without joins, each query must be served by the key design. Normalising first leaves queries that need data from several tables.",
    },
    {
      question: "Each blog post can collect hundreds of thousands of comments. Should comments be embedded in the post document?",
      answer: "No; store them separately, keyed by post id, because the list is unbounded",
      distractors: ["Yes, embedding is always faster", "Yes, but only the first 1,000", "No, comments need a graph database"],
      why: "An unbounded array would hit the document size limit and make every post read and write huge.",
    },
    {
      question: "A product page reads the product's name, and every order line copies the name too. The product is renamed. What happens to existing orders?",
      answer: "They keep the old name unless you update every copy, which is often what you want for orders",
      distractors: ["The database updates them automatically", "The orders become invalid", "Reads fail until the copies match"],
      why: "Duplication is a deliberate choice. Decide per field whether copies are snapshots or must be kept in sync.",
    },
  ],
  pitfalls: [
    "Starting with the data model and discovering the queries later.",
    "A partition key with few values or a time-based one, creating hot partitions.",
    "Unbounded arrays inside documents.",
    "Duplicating data without a plan for keeping the copies current.",
  ],
  next: [
    { id: "sql-schema-design", label: "Schema Design: Keys, Constraints & Normalization" },
    { id: "sd-interview-key-value-store", label: "Design a Distributed Key-Value Store" },
  ],
};
