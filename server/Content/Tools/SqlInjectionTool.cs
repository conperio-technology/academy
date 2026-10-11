namespace DsaAcademy.Content.Tools;

public class SqlInjectionTool : ITool
{
    public string Id => "security-sql-injection";
    public string Section => "Security";
    public string Track => "web attacks";
    public string Title => "SQL Injection";
    public string OneLiner => "When user input gets pasted into SQL text, the user gets to write part of your query.";
    public string KeyTakeaway =>
        "Never build SQL by gluing strings together with user input. Use parameterized queries -- ? or " +
        "@name placeholders with the values passed separately -- so input is always treated as data, " +
        "never as SQL. ORMs like EF Core do this for you, until you reach for raw SQL.";

    public ToolKind ToolKind => ToolKind.SqlInjection;

    public string Explanation =>
        "A login check is often written as one query: find a user with this username and this " +
        "password. Build it by pasting the form fields into a string, and the query's structure now " +
        "depends on what the user typed. Type a quote and you've closed the string early; everything " +
        "after it is read as SQL. `' OR '1'='1` turns \"the password matches\" into \"the password matches " +
        "OR one equals one\", which is always true. `admin' --` comments out the password check entirely. " +
        "And because many database drivers run several statements at once, `'; DROP TABLE users; --` " +
        "can delete the table outright.\n\n" +
        "The fix is not escaping quotes by hand or blocking suspicious words -- attackers have decades " +
        "of tricks for getting around both. The fix is a parameterized query. The SQL is sent with " +
        "placeholders (`WHERE username = ? AND password = ?`) and the values are sent separately. The " +
        "database parses the SQL first, so its structure is fixed before any input arrives; the input " +
        "can only ever fill a value slot. Turn on \"parameterized\" in the demo and try every attack again.\n\n" +
        "In C#, that means `command.Parameters.AddWithValue(\"@name\", name)` with ADO.NET, or just " +
        "using EF Core's LINQ queries, which are parameterized automatically. Watch for the escape " +
        "hatches: EF Core's `FromSqlRaw` with string concatenation is as vulnerable as any other " +
        "string-built query (`FromSqlInterpolated` and `FromSql` parameterize for you). The same idea " +
        "applies beyond SQL -- shell commands, LDAP filters, file paths -- anywhere input is mixed into " +
        "something that gets interpreted.\n\n" +
        "Also note this demo's other mistake: passwords stored in plain text. See Hashing vs. Encryption " +
        "for why that's a separate disaster.";
}
