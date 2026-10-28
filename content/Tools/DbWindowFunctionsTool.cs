namespace DsaAcademy.Content.Tools;

public class DbWindowFunctionsTool : ITool
{
    public string Id => "db-window-functions";
    public string Section => "Databases";
    public string Track => "sql";
    public int Order => 150;
    public string Title => "Window Functions: Rankings, Running Totals and LAG";
    public string OneLiner => "ROW_NUMBER, RANK, DENSE_RANK, LAG and running SUMs: calculations across rows that keep every row.";
    public string KeyTakeaway => "function() OVER (PARTITION BY group ORDER BY order frame) computes across related rows without collapsing them. Rank per group with ROW_NUMBER, RANK or DENSE_RANK depending on ties, compare with neighbours using LAG and LEAD, and filter on a window result in an outer query because windows run after WHERE.";

    public ToolKind ToolKind => ToolKind.DbWindowFunctions;

    public string Explanation =>
        "Window functions are the most asked-about SQL feature in data and backend interviews, and the cleanest way to answer \"top N per group\", \"running total\" and \"change since the previous period\". They compute over a set of rows related to the current one, but unlike GROUP BY they keep every row." +
        "\n\n" +
        "Each example below runs live. Change the PARTITION BY or ORDER BY and watch how the numbers move.";
}
