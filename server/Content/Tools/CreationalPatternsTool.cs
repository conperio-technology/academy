namespace DsaAcademy.Content.Tools;

public class CreationalPatternsTool : ITool
{
    public string Id => "creational-patterns";
    public string Section => "Software Design & OOP";
    public string Track => "design patterns";
    public int Order => 111;

    public string Title => "Creational Patterns: Controlling How Objects Get Made";
    public string OneLiner => "Factory Method, Abstract Factory, Builder, Singleton and Prototype, each with C#, a real .NET example and the interview angle.";
    public string KeyTakeaway =>
        "Creational patterns move the `new` keyword out of the code that uses an object. Once the caller only " +
        "asks for \"something that is an IShape\" or \"a configured HttpClient\", you can change which class gets " +
        "built, or how, in one place. In modern .NET the DI container already does a lot of this, so reach for " +
        "a hand written factory or singleton only when the container cannot express what you need.";

    public ToolKind ToolKind => ToolKind.CreationalPatterns;

    public string Explanation =>
        "Every object has to be constructed somewhere. When that construction is a plain `new Circle()` in the " +
        "middle of business logic, the business logic is now welded to the Circle class: it cannot be tested " +
        "with a fake, and adding a new shape means editing it. Creational patterns are the standard ways of " +
        "separating \"I need one of these\" from \"here is exactly how one gets built\".\n\n" +
        "The five here differ in what they hide. Factory Method hides which concrete class you get. Abstract " +
        "Factory hides which whole family of related classes you get, so they always match. Builder hides a " +
        "long, step by step construction behind readable calls. Singleton hides that there is only one " +
        "instance. Prototype hides construction entirely by copying an existing object.\n\n" +
        "Pick a pattern. Each one shows the intent, when to use it and when not to, a small structure diagram, " +
        "idiomatic C#, where you have already met it in .NET or in this app, and what interviewers actually " +
        "probe for.";
}
