namespace DsaAcademy.Content.Tools;

public class SqlPracticeAggregationTool : ITool
{
    public string Id => "sql-practice-aggregation";
    public string Section => "Databases";
    public string Track => "sql practice";
    public int Order => 310;
    public string Title => "SQL Practice: Grouping and Aggregates";
    public string OneLiner => "Graded SQL problems: revenue per category, repeat customers, duplicates, the second highest salary and monthly counts.";
    public string KeyTakeaway => "WHERE filters rows before grouping; HAVING filters groups after. Group by the id as well as the name so two different people with the same name stay apart, and remember MAX of an empty set is NULL.";

    public ToolKind ToolKind => ToolKind.SqlPracticeAggregation;

    public string Explanation =>
        "Five graded problems on GROUP BY, HAVING and aggregates, including two interview classics: finding duplicate values and the second highest salary. Your query is compared with a reference answer on a fresh copy of the shop database.";
}
