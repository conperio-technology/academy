import { type OpsLessonData } from "../types.ts";

export const dbNullsCaseSets: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "NULL means \"no value here\": unknown, missing or not applicable. It is not zero and not an empty string, and SQL treats it with three-valued logic. A comparison is TRUE, FALSE or UNKNOWN, and anything compared with NULL is UNKNOWN. WHERE keeps only rows where the condition is TRUE, so rows with UNKNOWN quietly disappear.",
        "That one rule explains most NULL surprises: `WHERE manager_id <> 1` doesn't return people with no manager, `NULL = NULL` isn't true, and adding NULL to a number gives NULL. To test for it, write `IS NULL` or `IS NOT NULL`.",
      ],
    },
    {
      kind: "sql",
      title: "NULL in expressions",
      intro: "SQLite prints TRUE as 1 and FALSE as 0; an empty cell here shows as NULL.",
      query: "SELECT NULL = NULL      AS equals,\n       NULL IS NULL     AS is_null,\n       1 + NULL         AS plus,\n       'a' || NULL      AS concat,\n       COALESCE(NULL, 'fallback') AS coalesced;",
    },
    {
      kind: "sql",
      title: "NULL in filters and counts",
      schema: "shop",
      intro: "Three employees have no manager. COUNT(*) counts rows; COUNT(column) counts non-NULL values. Then change the WHERE to `manager_id <> 1 OR manager_id IS NULL` and compare.",
      query: "SELECT COUNT(*)          AS all_rows,\n       COUNT(manager_id) AS with_manager,\n       (SELECT COUNT(*) FROM employees WHERE manager_id <> 1) AS not_managed_by_1\nFROM employees;",
    },
    {
      kind: "table",
      title: "NULL rules worth memorising",
      head: ["Situation", "What happens"],
      rows: [
        ["`x = NULL`, `x <> NULL`", "always UNKNOWN; use `x IS NULL`"],
        ["arithmetic and string concatenation", "NULL in, NULL out"],
        ["COUNT(*)", "counts every row"],
        ["COUNT(col), SUM, AVG, MIN, MAX", "ignore NULLs; AVG divides by the non-NULL count; SUM of no values is NULL"],
        ["GROUP BY", "puts all NULLs in one group"],
        ["ORDER BY", "NULLs sort first in SQLite, SQL Server and MySQL, last in PostgreSQL and Oracle; `NULLS FIRST` / `NULLS LAST` makes it explicit where supported"],
        ["UNIQUE constraint", "most databases allow many NULLs in a UNIQUE column (SQL Server allows one)"],
        ["`NOT IN (list with a NULL)`", "never TRUE, so no rows"],
        ["`COALESCE(a, b, c)`", "the first non-NULL argument"],
        ["`NULLIF(a, b)`", "NULL when a equals b, otherwise a; `x / NULLIF(y, 0)` avoids divide by zero"],
      ],
    },
    {
      kind: "text",
      title: "CASE: if/else inside a query",
      paragraphs: [
        "`CASE WHEN condition THEN value ... ELSE value END` produces a value per row. Use it to label rows into bands, to turn codes into words, and most usefully inside an aggregate, where it counts or sums only the rows you pick. That trick, conditional aggregation, turns rows into columns in one pass.",
      ],
    },
    {
      kind: "sql",
      title: "CASE to label rows",
      query: "SELECT name, salary,\n       CASE\n         WHEN salary >= 110000 THEN 'senior band'\n         WHEN salary >= 75000  THEN 'mid band'\n         ELSE 'entry band'\n       END AS band\nFROM employees\nORDER BY salary DESC;",
    },
    {
      kind: "sql",
      title: "Conditional aggregation: a status report in one row per month",
      schema: "shop",
      intro: "Each SUM counts only the rows its CASE lets through. This is how you pivot rows into columns without a PIVOT keyword.",
      query: "SELECT strftime('%Y-%m', order_date) AS month,\n       SUM(CASE WHEN status = 'shipped'   THEN 1 ELSE 0 END) AS shipped,\n       SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END) AS pending,\n       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled\nFROM orders\nGROUP BY month\nORDER BY month;",
    },
    {
      kind: "text",
      title: "Set operations: combining whole results",
      paragraphs: [
        "UNION, INTERSECT and EXCEPT combine the rows of two queries with the same number of columns. UNION keeps rows in either (removing duplicates), UNION ALL keeps every row including duplicates and is cheaper because it skips the de-duplication, INTERSECT keeps rows in both, and EXCEPT keeps rows in the first but not the second (Oracle calls it MINUS).",
      ],
    },
    {
      kind: "sql",
      title: "Customers who ordered in both February and March",
      schema: "shop",
      intro: "Swap INTERSECT for EXCEPT to get February customers who didn't come back in March, or for UNION to get anyone who ordered in either month.",
      query: "SELECT customer_id FROM orders WHERE order_date LIKE '2025-02-%'\nINTERSECT\nSELECT customer_id FROM orders WHERE order_date LIKE '2025-03-%';",
    },
  ],
  quiz: [
    {
      question: "A table has 10 rows; the bonus column is NULL in 4 of them and 100 in the rest. What does `SELECT AVG(bonus)` return?",
      answer: "100, because AVG ignores the NULLs and divides by 6",
      distractors: ["60, because the NULLs count as 0", "NULL, because some values are NULL", "An error"],
      why: "Aggregates skip NULLs. If missing should mean zero, write `AVG(COALESCE(bonus, 0))`, which gives 60.",
    },
    {
      question: "Why does `WHERE status <> 'cancelled'` leave out rows where status is NULL?",
      answer: "NULL <> 'cancelled' is UNKNOWN, and WHERE only keeps TRUE",
      distractors: ["NULL rows are always hidden by WHERE", "The index skips NULLs", "<> means the same as IS NOT"],
      why: "Three-valued logic. Add `OR status IS NULL` if those rows should stay.",
    },
    {
      question: "You combine two monthly lists of customer ids and need to count every visit, including repeats. Which operator?",
      answer: "UNION ALL",
      distractors: ["UNION", "INTERSECT", "EXCEPT"],
      why: "UNION removes duplicates, which would hide repeat visits and costs a sort or hash. UNION ALL keeps every row.",
    },
  ],
  pitfalls: [
    "Testing with `= NULL`. It is never true; use IS NULL.",
    "Forgetting that a LEFT JOIN creates NULLs, then filtering on the right table in WHERE and turning it back into an inner join. Put such conditions in the ON clause.",
    "Using UNION when UNION ALL is meant, paying for a de-duplication you didn't want.",
    "A CASE with no ELSE returns NULL for rows that match no branch.",
  ],
  next: [
    { id: "db-window-functions", label: "Window Functions: Rankings, Running Totals and LAG" },
    { id: "sql-practice-aggregation", label: "SQL Practice: Grouping and Aggregates" },
  ],
};
