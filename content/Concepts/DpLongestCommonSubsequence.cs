namespace DsaAcademy.Content.Concepts;

public class DpLongestCommonSubsequence : IConcept
{
    public string Id => "dp-longest-common-subsequence";
    public string Track => "patterns";
    public string Title => "2-D DP: Longest Common Subsequence";
    public string OneLiner => "The longest sequence of characters that appears in both strings in the same order (not necessarily adjacent) -- filled cell by cell in a prefix-by-prefix table.";
    public string KeyTakeaway =>
        "dp[i][j] = the LCS length of a's first i characters and b's first j. If a[i-1] == b[j-1], that " +
        "character extends the diagonal: dp[i-1][j-1] + 1. Otherwise drop the last character of one string " +
        "or the other: max(dp[i-1][j], dp[i][j-1]). Row 0 and column 0 are all 0.";
    public VisualizerKind VisualizerKind => VisualizerKind.Grid;

    public string Explanation =>
        "A subsequence keeps some characters of a string in their original order and deletes the rest: " +
        "\"ace\" is a subsequence of \"abcde\", \"aec\" is not. Given two strings, return the length of the " +
        "longest subsequence they share. For \"abcde\" and \"ace\" it's 3 (\"ace\" itself). This is the core " +
        "of diff tools: the lines two files have in common, in order, are their LCS, and everything else is " +
        "an insertion or a deletion.\n\n" +
        "Brute force would list all 2^n subsequences of one string. Instead, ask about prefixes and look only " +
        "at their last characters. Let dp[i][j] be the LCS length of a's first i characters and b's first j. " +
        "If a[i-1] == b[j-1], some longest common subsequence ends with that shared character, so dp[i][j] = " +
        "dp[i-1][j-1] + 1. If they differ, at least one of the two last characters isn't in the LCS, so " +
        "throw one away and keep the better result: dp[i][j] = max(dp[i-1][j], dp[i][j-1]). An empty prefix " +
        "shares nothing, so row 0 and column 0 are 0.\n\n" +
        "Fill the (len(a)+1) × (len(b)+1) table row by row, left to right; each cell needs only the cell " +
        "above, the cell to the left and the one up-left, which are already filled. The answer is the " +
        "bottom-right cell. That is O(n · m) time and space, and since a row only needs the row above it, " +
        "two rows (O(m) space) are enough when you only need the length.\n\n" +
        "Interviewers usually follow up by asking for the subsequence itself: keep the full table and walk " +
        "back from the bottom-right corner, moving diagonally (and collecting the character) when the " +
        "characters match, otherwise moving toward whichever neighbour, up or left, holds the larger value. " +
        "The visualization's last step highlights that path. Related problems with the same table: the " +
        "minimum deletions to make two strings equal (len(a) + len(b) - 2 × LCS), the shortest common " +
        "supersequence (len(a) + len(b) - LCS), and longest palindromic subsequence (LCS of a string and its " +
        "reverse).";

    public List<string> RecognitionSignals =>
    [
        "Two strings or sequences and \"longest\" something they share in order, where gaps are allowed (common subsequence, matching lines in a diff).",
        "The answer for two whole strings depends on the answer for their prefixes after dropping a last character from one or both.",
        "Problems phrased as \"minimum deletions to make them equal\" or \"shortest string containing both\" that reduce to LCS arithmetic.",
    ];

    public List<string> Gotchas =>
    [
        "A subsequence is not a substring. For longest common SUBSTRING, a mismatch resets the cell to 0 instead of taking max(up, left).",
        "The table has an extra row and column for the empty prefix, so cell (i, j) compares a[i-1] with b[j-1]. Off-by-one here is the most common bug.",
        "On a match, use the DIAGONAL plus 1, not max(up, left) plus 1 -- the latter can count the same character twice.",
    ];

    public List<string> ConfusableWith =>
    [
        "2-D DP: Edit Distance (this track) uses the same two-prefix table and fills it in the same order, but it MINIMIZES edits (1 + min of three neighbours on a mismatch) while LCS MAXIMIZES shared characters (max of two neighbours).",
        "Dynamic Programming: Longest Increasing Subsequence (Fundamentals) is also a \"longest subsequence\" problem, but over ONE sequence with a 1-D table.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int LongestCommonSubsequence(string a, string b)\n" +
            "    {\n" +
            "        // TODO: dp = new int[a.Length + 1, b.Length + 1] (row 0 and column 0\n" +
            "        // stay 0). For i from 1 to a.Length and j from 1 to b.Length: if\n" +
            "        // a[i-1] == b[j-1], dp[i, j] = dp[i-1, j-1] + 1; otherwise\n" +
            "        // dp[i, j] = Math.Max(dp[i-1, j], dp[i, j-1]). Return the\n" +
            "        // bottom-right cell.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def longest_common_subsequence(a, b):\n" +
            "    # TODO: dp is (len(a)+1) x (len(b)+1) zeros. For i in 1..len(a) and\n" +
            "    # j in 1..len(b): if a[i-1] == b[j-1], dp[i][j] = dp[i-1][j-1] + 1;\n" +
            "    # otherwise dp[i][j] = max(dp[i-1][j], dp[i][j-1]). Return the\n" +
            "    # bottom-right cell.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.LongestCommonSubsequence",
        ["python"] = "longest_common_subsequence",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.Str("abcde"), Lit.Str("ace")), "3"),
        new TestCase(Lit.Args(Lit.Str("abc"), Lit.Str("abc")), "3"),
        new TestCase(Lit.Args(Lit.Str("abc"), Lit.Str("def")), "0"),
        new TestCase(Lit.Args(Lit.Str(""), Lit.Str("abc")), "0"),
        new TestCase(Lit.Args(Lit.Str("AGGTAB"), Lit.Str("GXTXAYB")), "4"),
        new TestCase(Lit.Args(Lit.Str("abcba"), Lit.Str("abcbcba")), "5"),
        new TestCase(Lit.Args(Lit.Str("bsbininm"), Lit.Str("jmjkbkjkv")), "1"),
    ];

    public string CSharpCallTemplate => "Solution.LongestCommonSubsequence({input})";
    public string PythonCallTemplate => "longest_common_subsequence({input})";

    private static int[][] Cells(IEnumerable<(int R, int C)> cells) => cells.Select(p => new[] { p.R, p.C }).ToArray();

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const string a = "abcde", b = "ace";
        int n = a.Length, m = b.Length;
        var dp = new int[n + 1][];
        for (var i = 0; i <= n; i++) dp[i] = new int[m + 1];
        var filledRows = 0;

        var rowLabels = new[] { "-" }.Concat(a.Select(ch => ch.ToString())).ToArray();
        var colLabels = new[] { "-" }.Concat(b.Select(ch => ch.ToString())).ToArray();

        Dictionary<string, object> State(IEnumerable<(int R, int C)> highlight, IEnumerable<(int R, int C)> visited) => new()
        {
            ["grid"] = Enumerable.Range(0, n + 1)
                .Select(i => Enumerable.Range(0, m + 1).Select(j => i <= filledRows || j == 0 ? dp[i][j].ToString() : "").ToArray())
                .ToArray(),
            ["rowLabels"] = rowLabels,
            ["colLabels"] = colLabels,
            ["highlight"] = Cells(highlight),
            ["visited"] = Cells(visited),
        };

        var steps = new List<VisualizationStep>
        {
            new(
                State(Array.Empty<(int, int)>(), Array.Empty<(int, int)>()),
                [],
                $"Rows are prefixes of \"{a}\", columns are prefixes of \"{b}\" (\"-\" is the empty prefix). Row 0 and column 0 are 0: an empty string shares nothing."
            ),
        };

        for (var i = 1; i <= n; i++)
        {
            var matches = new List<(int R, int C)>();
            for (var j = 1; j <= m; j++)
            {
                if (a[i - 1] == b[j - 1])
                {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                    matches.Add((i, j));
                }
                else
                {
                    dp[i][j] = Math.Max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
            filledRows = i;
            var diagonals = matches.Select(p => (p.R - 1, p.C - 1)).ToList();
            steps.Add(new VisualizationStep(
                State(matches, diagonals),
                [],
                matches.Count > 0
                    ? $"Row {i} ('{a[i - 1]}'): it matches '{b[matches[0].C - 1]}' at column {matches[0].C}, so that cell (bright) is the up-left diagonal (green) + 1 = {dp[i][matches[0].C]}. Every other cell takes max(up, left)."
                    : $"Row {i} ('{a[i - 1]}'): '{a[i - 1]}' appears nowhere in \"{b}\", so every cell just copies max(up, left) -- this row equals the row above."
            ));
        }

        // Walk back from the bottom-right corner to recover one LCS.
        var path = new List<(int R, int C)>();
        var picked = new List<(int R, int C)>();
        var chars = new List<char>();
        int r = n, c = m;
        while (r > 0 && c > 0)
        {
            path.Add((r, c));
            if (a[r - 1] == b[c - 1])
            {
                picked.Add((r, c));
                chars.Add(a[r - 1]);
                r--;
                c--;
            }
            else if (dp[r - 1][c] >= dp[r][c - 1]) r--;
            else c--;
        }
        path.Add((r, c));
        chars.Reverse();

        steps.Add(new VisualizationStep(
            State(picked, path),
            [],
            $"The answer is the bottom-right cell: {dp[n][m]}. To recover the subsequence, walk back from there: on a match step diagonally and keep the character (bright), otherwise step toward the larger of up and left. Reading the kept characters backwards gives \"{new string(chars.ToArray())}\"."
        ));
        return steps;
    }
}
