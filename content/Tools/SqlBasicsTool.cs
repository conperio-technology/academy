namespace DsaAcademy.Content.Tools;

public class SqlBasicsTool : ITool
{
    public string Id => "sql-basics";
    public string Section => "Databases";
    public string Track => "sql";
    public int Order => 100;
    public string Title => "SQL Basics: SELECT, WHERE, ORDER BY, LIMIT";
    public string OneLiner => "The four clauses that answer 90% of \"get me some rows\" questions: which columns, which rows, in what order, how many.";
    public string KeyTakeaway =>
        "SQL clauses have a logical order that differs from how you TYPE them: FROM -> WHERE -> " +
        "(GROUP BY -> HAVING) -> SELECT -> ORDER BY -> LIMIT. WHERE filters rows before anything else " +
        "sees them, SELECT works out the output columns, ORDER BY sorts the result, and LIMIT caps the " +
        "count last, which is why \"give me the top 5 highest-paid engineers\" filters first and limits " +
        "last, not the other way around. That order defines what a query means; the database's actual " +
        "execution plan can differ, as long as the result is the same.";

    public ToolKind ToolKind => ToolKind.SqlBasics;

    public string Explanation =>
        "SQL (Structured Query Language) is the language for asking a relational database, data stored in tables of rows and columns, for data. A SQL query reads back a table (or several) as rows and columns, and four clauses handle " +
        "almost every basic question: SELECT picks which COLUMNS to return, FROM says which table, " +
        "WHERE filters which ROWS qualify, and ORDER BY sorts what's left. Add LIMIT to cap how many " +
        "rows come back, and that's enough to answer most \"show me...\" questions a business app ever " +
        "asks its database.\n\n" +
        "The clauses are WRITTEN in one order (SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT ...) " +
        "but are logically evaluated in another: FROM picks the table, WHERE throws out rows that fail " +
        "its test, GROUP BY and HAVING come next when a query has them (SQL Aggregation covers those), " +
        "then SELECT works out the output columns, ORDER BY sorts the result, and LIMIT trims it. That " +
        "logical order is what defines a query's result. The physical execution can differ: an index " +
        "might hand rows over already sorted, or LIMIT might let the database stop reading early, as " +
        "long as the answer comes out the same.\n\n" +
        "Two things follow. ORDER BY comes after SELECT, so it can use an alias SELECT defined " +
        "(`SELECT name, salary * 12 AS annual FROM employees ORDER BY annual`). And ORDER BY can still " +
        "sort by a column you didn't select (`SELECT name FROM employees ORDER BY salary DESC`), because " +
        "the sort is applied over the source rows, not only over the selected columns. The SQL standard " +
        "and engines such as SQLite, the one running below, allow that.\n\n" +
        "C# code often writes this same shape without any SQL text: with EF Core, " +
        "`db.Orders.Where(o => o.CustomerId == id).OrderByDescending(o => o.PlacedAt)` is turned into " +
        "exactly this WHERE then ORDER BY query underneath.\n\n" +
        "Try it below -- a real, tiny SQL database (two tables: employees and departments) actually " +
        "runs whatever you type. Edit the query and run it again; nothing you do here can break " +
        "anything outside this one browser tab.";
}
