namespace DsaAcademy.Content.Concepts;

public class DpRegexMatching : IConcept
{
    public string Id => "dp-regex-matching";
    public string Track => "patterns";
    public string Title => "DP: Regular Expression Matching (. and *)";
    public string OneLiner => "Decide whether a pattern with . (any character) and * (zero or more of the previous element) matches a whole string, with a 2D table over prefixes of both.";
    public string KeyTakeaway =>
        "dp[i][j] says whether the first i characters of s match the first j of p. A normal character or . " +
        "must match s[i-1] and then dp[i-1][j-1]. For x*, either use it zero times (dp[i][j-2]) or, if x " +
        "matches s[i-1], use it once more and stay on the same pattern (dp[i-1][j]). Fill row 0 for patterns " +
        "like a*b* that match the empty string.";
    public VisualizerKind VisualizerKind => VisualizerKind.Grid;

    public string Explanation =>
        "Write IsMatch(s, p), which returns true when the pattern p matches the entire string s. The pattern " +
        "uses two special characters: . matches any single character, and * means zero or more of the element " +
        "just before it. So \"a*\" matches \"\", \"a\" and \"aaa\"; \".*\" matches anything; and \"c*a*b\" matches \"aab\" " +
        "because c* can match nothing. Every * in the tests follows a letter or a dot. The match must cover " +
        "all of s, not just part of it.\n\n" +
        "Trying options recursively works but explodes, because x* can stop after any number of characters. " +
        "The choices repeat, though: whether the rest matches depends only on where you are in s and where " +
        "you are in p. That is dynamic programming over two prefixes, the same shape as edit distance and " +
        "longest common subsequence.\n\n" +
        "Let dp[i][j] be true when s[0..i) matches p[0..j). dp[0][0] is true: empty matches empty. If p[j-1] " +
        "is a letter or ., it must match s[i-1], and the rest is dp[i-1][j-1]. If p[j-1] is *, look at the " +
        "element x = p[j-2] it repeats. Using x* zero times gives dp[i][j-2]. Using it at least once requires " +
        "x to match s[i-1] (x equals it, or x is .), and then dp[i-1][j]: one character of s is consumed, and " +
        "the same x* stays available for more. Row 0 needs filling too: dp[0][j] = dp[0][j-2] when p[j-1] is " +
        "*, so a*b*c* can match the empty string.\n\n" +
        "The answer is dp[len(s)][len(p)]. The visualization fills the table for s = \"aab\" and p = \"c*a*b\"; " +
        "rows are prefixes of s, columns prefixes of p, and 1 means they match.";

    public List<string> RecognitionSignals => [
        "Two strings where one is a pattern with wildcards, and the question is whether the whole of one matches the other.",
        "A choice that can repeat an unbounded number of times (here x*) that you can model as staying in the same column while moving down a row.",
    ];

    public List<string> Gotchas => [
        "Forgetting row 0: patterns such as a* or a*b* match the empty string, so dp[0][j] isn't always false.",
        "* applies to the element before it, so for the zero case go back two columns, j-2, not one.",
        "The match must be the whole string; a pattern that matches only a prefix returns false.",
    ];

    public List<string> ConfusableWith => [
        "Wildcard Matching (? and * where * matches any sequence on its own) uses a similar table, but its * doesn't depend on the previous character.",
        "Extract Error Codes uses a real regex engine; real engines add many more features, and some backtrack exponentially on patterns like (a+)+b, which a DP table never does.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static bool IsMatch(string s, string p)\n" +
            "    {\n" +
            "        int n = s.Length, m = p.Length;\n" +
            "        var dp = new bool[n + 1, m + 1];   // dp[i, j]: s[0..i) matches p[0..j)\n" +
            "        dp[0, 0] = true;\n" +
            "        // TODO: row 0: for j from 2, if p[j - 1] == '*', dp[0, j] = dp[0, j - 2].\n" +
            "        // TODO: for each i, j: a letter or '.' must match s[i - 1], then dp[i - 1, j - 1];\n" +
            "        // '*' is zero copies (dp[i, j - 2]) or one more copy if p[j - 2] matches s[i - 1] (dp[i - 1, j]).\n" +
            "        return dp[n, m];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def is_match(s, p):\n" +
            "    n, m = len(s), len(p)\n" +
            "    dp = [[False] * (m + 1) for _ in range(n + 1)]   # dp[i][j]: s[:i] matches p[:j]\n" +
            "    dp[0][0] = True\n" +
            "    # TODO: row 0: for j from 2, if p[j - 1] == \"*\", dp[0][j] = dp[0][j - 2].\n" +
            "    # TODO: for each i, j: a letter or \".\" must match s[i - 1], then dp[i - 1][j - 1];\n" +
            "    # \"*\" is zero copies (dp[i][j - 2]) or one more copy if p[j - 2] matches s[i - 1] (dp[i - 1][j]).\n" +
            "    return dp[n][m]\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.IsMatch",
        ["python"] = "is_match",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("\"aa\", \"a\"", "false"),
        new TestCase("\"aa\", \"a*\"", "true"),
        new TestCase("\"ab\", \".*\"", "true"),
        new TestCase("\"aab\", \"c*a*b\"", "true"),
        new TestCase("\"mississippi\", \"mis*is*p*.\"", "false"),
        new TestCase("\"\", \"\"", "true"),
        new TestCase("\"\", \"a*b*\"", "true"),
        new TestCase("\"a\", \"\"", "false"),
        new TestCase("\"ab\", \".*c\"", "false"),
        new TestCase("\"aaa\", \"a*a\"", "true"),
        new TestCase("\"aaa\", \"ab*a*c*a\"", "true"),
        new TestCase("\"abcd\", \"d*\"", "false"),
        new TestCase("\"a\", \"ab*\"", "true"),
        new TestCase("\"bbbba\", \".*a*a\"", "true"),
    ];

    public string CSharpCallTemplate => "Solution.IsMatch({input})";
    public string PythonCallTemplate => "is_match({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        var s = "aab";
        var p = "c*a*b";
        int n = s.Length, m = p.Length;
        var dp = new int[n + 1][];
        for (var r = 0; r <= n; r++) dp[r] = new int[m + 1];
        dp[0][0] = 1;
        var steps = new List<VisualizationStep>
        {
            new(new() { ["grid"] = dp.Select(r => r.ToArray()).ToArray(), ["highlight"] = new[] { new[] { 0, 0 } } }, [],
                "s = \"aab\" (rows 0 to 3) and p = \"c*a*b\" (columns 0 to 5). dp[0][0] = 1: the empty string matches the empty pattern."),
        };
        for (var j = 2; j <= m; j++)
        {
            if (p[j - 1] != '*') continue;
            dp[0][j] = dp[0][j - 2];
            steps.Add(new(new() { ["grid"] = dp.Select(r => r.ToArray()).ToArray(), ["highlight"] = new[] { new[] { 0, j } }, ["visited"] = new[] { new[] { 0, j - 2 } } }, [],
                $"Row 0, column {j}: p[..{j}) ends in {p[j - 2]}*, which can repeat zero times, so copy dp[0][{j - 2}] = {dp[0][j - 2]}."));
        }
        for (var i = 1; i <= n; i++)
        {
            for (var j = 1; j <= m; j++)
            {
                string why;
                var from = new List<int[]>();
                if (p[j - 1] == '*')
                {
                    var zero = dp[i][j - 2] == 1;
                    var more = (p[j - 2] == s[i - 1] || p[j - 2] == '.') && dp[i - 1][j] == 1;
                    dp[i][j] = zero || more ? 1 : 0;
                    from.Add([i, j - 2]);
                    if (p[j - 2] == s[i - 1] || p[j - 2] == '.') from.Add([i - 1, j]);
                    why = $"{p[j - 2]}* against '{s[i - 1]}': zero copies gives dp[{i}][{j - 2}] = {dp[i][j - 2]}" +
                        (p[j - 2] == s[i - 1] || p[j - 2] == '.' ? $"; {p[j - 2]} matches '{s[i - 1]}', so one more copy gives dp[{i - 1}][{j}] = {dp[i - 1][j]}" : $"; {p[j - 2]} doesn't match '{s[i - 1]}'");
                }
                else
                {
                    var ok = p[j - 1] == s[i - 1] || p[j - 1] == '.';
                    dp[i][j] = ok && dp[i - 1][j - 1] == 1 ? 1 : 0;
                    if (ok) from.Add([i - 1, j - 1]);
                    why = ok ? $"'{p[j - 1]}' matches '{s[i - 1]}', so take dp[{i - 1}][{j - 1}] = {dp[i - 1][j - 1]}" : $"'{p[j - 1]}' doesn't match '{s[i - 1]}': 0";
                }
                if (dp[i][j] == 1 || i == n)
                    steps.Add(new(new() { ["grid"] = dp.Select(r => r.ToArray()).ToArray(), ["highlight"] = new[] { new[] { i, j } }, ["visited"] = from.ToArray() }, [],
                        $"dp[{i}][{j}], \"{s[..i]}\" vs \"{p[..j]}\": {why}. Result {dp[i][j]}."));
            }
        }
        steps.Add(new(new() { ["grid"] = dp.Select(r => r.ToArray()).ToArray(), ["highlight"] = new[] { new[] { n, m } } }, [],
            $"dp[{n}][{m}] = {dp[n][m]}: \"aab\" matches \"c*a*b\" (c* zero times, a* twice, then b)."));
        return steps;
    }
}
