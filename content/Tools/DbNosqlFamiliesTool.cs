namespace DsaAcademy.Content.Tools;

public class DbNosqlFamiliesTool : ITool
{
    public string Id => "db-nosql-families";
    public string Section => "Databases";
    public string Track => "nosql";
    public int Order => 500;
    public string Title => "NoSQL Families: Key-Value, Document, Wide-Column and Graph";
    public string OneLiner => "Redis, MongoDB, Cassandra and Neo4j: what each family stores, how you query it, what it gives up, and how to choose.";
    public string KeyTakeaway => "Each NoSQL family trades something (joins, multi-row transactions, immediate consistency) for one strength: key lookups, self-contained documents, huge write volume across many nodes, or relationship traversal. Pick by access pattern, keep a relational database as the default, and use quorums (R + W > N) when replicas must agree.";

    public ToolKind ToolKind => ToolKind.DbNosqlFamilies;

    public string Explanation =>
        "NoSQL is not one thing. Key-value stores, document databases, wide-column stores and graph databases solve different problems, and choosing between them (or sticking with SQL) is a common system design interview question. This lesson shows what working with each looks like and when each is the right tool.";
}
