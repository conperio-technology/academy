namespace DsaAcademy.Content.Tools;

public class LangAsyncAdvancedTool : ITool
{
    public string Id => "lang-async-advanced";
    public string Section => "Programming in C# & Python";
    public string Track => "advanced";
    public int Order => 2200;
    public string Title => "Async in Depth: Cancellation, Timeouts and Streams";
    public string OneLiner => "What await does under the hood (the event loop and the compiler's state machine), cooperative cancellation with CancellationToken and task.cancel, timeouts, WhenAny and as_completed, limiting concurrency with semaphores, async streams, and handling several failures.";
    public string KeyTakeaway =>
        "Async is cooperative: work pauses only at await, and stops only when asked. Pass a CancellationToken down (or cancel the task), give every external call a timeout, cap concurrency with a semaphore, and never swallow cancellation. IAsyncEnumerable and async generators stream results as they arrive.";

    public ToolKind ToolKind => ToolKind.LangAsyncAdvanced;

    public string Explanation =>
        "The intermediate lesson showed async and await for overlapping waits. This one covers what production async code also needs: knowing what happens at an await, stopping work that's no longer wanted, giving up on calls that take too long, choosing the first result, limiting how many requests run at once, streaming results, and dealing with several failures together.\n\n" +
        "The two languages differ in one important way: C# continuations resume on thread-pool threads, while Python's event loop runs every task on one thread, so the rules for shared data differ too.\n\n" +
        "As with the basics lesson, there's no graded exercise because the sandbox doesn't allow tasks; every sample is a complete program to run with dotnet run or python.";
}
