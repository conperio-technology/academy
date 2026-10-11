namespace DsaAcademy.Content.Tools;

public class SqlIndexesTool : ITool
{
    public string Id => "sql-indexes";
    public string Section => "Professional Dev Skills";
    public string Track => "sql";
    public string Title => "SQL Indexes & Query Plans";
    public string OneLiner => "Why the same query takes 0.1 ms or 10 ms, and how to ask the database which one you're going to get.";
    public string KeyTakeaway =>
        "An index is a sorted copy of one or more columns with pointers back to the rows -- a binary " +
        "search tree for your table. It turns \"read every row\" (a SCAN, O(n)) into \"jump to the " +
        "matches\" (a SEARCH, O(log n)). It isn't free: every INSERT, UPDATE and DELETE has to keep " +
        "every index up to date, so index the columns you actually filter and join on, not everything.";

    public ToolKind ToolKind => ToolKind.SqlIndexes;

    public string Explanation =>
        "Without an index, `WHERE customer_id = 42` has exactly one strategy: read every row in the " +
        "table and keep the ones that match. On 200 rows nobody notices. On 200,000 rows it's the " +
        "difference between a page that loads instantly and one that doesn't, and it gets worse every " +
        "day the table grows.\n\n" +
        "An index fixes that the same way a book's index does. `CREATE INDEX idx_orders_customer ON " +
        "orders(customer_id)` builds a separate structure (a B-tree, a wide, shallow cousin of the " +
        "binary search tree from the Trees track) holding every customer_id in sorted order, each " +
        "pointing back at its row. Finding customer 42 becomes a binary-search-style descent instead of " +
        "a full read. The primary key already works this way, which is why lookups by id are always " +
        "fast.\n\n" +
        "You don't have to guess whether an index is used: put `EXPLAIN QUERY PLAN` (SQLite) or " +
        "`EXPLAIN` (PostgreSQL, MySQL; SQL Server shows an execution plan) in front of the query. " +
        "`SCAN orders` means a full read; `SEARCH orders USING INDEX ...` means the index did its job. " +
        "Reading plans is the single most useful habit for fixing a slow query.\n\n" +
        "Three things that catch people out, all in the presets below. Column order in a composite index " +
        "(one index over several columns) matters: an index on (customer_id, created_at) is sorted by customer first, so it helps " +
        "\"customer 42 since June\" but not \"everyone since June\". Wrapping the column in a function " +
        "(`WHERE lower(status) = ...`) hides it from the index. And every index makes writes slower, " +
        "since each INSERT has to update every index too -- the \"Time 20,000 inserts\" button shows the " +
        "cost.";
}
