namespace DsaAcademy.Content.Tools;

public class LangErrorPatternsTool : ITool
{
    public string Id => "lang-error-patterns";
    public string Section => "Programming in C# & Python";
    public string Track => "advanced";
    public int Order => 2800;
    public string Title => "Error Handling Patterns: Exceptions, Results and Retries";
    public string OneLiner => "Designing exception hierarchies, guard clauses and failing fast, wrapping and chaining exceptions, exception filters, result types and the Try pattern, retries with exponential backoff and jitter, idempotency, and rules of thumb for real code.";
    public string KeyTakeaway =>
        "Throw early with a specific type, catch only what you can handle, and wrap low-level errors with context while keeping the cause. Return results when failure is an expected outcome. Retry only transient failures of idempotent operations, with backoff, jitter and a limit.";

    public ToolKind ToolKind => ToolKind.LangErrorPatterns;

    public string Explanation =>
        "The basics track showed how to throw and catch. This lesson is about using exceptions well in larger programs: what types to define, where to catch, how to add context without losing the original error, and when not to use exceptions at all.\n\n" +
        "It also covers the retry loop, one of the most common pieces of resilience code: which failures are worth retrying, why waits should grow exponentially with some randomness, and why only idempotent operations are safe to repeat. The two exercises after it build a retry helper and a result-returning validator.";
}
