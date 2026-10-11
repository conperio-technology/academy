namespace DsaAcademy.Content.Concepts;

public class InterSortByLength : IConcept
{
    public string Id => "inter-sort-by-length";
    public string Section => Basics.Section;
    public string Track => Inter.Track;
    public int Order => 1002;
    public string Title => "Sort by Length, Then Alphabetically";
    public string OneLiner => "Sort words shortest first, breaking ties alphabetically, using a key function or OrderBy and ThenBy.";
    public string KeyTakeaway =>
        "Sort by several things at once with OrderBy(...).ThenBy(...) in C#, or a key function that returns a tuple in " +
        "Python: sorted(words, key=lambda w: (len(w), w)). Tuples compare item by item, so the second item only breaks " +
        "ties.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write SortWords(words), returning a new list with the words ordered by length, shortest first, and words of " +
        "the same length in alphabetical order. [\"pear\", \"fig\", \"apple\", \"kiwi\"] gives [\"fig\", \"kiwi\", \"pear\", " +
        "\"apple\"]. Duplicates stay, and an empty list gives an empty list. All words are lowercase letters.\n\n" +
        "In C#, LINQ chains the two rules: words.OrderBy(w => w.Length).ThenBy(w => w, " +
        "StringComparer.Ordinal).ToList(). StringComparer.Ordinal compares by character code, the same as Python; the " +
        "default comparison follows the computer's culture, which agrees for plain lowercase letters but not for " +
        "everything.\n\n" +
        "In Python, pass a key function that returns a tuple: sorted(words, key=lambda w: (len(w), w)). Python compares " +
        "the tuples' first items (the lengths) and only looks at the second (the word) when the first are equal. Both " +
        "sorts are stable, but here the second key decides every tie anyway. Return a new list rather than sorting the " +
        "input in place.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static List<string> SortWords(string[] words)\n" +
            "    {\n" +
            "        // TODO: shortest first; same length in alphabetical order.\n" +
            "        return words.ToList();\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def sort_words(words):\n" +
            "    # TODO: shortest first; same length in alphabetical order.\n" +
            "    return list(words)\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.SortWords",
        ["python"] = "sort_words",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Basics.StrArray("pear", "fig", "apple", "kiwi"), "[\"fig\", \"kiwi\", \"pear\", \"apple\"]"),
        new TestCase(Basics.StrArray("bb", "a", "ccc", "aa", "c"), "[\"a\", \"c\", \"aa\", \"bb\", \"ccc\"]"),
        new TestCase(Basics.StrArray(), "[]"),
        new TestCase(Basics.StrArray("same", "same", "abc"), "[\"abc\", \"same\", \"same\"]"),
        new TestCase(Basics.StrArray("zeta", "alpha", "beta", "pi"), "[\"pi\", \"beta\", \"zeta\", \"alpha\"]"),
    ];

    public string CSharpCallTemplate => "Solution.SortWords({input})";
    public string PythonCallTemplate => "sort_words({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] before = ["pear", "fig", "apple", "kiwi"];
        object[] keys = ["(4, pear)", "(3, fig)", "(5, apple)", "(4, kiwi)"];
        object[] after = ["fig", "kiwi", "pear", "apple"];
        return
        [
            Basics.Step(before, [], "length, then word", "sort key", "Four words to sort: by length first, alphabetically when lengths tie."),
            Basics.Step(keys, [0, 3], "(length, word)", "sort key", "The key for each word is a pair. pear and kiwi both have length 4, so the word itself decides between them."),
            Basics.Step(after, [0], "3", "length", "fig is the only 3-letter word, so it's first."),
            Basics.Step(after, [1, 2], "4", "length", "kiwi before pear: same length, and k comes before p."),
            Basics.Step(after, [3], "5", "length", "apple is longest, so it's last, even though it's first alphabetically."),
        ];
    }
}
