namespace DsaAcademy.Content.Tools;

public class DesignPatternQuizTool : ITool
{
    public string Id => "design-pattern-quiz";
    public string Section => "Software Design & OOP";
    public string Track => "design patterns";
    public int Order => 114;

    public string Title => "Which Pattern Is This? A Recognition Quiz";
    public string OneLiner => "Read a short scenario or snippet and name the design pattern, then see the signals that give it away and the sibling it is usually confused with.";
    public string KeyTakeaway =>
        "Patterns are recognized by intent, not by shape. A class that wraps another and forwards calls could be " +
        "an Adapter, a Decorator or a Proxy; the question that settles it is what the wrapper is for. Train " +
        "yourself to ask that question first.";

    public ToolKind ToolKind => ToolKind.DesignPatternQuiz;

    public string Explanation =>
        "Interviewers rarely ask you to define a pattern. They describe a problem or show you code and wait to " +
        "see whether you recognize it, and whether you can explain why it is that pattern and not its closest " +
        "sibling. This quiz drills exactly that, in the same format as the Pattern Recognition Drill for " +
        "algorithms.\n\n" +
        "Each question is a short scenario or a snippet. Pick the pattern; the options always include the one " +
        "it is most often confused with. After answering you see the signals that identify it and how to tell " +
        "it from that sibling. The end screen lists every question you missed, with a link to the lesson that " +
        "covers it, and lets you rerun only the misses.";
}
