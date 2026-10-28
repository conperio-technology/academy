namespace DsaAcademy.Content.Tools;

public class DbNullsCaseSetsTool : ITool
{
    public string Id => "db-nulls-case-sets";
    public string Section => "Databases";
    public string Track => "sql";
    public int Order => 140;
    public string Title => "NULL, CASE and Set Operations";
    public string OneLiner => "Three-valued logic and the NULL traps, CASE for labels and conditional aggregation, and UNION, INTERSECT and EXCEPT.";
    public string KeyTakeaway => "Anything compared with NULL is UNKNOWN and WHERE drops it, so test with IS NULL and remember that aggregates skip NULLs. SUM(CASE WHEN ... THEN 1 ELSE 0 END) turns rows into columns. UNION removes duplicates; UNION ALL keeps them and is cheaper.";

    public ToolKind ToolKind => ToolKind.DbNullsCaseSets;

    public string Explanation =>
        "NULL causes more wrong SQL answers than anything else, because it doesn't behave like a value: it means unknown, and SQL's three-valued logic follows from that. This lesson shows the rules with live queries, then two tools you'll use constantly: CASE, an if/else that works inside SELECT and inside aggregates, and the set operations that combine whole query results.";
}
