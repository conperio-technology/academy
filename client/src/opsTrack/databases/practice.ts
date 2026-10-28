import { type OpsLessonData, type OpsPart } from "../types.ts";

// The three SQL practice lessons. Problems and the shop database are in src/sqlPracticeData.ts.

const SHOP_TABLES: OpsPart = {
  kind: "table",
  title: "The shop database",
  head: ["Table", "Columns", "Notes"],
  rows: [
    ["customers", "id, name, email, city, signup_date", "8 customers; two share an email; three have never ordered"],
    ["orders", "id, customer_id, order_date, status", "10 orders; status is shipped, pending or cancelled"],
    ["order_items", "order_id, product_id, quantity", "the lines of each order"],
    ["products", "id, name, category, price", "7 products; one has never been ordered"],
    ["employees", "id, name, department_id, manager_id, salary", "10 people; manager_id is NULL for department heads; two salaries tie"],
    ["departments", "id, name", "Engineering, Sales, Support"],
    ["logins", "customer_id, login_date", "daily logins in March 2025, with gaps"],
  ],
  notes: ["Dates are text in `YYYY-MM-DD` form (SQLite has no date type), so they sort and compare correctly as strings. Explore freely in the editor below before you start."],
};

const EXPLORE: OpsPart = {
  kind: "sql",
  title: "Look around first",
  schema: "shop",
  query: "SELECT o.id, c.name, o.order_date, o.status\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nORDER BY o.order_date;",
};

const HOW: OpsPart = {
  kind: "text",
  paragraphs: [
    "Each problem is graded: write a query, press Run and check, and it is compared with a reference answer on a fresh copy of the database. Column names don't matter, only the values; numbers are compared to two decimal places; row order only matters when the problem says so. Solve every problem in the set and the lesson is marked done.",
    "This is SQLite. Interview questions are usually asked in PostgreSQL, MySQL or SQL Server terms, and the queries here use standard SQL except for date functions (`strftime`, `julianday`), which each problem points out.",
  ],
};

export const sqlPracticeJoins: OpsLessonData = {
  parts: [HOW, SHOP_TABLES, EXPLORE, { kind: "sqlPractice", title: "Problems: filtering and joins", set: "joins" }],
  quiz: [],
  pitfalls: [
    "Using an inner join for \"which X have no Y\". Inner joins only return matches; use LEFT JOIN ... IS NULL or NOT EXISTS.",
    "Leaving out ORDER BY when the order matters. Without it the order is whatever the database happens to produce.",
  ],
  next: [
    { id: "sql-practice-aggregation", label: "SQL Practice: Grouping and Aggregates" },
    { id: "sql-joins", label: "SQL Joins: Combining Tables" },
  ],
};

export const sqlPracticeAggregation: OpsLessonData = {
  parts: [HOW, SHOP_TABLES, EXPLORE, { kind: "sqlPractice", title: "Problems: grouping and aggregates", set: "aggregation" }],
  quiz: [],
  pitfalls: [
    "Filtering on an aggregate in WHERE. Conditions on COUNT, SUM and friends go in HAVING.",
    "Selecting a column that is neither grouped nor aggregated. SQLite allows it and picks an arbitrary row's value; PostgreSQL and SQL Server refuse.",
  ],
  next: [
    { id: "sql-practice-windows", label: "SQL Practice: Window Functions and CTEs" },
    { id: "sql-aggregation", label: "SQL Aggregation: GROUP BY, COUNT, SUM, AVG" },
  ],
};

export const sqlPracticeWindows: OpsLessonData = {
  parts: [HOW, SHOP_TABLES, EXPLORE, { kind: "sqlPractice", title: "Problems: window functions and CTEs", set: "windows" }],
  quiz: [],
  pitfalls: [
    "Filtering on a window function in WHERE. Compute it in a CTE, filter outside.",
    "ROW_NUMBER when ties should count. Say out loud which ranking you picked and why.",
  ],
  next: [
    { id: "db-window-functions", label: "Window Functions: Rankings, Running Totals and LAG" },
    { id: "db-isolation-anomalies", label: "Isolation Levels and Anomalies" },
  ],
};
