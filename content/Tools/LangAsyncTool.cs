namespace DsaAcademy.Content.Tools;

public class LangAsyncTool : ITool
{
    public string Id => "lang-async";
    public string Section => "Programming in C# & Python";
    public string Track => "intermediate";
    public int Order => 1800;
    public string Title => "Async and Await Basics";
    public string OneLiner => "Waiting without blocking: async methods and coroutines, await, Task.WhenAll versus asyncio.gather, sequential versus concurrent waits, when each language starts running an async call, and the common mistakes.";
    public string KeyTakeaway =>
        "await pauses a method until a result is ready while other work runs. Start independent operations first and await " +
        "them together (Task.WhenAll, asyncio.gather) so the waits overlap. A C# async method runs until its first await " +
        "when called; a Python coroutine doesn't start until it's awaited or scheduled and the event loop gets control.";

    public ToolKind ToolKind => ToolKind.LangAsync;

    public string Explanation =>
        "Programs that talk to networks, databases, files or devices spend most of their time waiting. Ordinary code " +
        "waits by blocking: the thread sits idle until the reply arrives. Asynchronous code instead starts the operation, " +
        "lets other work run, and resumes when the result is ready. With async/await this reads almost like ordinary " +
        "top-to-bottom code.\n\n" +
        "An async method returns a pending result straight away: a Task in C#, a coroutine in Python (which an event " +
        "loop, the scheduler that runs Python's async code, wraps in a task). Writing await in front of it pauses the " +
        "current method until the result is ready. The big win comes from starting several operations before awaiting " +
        "any of them, so their waits overlap.\n\n" +
        "The languages agree on the idea and differ in details that change the order of events, shown step by step in the " +
        "lesson: when an async call actually starts running, how the program's entry point starts the machinery, and " +
        "what happens if you forget to await. Async helps with waiting, not with heavy computation.\n\n" +
        "This is a first look with runnable samples; there's no graded exercise because the exercise sandbox doesn't " +
        "allow tasks. Stage 3 goes deeper, and async/await vs Threads in Concurrency & Memory explains what happens " +
        "underneath.";
}
