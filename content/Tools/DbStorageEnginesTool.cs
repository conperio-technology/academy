namespace DsaAcademy.Content.Tools;

public class DbStorageEnginesTool : ITool
{
    public string Id => "db-storage-engines";
    public string Section => "Databases";
    public string Track => "internals";
    public int Order => 400;
    public string Title => "How a Database Stores Data: Pages, B-Trees, LSM Trees and the WAL";
    public string OneLiner => "Pages and the buffer pool, the write-ahead log and crash recovery, B-trees versus LSM trees, and row versus column storage.";
    public string KeyTakeaway => "A commit is durable once its record is in the write-ahead log; data pages catch up later. B-trees update pages in place and read cheaply; LSM trees turn writes into sequential appends and pay with compaction and multi-file reads. Row stores suit transactions, column stores suit analytics.";

    public ToolKind ToolKind => ToolKind.DbStorageEngines;

    public string Explanation =>
        "You can use a database for years without knowing how it stores data, until a design decision depends on it: which engine for a write-heavy workload, why random UUID keys slow inserts, how a crash mid-write doesn't corrupt anything. This lesson opens the box." +
        "\n\n" +
        "The LSM tree simulator lets you watch writes land in memory, flush to sorted files and get compacted, and see how many places a read has to check.";
}
