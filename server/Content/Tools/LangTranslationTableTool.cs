namespace DsaAcademy.Content.Tools;

public class LangTranslationTableTool : ITool
{
    public string Id => "lang-cheat-translate";
    public string Section => "Programming in C# & Python";
    public string Track => "cheat sheets";
    public int Order => 5002;
    public string Title => "C# vs Python Translation Table";
    public string OneLiner => "The same task in both languages, side by side: for reading code in the language you know less, or switching languages before an interview.";
    public string KeyTakeaway =>
        "Most ideas map one to one (List and list, Dictionary and dict, HashSet and set, LINQ and comprehensions, " +
        "PriorityQueue and heapq). The traps are where they differ: integer division and negative modulo, truthiness, " +
        "slices versus Substring, dictionary ordering, and Python's mutable default arguments.";

    public ToolKind ToolKind => ToolKind.LangTranslationTable;

    public string Explanation =>
        "Each row shows one task written in C# and in Python, using the idiomatic tools of each, not a word-for-word " +
        "translation. Every snippet runs as shown, with its output in the comments, and the two halves of a row produce " +
        "the same results unless a comment says otherwise. Search finds a keyword in either language, so typing " +
        "\"heapq\" or \"PriorityQueue\" finds the same row.\n\n" +
        "Print gives a landscape-friendly two-column copy without the controls. For one language at a time, use the C# " +
        "Cheat Sheet or the Python Cheat Sheet.";
}
