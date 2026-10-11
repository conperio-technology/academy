using Microsoft.EntityFrameworkCore;

namespace DsaAcademy.Data;

// Shared upsert used by both the C# execution endpoint (which runs code and records the
// result in one round trip) and the generic progress-record endpoint (used by languages
// that execute client-side, like Python via Pyodide, which can't run through the C#
// executor but still need the attempt/completion persisted).
//
// Also owns the spaced-repetition ladder. A first pass puts a lesson on rung 0, due after
// ReviewDays[0]. Passing it again WHILE IT IS DUE moves it one rung up (a longer gap);
// passing it early, or failing a run, changes nothing -- a failed run while you're
// experimenting in a lesson isn't a lapse, and re-running tests early shouldn't inflate
// the schedule. Rungs top out at the last interval, then repeat at that gap.
//
// And the evidence the readiness view shows: each pass is recorded as assisted or
// independent (and timed) depending on the starter it was made from and whether the
// reference solution was seen recently.
public static class ProgressService
{
    public static readonly int[] ReviewDays = [1, 3, 7, 14, 30];

    // A pass counts as independent only when it was made from the bare (signature only) or
    // timed starter AND the reference solution wasn't shown in any language of the lesson in
    // the last RevealCooldown. A week is long enough that re-solving it is recall, not copying.
    public static readonly TimeSpan RevealCooldown = TimeSpan.FromDays(7);

    // "guided" (the step-by-step TODO starter, also the default for older clients), "bare"
    // (signature only) or "timed" (the mixed interview set: blind and against the clock).
    public static string NormalizeMode(string? mode) => mode is "bare" or "timed" ? mode : "guided";

    public static DateTime? EffectiveNextReview(ProgressEntry e) =>
        e.CompletedAt is null ? null : e.NextReviewAt ?? e.CompletedAt.Value.AddDays(ReviewDays[0]);

    public static async Task RecordAttempt(
        AppDbContext db, string userId, string conceptId, string language, string code, bool passed, string? mode, CancellationToken ct)
    {
        var rows = await db.ProgressEntries
            .Where(p => p.UserId == userId && p.ConceptId == conceptId)
            .ToListAsync(ct);
        var entry = rows.FirstOrDefault(p => p.Language == language);

        if (entry is null)
        {
            entry = new ProgressEntry { UserId = userId, ConceptId = conceptId, Language = language, Attempts = 0 };
            db.ProgressEntries.Add(entry);
        }

        var now = DateTime.UtcNow;
        var wasCompleted = entry.CompletedAt is not null;
        var wasDue = wasCompleted && EffectiveNextReview(entry)!.Value <= now;

        entry.Attempts++;
        entry.LastSubmittedCode = code;
        entry.UpdatedAt = now;

        if (passed)
        {
            if (!wasCompleted)
            {
                entry.CompletedAt = now;
                entry.ReviewStage = 0;
                entry.NextReviewAt = now.AddDays(ReviewDays[0]);
            }
            else if (wasDue)
            {
                entry.ReviewStage = Math.Min(entry.ReviewStage + 1, ReviewDays.Length - 1);
                entry.NextReviewAt = now.AddDays(ReviewDays[entry.ReviewStage]);
            }

            var normalized = NormalizeMode(mode);
            var lastReveal = rows.Max(r => r.SolutionRevealedAt);
            var sawReference = lastReveal is not null && now - lastReveal.Value < RevealCooldown;
            if (normalized != "guided" && !sawReference)
            {
                entry.IndependentPassedAt ??= now;
                if (normalized == "timed") entry.TimedPassedAt ??= now;
            }
            else
            {
                entry.AssistedPassedAt ??= now;
            }
        }

        await db.SaveChangesAsync(ct);
    }

    // The learner opened the reference solution. Kept per language, most recent time only,
    // since only "was it seen recently" matters (see RevealCooldown).
    public static async Task RecordReveal(AppDbContext db, string userId, string conceptId, string language, CancellationToken ct)
    {
        var entry = await db.ProgressEntries
            .FirstOrDefaultAsync(p => p.UserId == userId && p.ConceptId == conceptId && p.Language == language, ct);
        if (entry is null)
        {
            entry = new ProgressEntry { UserId = userId, ConceptId = conceptId, Language = language, Attempts = 0 };
            db.ProgressEntries.Add(entry);
        }
        var now = DateTime.UtcNow;
        entry.SolutionRevealedAt = now;
        entry.UpdatedAt = now;
        await db.SaveChangesAsync(ct);
    }

    // What one lesson's rows (all languages) show about how it was practised. A completed row
    // with no pass kind recorded predates the evidence columns, so how it was passed is unknown.
    public static LessonEvidence Evidence(string conceptId, IEnumerable<ProgressEntry> rows)
    {
        var list = rows.ToList();
        return new LessonEvidence(
            conceptId,
            Attempted: list.Any(r => r.Attempts > 0),
            LastRevealedAt: list.Max(r => r.SolutionRevealedAt),
            AssistedPass: list.Any(r => r.AssistedPassedAt is not null),
            IndependentPass: list.Any(r => r.IndependentPassedAt is not null),
            TimedPass: list.Any(r => r.TimedPassedAt is not null),
            UnrecordedPass: list.Any(r => r.CompletedAt is not null && r.AssistedPassedAt is null && r.IndependentPassedAt is null));
    }

    // A concept is due for review only when EVERY language it's been completed in is due --
    // passing it again in any one language pushes that row out and takes the concept off
    // the queue, so a learner who knows both languages isn't asked to redo both.
    public static async Task<List<DueReview>> GetDue(AppDbContext db, string userId, CancellationToken ct)
    {
        var rows = await db.ProgressEntries
            .Where(p => p.UserId == userId && p.CompletedAt != null)
            .ToListAsync(ct);
        var now = DateTime.UtcNow;

        return rows
            .GroupBy(r => r.ConceptId)
            .Select(g => (ConceptId: g.Key, Next: g.Max(r => EffectiveNextReview(r)!.Value), Stage: g.Max(r => r.ReviewStage)))
            .Where(x => x.Next <= now)
            .Select(x => new DueReview(x.ConceptId, x.Next, x.Stage, Math.Max(0, (int)Math.Floor((now - x.Next).TotalDays))))
            .OrderBy(x => x.DueSince)
            .ToList();
    }
}

public record DueReview(string ConceptId, DateTime DueSince, int Stage, int DaysOverdue);

// Per lesson, for the readiness view and the lesson page. LastRevealedAt is the latest time the
// reference solution was shown in any language.
public record LessonEvidence(
    string ConceptId,
    bool Attempted,
    DateTime? LastRevealedAt,
    bool AssistedPass,
    bool IndependentPass,
    bool TimedPass,
    bool UnrecordedPass);
