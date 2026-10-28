namespace DsaAcademy.Content.Tools;

public class DbNosqlModelingTool : ITool
{
    public string Id => "db-nosql-modeling";
    public string Section => "Databases";
    public string Track => "nosql";
    public int Order => 510;
    public string Title => "NoSQL Data Modeling: Access Patterns, Embedding and Partition Keys";
    public string OneLiner => "Design from the queries: embed or reference, partition and sort keys, single-table design in DynamoDB, and avoiding hot partitions.";
    public string KeyTakeaway => "List the access patterns first and shape the data so each is one read. Embed what is read together and bounded; reference what is shared or unbounded. A partition key must spread writes evenly and be known by every query; duplicate data on purpose and decide how each copy stays current.";

    public ToolKind ToolKind => ToolKind.DbNosqlModeling;

    public string Explanation =>
        "Modeling for a NoSQL database is a different skill from normalising a relational schema, and getting it wrong is expensive because the key design is hard to change later. This lesson walks through the process, the embed or reference decision, a DynamoDB single-table layout, and a partition key simulator.";
}
