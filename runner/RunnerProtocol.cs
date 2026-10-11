namespace DsaAcademy.Runner;

// The wire format between the API (server/Execution/CSharpExecutor.cs) and this runner
// process. The API writes one RunRequest as JSON on stdin; the runner answers with one
// RunLine per line on stdout -- either a single CompileError line, or one result line per
// call, in order. Streaming one line per test (instead of one blob at the end) is what
// lets the API keep the results that finished before an infinite loop or a crash.
public record RunRequest(string Code, List<string> Calls);

public record RunLine(string? CompileError, string? ActualJson, string? Error);

// How much text one line may carry back. The runner trims anything longer (a learner
// can return a 100 MB string) and the API refuses to buffer more than MaxLineChars of a
// line either way -- JSON escaping can grow text up to 6x, hence the headroom.
public static class RunnerLimits
{
    public const int MaxResultChars = 64 * 1024;
    public const int MaxLineChars = 8 * MaxResultChars;
}
