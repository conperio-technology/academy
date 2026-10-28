import { src, type OpsLessonData } from "../types.ts";

export const analytics: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "The database behind an application is built for many small, fast reads and writes: place this order, update that address. Questions such as \"revenue by region and month for the last three years\" are a different workload: they scan huge amounts of history, often from several systems at once. Running them on the production database slows the application down, and the data they need is spread across systems anyway.",
        "So companies copy data into separate analytical systems. This lesson explains the vocabulary you'll meet around them: OLTP and OLAP, data warehouses and lakes, star schemas, ETL and ELT, and batch versus stream processing.",
      ],
    },
    {
      kind: "table",
      title: "OLTP and OLAP",
      head: ["", "OLTP (transactional)", "OLAP (analytical)"],
      rows: [
        ["Serves", "the application and its users", "analysts, dashboards, reports, data science"],
        ["Typical query", "read or change a few rows by key", "scan and aggregate millions or billions of rows"],
        ["Data", "current state, normalized", "history from many sources, often denormalized"],
        ["Storage layout", "row-oriented: a whole row together", "column-oriented: each column together, compressed"],
        ["Examples", "PostgreSQL, SQL Server, MySQL", "Snowflake, BigQuery, Redshift, Azure Synapse, ClickHouse, DuckDB"],
      ],
      notes: ["Columnar storage is why warehouses are fast at analytics: a query summing one column reads only that column's data, compressed, instead of every column of every row."],
    },
    {
      kind: "terms",
      title: "Where analytical data lives",
      terms: [
        { term: "Data warehouse", meaning: "a database built for analysis: cleaned, structured data from many sources, modelled for querying with SQL. The trusted source for reports." },
        { term: "Data lake", meaning: "cheap object storage (S3, Azure Data Lake Storage) holding raw files of any kind: CSV and JSON exports, logs, Parquet files, images. Flexible, but without discipline it becomes a swamp nobody can find anything in." },
        { term: "Lakehouse", meaning: "a lake with table formats (Delta Lake, Apache Iceberg) that add transactions, schemas and fast queries on top of the files, so one copy serves both roles. Databricks and Microsoft Fabric work this way." },
        { term: "Parquet", meaning: "the standard columnar file format for analytical data: compressed, typed, and readable by almost every tool." },
        { term: "Data mart", meaning: "a smaller, subject-specific slice of the warehouse, such as sales or finance, shaped for one group's reports." },
      ],
    },
    {
      kind: "text",
      title: "Star schemas: facts and dimensions",
      paragraphs: [
        "Warehouses are usually modelled as star schemas. A fact table holds one row per event you measure, such as a sale line, with numeric measures (quantity, amount) and keys to dimension tables. Dimension tables describe the context: which date, which product, which store, which customer, with readable attributes such as month, category and region. Drawn out, the fact table sits in the middle with dimensions around it like the points of a star.",
        "Unlike an application schema, a star schema is deliberately denormalized: the product dimension repeats the category name on every product rather than pointing at a category table. That makes queries simple (join the fact table to a few dimensions, then group by their attributes) and fast in a columnar engine. A dimension that keeps history, such as a customer's region changing, is a slowly changing dimension; the usual approach (type 2) adds a new row with valid-from and valid-to dates instead of overwriting.",
      ],
    },
    {
      kind: "code",
      title: "A typical star schema query",
      blocks: [
        {
          lang: "sql",
          label: "warehouse query",
          code: src`
-- Revenue per month and category for 2026, from the sales fact table and two dimensions
SELECT d.year_month,
       p.category,
       SUM(f.amount)   AS revenue,
       SUM(f.quantity) AS units
FROM fact_sales AS f
JOIN dim_date    AS d ON d.date_key = f.date_key
JOIN dim_product AS p ON p.product_key = f.product_key
WHERE d.year = 2026
GROUP BY d.year_month, p.category
ORDER BY d.year_month, revenue DESC;`,
        },
      ],
      notes: ["Every star schema query looks like this: filter and group by dimension attributes, aggregate the fact's measures. BI tools such as Power BI, Tableau and Looker generate queries of this shape when you drag fields onto a chart."],
    },
    {
      kind: "table",
      title: "Moving the data: ETL and ELT",
      head: ["", "ETL", "ELT"],
      rows: [
        ["Order", "extract, transform on a separate server, load the result", "extract, load raw data into the warehouse, transform there with SQL"],
        ["Grew up with", "on-premises warehouses where compute was scarce", "cloud warehouses that scale compute on demand"],
        ["Tools", "SSIS, Informatica, Azure Data Factory", "Fivetran or Airbyte to load, dbt to transform in SQL"],
        ["Raw data kept?", "often not", "yes, so transformations can be rerun and fixed"],
      ],
      notes: ["Modern teams mostly do ELT: the raw copy is a safety net, and transformations live as versioned, tested SQL (dbt models) that rebuild the clean tables."],
    },
    {
      kind: "table",
      title: "Batch and stream processing",
      head: ["", "Batch", "Stream"],
      rows: [
        ["Processes", "a bounded chunk of data on a schedule, such as last night's orders", "each event continuously as it arrives"],
        ["Latency", "minutes to hours", "milliseconds to seconds"],
        ["Tools", "SQL in the warehouse, Apache Spark, scheduled with Airflow or Dagster", "Kafka Streams, Apache Flink, Spark Structured Streaming, cloud stream services"],
        ["Good for", "reports, billing, model training, anything that can wait", "fraud detection, live dashboards, alerts, keeping caches and search in sync"],
        ["Harder parts", "late-arriving data, reruns", "out-of-order events, windows, exactly-once results, state"],
      ],
      notes: ["Change data capture (CDC, for example Debezium reading the database's write-ahead log) streams every insert, update and delete from the application database without touching the application, and is a common way to feed both a warehouse and streaming consumers."],
    },
  ],
  quiz: [
    {
      question: "Why do analytical databases store data by column?",
      answer: "Queries that aggregate a few columns read only those columns, and columns compress well",
      distractors: ["It makes single-row updates faster", "It removes the need for indexes on keys", "Columns can be stored on different servers"],
      why: "An aggregate over one column of a billion rows reads a small, compressed slice of the data instead of every row in full.",
    },
    {
      question: "In a star schema, what goes in the fact table?",
      answer: "One row per measured event, with numeric measures and keys to dimensions",
      distractors: ["Descriptive attributes such as product names and regions", "Only the current state of each customer", "Pre-built reports"],
      why: "Facts are what you measure (sales, clicks, readings). Dimensions describe the who, what, where and when around each fact.",
    },
    {
      question: "What is the main difference between ETL and ELT?",
      answer: "ELT loads raw data first and transforms it inside the warehouse",
      distractors: ["ELT skips the transformation step", "ETL only works with streaming data", "ELT can't use SQL"],
      why: "Cloud warehouses have plenty of compute, so transforming after loading is simpler and keeps the raw data for reprocessing.",
    },
    {
      question: "A bank wants to flag suspicious card payments within a second. Batch or stream?",
      answer: "Stream processing",
      distractors: ["A nightly batch job", "A weekly report", "An OLAP cube rebuilt every hour"],
      why: "Fraud must be caught while the payment is happening, so each event is processed as it arrives.",
    },
  ],
  pitfalls: [
    "Running heavy reports against the production application database.",
    "A data lake with no catalogue, owners or formats: the data swamp.",
    "Overwriting dimension attributes such as a customer's region, so last year's reports change when someone moves.",
    "Building streaming pipelines for numbers that people look at once a day.",
    "Copying personal data into analytics systems without the same access controls and retention rules as the source.",
  ],
  next: [
    { id: "db-intro", label: "Databases: What They Do and Which Kind to Use" },
    { id: "db-window-functions", label: "Window Functions: Rankings, Running Totals and LAG" },
    { id: "sd-async-systems", label: "Distributed Async Systems: Streams, Outbox and Sagas" },
  ],
};
