namespace DsaAcademy.Data;

// One row per (user, concept, language) the user has touched. Kept intentionally simple
// for Phase 0 -- spaced-repetition fields (NextReviewAt, EaseFactor, ...) get added in
// Phase 2 without needing to reshape this table.
//
// UserId is never authenticated by this app -- see Program.cs's CurrentUserId(): it's
// whatever a trusted upstream identity header says (populated by a reverse proxy that
// injects an identity header, when deployed behind one), or the literal string "guest"
// when there's no such header (any local/LAN run, since nothing injects it there).
// "guest" progress is intentionally a single shared bucket, not tied to any real
// person -- there's no way to tell two different guests apart without an identity.
public class ProgressEntry
{
    public int Id { get; set; }
    public required string UserId { get; set; }
    public required string ConceptId { get; set; }
    public required string Language { get; set; }
    public string? LastSubmittedCode { get; set; }
    public int Attempts { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Spaced repetition (see ProgressService): which rung of the review ladder this
    // completed row is on, and when it next comes due. Null NextReviewAt on a completed row
    // means it predates review tracking -- treated as due one day after CompletedAt.
    public int ReviewStage { get; set; }
    public DateTime? NextReviewAt { get; set; }

    // Evidence for the readiness view (see ProgressService.RecordAttempt). When the
    // reference solution was last shown in this language, and the first pass of each kind:
    // assisted (guided starter, or the reference seen in the last RevealCooldown), independent
    // (bare or timed starter with no recent reference) and timed (inside the mixed interview
    // set). A row completed before these columns existed has none of them set.
    public DateTime? SolutionRevealedAt { get; set; }
    public DateTime? AssistedPassedAt { get; set; }
    public DateTime? IndependentPassedAt { get; set; }
    public DateTime? TimedPassedAt { get; set; }
}
