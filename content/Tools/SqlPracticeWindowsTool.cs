namespace DsaAcademy.Content.Tools;

public class SqlPracticeWindowsTool : ITool
{
    public string Id => "sql-practice-windows";
    public string Section => "Databases";
    public string Track => "sql practice";
    public int Order => 320;
    public string Title => "SQL Practice: Window Functions and CTEs";
    public string OneLiner => "Graded SQL problems: top N per group, running totals, month-over-month change, first order per customer, and the longest streak.";
    public string KeyTakeaway => "Rank inside groups with a window function in a CTE and filter outside it. Aggregate to the right grain first (per day, per month), then apply the window. Consecutive runs are grouped by date minus ROW_NUMBER.";

    public ToolKind ToolKind => ToolKind.SqlPracticeWindows;

    public string Explanation =>
        "Six graded problems that need window functions or CTEs, ending with the gaps-and-islands streak question that separates strong SQL candidates from the rest. Your query is compared with a reference answer on a fresh copy of the shop database.";
}
