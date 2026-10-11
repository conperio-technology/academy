namespace DsaAcademy.Content.Tools;

public class SolidPrinciplesTool : ITool
{
    public string Id => "solid-principles";
    public string Section => "Software Design & OOP";
    public string Track => "design patterns";

    // The design patterns track sits after the OOP basics (default Order 100).
    // 120 to 124 are reserved for the OOD walk-throughs.
    public int Order => 110;

    public string Title => "SOLID Principles: Five Smells and Their Fixes";
    public string OneLiner => "Each principle as a before and after in C#, plus the code smell that tells you it is being broken.";
    public string KeyTakeaway =>
        "SOLID is a set of reasons code becomes hard to change, not a checklist to satisfy. Learn the smell " +
        "first (a class that changes for two reasons, a switch that grows with every feature, an override that " +
        "throws, an interface full of NotImplementedException, a `new` buried inside business logic) and the " +
        "fix usually follows on its own.";

    public ToolKind ToolKind => ToolKind.SolidPrinciples;

    public string Explanation =>
        "SOLID is five principles Robert Martin collected for object oriented design: Single Responsibility, " +
        "Open/Closed, Liskov Substitution, Interface Segregation and Dependency Inversion. Each one names a " +
        "specific way code resists change. Most design patterns in the rest of this track exist because of one " +
        "of them: Strategy is Open/Closed applied, Adapter rescues you from a Dependency Inversion mismatch, and " +
        "Decorator lets you add behavior without editing a class that already works.\n\n" +
        "Pick a principle below. Each one shows a small C# class that breaks it, the refactored version (restructured without changing what it does), and the " +
        "smell you would notice in a real code review. The smell is the part worth memorizing: in an interview " +
        "you are rarely asked to recite a definition, but you are often handed code and asked what is wrong " +
        "with it.\n\n" +
        "A word of balance: every principle can be overapplied. Splitting a 40 line class into six interfaces " +
        "with one method each is not good design, it is indirection. Apply a principle when you can name the " +
        "change it protects you from.";
}
