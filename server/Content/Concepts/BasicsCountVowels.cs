namespace DsaAcademy.Content.Concepts;

public class BasicsCountVowels : IConcept
{
    public string Id => "basics-count-vowels";
    public string Section => Basics.Section;
    public string Track => "basics";
    public int Order => 21;
    public string Title => "Count the Vowels";
    public string OneLiner => "Walk through a string one character at a time and count the ones that are vowels, ignoring case.";
    public string KeyTakeaway =>
        "Looping over a string gives you its characters one by one. Normalise case once (lowercase the character) and test " +
        "membership in a small set of allowed characters, instead of writing ten separate comparisons.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Return how many vowels (a, e, i, o, u, upper or lower case) a string contains. \"y\" doesn't count. An empty " +
        "string has 0.\n\n" +
        "Loop over the characters with foreach (char c in text) or for c in text. For each one, turn it to lowercase " +
        "(char.ToLower(c) in C#, c.lower() in Python) and check whether it's one of the vowels: \"aeiou\".Contains(...) " +
        "in C#, ... in \"aeiou\" in Python. Keep a counter that starts at 0.\n\n" +
        "Once that works, try a one-liner: text.Count(c => \"aeiouAEIOU\".Contains(c)) with LINQ in C#, or " +
        "sum(1 for c in text.lower() if c in \"aeiou\") in Python.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int CountVowels(string text)\n" +
            "    {\n" +
            "        // TODO: count a, e, i, o, u in either case.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def count_vowels(text):\n" +
            "    # TODO: count a, e, i, o, u in either case.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CountVowels",
        ["python"] = "count_vowels",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Str("hello"), "2"),
        new TestCase(Lit.Str(""), "0"),
        new TestCase(Lit.Str("AEIOU aeiou"), "10"),
        new TestCase(Lit.Str("rhythm"), "0"),
        new TestCase(Lit.Str("Programming in C#"), "4"),
    ];

    public string CSharpCallTemplate => "Solution.CountVowels({input})";
    public string PythonCallTemplate => "count_vowels({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const string sample = "Pump On";
        var chars = Basics.Chars(sample);
        var steps = new List<VisualizationStep> { Basics.Step(chars, [], 0, "vowels", $"Count the vowels in \"{sample}\". Start the count at 0.") };
        var count = 0;
        for (var i = 0; i < sample.Length; i++)
        {
            var lower = char.ToLower(sample[i]);
            var isVowel = "aeiou".Contains(lower);
            if (isVowel) count++;
            steps.Add(Basics.Step(chars, [i], count, "vowels",
                sample[i] == ' ' ? "A space: not a vowel." :
                isVowel ? $"'{sample[i]}' lowercases to '{lower}', which is in \"aeiou\": count is now {count}." :
                $"'{sample[i]}' lowercases to '{lower}': not a vowel."));
        }
        steps.Add(Basics.Step(chars, [], count, "vowels", $"Every character checked once: {count} vowels."));
        return steps;
    }
}
