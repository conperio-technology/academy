// Replays event sequences through server/Data/ProgressService.cs on an in-memory SQLite
// database and prints what the API would report after every event. check.mjs feeds the same
// sequences to client/src/progressCore.ts and compares the two outputs.
//
//   dotnet run --project tools/progress-parity -- <sequences.json>
//
// Input: [[{ "op": "record", "c": "two-sum", "lang": "csharp", "passed": true, "mode": "bare" },
//          { "op": "reveal", "c": ..., "lang": ... }, { "op": "advance", "hours": 24 },
//          { "op": "reset", "c": ... }, { "op": "resetAll" }], ...]
// ProgressService reads DateTime.UtcNow, so "advance" moves every stored time back instead,
// which is the same thing as the clock moving forward. Times are printed as hours before now.
using System.Text.Json;
using DsaAcademy.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

const string User = "parity";
var sequences = JsonSerializer.Deserialize<List<List<JsonElement>>>(File.ReadAllText(args[0]))!;
var output = new List<List<object>>();

foreach (var events in sequences)
{
    using var connection = new SqliteConnection("Data Source=:memory:");
    connection.Open();
    var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options;
    using (var setup = new AppDbContext(options)) setup.Database.EnsureCreated();

    var snapshots = new List<object>();
    foreach (var e in events)
    {
        // A fresh context per event, like one per request.
        using (var db = new AppDbContext(options))
        {
            string Str(string name) => e.GetProperty(name).GetString()!;
            switch (Str("op"))
            {
                case "record":
                    var mode = e.TryGetProperty("mode", out var m) && m.ValueKind == JsonValueKind.String ? m.GetString() : null;
                    await ProgressService.RecordAttempt(db, User, Str("c"), Str("lang"), "code", e.GetProperty("passed").GetBoolean(), mode, default);
                    break;
                case "reveal":
                    await ProgressService.RecordReveal(db, User, Str("c"), Str("lang"), default);
                    break;
                case "advance":
                    var by = TimeSpan.FromHours(e.GetProperty("hours").GetDouble());
                    foreach (var r in db.ProgressEntries)
                    {
                        r.UpdatedAt -= by;
                        r.CompletedAt -= by;
                        r.NextReviewAt -= by;
                        r.SolutionRevealedAt -= by;
                        r.AssistedPassedAt -= by;
                        r.IndependentPassedAt -= by;
                        r.TimedPassedAt -= by;
                    }
                    await db.SaveChangesAsync();
                    break;
                case "reset":
                    var conceptId = Str("c");
                    db.ProgressEntries.RemoveRange(db.ProgressEntries.Where(p => p.UserId == User && p.ConceptId == conceptId));
                    await db.SaveChangesAsync();
                    break;
                case "resetAll":
                    db.ProgressEntries.RemoveRange(db.ProgressEntries.Where(p => p.UserId == User));
                    await db.SaveChangesAsync();
                    break;
            }
        }

        using (var db = new AppDbContext(options))
        {
            var rows = await db.ProgressEntries.Where(p => p.UserId == User).ToListAsync();
            var due = await ProgressService.GetDue(db, User, default);
            var now = DateTime.UtcNow;
            double? Ago(DateTime? t) => t is null ? null : Math.Round((now - t.Value).TotalHours, 2, MidpointRounding.AwayFromZero);
            snapshots.Add(new
            {
                rows = rows.OrderBy(r => r.ConceptId, StringComparer.Ordinal).ThenBy(r => r.Language, StringComparer.Ordinal).Select(r => new
                {
                    c = r.ConceptId,
                    lang = r.Language,
                    attempts = r.Attempts,
                    code = r.LastSubmittedCode,
                    completed = Ago(r.CompletedAt),
                    updated = Ago(r.UpdatedAt),
                    stage = r.ReviewStage,
                    next = Ago(r.NextReviewAt),
                    revealed = Ago(r.SolutionRevealedAt),
                    assisted = Ago(r.AssistedPassedAt),
                    independent = Ago(r.IndependentPassedAt),
                    timed = Ago(r.TimedPassedAt),
                }),
                evidence = rows.GroupBy(r => r.ConceptId).OrderBy(g => g.Key, StringComparer.Ordinal).Select(g => ProgressService.Evidence(g.Key, g)).Select(v => new
                {
                    c = v.ConceptId,
                    attempted = v.Attempted,
                    revealed = Ago(v.LastRevealedAt),
                    assisted = v.AssistedPass,
                    independent = v.IndependentPass,
                    timed = v.TimedPass,
                    unrecorded = v.UnrecordedPass,
                }),
                due = due.Select(d => new { c = d.ConceptId, since = Ago(d.DueSince), stage = d.Stage, overdue = d.DaysOverdue }),
            });
        }
    }
    output.Add(snapshots);
}

Console.WriteLine(JsonSerializer.Serialize(output));
