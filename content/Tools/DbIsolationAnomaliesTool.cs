namespace DsaAcademy.Content.Tools;

public class DbIsolationAnomaliesTool : ITool
{
    public string Id => "db-isolation-anomalies";
    public string Section => "Databases";
    public string Track => "sql";
    public int Order => 190;
    public string Title => "Isolation Levels and Anomalies";
    public string OneLiner => "Dirty reads, non-repeatable reads, phantoms, lost updates and write skew, which isolation level stops each, and MVCC versus locking.";
    public string KeyTakeaway => "Default isolation (read committed in PostgreSQL and SQL Server, repeatable read in MySQL) does not stop lost updates or write skew. Use atomic updates, SELECT ... FOR UPDATE, a version column or a constraint, or run at serializable and retry the transactions it aborts.";

    public ToolKind ToolKind => ToolKind.DbIsolationAnomalies;

    public string Explanation =>
        "The SQL Transactions lesson covered what a transaction promises. This one covers what happens when many run at once. Weaker isolation levels are faster, and each lets a specific, named anomaly through; the bugs they cause appear only under concurrent load, which is why they reach production." +
        "\n\n" +
        "The simulator races two sessions step by step under each level, following how PostgreSQL and MySQL actually behave, including where the two differ.";
}
