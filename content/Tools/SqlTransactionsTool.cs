namespace DsaAcademy.Content.Tools;

public class SqlTransactionsTool : ITool
{
    public string Id => "sql-transactions";
    public string Section => "Professional Dev Skills";
    public string Track => "sql";
    public string Title => "SQL Transactions & ACID";
    public string OneLiner => "A bank transfer is two UPDATEs. A transaction is what stops a crash between them from losing money.";
    public string KeyTakeaway =>
        "Wrap statements that must succeed or fail together in BEGIN ... COMMIT. If anything goes " +
        "wrong before COMMIT -- an error, a constraint violation, a crash -- ROLLBACK undoes all of it, " +
        "so the database never shows the half-finished state. That all-or-nothing guarantee is the A in ACID.";

    public ToolKind ToolKind => ToolKind.SqlTransactions;

    public string Explanation =>
        "Moving $100 from Ava to Ben takes two statements: subtract from Ava, add to Ben. Run them " +
        "one at a time and there is a moment where the money has left Ava's account but not reached " +
        "Ben's. If the server crashes, the app throws, or the network drops in that moment, the $100 " +
        "is simply gone. Bugs like this are rare per request and certain over enough requests.\n\n" +
        "A transaction groups statements into one unit. `BEGIN` starts it; nothing you change is " +
        "final until `COMMIT`. If something fails first, `ROLLBACK` puts every row back exactly as it " +
        "was at BEGIN -- and if the server dies mid-transaction, the database rolls it back on restart " +
        "by itself. Other sessions never see the in-between state.\n\n" +
        "That's what ACID describes. Atomicity: all of it happens or none of it does. Consistency: " +
        "rules like `CHECK (balance >= 0)` hold before and after, so a transfer that would overdraw " +
        "an account is rejected outright. Isolation: two transactions running at once don't see each " +
        "other's half-done work (how strictly is the isolation level -- READ COMMITTED is a common " +
        "default, SERIALIZABLE the strictest). Durability: once COMMIT returns, the change survives " +
        "a crash.\n\n" +
        "In application code this is usually `using var tx = connection.BeginTransaction()` in C# " +
        "(or your ORM's equivalent, an ORM being an object-relational mapper, a library that maps tables to classes; e.g. EF Core's `SaveChanges`, which wraps its batch in one), with " +
        "a commit at the end and a rollback in the error path. Keep transactions short: while one is " +
        "open it can hold locks other requests are waiting on.";
}
