import { type OpsLessonData } from "../types.ts";

export const dbStorage: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Under the SQL, a database is a program that keeps data in files and tries very hard to touch the disk as little as possible. Knowing roughly how it does that explains why indexes help, why some databases are better at writes and others at reads, and how a database survives a crash halfway through a write.",
      ],
    },
    {
      kind: "terms",
      title: "The parts",
      terms: [
        { term: "Page", meaning: "the unit the database reads and writes, usually 8 KB (PostgreSQL, SQL Server) or 16 KB (MySQL). A table is a file of pages, each holding several rows." },
        { term: "Buffer pool", meaning: "a large cache of pages in memory. A query that finds its pages here never touches the disk; a busy database aims to keep its working set in it." },
        { term: "Write-ahead log (WAL)", meaning: "an append-only file where every change is recorded before the data pages are changed. Appending is fast and sequential, so a commit only has to wait for the log to reach disk." },
        { term: "Checkpoint", meaning: "a moment where changed pages in memory are written out to the data files, so the log before it is no longer needed for recovery." },
        { term: "Recovery", meaning: "after a crash, the database replays the log from the last checkpoint: committed changes are redone, uncommitted ones undone." },
      ],
    },
    {
      kind: "text",
      title: "B-trees: the read-optimised default",
      paragraphs: [
        "Almost every relational index, and the table itself in SQL Server's clustered indexes and MySQL InnoDB, is a B+ tree: a short, wide tree of pages. Each inner page holds hundreds of keys pointing to child pages, so even a billion rows is only 4 or 5 levels deep, and finding a key costs 4 or 5 page reads, most of them already in the buffer pool. Leaf pages are linked in key order, which makes range scans (`WHERE date BETWEEN ...`) and ORDER BY cheap.",
        "Writes update pages in place. Inserting into a full page splits it in two, and each changed page is written twice: once to the WAL, later at a checkpoint. Random inserts (such as random UUID keys) scatter writes across many pages; ever-increasing keys append to the right edge.",
      ],
    },
    {
      kind: "text",
      title: "LSM trees: the write-optimised alternative",
      paragraphs: [
        "A log-structured merge tree never updates in place. Writes go to the WAL and to a sorted in-memory table (the memtable). When it fills, it is written to disk in one sequential pass as an immutable sorted file (an SSTable). Background compaction later merges files, keeping the newest version of each key and dropping deleted ones.",
        "Writes are very fast because the disk only sees sequential appends. Reads may have to check the memtable and several files, so LSM engines keep a Bloom filter per file to skip the ones that can't contain the key. Cassandra, ScyllaDB, RocksDB, LevelDB, HBase and Bigtable are LSM-based; so are many time-series and key-value stores.",
      ],
    },
    {
      kind: "widget",
      widget: "lsmTree",
      title: "Try it: an LSM tree",
      intro: "Put and delete keys until the memtable flushes, write some keys again so several files hold versions of them, then Get a key and watch how many places the read checks. Compact merges the files.",
    },
    {
      kind: "table",
      title: "B-tree or LSM?",
      head: ["", "B-tree", "LSM tree"],
      rows: [
        ["Writes", "in place; random page writes", "sequential appends; very high throughput"],
        ["Reads", "one path down the tree", "memtable plus several files; Bloom filters help"],
        ["Range scans", "excellent (linked leaves)", "good, merging several sorted files"],
        ["Space", "pages are partly empty after splits", "old versions take space until compaction"],
        ["Hidden cost", "page splits, fragmentation", "compaction uses disk bandwidth in the background (write amplification)"],
        ["Typical", "PostgreSQL, SQL Server, MySQL, Oracle, SQLite", "Cassandra, RocksDB, HBase, ScyllaDB"],
      ],
    },
    {
      kind: "text",
      title: "Row store or column store?",
      paragraphs: [
        "OLTP databases store each row's columns together, so reading or writing one whole order is one page. Analytical databases (Snowflake, BigQuery, Redshift, ClickHouse, DuckDB, and Parquet files) store each column together instead. A query that sums one column over 100 million rows then reads only that column, and a column of similar values compresses extremely well. The price is that writing or reading one whole row touches every column file.",
      ],
    },
  ],
  quiz: [
    {
      question: "Why can a database acknowledge a commit before the changed data pages are on disk?",
      answer: "The change is already in the write-ahead log, which recovery replays after a crash",
      distractors: ["Commits are only durable after a checkpoint", "The buffer pool is battery-backed", "It can't; that would lose data"],
      why: "Write-ahead logging is the trick behind durability: the sequential log write is the only one a commit waits for.",
    },
    {
      question: "A service ingests 200,000 sensor readings per second and mostly reads recent data by device. Which storage engine shape suits it?",
      answer: "An LSM tree, because it turns writes into sequential appends",
      distractors: ["A B-tree, because reads are faster", "A column store, because it compresses well", "Neither; use an in-memory cache only"],
      why: "Write-heavy, append-mostly workloads are what LSM engines are built for. Cassandra or a time-series database would be typical.",
    },
    {
      question: "About how many page reads does finding one key in a B+ tree index on a billion rows take?",
      answer: "4 or 5",
      distractors: ["About 30, one per halving", "About 1,000", "1, always"],
      why: "Each page holds hundreds of keys, so the tree's fan-out is huge and its height tiny. The top levels are almost always cached too.",
    },
  ],
  pitfalls: [
    "Random UUIDs as a clustered primary key in SQL Server or MySQL: inserts land on random pages and split them. Prefer sequential keys, or time-ordered UUIDs (UUIDv7).",
    "Turning off fsync or synchronous commit for speed and forgetting that a crash can then lose recent commits.",
    "Expecting an LSM store to read as cheaply as it writes. Point reads and compaction need tuning.",
  ],
  next: [
    { id: "sql-indexes", label: "SQL Indexes & Query Plans" },
    { id: "db-nosql-families", label: "NoSQL Families: Key-Value, Document, Wide-Column and Graph" },
  ],
};
