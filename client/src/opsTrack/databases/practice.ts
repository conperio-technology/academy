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

// The SQL Join Ladder: generated questions on a bigger database (src/sqlLadder.ts,
// src/sqlLadderData.ts).
const LADDER_TABLES: OpsPart = {
  kind: "table",
  title: "The ladder database",
  head: ["Table", "Columns", "Notes"],
  rows: [
    ["customers", "id, name, city, signup_date, referred_by", "30 customers in 8 cities; 5 never ordered; referred_by is another customer's id or NULL"],
    ["orders", "id, customer_id, employee_id, order_date, status", "90 orders, January to June 2025; employee_id is the sales rep, NULL for orders with no rep"],
    ["order_items", "order_id, product_id, quantity", "the lines of each order (200 lines)"],
    ["products", "id, name, category_id, supplier_id, price", "30 products; 5 have never been ordered"],
    ["categories", "id, name", "7 categories; Toys has no products yet"],
    ["suppliers", "id, name, country", "7 suppliers in 6 countries; Fjord Works has no products yet"],
    ["employees", "id, name, department_id, manager_id, salary, hire_date", "16 people; manager_id is NULL for department heads"],
    ["departments", "id, name", "5 departments; Finance has nobody in it"],
    ["reviews", "customer_id, product_id, rating", "60 reviews, ratings 2 to 5; some bought products have none"],
  ],
  notes: ["Revenue is always `quantity * price` summed over order lines. Dates are `YYYY-MM-DD` text, so `LIKE '2025-03%'` picks a month."],
};

export const sqlJoinLadder: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "The questions here are generated, not hand-written: each comes from a template filled in with values from the data (a city, a category, a month), and the reference query is built from the same values. A question is only used if its reference query returns rows, and when it teaches a trap (a missing DISTINCT, a filter in the wrong clause), only if the trap really gives a different answer on this data.",
        "There are eight rungs, from one table up to anti-joins and CTEs. Pass three different questions on a rung to clear it, then move up; you can jump to any rung at any time. Grading works like the other SQL practice lessons: column names don't matter, numbers are compared to two decimal places, and row order never matters here.",
      ],
    },
    LADDER_TABLES,
    {
      kind: "sql",
      title: "Look around first",
      schema: "ladder",
      query: "SELECT o.id, c.name AS customer, e.name AS rep, o.order_date, o.status\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nLEFT JOIN employees e ON e.id = o.employee_id\nORDER BY o.order_date\nLIMIT 15;",
    },
    { kind: "joinLadder", title: "The ladder" },
  ],
  quiz: [],
  pitfalls: [
    "Joining through a bridge table (order_items, reviews) and forgetting it multiplies rows: use DISTINCT for lists and COUNT(DISTINCT ...) for counts.",
    "Putting a condition on the right-hand table of a LEFT JOIN in WHERE. It removes the unmatched rows and turns the outer join into an inner one; put it in ON.",
    "COUNT(*) after a LEFT JOIN counts the row of NULLs as 1. Count a column from the right-hand table instead.",
  ],
  next: [
    { id: "sql-practice-joins", label: "SQL Practice: Filtering and Joins" },
    { id: "sql-joins", label: "SQL Joins: Combining Tables" },
  ],
};
