namespace DsaAcademy.Content.Tools;

public class LangProfilingTool : ITool
{
    public string Id => "lang-profiling";
    public string Section => "Programming in C# & Python";
    public string Track => "advanced";
    public int Order => 2900;
    public string Title => "Profiling and Benchmarking";
    public string OneLiner => "Measuring instead of guessing: Stopwatch and perf_counter, warm-up and Release builds, BenchmarkDotNet and timeit, cProfile and the .NET diagnostic tools, and the performance traps that cause most slow code.";
    public string KeyTakeaway =>
        "Measure before and after every optimization. Benchmarks (BenchmarkDotNet, timeit) compare small pieces; profilers (cProfile, Visual Studio, dotnet-trace) show where a whole program spends its time. Most slow code is an O(n) operation inside a loop, repeated lazy queries, or one call per item where one call for all would do.";

    public ToolKind ToolKind => ToolKind.LangProfiling;

    public string Explanation =>
        "Performance work starts with measurement. This lesson covers timing code correctly (warm-up, Release builds, repetition), proper benchmarking with BenchmarkDotNet and timeit, finding hot spots with profilers, and the traps that turn up again and again in code reviews and interviews.\n\n" +
        "The exercise after it hands you a correct but slow function and asks you to make it fast enough to pass a large test.";
}
