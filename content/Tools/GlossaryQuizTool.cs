namespace DsaAcademy.Content.Tools;

public class GlossaryQuizTool : ITool
{
    public string Id => "glossary-quiz";
    public string Section => "Glossary";
    public string Track => "industry terms";
    public int Order => 3;
    public string Title => "Term Quiz";
    public string OneLiner => "Ten multiple-choice questions, term to definition or definition to term, with wrong answers from the same topic.";
    public string KeyTakeaway =>
        "Telling a term apart from its close neighbours (latency vs. throughput, PLC vs. RTU, authentication vs. " +
        "authorization) is the real test of understanding, so the wrong answers here always come from the same topic.";

    public ToolKind ToolKind => ToolKind.GlossaryQuiz;

    public string Explanation =>
        "Choose a topic, or all of them, and a direction. Term to definition shows a term and four definitions; " +
        "definition to term shows a definition and four terms. Every wrong option is from the same topic, so you " +
        "can't rule options out just because they're about something else.\n\n" +
        "At the end you get your score and every term you missed with its definition. Look those up in the " +
        "Glossary, then add them to your Flash Cards practice.";
}
