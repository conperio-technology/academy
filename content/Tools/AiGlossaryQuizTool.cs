namespace DsaAcademy.Content.Tools;

public class AiGlossaryQuizTool : ITool
{
    public string Id => "ai-glossary-quiz";
    public string Section => "AI & Machine Learning";
    public string Track => "using AI";
    public int Order => 80;
    public string Title => "AI Glossary Quiz";
    public string OneLiner => "Ten questions drawn from the AI and machine learning terms in the Glossary: tokens, embeddings, RAG, LoRA, quantization and the rest.";
    public string KeyTakeaway =>
        "Most AI jargon is a short name for one idea from this section. If you can tell a token from an embedding, " +
        "fine-tuning from RAG, and temperature from top-p, you can follow nearly any conversation about AI tools.";

    public ToolKind ToolKind => ToolKind.AiGlossaryQuiz;

    public string Explanation =>
        "The terms live in the Glossary section under \"AI and machine learning\", so you can also search them there " +
        "and add them to your Flash Cards. This quiz draws only from that topic, and every wrong option is another AI " +
        "term, so you cannot rule options out because they are about something else.\n\n" +
        "Pick a direction, answer ten questions, and review the definitions of any you missed. Terms that have a " +
        "lesson in this section link back to it.";
}
