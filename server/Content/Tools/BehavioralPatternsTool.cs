namespace DsaAcademy.Content.Tools;

public class BehavioralPatternsTool : ITool
{
    public string Id => "behavioral-patterns";
    public string Section => "Software Design & OOP";
    public string Track => "design patterns";
    public int Order => 113;

    public string Title => "Behavioral Patterns: Who Does What, and When";
    public string OneLiner => "Strategy, Observer, Command, State, Template Method, Iterator and Chain of Responsibility, with C# and the .NET features built on them.";
    public string KeyTakeaway =>
        "Behavioral patterns decide how responsibility and control flow are split between objects. Most of them " +
        "replace a growing if/else or switch with objects: one object per algorithm (Strategy), per state (State), " +
        "per request (Command) or per handler (Chain of Responsibility). If you can say which question a branch " +
        "is answering, you can usually say which pattern replaces it.";

    public ToolKind ToolKind => ToolKind.BehavioralPatterns;

    public string Explanation =>
        "These patterns are the ones you use every day in .NET without naming them. `foreach` runs on the " +
        "Iterator pattern. Every C# `event` is Observer. ASP.NET Core middleware is Chain of Responsibility. " +
        "`BackgroundService` is Template Method. Recognizing them in the framework is the fastest way to " +
        "remember them, and it gives you concrete answers when an interviewer asks \"where have you used this?\"\n\n" +
        "Two pairs here are the most confused in the whole catalog. Strategy and State have the same class " +
        "diagram; the difference is who picks the implementation (the caller, or the object itself as it moves " +
        "between states). Strategy and Template Method solve the same problem, varying one part of an " +
        "algorithm, with composition versus inheritance.\n\n" +
        "Pick a pattern. Each one shows the intent, when to use it and when not to, a small structure diagram, " +
        "idiomatic C#, where it already lives in .NET or this app, and the interview angle.";
}
