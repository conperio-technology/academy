namespace DsaAcademy.Content.Concepts;

public class BasicsReverseWords : IConcept
{
    public string Id => "basics-reverse-words";
    public string Section => Basics.Section;
    public string Track => "basics";
    public int Order => 22;
    public string Title => "Reverse the Words";
    public string OneLiner => "Split a sentence into words, reverse their order, and join them back with single spaces.";
    public string KeyTakeaway =>
        "Split, transform, join is the everyday shape of text processing. Splitting on runs of spaces (Split with " +
        "RemoveEmptyEntries in C#, split() with no argument in Python) takes care of extra spaces for you.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given a sentence, return the same words in reverse order, separated by single spaces. Extra spaces at the start, " +
        "the end, or between words should disappear: \"  hello   world \" becomes \"world hello\". A sentence with no " +
        "words gives an empty string. Words only contain letters; you're reversing the order of words, not the letters " +
        "inside them.\n\n" +
        "Three steps. Split the sentence into a list of words: in C# text.Split(' ', StringSplitOptions.RemoveEmptyEntries) " +
        "(without the option, double spaces produce empty strings), in Python text.split() with no argument, which splits " +
        "on any run of whitespace. Reverse the list: Array.Reverse(words) or a loop from the end in C#, words[::-1] or " +
        "reversed(words) in Python. Join with one space: string.Join(\" \", words) or \" \".join(words).";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static string ReverseWords(string text)\n" +
            "    {\n" +
            "        // TODO: split into words, reverse the order, join with single spaces.\n" +
            "        return text;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def reverse_words(text):\n" +
            "    # TODO: split into words, reverse the order, join with single spaces.\n" +
            "    return text\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ReverseWords",
        ["python"] = "reverse_words",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Str("the quick brown fox"), Lit.Str("fox brown quick the")),
        new TestCase(Lit.Str("  hello   world  "), Lit.Str("world hello")),
        new TestCase(Lit.Str("single"), Lit.Str("single")),
        new TestCase(Lit.Str(""), Lit.Str("")),
        new TestCase(Lit.Str("   "), Lit.Str("")),
        new TestCase(Lit.Str("a b c"), Lit.Str("c b a")),
    ];

    public string CSharpCallTemplate => "Solution.ReverseWords({input})";
    public string PythonCallTemplate => "reverse_words({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] words = ["start", "the", "pump"];
        object[] reversed = ["pump", "the", "start"];
        return
        [
            Basics.Step(["", "start", "", "the", "pump"], [0, 2], "\" start  the pump\"", "input",
                "Input \" start  the pump\" has a leading space and a double space. A plain Split(' ') or split(\" \") gives these five pieces, two of them empty."),
            Basics.Step(words, [0, 1, 2], "3 words", "after split", "Split with RemoveEmptyEntries (C#) or split() with no argument (Python) instead: the empty pieces are dropped, leaving three words."),
            Basics.Step(reversed, [0, 2], "3 words", "after reverse", "Reverse the list of words. The letters inside each word stay as they are."),
            Basics.Step(reversed, [], "\"pump the start\"", "result", "Join with single spaces: \"pump the start\"."),
        ];
    }
}
