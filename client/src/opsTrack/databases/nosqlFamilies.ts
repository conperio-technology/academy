import { type OpsLessonData } from "../types.ts";

export const dbNosqlFamilies: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "NoSQL databases grew out of problems relational databases handled badly in the 2000s: spreading one dataset over hundreds of machines, accepting enormous write rates, staying available when machines and links fail, and storing data whose shape changes often. Each family solves some of those by giving something up, usually joins, multi-row transactions, or immediate consistency.",
        "The lines have blurred since. PostgreSQL stores and indexes JSON documents, and MongoDB and DynamoDB offer multi-document transactions. The useful skill is knowing what each family is shaped for, so you can pick deliberately.",
      ],
    },
    {
      kind: "code",
      title: "Key-value: Redis",
      blocks: [
        {
          lang: "text",
          label: "redis-cli",
          code: "SET session:9f2c '{\"userId\": 42}' EX 1800   # expires in 30 minutes\nGET session:9f2c\nINCR page:home:views                       # atomic counter\nZADD leaderboard 3100 \"ava\" 2900 \"ben\"      # sorted set\nZREVRANGE leaderboard 0 9 WITHSCORES        # top 10",
        },
      ],
      notes: [
        "A key-value store only knows how to find a value by its exact key, and does that in well under a millisecond. Redis keeps everything in memory and adds data structures (lists, sets, sorted sets, hashes, streams), which makes it the usual choice for caches, sessions, rate-limit counters, leaderboards and queues. DynamoDB is a durable, managed key-value and document store that scales to any size if you design the keys well.",
      ],
    },
    {
      kind: "code",
      title: "Document: MongoDB",
      blocks: [
        {
          lang: "json",
          label: "one order document",
          code: "{\n  \"_id\": \"ord_1042\",\n  \"customer\": { \"id\": 7, \"name\": \"Emma Rossi\" },\n  \"status\": \"shipped\",\n  \"items\": [\n    { \"sku\": \"LAMP-01\", \"qty\": 2, \"price\": 30.0 },\n    { \"sku\": \"STAND-02\", \"qty\": 1, \"price\": 45.0 }\n  ],\n  \"placedAt\": \"2025-03-15T10:22:00Z\"\n}",
        },
        {
          lang: "text",
          label: "mongosh",
          code: "db.orders.find({ status: \"shipped\", \"items.sku\": \"LAMP-01\" })\ndb.orders.createIndex({ \"customer.id\": 1, placedAt: -1 })",
        },
      ],
      notes: [
        "A document holds everything about one thing, nested, so the common read (show this order) is one fetch with no joins. Documents in one collection can have different fields, which helps when the shape varies (product types with different attributes) and hurts when nobody enforces a shape at all. You can index nested fields and query them, but joining across collections is limited and slower than in SQL.",
      ],
    },
    {
      kind: "code",
      title: "Wide-column: Cassandra",
      blocks: [
        {
          lang: "sql",
          label: "CQL",
          code: "CREATE TABLE messages_by_chat (\n  chat_id    uuid,\n  sent_at    timeuuid,\n  sender_id  uuid,\n  body       text,\n  PRIMARY KEY ((chat_id), sent_at)\n) WITH CLUSTERING ORDER BY (sent_at DESC);\n\nSELECT * FROM messages_by_chat WHERE chat_id = ? LIMIT 50;",
        },
      ],
      notes: [
        "It looks like SQL, but the primary key decides everything. The partition key (`chat_id`) picks which machines store the row; the clustering key (`sent_at`) sorts rows inside the partition. Queries must name the partition key, there are no joins, and you design one table per query, duplicating data on purpose. In return you get near-linear scaling of writes across many nodes, and every node can accept writes even during a network partition.",
      ],
    },
    {
      kind: "code",
      title: "Graph: Neo4j",
      blocks: [
        {
          lang: "text",
          label: "Cypher",
          code: "MATCH (me:Person {name: 'Ava'})-[:FRIEND]->(f)-[:FRIEND]->(fof)\nWHERE NOT (me)-[:FRIEND]->(fof) AND fof <> me\nRETURN fof.name, count(f) AS mutual\nORDER BY mutual DESC LIMIT 10;",
        },
      ],
      notes: [
        "Relationships are stored as first-class links, so following them is a pointer hop instead of an index lookup per join. That makes many-hop questions (friends of friends, shortest path, fraud rings, network dependencies) fast and natural to write. Graph databases are a poor fit for bulk aggregates over everything.",
      ],
    },
    {
      kind: "table",
      title: "Choosing",
      head: ["You need", "Reach for"],
      rows: [
        ["related data, ad hoc queries, transactions, constraints", "a relational database (the default)"],
        ["sub-millisecond lookups by key, counters, caching, expiry", "Redis or another key-value store"],
        ["self-contained records read and written whole, with varying shape", "a document database, or JSON columns in PostgreSQL"],
        ["massive write volume with a few known query patterns, multi-region", "a wide-column store (Cassandra, ScyllaDB) or DynamoDB"],
        ["queries that follow relationships many hops deep", "a graph database"],
        ["metrics over time", "a time-series database"],
        ["free-text search with ranking", "Elasticsearch or OpenSearch, fed from the main database"],
      ],
      notes: ["Large systems use several at once (polyglot persistence): the relational database is the source of truth, and caches, search indexes and analytics stores are copies kept in sync with change data capture or events."],
    },
    {
      kind: "text",
      title: "BASE, and what consistency NoSQL offers",
      paragraphs: [
        "Distributed NoSQL stores are often described as BASE: basically available, soft state, eventually consistent. Replicas accept writes and catch up with each other later, so a read may briefly return old data. Many let you choose per request: Cassandra's consistency levels (ONE, QUORUM, ALL) and DynamoDB's strongly consistent reads trade latency for freshness. With N replicas, writing to W and reading from R where R + W > N guarantees the read sees the latest write. The CAP and Consistency lesson in System Design covers the theory.",
      ],
    },
  ],
  quiz: [
    {
      question: "Which is the best fit for storing login sessions that expire after 30 minutes of inactivity?",
      answer: "A key-value store such as Redis, with an expiry on each key",
      distractors: ["A graph database", "A wide-column store with one table per query", "A data warehouse"],
      why: "Sessions are looked up by an exact key and expire; Redis does both natively.",
    },
    {
      question: "In Cassandra, why must almost every query include the partition key?",
      answer: "The partition key decides which nodes hold the data; without it the query would have to ask every node",
      distractors: ["It is the only column that can be indexed", "Cassandra has no WHERE clause otherwise", "It is required for transactions"],
      why: "Design tables around the queries so each one hits one partition. Scanning every node is slow and usually refused.",
    },
    {
      question: "With 3 replicas, a write waits for 2 acknowledgements and a read asks 2 replicas. Will the read see the latest write?",
      answer: "Yes, because 2 + 2 > 3, so the read and write sets overlap",
      distractors: ["No, only reading all 3 guarantees it", "Only if the clocks are synchronised", "Only with a graph database"],
      why: "Quorum reads and writes overlap in at least one replica that has the newest value.",
    },
  ],
  pitfalls: [
    "Choosing NoSQL for scale you don't have yet, and then needing joins and transactions you gave up.",
    "Schemaless meaning \"no schema anywhere\". The schema then lives, undocumented, in every piece of code that reads the data.",
    "Using a cache as the only copy of important data.",
    "Designing Cassandra or DynamoDB tables like normalised SQL tables.",
  ],
  next: [
    { id: "db-nosql-modeling", label: "NoSQL Data Modeling: Access Patterns, Embedding and Partition Keys" },
    { id: "sd-replication-sharding", label: "Replication and Sharding" },
  ],
};
