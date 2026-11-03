namespace DsaAcademy.Content.Tools;

public class SqlJoinLadderTool : ITool
{
    public string Id => "sql-join-ladder";
    public string Section => "Databases";
    public string Track => "sql practice";
    public int Order => 330;
    public string Title => "SQL Join Ladder: Generated Join Practice";
    public string OneLiner => "Hundreds of generated SELECT questions on a bigger database, in eight rungs from one table to anti-joins and CTEs.";
    public string KeyTakeaway => "Every join is one foreign key at a time. Joining a child table multiplies the parent's rows, so lists need DISTINCT and counts need COUNT(DISTINCT ...). A LEFT JOIN keeps unmatched rows only while conditions on its right-hand table stay in the ON clause.";

    public ToolKind ToolKind => ToolKind.SqlJoinLadder;

    public string Explanation =>
        "Join practice with hundreds of questions. They are generated from templates over a bigger shop database (30 customers, 30 products, 90 orders, 16 employees, 60 reviews) and grouped into eight rungs: one table, two tables, three tables, four or more, outer joins, self joins, aggregates over joins, and mixed anti-join and CTE questions." +
        "\n\n" +
        "Each answer is checked by running your query and a reference query on a fresh copy of the data and comparing the rows, so any correct query passes. Pass three different questions on a rung to clear it.";
}
