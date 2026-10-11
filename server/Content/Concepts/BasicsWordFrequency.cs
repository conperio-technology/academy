namespace DsaAcademy.Content.Concepts;

public class BasicsWordFrequency : IConcept
{
    public string Id => "basics-word-frequency";
    public string Section => Basics.Section;
    public string Track => "basics";
    public int Order => 61;
    public string Title => "Word Frequency";
    public string OneLiner => "Count how many times each word appears using a dictionary, treating upper and lower case as the same word.";
    public string KeyTakeaway =>
        "The counting idiom: for each item, add 1 to its entry, starting it at 0 the first time. In C# use " +
        "counts[w] = counts.GetValueOrDefault(w) + 1; in Python counts[w] = counts.get(w, 0) + 1, or collections.Counter.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given a line of text made of letters and spaces, return a dictionary mapping each word, in lowercase, to the " +
        "number of times it appears. \"Go go GO\" gives {\"go\": 3}. Extra spaces don't create empty words, and text with no " +
        "words gives an empty dictionary.\n\n" +
        "Lowercase the text, split it into words (Split(' ', StringSplitOptions.RemoveEmptyEntries) in C#, split() in " +
        "Python), and count with a dictionary. The tricky part is the first time you see a word: reading a missing key " +
        "throws (KeyNotFoundException, KeyError). Either check first (ContainsKey / in), or read with a fallback " +
        "of 0: counts.GetValueOrDefault(word) + 1 in C#, counts.get(word, 0) + 1 in Python.\n\n" +
        "Python's standard library has this built in: collections.Counter(words) counts everything in one call, and " +
        "dict(Counter(words)) turns it into a plain dictionary. In C#, LINQ can do it in one expression: " +
        "words.GroupBy(w => w).ToDictionary(g => g.Key, g => g.Count()). Write the loop version first. The order of keys " +
        "in your dictionary doesn't matter to the tests.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static Dictionary<string, int> WordFrequency(string text)\n" +
            "    {\n" +
            "        var counts = new Dictionary<string, int>();\n" +
            "        // TODO: lowercase, split into words, count each one.\n" +
            "        return counts;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def word_frequency(text):\n" +
            "    counts = {}\n" +
            "    # TODO: lowercase, split into words, count each one.\n" +
            "    return counts\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.WordFrequency",
        ["python"] = "word_frequency",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Str("the cat and the hat"), "{\"the\": 2, \"cat\": 1, \"and\": 1, \"hat\": 1}"),
        new TestCase(Lit.Str("Go go GO"), "{\"go\": 3}"),
        new TestCase(Lit.Str(""), "{}"),
        new TestCase(Lit.Str("  a  b a "), "{\"a\": 2, \"b\": 1}"),
        new TestCase(Lit.Str("Pump"), "{\"pump\": 1}"),
    ];

    public string CSharpCallTemplate => "Solution.WordFrequency({input})";
    public string PythonCallTemplate => "word_frequency({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        string[] words = ["pump", "fan", "pump", "valve", "pump"];
        object[] arr = words;
        var steps = new List<VisualizationStep> { Basics.Step(arr, [], "{}", "counts", "The words, already lowercased and split. Start with an empty dictionary.") };
        var counts = new Dictionary<string, int>();
        for (var i = 0; i < words.Length; i++)
        {
            var w = words[i];
            var seen = counts.ContainsKey(w);
            counts[w] = counts.GetValueOrDefault(w) + 1;
            steps.Add(Basics.Step(arr, [i], "{" + string.Join(", ", counts.Select(kv => $"{kv.Key}: {kv.Value}")) + "}", "counts",
                seen ? $"\"{w}\" is already a key: add 1, now {counts[w]}." : $"\"{w}\" is new: it starts from 0 and becomes 1."));
        }
        return steps;
    }
}
