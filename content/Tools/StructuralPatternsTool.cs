namespace DsaAcademy.Content.Tools;

public class StructuralPatternsTool : ITool
{
    public string Id => "structural-patterns";
    public string Section => "Software Design & OOP";
    public string Track => "design patterns";
    public int Order => 112;

    public string Title => "Structural Patterns: Wrapping and Composing Objects";
    public string OneLiner => "Adapter, Decorator, Facade, Proxy and Composite: five ways to put one object in front of, around or inside another.";
    public string KeyTakeaway =>
        "Three of these patterns look identical in code: a class that holds another object and forwards calls to " +
        "it. Tell them apart by intent. An Adapter changes the interface, a Decorator keeps the interface and adds " +
        "behavior, and a Proxy keeps the interface and controls access. Facade simplifies many objects into one, " +
        "and Composite lets one object and a tree of them be treated the same way.";

    public ToolKind ToolKind => ToolKind.StructuralPatterns;

    public string Explanation =>
        "Structural patterns are about how classes and objects are assembled into bigger structures. Almost all " +
        "of them rely on composition (an object holding a reference to another object) rather than inheritance, " +
        "which is why they are flexible: you can wrap, swap or stack them at runtime.\n\n" +
        "This family is where interview questions most often turn into \"what is the difference between\" " +
        "questions, because Adapter, Decorator and Proxy share the same shape. Read the \"often confused with\" " +
        "note under each one, then test yourself in the recognition quiz at the end of the track.\n\n" +
        "Pick a pattern. Each one shows the intent, when to use it and when not to, a small structure diagram, " +
        "idiomatic C#, a real .NET example (the Stream classes alone contain three of these five) and the " +
        "interview angle.";
}
