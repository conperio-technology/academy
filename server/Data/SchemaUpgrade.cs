using Microsoft.EntityFrameworkCore;

namespace DsaAcademy.Data;

// This app uses Database.EnsureCreated(), not EF migrations, and EnsureCreated does nothing
// to a database file that already exists -- so a column added to an entity later never
// appears in an existing progress.db on its own. Rather than introduce migration tooling
// (or tell everyone to delete their progress file), this adds any missing columns in place.
// Each entry is idempotent: it only runs if PRAGMA table_info says the column is absent.
public static class SchemaUpgrade
{
    private static readonly (string Column, string Ddl)[] ProgressEntryColumns =
    [
        ("ReviewStage", "ALTER TABLE ProgressEntries ADD COLUMN ReviewStage INTEGER NOT NULL DEFAULT 0"),
        ("NextReviewAt", "ALTER TABLE ProgressEntries ADD COLUMN NextReviewAt TEXT NULL"),
        ("SolutionRevealedAt", "ALTER TABLE ProgressEntries ADD COLUMN SolutionRevealedAt TEXT NULL"),
        ("AssistedPassedAt", "ALTER TABLE ProgressEntries ADD COLUMN AssistedPassedAt TEXT NULL"),
        ("IndependentPassedAt", "ALTER TABLE ProgressEntries ADD COLUMN IndependentPassedAt TEXT NULL"),
        ("TimedPassedAt", "ALTER TABLE ProgressEntries ADD COLUMN TimedPassedAt TEXT NULL"),
    ];

    public static void Apply(AppDbContext db)
    {
        var existing = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var conn = db.Database.GetDbConnection();
        var wasClosed = conn.State != System.Data.ConnectionState.Open;
        if (wasClosed) conn.Open();
        try
        {
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "PRAGMA table_info(ProgressEntries)";
            using var reader = cmd.ExecuteReader();
            while (reader.Read()) existing.Add(reader.GetString(1));
        }
        finally
        {
            if (wasClosed) conn.Close();
        }

        foreach (var (column, ddl) in ProgressEntryColumns)
        {
            if (!existing.Contains(column)) db.Database.ExecuteSqlRaw(ddl);
        }
    }
}
