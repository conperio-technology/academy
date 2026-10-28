import { type OpsLessonData } from "../types.ts";

export const dbWindowFunctions: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "GROUP BY collapses rows: ten employees in three departments become three rows. A window function computes over a group of rows too, but keeps every row and puts the result beside it. That is how you answer \"rank each employee within their department\", \"running total by day\" or \"change since last month\" without self joins.",
        "The shape is always `function() OVER (PARTITION BY ... ORDER BY ... frame)`. PARTITION BY splits the rows into groups (leave it out for one group of everything), ORDER BY sets the order inside each group, and the optional frame says which neighbouring rows a running calculation can see.",
      ],
    },
    {
      kind: "sql",
      title: "Ranking within a group",
      schema: "shop",
      intro: "Support has a tie at 64000. Look at how the three ranking functions treat it, then change the PARTITION BY to rank across the whole company.",
      query: "SELECT department_id, name, salary,\n       ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS row_num,\n       RANK()       OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk,\n       DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dense\nFROM employees\nORDER BY department_id, salary DESC;",
    },
    {
      kind: "table",
      title: "The window functions you will use",
      head: ["Function", "Gives", "Typical question"],
      rows: [
        ["ROW_NUMBER()", "1, 2, 3, ... with ties broken arbitrarily", "latest order per customer, de-duplicate rows"],
        ["RANK()", "1, 2, 2, 4: ties share a rank, then a gap", "competition-style ranking"],
        ["DENSE_RANK()", "1, 2, 2, 3: ties share, no gap", "top N distinct values per group"],
        ["NTILE(n)", "splits rows into n roughly equal buckets", "quartiles, deciles"],
        ["LAG(x, k) / LEAD(x, k)", "x from k rows before / after", "change since last period, time between events"],
        ["FIRST_VALUE / LAST_VALUE", "x from the frame's first / last row", "compare each row with the group's best"],
        ["SUM, AVG, COUNT, MIN, MAX with OVER", "the aggregate over the partition or frame", "running totals, moving averages, share of total"],
      ],
    },
    {
      kind: "sql",
      title: "Running totals and LAG",
      intro: "The running payroll grows as people are hired. `days_since_prev` uses LAG to read the previous row's hire date.",
      query: "SELECT name, hire_date, salary,\n       SUM(salary) OVER (ORDER BY hire_date) AS running_payroll,\n       julianday(hire_date) - julianday(LAG(hire_date) OVER (ORDER BY hire_date)) AS days_since_prev\nFROM employees\nORDER BY hire_date;",
    },
    {
      kind: "sql",
      title: "Share of the department and a moving average",
      intro: "`SUM(salary) OVER (PARTITION BY department_id)` with no ORDER BY gives the whole department's total on every row. The moving average uses an explicit frame of the current row and the two before it.",
      query: "SELECT name, department_id, salary,\n       ROUND(100.0 * salary / SUM(salary) OVER (PARTITION BY department_id), 1) AS pct_of_dept,\n       ROUND(AVG(salary) OVER (ORDER BY hire_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)) AS moving_avg_3\nFROM employees\nORDER BY hire_date;",
    },
    {
      kind: "text",
      title: "Frames, and the one gotcha",
      paragraphs: [
        "When a window has ORDER BY but no frame, the default frame is `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`: everything from the start up to the current row and every row tied with it. With ties in the ORDER BY, all tied rows get the same running total. Write `ROWS BETWEEN ...` to count physical rows instead, or make the ORDER BY unique.",
        "LAST_VALUE trips people up for the same reason: with the default frame, the last row of the frame is the current row. Use `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` to see the whole partition.",
      ],
    },
    {
      kind: "text",
      title: "Filtering on a window result",
      paragraphs: [
        "Window functions are computed after WHERE, GROUP BY and HAVING, just before ORDER BY. So `WHERE ROW_NUMBER() OVER (...) = 1` is an error: the number doesn't exist yet when WHERE runs. Compute it in a CTE or subquery, then filter in the outer query. (Snowflake, BigQuery and DuckDB add a QUALIFY clause for this; most databases don't have it.)",
      ],
    },
    {
      kind: "sql",
      title: "Top earner per department, the standard pattern",
      query: "WITH ranked AS (\n  SELECT name, department_id, salary,\n         ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS n\n  FROM employees\n)\nSELECT d.name AS department, r.name, r.salary\nFROM ranked r\nJOIN departments d ON d.id = r.department_id\nWHERE r.n = 1\nORDER BY r.salary DESC;",
    },
  ],
  quiz: [
    {
      question: "Salaries in a department are 90, 80, 80, 70. What does DENSE_RANK() OVER (ORDER BY salary DESC) give the 70?",
      answer: "3",
      distractors: ["4", "2", "1"],
      why: "DENSE_RANK gives 1, 2, 2, 3: no gap after the tie. RANK would give 4, and ROW_NUMBER would give 4 too.",
    },
    {
      question: "Why does `SELECT * FROM t WHERE ROW_NUMBER() OVER (ORDER BY x) <= 3` fail?",
      answer: "Window functions are evaluated after WHERE, so WHERE can't use them",
      distractors: ["ROW_NUMBER needs PARTITION BY", "You must alias the window first", "ROW_NUMBER only works in ORDER BY"],
      why: "Put the window in a CTE or derived table and filter outside it.",
    },
    {
      question: "A running total shows the same value on three rows that share a date. Why?",
      answer: "The default frame is RANGE, which includes every row tied with the current one",
      distractors: ["SUM ignores duplicate dates", "The rows are duplicates and should be removed", "Running totals need GROUP BY"],
      why: "Use `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`, add a tie breaker to the ORDER BY, or total per date first.",
    },
  ],
  pitfalls: [
    "Using ROW_NUMBER for \"top N\" when ties should all count. Use DENSE_RANK or RANK and say which in the interview.",
    "LAST_VALUE with the default frame returns the current row.",
    "Forgetting PARTITION BY and ranking across the whole table.",
    "Window functions in WHERE or GROUP BY. Wrap them in a CTE.",
  ],
  next: [
    { id: "sql-practice-windows", label: "SQL Practice: Window Functions and CTEs" },
    { id: "sql-schema-design", label: "Schema Design: Keys, Constraints & Normalization" },
  ],
};
