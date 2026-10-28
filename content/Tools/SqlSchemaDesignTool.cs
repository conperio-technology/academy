namespace DsaAcademy.Content.Tools;

public class SqlSchemaDesignTool : ITool
{
    public string Id => "sql-schema-design";
    public string Section => "Databases";
    public string Track => "sql";
    public int Order => 160;
    public string Title => "Schema Design: Keys, Constraints & Normalization";
    public string OneLiner => "Store each fact once, and make the database itself refuse data that breaks your rules.";
    public string KeyTakeaway =>
        "If the same fact is stored in two places, eventually the two copies will disagree. Normalize " +
        "so each fact has one home, link tables with foreign keys, and declare your rules (PRIMARY KEY, UNIQUE, " +
        "NOT NULL, FOREIGN KEY, CHECK) in the schema (the definition of the tables, their columns and rules) -- the database enforces them for every " +
        "app and every script, including the ones that forgot to check.";

    public ToolKind ToolKind => ToolKind.SqlSchemaDesign;

    public string Explanation =>
        "A spreadsheet-style table with one row per order and the customer's name and email copied " +
        "onto each row is easy to start with. The trouble starts when something changes. Ava updates " +
        "her email, someone runs an UPDATE against the order they were looking at, and now Ava has two " +
        "emails depending on which order you read. That's an update anomaly, and it's a design " +
        "problem, not a coding mistake: the design allowed the copies to disagree.\n\n" +
        "Normalization means splitting data so each fact is stored exactly once. Customers go in a " +
        "customers table, orders in an orders table, and each order holds a customer_id that points " +
        "at its customer -- a foreign key. Now there is one row to update, and every order sees the " +
        "change through a JOIN (see SQL Joins). The usual rule of thumb: every non-key column should " +
        "describe the key of its own table, the whole key, and nothing but the key.\n\n" +
        "Constraints are rules the database enforces on every write. PRIMARY KEY: one unique id per " +
        "row. UNIQUE: no two rows share a value (one account per email). NOT NULL: a value is " +
        "required. FOREIGN KEY: a reference must point at a row that exists, and that row can't be " +
        "deleted out from under it. CHECK: any true/false rule on the row, like qty > 0. Validation " +
        "in the app is still good for friendly error messages, but only the database sees every " +
        "write -- the import script, the admin tool, the bug in next month's release.\n\n" +
        "Normalizing isn't always the end state. Reporting databases sometimes copy data on purpose " +
        "(denormalize) so big reads need fewer joins. That's a deliberate trade made later, for " +
        "speed, with a plan for keeping copies in sync -- not the default.";
}
