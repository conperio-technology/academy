namespace DsaAcademy.Content.Concepts;

public class InterGroupByLength : IConcept
{
    public string Id => "inter-group-by-length";
    public string Section => Basics.Section;
    public string Track => Inter.Track;
    public int Order => 1101;
    public string Title => "Group Words by Length";
    public string OneLiner => "Build a dictionary from each word length to the list of words with that length, keeping their original order.";
    public string KeyTakeaway =>
        "Grouping is a dictionary of lists: for each item, find its key and append it to that key's list, creating the " +
        "list the first time. LINQ does it with GroupBy(...).ToDictionary(...); Python with defaultdict(list) or " +
        "setdefault.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write GroupByLength(words), returning a dictionary whose keys are word lengths and whose values are the words " +
        "of that length, in the order they appeared. [\"fan\", \"pump\", \"cat\", \"valve\", \"gear\"] gives {3: [\"fan\", \"cat\"], " +
        "4: [\"pump\", \"gear\"], 5: [\"valve\"]}. Duplicates are kept, and an empty list gives an empty dictionary. (The " +
        "tests show the keys as strings, \"3\", because that's how JSON writes dictionary keys; your dictionary uses " +
        "ints.)\n\n" +
        "The loop version works in both languages: for each word, look up its length; if that key isn't in the " +
        "dictionary yet, add an empty list; then append the word. Python's collections.defaultdict(list) creates the " +
        "empty list for you, and dict.setdefault(key, []).append(word) does the same with a plain dict.\n\n" +
        "Then try the one-expression versions from the LINQ and Comprehensions lesson: words.GroupBy(w => w.Length) " +
        ".ToDictionary(g => g.Key, g => g.ToList()) in C#. GroupBy keeps the items in each group in their original " +
        "order. Python has no single built-in that groups without sorting first (itertools.groupby only groups " +
        "neighbours), so the loop with a defaultdict is the usual answer.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static Dictionary<int, List<string>> GroupByLength(string[] words)\n" +
            "    {\n" +
            "        var groups = new Dictionary<int, List<string>>();\n" +
            "        // TODO: add each word to the list for its length.\n" +
            "        return groups;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def group_by_length(words):\n" +
            "    groups = {}\n" +
            "    # TODO: add each word to the list for its length.\n" +
            "    return groups\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.GroupByLength",
        ["python"] = "group_by_length",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Basics.StrArray("fan", "pump", "cat", "valve", "gear"), "{\"3\": [\"fan\", \"cat\"], \"4\": [\"pump\", \"gear\"], \"5\": [\"valve\"]}"),
        new TestCase(Basics.StrArray(), "{}"),
        new TestCase(Basics.StrArray("a"), "{\"1\": [\"a\"]}"),
        new TestCase(Basics.StrArray("ab", "ab", "c"), "{\"2\": [\"ab\", \"ab\"], \"1\": [\"c\"]}"),
        new TestCase(Basics.StrArray("motor", "relay", "fuse", "plc"), "{\"5\": [\"motor\", \"relay\"], \"4\": [\"fuse\"], \"3\": [\"plc\"]}"),
    ];

    public string CSharpCallTemplate => "Solution.GroupByLength({input})";
    public string PythonCallTemplate => "group_by_length({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] words = ["fan", "pump", "cat", "valve", "gear"];
        var groups = new Dictionary<int, List<string>>();
        var steps = new List<VisualizationStep> { Basics.Step(words, [], "{}", "groups", "Start with an empty dictionary of lists.") };
        for (var i = 0; i < words.Length; i++)
        {
            var w = (string)words[i];
            var isNew = !groups.ContainsKey(w.Length);
            if (isNew) groups[w.Length] = [];
            groups[w.Length].Add(w);
            var shown = "{" + string.Join(", ", groups.Select(kv => $"{kv.Key}: [{string.Join(", ", kv.Value)}]")) + "}";
            steps.Add(Basics.Step(words, [i], shown, "groups",
                isNew ? $"\"{w}\" has length {w.Length}, a new key: start an empty list and add it." : $"\"{w}\" has length {w.Length}: append it to that list."));
        }
        return steps;
    }
}
