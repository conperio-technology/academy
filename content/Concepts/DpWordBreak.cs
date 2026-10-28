namespace DsaAcademy.Content.Concepts;

public class DpWordBreak : IConcept
{
    public string Id => "dp-word-break";
    public string Track => "patterns";
    public string Title => "DP: Word Break";
    public string OneLiner => "Can a string be split into dictionary words? dp[i] says whether the first i characters can; it is true if some earlier split point j is true and s[j..i) is a word.";
    public string KeyTakeaway =>
        "Let dp[i] mean \"the prefix of length i can be segmented\". dp[0] is true (the empty prefix). dp[i] is " +
        "true if for some j < i, dp[j] is true and s[j..i) is in the dictionary (a hash set). The answer is " +
        "dp[n]. O(n²) substring checks (times the substring length), O(n) table.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given a string s and a list of words, return true if s can be split into a sequence of one or more " +
        "dictionary words, using a word as many times as you like. \"applepenapple\" with [\"apple\", \"pen\"] is " +
        "true (apple pen apple). \"catsandog\" with [\"cats\", \"dog\", \"sand\", \"and\", \"cat\"] is false: cats and " +
        "leaves og, cat sand leaves og.\n\n" +
        "Plain recursion tries every first word and recurses on the rest. It is correct but exponential, " +
        "because the same suffix gets re-solved down many paths: in \"aaaaaaaaaaaaaaaaaaaab\" with [\"a\", \"aa\", " +
        "\"aaa\"] it explores a huge number of splits before discovering the b makes all of them fail. The rest " +
        "of the string only depends on where you are, not how you got there, which is the signal for DP.\n\n" +
        "Define dp[i] = whether s[0..i), the first i characters, can be segmented. dp[0] = true: the empty " +
        "prefix needs no words. For each i from 1 to n, look at every split point j < i: if dp[j] is true and " +
        "the piece s[j..i) is a dictionary word, then dp[i] is true and you can stop looking. Put the words " +
        "in a hash set first so each lookup is O(1) on average (plus hashing the substring).\n\n" +
        "There are O(n²) pairs (j, i), and building each substring costs up to its length, so O(n³) in the " +
        "worst case, often described as O(n²) lookups. You can cut this by only trying lengths up to the " +
        "longest word. The table is O(n). Note that the empty string is trivially true here: zero words.\n\n" +
        "The visualization fills dp for \"leetcode\" with [\"leet\", \"code\"]. The array shows dp[0..8] as 1 " +
        "(true) and 0 (false).";

    public List<string> RecognitionSignals => [
        "\"Can the string be split, segmented or built from these pieces?\"",
        "Recursion on \"the rest of the string\" where the same suffix is reached many ways.",
        "A yes or no question over prefixes: dp over the prefix length.",
    ];

    public List<string> Gotchas => [
        "dp has n + 1 entries; dp[i] is about the first i characters, so the piece is s[j..i) (C# s[j..i], Python s[j:i]).",
        "Forgetting dp[0] = true means nothing can ever become true.",
        "Checking only the longest or the first matching word greedily fails (\"cars\" with [\"car\", \"ca\", \"rs\"] needs ca + rs).",
    ];

    public List<string> ConfusableWith => [
        "Coin Change asks for the fewest pieces summing to an amount; Word Break asks only whether the pieces can cover the string, and pieces must match the text exactly.",
        "Decode Ways also walks prefixes, but counts the splits and each piece is one or two digits.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static bool WordBreak(string s, string[] wordDict)\n" +
            "    {\n" +
            "        var words = new HashSet<string>(wordDict);\n" +
            "        var dp = new bool[s.Length + 1]; // dp[i]: the first i characters can be segmented\n" +
            "        dp[0] = true;\n" +
            "        // TODO: for i from 1 to s.Length, for j from 0 to i - 1:\n" +
            "        // if dp[j] and words contains s[j..i], set dp[i] = true and stop trying j.\n" +
            "        return false;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def word_break(s, word_dict):\n" +
            "    words = set(word_dict)\n" +
            "    dp = [False] * (len(s) + 1)  # dp[i]: the first i characters can be segmented\n" +
            "    dp[0] = True\n" +
            "    # TODO: for i from 1 to len(s), for j from 0 to i - 1:\n" +
            "    # if dp[j] and s[j:i] in words, set dp[i] = True and stop trying j.\n" +
            "    return False\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.WordBreak",
        ["python"] = "word_break",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("\"leetcode\", [\"leet\", \"code\"]", "true"),
        new TestCase("\"applepenapple\", [\"apple\", \"pen\"]", "true"),
        new TestCase("\"catsandog\", [\"cats\", \"dog\", \"sand\", \"and\", \"cat\"]", "false"),
        new TestCase("\"a\", [\"b\"]", "false"),
        new TestCase("\"aaaaaaa\", [\"aaaa\", \"aaa\"]", "true"),
        new TestCase("\"cars\", [\"car\", \"ca\", \"rs\"]", "true"),
        new TestCase("\"\", [\"a\"]", "true"),
        new TestCase("\"bb\", [\"a\", \"b\", \"bbb\"]", "true"),
        new TestCase("\"aaaaaaaaaaaaaaaaaaaab\", [\"a\", \"aa\", \"aaa\", \"aaaa\"]", "false"),
    ];

    public string CSharpCallTemplate => "Solution.WordBreak({input})";
    public string PythonCallTemplate => "word_break({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const string s = "leetcode";
        var words = new HashSet<string> { "leet", "code" };
        var dp = new int[s.Length + 1];
        dp[0] = 1;
        var steps = new List<VisualizationStep>
        {
            new(new() { ["array"] = dp.ToArray(), ["tracker"] = 0, ["trackerLabel"] = "i" }, [0], "s = \"leetcode\", words = [\"leet\", \"code\"]. dp[0] = 1: the empty prefix needs no words."),
        };
        for (var i = 1; i <= s.Length; i++)
        {
            for (var j = 0; j < i; j++)
            {
                if (dp[j] == 1 && words.Contains(s[j..i]))
                {
                    dp[i] = 1;
                    steps.Add(new(new() { ["array"] = dp.ToArray(), ["tracker"] = i, ["trackerLabel"] = "i" }, [j, i],
                        $"dp[{i}]: dp[{j}] is true and \"{s[j..i]}\" is a word, so the first {i} characters \"{s[..i]}\" can be split. dp[{i}] = 1."));
                    break;
                }
            }
            if (dp[i] == 0 && (i == 2 || i == 6))
                steps.Add(new(new() { ["array"] = dp.ToArray(), ["tracker"] = i, ["trackerLabel"] = "i" }, [i],
                    $"dp[{i}]: no split point j has dp[j] true and s[j..{i}) in the dictionary, so \"{s[..i]}\" can't be split. dp[{i}] stays 0."));
        }
        steps.Add(new(new() { ["array"] = dp.ToArray() }, [s.Length], $"dp[8] = {dp[8]}: \"leetcode\" splits as leet + code."));
        return steps;
    }
}
