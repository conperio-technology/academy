namespace DsaAcademy.Content.Tools;

public class DbOrmsConnectionPoolsTool : ITool
{
    public string Id => "db-orms-connection-pools";
    public string Section => "Databases";
    public string Track => "internals";
    public int Order => 410;
    public string Title => "ORMs, N+1 Queries, Connection Pools and Migrations";
    public string OneLiner => "How Entity Framework and SQLAlchemy talk to the database, the N+1 query problem, connection pools, and schema changes without downtime.";
    public string KeyTakeaway => "Watch the SQL your ORM generates: load related data deliberately to avoid N+1 queries, select only the columns you need, and hold pooled connections briefly. Change schemas with expand and contract so old and new code both keep working during a deploy.";

    public ToolKind ToolKind => ToolKind.DbOrmsConnectionPools;

    public string Explanation =>
        "Most production code reaches the database through an ORM, and most database performance problems in application code come from how it is used rather than from the database itself. This lesson covers the patterns that matter in C# and Python, with a calculator for what N+1 queries cost.";
}
