namespace DsaAcademy.Content.Concepts;

public class BlockMinCostClimb : BuildingBlock
{
    public override string Id => "block-min-cost-climb";
    public override string Title => "Block: A 1-D DP Table (Bottom-Up)";
    public override string OneLiner => "Find the cheapest way to climb a staircase taking one or two steps at a time, filling a table from the bottom.";
    public override string KeyTakeaway =>
        "Bottom-up DP: say what dp[i] means in one sentence, fill the base cases, then fill each entry from the ones before it. Most 1-D DP bugs are an unclear meaning for dp[i].";

    public override string Explanation =>
        "cost[i] is what it costs to stand on step i (there are at least two steps). You can start on step 0 or step 1, and from any step climb one or two. Return the cheapest total to get past the last step. [10, 15, 20] costs 15: start on step 1 and climb two.\n" +
        "\n" +
        "Let dp[i] be the cheapest total to stand on step i. dp[0] = cost[0] and dp[1] = cost[1]; after that dp[i] = cost[i] + min(dp[i - 1], dp[i - 2]). The top is reached from either of the last two steps, so the answer is the smaller of those two. House Robber, Fibonacci and Decode Ways are this block with a different recurrence, and two variables can replace the array once it works.";

    protected override string[] Plan =>
    [
        "Make dp the same length as cost: dp[i] is the cheapest total to stand on step i.",
        "Fill the base cases: dp[0] = cost[0], dp[1] = cost[1].",
        "For each later step, dp[i] = cost[i] + the smaller of dp[i - 1] and dp[i - 2].",
        "The top is reached from either of the last two steps: return the smaller of those.",
    ];

    protected override string CSharpSignature => "public static int MinCostClimb(int[] cost)";
    protected override string CSharpReturnStub => "return 0;";
    protected override string PythonSignature => "def min_cost_climb(cost):";
    protected override string PythonReturnStub => "return 0";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MinCostClimb",
        ["python"] = "min_cost_climb",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("[10, 15, 20]", "15"),
        new TestCase("[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]", "6"),
        new TestCase("[0, 0]", "0"),
        new TestCase("[5, 3]", "3"),
        new TestCase("[1, 2, 3, 4]", "4"),
    ];

    public override string CSharpCallTemplate => "Solution.MinCostClimb({input})";
    public override string PythonCallTemplate => "min_cost_climb({input})";

    public override List<string> Gotchas =>
    [
        "Returning dp[n - 1] instead of the smaller of the last two entries.",
        "Starting the loop at 1 and reading dp[-1].",
    ];
}
