namespace DsaAcademy.Content.Concepts;

public class StringGroupAnagrams : IConcept
{
    public string Id => "string-group-anagrams";
    public string Track => "patterns";
    public string Title => "Hash Map: Group Anagrams";
    public string OneLiner => "Give every word a key that all of its anagrams share, then let a hash map do the grouping in one pass.";
    public string KeyTakeaway =>
        "Grouping by \"same up to rearrangement\" means finding a canonical form: a value that is identical " +
        "for every member of a group and different across groups. For anagrams that is the sorted word (or a " +
        "26-slot letter count). Use it as a hash map key and each word joins its group in one lookup, instead " +
        "of being compared against every other word.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given an array of lowercase words, group together the words that are anagrams of each other (the " +
        "same letters with the same counts, in any order) and return the groups. For [\"eat\", \"tea\", " +
        "\"tan\", \"ate\", \"nat\", \"bat\"] the groups are [eat, tea, ate], [tan, nat], and [bat]. The order of " +
        "the groups and of the words inside each group doesn't matter; the tests sort both before comparing.\n\n" +
        "The obvious approach compares every pair of words with an anagram check, which is O(n²) checks. The " +
        "better question is: what do anagrams have in common that you can compute from one word alone? Sort " +
        "the letters. \"eat\", \"tea\" and \"ate\" all sort to \"aet\", and no word outside that group does. " +
        "That sorted string is a canonical form, and canonical forms make perfect hash map keys.\n\n" +
        "So: make a map from key to list of words. For each word, compute its key, look it up, and append the " +
        "word to that list (creating the list the first time the key appears). At the end, the map's values " +
        "are the groups. Each word costs one sort of its letters, O(L log L) for a word of length L, so the " +
        "total is O(n · L log L).\n\n" +
        "If the alphabet is small and fixed, you can skip the sort: count each letter into a 26-slot array " +
        "and use the counts as the key (joined into a string like \"1#0#0#...\" in C#, or as a tuple in " +
        "Python). That is O(L) per word, so O(n · L) total. The separator matters: without one, counts of 1 " +
        "and 11 can run together and two different words can end up with the same key. Both keys work for " +
        "this lesson. The same idea (map each item to a canonical key) also groups shifted strings " +
        "(\"abc\", \"bcd\"), isomorphic words, and points on the same line.\n\n" +
        "The visualization shows the map's entries as each word is added.";

    public List<string> RecognitionSignals =>
    [
        "\"Group\", \"bucket\", or \"classify\" items that are equivalent under some rearrangement or transformation.",
        "A pairwise \"are these two the same kind?\" check exists, but comparing every pair would be O(n²).",
        "You can compute something from ONE item alone that is identical for every member of its group.",
    ];

    public List<string> Gotchas =>
    [
        "A list or array is not a usable dictionary key in either language: C# compares int[] by reference and Python can't hash a list. Convert to a string (or a tuple in Python).",
        "When you build a count-based key as a string, put a separator between the counts. Without one, different count arrays can produce the same string.",
        "Duplicates are real words too: [\"x\", \"x\"] is one group of two, not one group of one.",
    ];

    public List<string> ConfusableWith =>
    [
        "Hash Maps: Two Sum uses the map to remember values already seen so a later element can find its partner. Here the map is a bucketing tool: the key is computed, and every item lands in exactly one bucket.",
        "Sorting the whole input does not group anagrams, because \"ate\" and \"bat\" would sit next to each other. It's each WORD that gets sorted, to build its key.",
    ];

    // Group order and order inside each group aren't well-defined: different correct
    // implementations (and different map iteration orders) can return the same groups
    // in any order. The harness sorts each group, then sorts the groups, before comparing.
    public string? CSharpHarnessPreamble =>
        "public static class AnagramNormalizer\n" +
        "{\n" +
        "    public static List<List<string>> Normalize(List<List<string>> groups)\n" +
        "    {\n" +
        "        var sorted = groups.Select(g => { var c = new List<string>(g); c.Sort(string.CompareOrdinal); return c; }).ToList();\n" +
        "        sorted.Sort((a, b) =>\n" +
        "        {\n" +
        "            for (var i = 0; i < Math.Min(a.Count, b.Count); i++)\n" +
        "            {\n" +
        "                var cmp = string.CompareOrdinal(a[i], b[i]);\n" +
        "                if (cmp != 0) return cmp;\n" +
        "            }\n" +
        "            return a.Count - b.Count;\n" +
        "        });\n" +
        "        return sorted;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def normalize_groups(groups):\n" +
        "    return sorted(sorted(g) for g in groups)\n";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static List<List<string>> GroupAnagrams(string[] words)\n" +
            "    {\n" +
            "        // TODO: a Dictionary<string, List<string>> from key to group. For each\n" +
            "        // word, the key is its letters sorted (ToCharArray, Array.Sort, new\n" +
            "        // string). Append the word to that key's list, creating it if needed.\n" +
            "        // Return the dictionary's values as a list.\n" +
            "        return new List<List<string>>();\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def group_anagrams(words):\n" +
            "    # TODO: a dict from key to group. For each word, the key is its letters\n" +
            "    # sorted (\"\".join(sorted(word))). Append the word to that key's list,\n" +
            "    # creating it if needed. Return list(groups.values()).\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.GroupAnagrams",
        ["python"] = "group_anagrams",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Words("eat", "tea", "tan", "ate", "nat", "bat"), "[[\"ate\",\"eat\",\"tea\"],[\"bat\"],[\"nat\",\"tan\"]]"),
        new TestCase(Words(""), "[[\"\"]]"),
        new TestCase(Words("a"), "[[\"a\"]]"),
        new TestCase(Words("abc", "def", "ghi"), "[[\"abc\"],[\"def\"],[\"ghi\"]]"),
        new TestCase(Words("ab", "ba", "abc", "cab", "bca", "b"), "[[\"ab\",\"ba\"],[\"abc\",\"bca\",\"cab\"],[\"b\"]]"),
        new TestCase(Words("listen", "silent", "enlist", "google", "gogole"), "[[\"enlist\",\"listen\",\"silent\"],[\"gogole\",\"google\"]]"),
        new TestCase(Words("aab", "aba", "abb", "x", "x"), "[[\"aab\",\"aba\"],[\"abb\"],[\"x\",\"x\"]]"),
        new TestCase(Words(), "[]"),
    ];

    private static string Words(params string[] words) => "[" + string.Join(", ", words.Select(Lit.Str)) + "]";

    public string CSharpCallTemplate => "AnagramNormalizer.Normalize(Solution.GroupAnagrams({input}))";
    public string PythonCallTemplate => "normalize_groups(group_anagrams({input}))";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        string[] words = ["eat", "tea", "tan", "ate", "nat", "bat"];
        var groups = new Dictionary<string, List<string>>();
        var order = new List<string>();
        var steps = new List<VisualizationStep>();

        object[] Snapshot() => order.Select(key => (object)$"{key}: {string.Join(", ", groups[key])}").ToArray();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot() },
            HighlightIndices: [],
            Message: "Words: [eat, tea, tan, ate, nat, bat]. The map starts empty. Each cell below will be one entry, shown as key: group."
        ));

        foreach (var word in words)
        {
            var chars = word.ToCharArray();
            Array.Sort(chars);
            var key = new string(chars);
            var isNew = !groups.ContainsKey(key);
            if (isNew)
            {
                groups[key] = [];
                order.Add(key);
            }
            groups[key].Add(word);

            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = Snapshot(), ["tracker"] = key, ["trackerLabel"] = $"key for \"{word}\"" },
                HighlightIndices: [order.IndexOf(key)],
                Message: isNew
                    ? $"\"{word}\" sorts to \"{key}\". New key, so start a group: {key}: [{word}]."
                    : $"\"{word}\" sorts to \"{key}\", which is already in the map. Append it: {key}: [{string.Join(", ", groups[key])}]."
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot() },
            HighlightIndices: Enumerable.Range(0, order.Count).ToArray(),
            Message: $"Done in one pass. The map's values are the {order.Count} groups: {string.Join(", ", order.Select(k => $"[{string.Join(", ", groups[k])}]"))}."
        ));
        return steps;
    }
}
