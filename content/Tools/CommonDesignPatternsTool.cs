namespace DsaAcademy.Content.Tools;

public class CommonDesignPatternsTool : ITool
{
    public string Id => "common-design-patterns";
    public string Section => "Software Design & OOP";
    public string Track => "oop";
    public string Title => "A Few Design Patterns Worth Knowing";
    public string OneLiner => "Not the full Gang-of-Four catalog (the 1994 book by four authors that named 23 classic patterns) -- just four patterns that show up constantly in real code, including this app's own.";
    public string KeyTakeaway =>
        "A design pattern isn't a library or a language feature -- it's a NAME for a recurring shape of " +
        "solution, useful specifically because naming it lets you say \"this needs a Strategy\" instead " +
        "of re-explaining the whole idea from scratch every time.";

    public ToolKind ToolKind => ToolKind.CommonDesignPatterns;

    public string Explanation =>
        "Design patterns aren't code you import or a language feature you turn on -- they're names for " +
        "shapes of solution that keep showing up once you've written enough software, useful mainly " +
        "because having a shared name for one lets a team talk about the design in one word instead of " +
        "re-deriving it from scratch in every code review. The full Gang-of-Four catalog runs to over " +
        "twenty patterns; four of them show up often enough to be worth knowing by name immediately, " +
        "and three of the four already have a real example living somewhere in this app.\n\n" +
        "Click through the four below -- each one gets a plain description, a small code sketch, and " +
        "(where it exists) the place this exact pattern already shows up elsewhere in this app or in " +
        "everyday code you've probably already written without naming it.\n\n" +
        "This lesson is the short introduction. The design patterns track right after it covers the SOLID " +
        "principles and seventeen patterns in depth (creational, structural and behavioral), and ends with a " +
        "recognition quiz; the links under the widget jump straight to each part.";
}
