namespace DsaAcademy.Runner;

// What one graded call sends back to the page (csharpWasmWorker.ts), as JSON: a compile
// error (or CodePolicy rejection) for the whole submission, or one test's result.
public record RunLine(string? CompileError, string? ActualJson, string? Error);

// How much text one result may carry back. Longer results are trimmed (a learner can
// return a 100 MB string).
public static class RunnerLimits
{
    public const int MaxResultChars = 64 * 1024;
}
