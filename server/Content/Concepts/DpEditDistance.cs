namespace DsaAcademy.Content.Concepts;

public class DpEditDistance : IConcept
{
    public string Id => "dp-edit-distance";
    public string Track => "patterns";
    public string Title => "2-D DP: Edit Distance";
    public string OneLiner => "The fewest single-character inserts, deletes and replaces to turn one word into another -- the classic two-string DP table.";
    public string KeyTakeaway =>
        "dp[i][j] = the cost to turn the first i characters of a into the first j characters of b. If " +
        "a[i-1] == b[j-1] it's free: dp[i-1][j-1]. Otherwise it's 1 + the cheapest of replace " +
        "(dp[i-1][j-1]), delete (dp[i-1][j]) and insert (dp[i][j-1]). Row 0 and column 0 are just 0..n.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Spell-check suggestions, diff tools and DNA alignment all need a number for \"how different are these " +
        "two strings?\". Edit distance (Levenshtein distance) is the minimum number of single-character " +
        "edits -- insert, delete or replace -- that turns one into the other. kitten → sitting is 3: replace " +
        "k with s, replace e with i, insert g.\n\n" +
        "Whenever a problem compares two sequences, try a 2-D table indexed by \"how much of each have I " +
        "used\". Here dp[i][j] is the edit distance between a's first i characters and b's first j. The edges " +
        "are easy: turning i characters into nothing takes i deletes, so dp[i][0] = i, and dp[0][j] = j " +
        "inserts. For any other cell, look at the last characters. If they match, they cost nothing and " +
        "dp[i][j] = dp[i-1][j-1]. If they don't, the last step was one of three edits: replace a's last " +
        "character with b's (1 + dp[i-1][j-1]), delete a's last character (1 + dp[i-1][j]), or insert b's " +
        "last character (1 + dp[i][j-1]). Take the cheapest.\n\n" +
        "Fill the table row by row, left to right, so every cell's three neighbours (up, left, up-left) are " +
        "already known. The answer is the bottom-right cell, dp[len(a)][len(b)]. Since each row only needs " +
        "the row above, you can keep just two rows if memory matters.\n\n" +
        "The visualization fills the table for kitten → sitting one row at a time.";

    public List<string> RecognitionSignals =>
    [
        "Two strings or sequences are compared and the answer is a minimum number of operations, or a longest common something.",
        "A choice at the END of both sequences (match them, or drop one character from either) reduces the problem to smaller prefixes of the same two sequences.",
    ];

    public List<string> Gotchas =>
    [
        "The table is (len(a)+1) × (len(b)+1): row and column 0 represent the EMPTY prefix, which is why dp[i][j] compares a[i-1] with b[j-1].",
        "Initialize the first row and column to 0, 1, 2, ... -- leaving them at 0 makes turning \"abc\" into \"\" look free.",
        "On a match, don't add 1, and don't take the min with the other two either -- dp[i-1][j-1] is already optimal there.",
    ];

    public List<string> ConfusableWith =>
    [
        "Dynamic Programming: Longest Increasing Subsequence (Fundamentals) works over ONE sequence with a 1-D table; two sequences almost always mean a 2-D table like this one.",
        "0/1 Knapsack (this track) is also a 2-D table at heart (items × capacity), but its second dimension is a budget, not a second string.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int MinDistance(string a, string b)\n" +
            "    {\n" +
            "        // TODO: dp = new int[a.Length + 1, b.Length + 1]. dp[i, 0] = i and\n" +
            "        // dp[0, j] = j. For every other cell: if a[i-1] == b[j-1],\n" +
            "        // dp[i, j] = dp[i-1, j-1]; otherwise 1 + the min of dp[i-1, j-1]\n" +
            "        // (replace), dp[i-1, j] (delete) and dp[i, j-1] (insert).\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def min_distance(a, b):\n" +
            "    # TODO: dp is (len(a)+1) x (len(b)+1). dp[i][0] = i and dp[0][j] = j.\n" +
            "    # For every other cell: if a[i-1] == b[j-1], dp[i][j] = dp[i-1][j-1];\n" +
            "    # otherwise 1 + min(dp[i-1][j-1] (replace), dp[i-1][j] (delete),\n" +
            "    # dp[i][j-1] (insert)).\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MinDistance",
        ["python"] = "min_distance",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.Str("kitten"), Lit.Str("sitting")), "3"),
        new TestCase(Lit.Args(Lit.Str("horse"), Lit.Str("ros")), "3"),
        new TestCase(Lit.Args(Lit.Str("intention"), Lit.Str("execution")), "5"),
        new TestCase(Lit.Args(Lit.Str(""), Lit.Str("abc")), "3"),
        new TestCase(Lit.Args(Lit.Str("same"), Lit.Str("same")), "0"),
        new TestCase(Lit.Args(Lit.Str("abc"), Lit.Str("")), "3"),
    ];

    public string CSharpCallTemplate => "Solution.MinDistance({input})";
    public string PythonCallTemplate => "min_distance({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const string a = "kitten", b = "sitting";
        var prev = Enumerable.Range(0, b.Length + 1).ToArray();
        var steps = new List<VisualizationStep>
        {
            new(
                State: new Dictionary<string, object> { ["array"] = prev.Select(v => (object)v).ToArray(), ["tracker"] = 0, ["trackerLabel"] = "row i (characters of \"kitten\" used)" },
                HighlightIndices: [],
                Message: "Row 0: turning the empty string into the first j characters of \"sitting\" takes j inserts."
            ),
        };

        for (var i = 1; i <= a.Length; i++)
        {
            var row = new int[b.Length + 1];
            row[0] = i;
            var matches = new List<int>();
            for (var j = 1; j <= b.Length; j++)
            {
                if (a[i - 1] == b[j - 1])
                {
                    row[j] = prev[j - 1];
                    matches.Add(j);
                }
                else
                {
                    row[j] = 1 + Math.Min(prev[j - 1], Math.Min(prev[j], row[j - 1]));
                }
            }
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = row.Select(v => (object)v).ToArray(), ["tracker"] = i, ["trackerLabel"] = $"row i (\"{a[..i]}\")" },
                HighlightIndices: matches.ToArray(),
                Message: matches.Count > 0
                    ? $"Row {i} ('{a[i - 1]}'): highlighted cells are where '{a[i - 1]}' matches a letter of \"sitting\", so they copy the diagonal for free. Every other cell is 1 + min(up-left, up, left)."
                    : $"Row {i} ('{a[i - 1]}'): no letter of \"sitting\" matches '{a[i - 1]}', so every cell is 1 + min(replace, delete, insert)."
            ));
            prev = row;
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = prev.Select(v => (object)v).ToArray(), ["tracker"] = a.Length, ["trackerLabel"] = "row i (\"kitten\")" },
            HighlightIndices: [b.Length],
            Message: $"The bottom-right cell is the answer: \"kitten\" → \"sitting\" takes {prev[b.Length]} edits."
        ));
        return steps;
    }
}
