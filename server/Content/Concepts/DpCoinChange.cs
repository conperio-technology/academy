namespace DsaAcademy.Content.Concepts;

public class DpCoinChange : IConcept
{
    public string Id => "dp-coin-change";
    public string Track => "patterns";
    public string Title => "Unbounded Knapsack: Coin Change";
    public string OneLiner => "The fewest coins that add up to an amount, when you can use each coin as many times as you like.";
    public string KeyTakeaway =>
        "dp[x] = the fewest coins that make x, with dp[0] = 0 and everything else \"impossible\" (infinity) to " +
        "start. For each amount x from 1 up, try every coin c ≤ x: dp[x] = min(dp[x], dp[x - c] + 1). " +
        "Looping UPWARD is what lets the same coin be reused -- the opposite of 0/1 knapsack.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Make 11 cents from coins of 1, 2 and 5 using as few coins as possible. Always grabbing the biggest " +
        "coin that fits (greedy) gives 5 + 5 + 1 = 3 coins, which happens to be right here -- but with coins " +
        "1, 3 and 4, greedy makes 6 as 4 + 1 + 1 (3 coins) when 3 + 3 (2 coins) is better. Greedy only works " +
        "for specially designed coin systems, so in general you need DP.\n\n" +
        "Build answers for every amount from 0 up to the target. dp[0] = 0 (no coins make nothing). For any " +
        "larger amount x, the last coin you used was some c, and before it you'd made x - c as cheaply as " +
        "possible, so dp[x] = 1 + the smallest dp[x - c] over all coins c that fit. Amounts that can't be " +
        "made stay at infinity; if dp[amount] is still infinity at the end, return -1.\n\n" +
        "Compare this with 0/1 knapsack, where the inner loop runs downward so each item is used at most " +
        "once. Here reading dp[x - c] from the SAME pass is exactly what we want: it may already include " +
        "coin c, which is what \"unlimited coins\" means. That one loop direction is the whole difference " +
        "between the two problems.\n\n" +
        "The visualization fills dp for coins [1, 2, 5] up to 11. A highlighted cell is the amount being " +
        "solved; \"∞\" means not reachable yet.";

    public List<string> RecognitionSignals =>
    [
        "Reach an exact total (amount, length, weight) using pieces you can reuse as often as you like, with the fewest pieces or the number of ways.",
        "A greedy \"take the biggest piece\" seems to work on the examples, but nothing guarantees it -- try a counterexample before trusting it.",
    ];

    public List<string> Gotchas =>
    [
        "Initialize dp[1..amount] to infinity (or amount + 1), not 0 -- otherwise every amount looks free.",
        "Only use dp[x - c] when it's reachable; infinity + 1 should stay infinity (or the sentinel must be large enough that +1 doesn't matter).",
        "Return -1 when dp[amount] is still the sentinel; amount 0 always needs 0 coins.",
    ];

    public List<string> ConfusableWith =>
    [
        "0/1 Knapsack (this track): same table, but each item at most once, so its capacity loop runs DOWNWARD. Coin change lets coins repeat, so amounts are filled UPWARD and may reuse the coin just used.",
        "Climbing Stairs (Fundamentals) is the \"number of ways\" cousin with fixed step sizes 1 and 2 -- coin change generalizes the steps and asks for the minimum count instead.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int CoinChange(int[] coins, int amount)\n" +
            "    {\n" +
            "        // TODO: dp[x] = fewest coins making x. dp[0] = 0, the rest start\n" +
            "        // at int.MaxValue (unreachable). For x from 1 to amount, for each\n" +
            "        // coin c <= x with dp[x - c] reachable: dp[x] = min(dp[x], dp[x - c] + 1).\n" +
            "        // Return -1 if dp[amount] is still unreachable.\n" +
            "        return -1;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def coin_change(coins, amount):\n" +
            "    # TODO: dp[x] = fewest coins making x. dp[0] = 0, the rest start at\n" +
            "    # float('inf'). For x from 1 to amount, for each coin c <= x:\n" +
            "    # dp[x] = min(dp[x], dp[x - c] + 1). Return -1 if dp[amount] is\n" +
            "    # still infinite.\n" +
            "    return -1\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CoinChange",
        ["python"] = "coin_change",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 5]), Lit.Int(11)), "3"),
        new TestCase(Lit.Args(Lit.IntArray([1, 3, 4]), Lit.Int(6)), "2"),
        new TestCase(Lit.Args(Lit.IntArray([2]), Lit.Int(3)), "-1"),
        new TestCase(Lit.Args(Lit.IntArray([1]), Lit.Int(0)), "0"),
        new TestCase(Lit.Args(Lit.IntArray([186, 419, 83, 408]), Lit.Int(6249)), "20"),
        new TestCase(Lit.Args(Lit.IntArray([5, 10]), Lit.Int(3)), "-1"),
    ];

    public string CSharpCallTemplate => "Solution.CoinChange({input})";
    public string PythonCallTemplate => "coin_change({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] coins = [1, 2, 5];
        const int amount = 11;
        const int inf = int.MaxValue;
        var dp = Enumerable.Repeat(inf, amount + 1).ToArray();
        dp[0] = 0;
        object[] Snapshot() => dp.Select(v => v == inf ? (object)"∞" : v).ToArray();

        var steps = new List<VisualizationStep>
        {
            new(
                State: new Dictionary<string, object> { ["array"] = Snapshot() },
                HighlightIndices: [0],
                Message: "dp[x] = fewest coins (from 1, 2, 5) making x. Only dp[0] = 0 is known."
            ),
        };

        for (var x = 1; x <= amount; x++)
        {
            var bestCoin = 0;
            foreach (var c in coins)
            {
                if (c <= x && dp[x - c] != inf && dp[x - c] + 1 < dp[x])
                {
                    dp[x] = dp[x - c] + 1;
                    bestCoin = c;
                }
            }
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = Snapshot() },
                HighlightIndices: [x],
                Message: $"dp[{x}] = dp[{x} - {bestCoin}] + 1 = {dp[x]}: the best last coin is {bestCoin}."
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot() },
            HighlightIndices: [amount],
            Message: $"Done: {amount} needs {dp[amount]} coins (5 + 5 + 1)."
        ));
        return steps;
    }
}
