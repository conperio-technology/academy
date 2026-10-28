namespace DsaAcademy.Content.Tools;

public class SqlAggregationTool : ITool
{
    public string Id => "sql-aggregation";
    public string Section => "Databases";
    public string Track => "sql";
    public int Order => 120;
    public string Title => "SQL Aggregation: GROUP BY, COUNT, SUM, AVG";
    public string OneLiner => "Answering \"how many\" and \"what's the average, per group\" without writing a loop -- GROUP BY collapses many rows into one summary row per group.";
    public string KeyTakeaway =>
        "Every column in the SELECT list has to be either something you GROUP BY or the result of an " +
        "aggregate function (COUNT, SUM, AVG, MIN, MAX) -- mixing in a plain column that's neither is a " +
        "common mistake, because the database has no way to know WHICH of the many rows in that " +
        "group's plain column value you actually meant.";

    public ToolKind ToolKind => ToolKind.SqlAggregation;

    public string Explanation =>
        "COUNT(*), SUM(column), AVG(column), MIN(column), and MAX(column) are aggregate functions -- " +
        "each one collapses many rows down to a single number. Used alone (`SELECT COUNT(*) FROM " +
        "employees`), that number is computed across the WHOLE table. Add GROUP BY and it changes shape " +
        "entirely: `GROUP BY department_id` splits all the rows into one bucket per distinct " +
        "department_id first, THEN runs the aggregate separately within each bucket -- so COUNT(*) " +
        "becomes \"how many employees in EACH department,\" not one number for the whole company.\n\n" +
        "HAVING is WHERE's counterpart for GROUPS instead of individual rows -- filtering `WHERE salary " +
        "> 100000` happens before grouping (on raw employee rows), while `HAVING COUNT(*) > 5` happens " +
        "after grouping (on the summarized group rows). \"Only show departments with more than 5 " +
        "people\" can only be expressed with HAVING, since \"how many people\" doesn't exist as a value " +
        "until after the grouping already happened.\n\n" +
        "The starter query below joins employees to departments (see SQL Joins) and then groups by " +
        "department to show headcount and average salary per department in one query -- the same shape " +
        "as a report a manager might actually ask for. Edit the aggregate functions, add a HAVING " +
        "clause, see what changes.";
}
