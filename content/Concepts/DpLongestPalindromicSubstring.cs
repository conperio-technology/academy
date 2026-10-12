namespace DsaAcademy.Content.Concepts;

public class DpLongestPalindromicSubstring : IConcept
{
    public string Id => "dp-longest-palindromic-substring";
    public string Track => "dynamic-programming";
    public string Title => "Interval DP: Longest Palindromic Substring";
    public string OneLiner => "Whether a whole SUBSTRING is a palindrome depends on whether the substring one character shorter, INSIDE it, already was -- the interval-DP shape: solve small ranges first, use them to answer bigger ranges.";
    public string KeyTakeaway =>
        "isPalin(i, j) (\"is s[i..j] a palindrome\") is true exactly when the outer characters match " +
        "(s[i] == s[j]) AND the INNER substring s[i+1..j-1] is also a palindrome -- so processing " +
        "every substring in order of INCREASING LENGTH guarantees the shorter inner answer is already " +
        "known by the time a longer interval needs it. This returns the LENGTH of the longest " +
        "palindromic substring, not the substring itself, since more than one substring can tie for " +
        "longest (e.g. \"bab\" and \"aba\" inside \"babad\") and only the length has one unambiguous " +
        "right answer.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Every DP concept so far in this app has built a 1-D array where each cell depends on one or " +
        "two PRIOR cells. Interval DP is the same overlapping-subproblems idea applied to RANGES " +
        "[i, j] of the input instead of single positions -- and the classic example is checking every " +
        "substring of a string for whether it's a palindrome.\n\n" +
        "The recurrence: a substring s[i..j] is a palindrome if its outer characters match " +
        "(s[i] == s[j]) AND everything INSIDE those two characters, s[i+1..j-1], is itself a " +
        "palindrome. That inner check is a SMALLER interval -- so if every interval is processed in " +
        "order of increasing LENGTH (all length-1 intervals first, then all length-2, then " +
        "length-3, ...), the inner answer a longer interval needs has always already been computed. " +
        "Every single character is trivially a palindrome of length 1 (the base case), and a 2-character " +
        "interval is a palindrome exactly when its two characters match (no room for an inner check).\n\n" +
        "This is genuinely a different shape from the DP concepts before it: the STATE isn't \"how far " +
        "into the input am I\" (a single index), it's \"which interval [i, j] am I asking about\" (two " +
        "indices), and the processing ORDER (shortest intervals first) matters just as much as the " +
        "recurrence itself -- checking a length-5 interval before its length-3 inner interval has been " +
        "computed would read a stale or missing answer.\n\n" +
        "Watch the highlighted window below sweep every interval in increasing-length order, and the " +
        "tracker update whenever a longer palindrome is found.";

    public List<string> RecognitionSignals =>
    [
        "The problem is about a CONTIGUOUS range (substring, subarray) rather than a subsequence, and whether a range \"works\" depends on whether a SMALLER range strictly inside it also worked.",
        "You catch yourself wanting to check every possible (i, j) pair -- that's the O(n^2) STATE space interval DP fills in, same way a 1-D dp array fills every index.",
    ];

    public List<string> Gotchas =>
    [
        "Processing order matters here in a way it didn't for earlier DP concepts: intervals MUST be handled shortest-to-longest, or a longer interval's inner lookup reads a cell that hasn't been filled in yet.",
        "The longest palindrome isn't always unique (\"babad\" has both \"bab\" and \"aba\" at length 3) -- this lesson deliberately asks for the LENGTH, not the substring itself, to sidestep that ambiguity entirely.",
    ];

    public List<string> ConfusableWith =>
    [
        "Dynamic Programming: Longest Increasing Subsequence (this track) is also \"build up from smaller answers,\" but its state is a single index, not a two-index interval, and order doesn't matter beyond left-to-right.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int LongestPalindromeLength(string s)\n" +
            "    {\n" +
            "        // TODO: dp[i][j] = true if s[i..j] is a palindrome. Base cases: every single\n" +
            "        // character (length 1) is a palindrome; a 2-character range is a palindrome iff\n" +
            "        // its two characters match. For longer ranges: dp[i][j] = s[i] == s[j] &&\n" +
            "        // dp[i+1][j-1]. Process ranges shortest-to-longest. Return the longest length found.\n" +
            "        return s.Length > 0 ? 1 : 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def longest_palindrome_length(s):\n" +
            "    # TODO: dp[i][j] = True if s[i..j] is a palindrome. Base cases: every single\n" +
            "    # character (length 1) is a palindrome; a 2-character range is a palindrome iff its\n" +
            "    # two characters match. For longer ranges: dp[i][j] = s[i] == s[j] and dp[i+1][j-1].\n" +
            "    # Process ranges shortest-to-longest. Return the longest length found.\n" +
            "    return 1 if len(s) > 0 else 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.LongestPalindromeLength",
        ["python"] = "longest_palindrome_length",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Str("babad"), "3"),
        new TestCase(Lit.Str("cbbd"), "2"),
        new TestCase(Lit.Str("a"), "1"),
        new TestCase(Lit.Str(""), "0"),
        new TestCase(Lit.Str("racecar"), "7"),
        new TestCase(Lit.Str("abcde"), "1"),
    ];

    public string CSharpCallTemplate => "Solution.LongestPalindromeLength({input})";
    public string PythonCallTemplate => "longest_palindrome_length({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const string word = "babad";
        var chars = word.ToCharArray();
        var n = chars.Length;
        var dp = new bool[n, n];
        var best = 0;
        var steps = new List<VisualizationStep>();

        for (var len = 1; len <= n; len++)
        {
            for (var i = 0; i + len - 1 < n; i++)
            {
                var j = i + len - 1;
                bool isPalin;
                string reason;

                if (len == 1)
                {
                    isPalin = true;
                    reason = $"length 1 -- a single character is always a palindrome.";
                }
                else if (len == 2)
                {
                    isPalin = chars[i] == chars[j];
                    reason = isPalin
                        ? $"'{chars[i]}' == '{chars[j]}' -- length-2 match."
                        : $"'{chars[i]}' != '{chars[j]}' -- not a palindrome.";
                }
                else
                {
                    isPalin = chars[i] == chars[j] && dp[i + 1, j - 1];
                    reason = chars[i] != chars[j]
                        ? $"'{chars[i]}' != '{chars[j]}' -- not a palindrome."
                        : dp[i + 1, j - 1]
                            ? $"'{chars[i]}' == '{chars[j]}' AND the inner range [{i + 1}..{j - 1}] was already a palindrome."
                            : $"'{chars[i]}' == '{chars[j]}' but the inner range [{i + 1}..{j - 1}] was NOT a palindrome.";
                }

                dp[i, j] = isPalin;
                var updated = isPalin && len > best;
                if (updated) best = len;

                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object>
                    {
                        ["array"] = chars.Select(c => (object)c.ToString()).ToArray(),
                        ["tracker"] = best,
                        ["trackerLabel"] = "longest palindrome length so far",
                    },
                    HighlightIndices: i == j ? [i] : [i, j],
                    Message: $"Check s[{i}..{j}] = \"{word[i..(j + 1)]}\": {reason}" + (updated ? $" New best length: {best}." : "")
                ));
            }
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object>
            {
                ["array"] = chars.Select(c => (object)c.ToString()).ToArray(),
                ["tracker"] = best,
                ["trackerLabel"] = "longest palindrome length so far",
            },
            HighlightIndices: [],
            Message: $"Done -- every interval checked shortest-to-longest. Longest palindromic substring length: {best}."
        ));

        return steps;
    }
}
