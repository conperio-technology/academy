import { type OpsLessonData } from "../types.ts";

export const dbSubqueriesCtes: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "A subquery is a query inside another query, in brackets. Anywhere SQL expects a value, a list or a table, you can put a SELECT that produces one. That lets you answer questions in steps: \"first work out the average salary, then find everyone above it\".",
        "A common table expression (CTE) is the same idea with a name. `WITH step AS (SELECT ...)` defines a temporary result you can use in the query that follows, as if it were a table. CTEs read top to bottom like a recipe, which makes long queries much easier to follow and to debug: run each step on its own.",
      ],
    },
    {
      kind: "table",
      title: "Where a subquery can go",
      head: ["Shape it returns", "Where it goes", "Example"],
      rows: [
        ["one value (scalar)", "anywhere a value fits: SELECT list, WHERE, comparisons", "`WHERE salary > (SELECT AVG(salary) FROM employees)`"],
        ["one column of values", "after IN / NOT IN", "`WHERE department_id IN (SELECT id FROM departments WHERE location = 'Remote')`"],
        ["whether any row exists", "EXISTS / NOT EXISTS", "`WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`"],
        ["a whole table (derived table)", "in FROM, with an alias", "`FROM (SELECT department_id, AVG(salary) AS avg_pay FROM employees GROUP BY department_id) a`"],
      ],
    },
    {
      kind: "sql",
      title: "Scalar subquery: above the company average",
      intro: "The inner query runs once and returns one number. Try replacing `AVG` with `MAX`, then think about why that returns no rows.",
      query: "SELECT name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees)\nORDER BY salary DESC;",
    },
    {
      kind: "sql",
      title: "Correlated subquery: above their own department's average",
      intro: "This inner query mentions `e.department_id` from the outer row, so it is evaluated per row: each employee is compared with the average of their own department.",
      query: "SELECT e.name, e.department_id, e.salary\nFROM employees e\nWHERE e.salary > (\n  SELECT AVG(e2.salary)\n  FROM employees e2\n  WHERE e2.department_id = e.department_id\n)\nORDER BY e.department_id, e.salary DESC;",
    },
    {
      kind: "sql",
      title: "The same question as a CTE",
      intro: "Step one computes each department's average once; step two joins to it. Highlight just the CTE's inner SELECT and run that on its own to see the intermediate table.",
      query: "WITH dept_avg AS (\n  SELECT department_id, AVG(salary) AS avg_salary\n  FROM employees\n  GROUP BY department_id\n)\nSELECT e.name, d.name AS department, e.salary, ROUND(a.avg_salary) AS dept_average\nFROM employees e\nJOIN dept_avg a ON a.department_id = e.department_id\nJOIN departments d ON d.id = e.department_id\nWHERE e.salary > a.avg_salary\nORDER BY department, e.salary DESC;",
    },
    {
      kind: "text",
      title: "Recursive CTEs: walking a hierarchy",
      paragraphs: [
        "`WITH RECURSIVE` lets a CTE refer to itself. It has two halves joined by UNION ALL: an anchor query that produces the starting rows, and a recursive query that produces the next rows from the previous ones. The database repeats the recursive half until it adds nothing new.",
        "That is how SQL walks trees and graphs stored as rows: an org chart (each employee has a `manager_id`), folders inside folders, a bill of materials, or a chain of replies. The block below uses the shop database, whose employees table has a `manager_id` column.",
      ],
    },
    {
      kind: "sql",
      title: "Everyone under Priya, with their depth",
      schema: "shop",
      intro: "The anchor picks Priya (depth 0). Each round finds the people whose manager was found in the round before. Change `id = 1` to `id = 5` to see Sofia's team.",
      query: "WITH RECURSIVE team AS (\n  SELECT id, name, manager_id, 0 AS depth\n  FROM employees\n  WHERE id = 1\n  UNION ALL\n  SELECT e.id, e.name, e.manager_id, t.depth + 1\n  FROM employees e\n  JOIN team t ON e.manager_id = t.id\n)\nSELECT name, depth\nFROM team\nORDER BY depth, name;",
    },
    {
      kind: "sql",
      title: "A recursive CTE as a number generator",
      schema: "shop",
      intro: "Recursion over nothing but a counter generates rows, which is handy for a calendar of days to join against so that days with no orders still show up with 0.",
      query: "WITH RECURSIVE days(d) AS (\n  SELECT '2025-03-01'\n  UNION ALL\n  SELECT date(d, '+1 day') FROM days WHERE d < '2025-03-07'\n)\nSELECT days.d AS day, COUNT(l.customer_id) AS logins\nFROM days\nLEFT JOIN logins l ON l.login_date = days.d\nGROUP BY days.d\nORDER BY days.d;",
    },
    {
      kind: "table",
      title: "Subquery, CTE or join?",
      head: ["Use", "When"],
      rows: [
        ["JOIN", "you need columns from both tables in the output"],
        ["EXISTS / NOT EXISTS", "you only need to know whether a related row exists (\"customers with no orders\"); it stops at the first match"],
        ["Scalar subquery", "you compare against one computed value"],
        ["CTE", "the query has several steps, or uses the same intermediate result twice, or you want it readable"],
        ["Recursive CTE", "the depth isn't known in advance: hierarchies, graphs, generated series"],
      ],
      notes: [
        "Modern optimizers often turn a subquery and the equivalent join into the same plan, so pick the clearest form first and check the query plan only if it is slow. Older MySQL versions and some correlated subqueries are exceptions: a correlated subquery the optimizer can't rewrite really does run once per outer row.",
      ],
    },
  ],
  quiz: [
    {
      question: "`SELECT name FROM customers WHERE id NOT IN (SELECT customer_id FROM orders)` returns no rows at all, although some customers have never ordered. What is the most likely cause?",
      answer: "Some order has a NULL customer_id, and NOT IN with a NULL in the list is never true",
      distractors: ["NOT IN only works on numbers", "The subquery must use DISTINCT", "NOT IN needs an index on customer_id"],
      why: "`x NOT IN (1, NULL)` means `x <> 1 AND x <> NULL`, and anything compared with NULL is unknown, so the whole test is never true. NOT EXISTS doesn't have this trap.",
    },
    {
      question: "What makes a subquery correlated?",
      answer: "It refers to a column of the outer query, so its result depends on the current outer row",
      distractors: ["It appears in the FROM clause", "It returns more than one column", "It uses GROUP BY"],
      why: "The reference to the outer row is what forces per-row evaluation. A subquery in FROM is a derived table, not a correlated one.",
    },
    {
      question: "A recursive CTE never stops. What is missing?",
      answer: "A condition in the recursive half that eventually produces no new rows",
      distractors: ["An ORDER BY in the anchor", "A primary key on the CTE", "The RECURSIVE keyword"],
      why: "Recursion ends when a round adds nothing. A cycle in the data (A manages B manages A) or a counter with no upper bound keeps it going; add a WHERE bound or track the visited path.",
    },
  ],
  pitfalls: [
    "NOT IN against a column that can be NULL. Use NOT EXISTS.",
    "Writing one enormous nested query. Split it into named CTE steps and run each step alone while you build it.",
    "Assuming a CTE is always computed once. Some databases inline it into the main query; PostgreSQL lets you force either with MATERIALIZED / NOT MATERIALIZED.",
    "A recursive CTE over data with cycles and no guard. Add a depth limit.",
  ],
  next: [
    { id: "db-nulls-case-sets", label: "NULL, CASE and Set Operations" },
    { id: "db-window-functions", label: "Window Functions: Rankings, Running Totals and LAG" },
  ],
};
