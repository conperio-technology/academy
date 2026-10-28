namespace DsaAcademy.Content.Tools;

public class DataAnalyticsWarehousesTool : ITool
{
    public string Id => "data-analytics-warehouses";
    public string Section => "Databases";
    public string Track => "analytics";
    public int Order => 600;
    public string Title => "Data and Analytics: OLTP vs OLAP, Warehouses, Star Schemas and ETL";
    public string OneLiner => "Why analytics runs on separate systems: OLTP versus OLAP, data warehouses, lakes and lakehouses, columnar storage, star schemas with facts and dimensions, ETL versus ELT, and batch versus stream processing.";
    public string KeyTakeaway => "Keep analytics off the application database: copy data into a columnar warehouse or lake built for scanning history. Model it as a star schema (facts with measures, dimensions with context), load raw then transform in SQL (ELT), and choose batch for anything that can wait and streaming for what must be immediate.";

    public ToolKind ToolKind => ToolKind.DataAnalyticsWarehouses;

    public string Explanation =>
        "The database behind an app is built for many small reads and writes; questions over years of history across systems are a different workload. This lesson explains the separate systems companies build for analytics and the vocabulary around them." +
        "\n\n" +
        "It covers OLTP versus OLAP, warehouses, lakes and lakehouses, star schemas, ETL versus ELT and batch versus stream processing, with a star-schema query of the shape every BI tool generates.";
}
