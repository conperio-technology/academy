namespace DsaAcademy.Content.Tools;

public class GlossaryTool : ITool
{
    public string Id => "glossary-terms";
    public string Section => "Glossary";
    public string Track => "industry terms";
    public int Order => 1;
    public string Title => "Glossary of Industry Terms";
    public string OneLiner => "About 1,000 terms from algorithms to PLCs and AI, each in a sentence or two of plain English, searchable and filterable by topic.";
    public string KeyTakeaway =>
        "Most jargon names a simple idea. If you can say what a term means in one plain sentence and name a " +
        "related term it is often confused with, you understand it well enough to use it in a meeting or an interview.";

    public ToolKind ToolKind => ToolKind.Glossary;

    public string Explanation =>
        "Software and automation teams use a lot of shorthand: idempotent, p99, blue-green, SCADA, historian, " +
        "bar raiser. Hearing one you don't know can make a whole conversation hard to follow, and most of them " +
        "turn out to describe something simple.\n\n" +
        "Search by name or by words in the definition, or narrow the list to one topic. Each entry has a short " +
        "definition, related terms you can jump to, and, where the academy has one, a link to the lesson that " +
        "covers the idea in depth.\n\n" +
        "When you've read through a topic, use Flash Cards to make the terms stick and the Term Quiz to check " +
        "yourself.";
}
