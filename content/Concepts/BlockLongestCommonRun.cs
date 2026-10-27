namespace DsaAcademy.Content.Concepts;

public class BlockLongestCommonRun : BuildingBlock
{
    public override string Id => "block-longest-common-run";
    public override string Title => "Block: A 2-D DP Table Over Two Strings";
    public override string OneLiner => "Find the length of the longest substring two strings share, with a table indexed by prefixes of each.";
    public override string KeyTakeaway =>
        "For two sequences, make the table (n + 1) by (m + 1) so row 0 and column 0 mean \"empty prefix\", and compare a[i - 1] with b[j - 1]. That offset is where the bugs live.";

    public override string Explanation =>
        "Return the length of the longest contiguous run of characters that appears in both a and b. \"banana\" and \"ananas\" share \"anana\", length 5.\n" +
        "\n" +
        "dp[i][j] is the length of the common run ending exactly at a[i - 1] and b[j - 1]. If those characters match, the run extends the one ending one character earlier in both: dp[i - 1][j - 1] + 1. If they don't, no run ends here: 0. The answer is the largest entry. Longest Common Subsequence and Edit Distance use the same table and indexing with a different rule when characters differ.";

    protected override string[] Plan =>
    [
        "Make a table of (len(a) + 1) rows by (len(b) + 1) columns filled with 0; row 0 and column 0 stand for empty prefixes.",
        "Loop i over a and j over b, both starting from 1.",
        "If a[i - 1] equals b[j - 1], dp[i][j] = dp[i - 1][j - 1] + 1; otherwise it stays 0.",
        "Track the largest value seen.",
        "Return it.",
    ];

    protected override string CSharpSignature => "public static int LongestCommonRun(string a, string b)";
    protected override string CSharpReturnStub => "return 0;";
    protected override string PythonSignature => "def longest_common_run(a, b):";
    protected override string PythonReturnStub => "return 0";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.LongestCommonRun",
        ["python"] = "longest_common_run",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("\"abcde\", \"abfce\"", "2"),
        new TestCase("\"\", \"a\"", "0"),
        new TestCase("\"abc\", \"abc\"", "3"),
        new TestCase("\"xyz\", \"abc\"", "0"),
        new TestCase("\"banana\", \"ananas\"", "5"),
        new TestCase("\"abab\", \"baba\"", "3"),
    ];

    public override string CSharpCallTemplate => "Solution.LongestCommonRun({input})";
    public override string PythonCallTemplate => "longest_common_run({input})";

    public override List<string> Gotchas =>
    [
        "Comparing a[i] with b[j] in a table that has the extra empty row and column, which is off by one.",
        "Carrying the best value forward when characters differ (that is the subsequence rule, not the substring one).",
    ];
}
