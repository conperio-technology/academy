namespace DsaAcademy.Content.Tools;

public class DbIntroTool : ITool
{
    public string Id => "db-intro";
    public string Section => "Databases";
    public string Track => "foundations";
    public int Order => 0;
    public string Title => "Databases: What They Do and Which Kind to Use";
    public string OneLiner => "What a database gives you that files don't, the main families from relational to vector, and OLTP versus OLAP.";
    public string KeyTakeaway => "Start with a relational database: it gives you durability, transactions, constraints and ad hoc queries. Reach for another family when you can name the problem it solves: key lookups at huge scale, massive write volume, deep relationship queries, time series, full-text or similarity search. Keep analytics off the app's database.";

    public ToolKind ToolKind => ToolKind.DbIntro;

    public string Explanation =>
        "Almost every application keeps its important data in a database. This lesson is the map for the section: what any database does for you, the families of databases and what each is shaped for, and the difference between the database that runs the business (OLTP) and the one that analyses it (OLAP)." +
        "\n\n" +
        "The rest of the section goes deep on relational databases and SQL first, with live queries and graded practice problems, then how databases store data and stay correct under concurrency, and finally NoSQL: the families in detail and how to model data for them.";
}
