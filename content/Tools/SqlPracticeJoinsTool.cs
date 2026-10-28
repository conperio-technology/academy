namespace DsaAcademy.Content.Tools;

public class SqlPracticeJoinsTool : ITool
{
    public string Id => "sql-practice-joins";
    public string Section => "Databases";
    public string Track => "sql practice";
    public int Order => 300;
    public string Title => "SQL Practice: Filtering and Joins";
    public string OneLiner => "Graded SQL problems on a shop database: filtering, anti-joins, multi-table joins and self joins.";
    public string KeyTakeaway => "For \"which X have no Y\", use LEFT JOIN ... WHERE y.id IS NULL or NOT EXISTS, never an inner join. Join a table to itself with two aliases to compare rows, such as an employee and their manager.";

    public ToolKind ToolKind => ToolKind.SqlPracticeJoins;

    public string Explanation =>
        "Five graded problems on a small shop database. Each answer is checked by running your query and a reference query on a fresh copy of the data and comparing the rows, so any correct query passes, whatever its style." +
        "\n\n" +
        "These are the join questions that come up again and again in interviews and on the job: customers who never ordered, products nobody bought, order totals across four tables, and employees who earn more than their manager.";
}
