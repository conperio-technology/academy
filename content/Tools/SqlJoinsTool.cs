namespace DsaAcademy.Content.Tools;

public class SqlJoinsTool : ITool
{
    public string Id => "sql-joins";
    public string Section => "Professional Dev Skills";
    public string Track => "sql";
    public string Title => "SQL Joins: Combining Tables";
    public string OneLiner => "Real data lives in more than one table on purpose -- a JOIN is how you ask a question that spans both without duplicating data everywhere.";
    public string KeyTakeaway =>
        "An INNER JOIN only keeps rows that match on both sides -- a department with zero employees " +
        "would silently disappear entirely from the result. A LEFT JOIN keeps every row from the left " +
        "table regardless, filling in NULLs (SQL's marker for \"no value\") for the side that didn't match -- which one you want " +
        "depends on whether \"no match\" should hide the row or just leave gaps in it.";

    public ToolKind ToolKind => ToolKind.SqlJoins;

    public string Explanation =>
        "Splitting data into multiple tables (employees in one table, departments in another) avoids " +
        "repeating a department's name and location on every single employee row -- instead, each " +
        "employee just stores a department_id, a foreign key pointing at the department it belongs to. " +
        "That's normalization: each fact lives in exactly one place. The tradeoff is that answering " +
        "\"which department does Ava work in\" now needs a JOIN to stitch the two tables back together " +
        "for the query.\n\n" +
        "`SELECT ... FROM employees JOIN departments ON employees.department_id = departments.id` walks " +
        "every employee row, finds the department row whose id matches that employee's department_id, " +
        "and glues the two rows together into one wider result row -- as if, just for this one query, " +
        "the two tables were combined into one. The ON clause is the matching rule; get it wrong (or " +
        "forget it entirely) and you get either no rows or a cartesian product (every row of one " +
        "table paired with every row of the other), both obviously broken results that are still worth recognizing on sight.\n\n" +
        "This is plain JOIN / INNER JOIN -- only pairs that actually match on both sides survive. A " +
        "LEFT JOIN keeps every row from the left table even with no match, filling the right side's " +
        "columns with NULLs instead of dropping the row -- the right choice when \"no match\" is itself " +
        "meaningful information, not something to hide. Every department in the sample data has " +
        "employees, so add one that doesn't and try it in the playground: `INSERT OR IGNORE INTO " +
        "departments VALUES (4, 'Legal', 'Boston'); SELECT departments.name, employees.name FROM " +
        "departments LEFT JOIN employees ON employees.department_id = departments.id;` Legal comes back " +
        "once, with NULL as the employee's name.\n\n" +
        "A common LEFT JOIN bug is filtering the right table in WHERE, such as `WHERE employees.salary > " +
        "100000`. On Legal's row employees.salary is NULL, and a comparison with NULL is never true, so " +
        "WHERE drops the row and the LEFT JOIN quietly behaves like an inner join. To filter the matches " +
        "but still keep every department, move the condition into ON: `LEFT JOIN employees ON " +
        "employees.department_id = departments.id AND employees.salary > 100000`. A WHERE condition on " +
        "the left table is fine.\n\n" +
        "Try it below -- the starter query joins employees to departments to show each person's " +
        "department name instead of just its id number. Edit it, break it, fix it; the sample data " +
        "resets any time.";
}
