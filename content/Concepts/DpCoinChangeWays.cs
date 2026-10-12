namespace DsaAcademy.Content.Concepts;

// Transfer exercise after Coin Change: same unbounded table, but counting combinations instead of
// minimising, which makes the loop order (coins outside, amounts inside) part of the answer.
public class DpCoinChangeWays : IConcept
{
    public string Id => "dp-coin-change-ways";
    public string Track => "patterns";
    public string Title => "Transfer: Coin Change II, Count the Ways";
    public string OneLiner => "How many different combinations of coins make the amount? The same unbounded table as Coin Change, with min swapped for a sum and the loops in a deliberate order.";
    public string KeyTakeaway =>
        "ways[0] = 1, then for each coin c (outer loop) and each amount x from c up (inner loop): " +
        "ways[x] += ways[x - c]. Putting coins outside means every combination is built in one fixed coin " +
        "order, so 1 + 2 and 2 + 1 are counted once. Swap the loops and you count ordered sequences instead.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;
    public string? TransferOf => "dp-coin-change";

    public string Explanation =>
        "This follows Unbounded Knapsack: Coin Change with the question changed from \"fewest coins\" to " +
        "\"how many ways\". Given coin values (each usable any number of times) and an amount, return the " +
        "number of different combinations that add up to the amount. Order does not matter: 1 + 2 + 2 and " +
        "2 + 1 + 2 are the same combination. For coins [1, 2, 5] and amount 5 the answer is 4: 5, 2 + 2 + 1, " +
        "2 + 1 + 1 + 1 and 1 + 1 + 1 + 1 + 1. Amount 0 has exactly one way: take no coins.\n\n" +
        "The table is the same shape as before, one cell per amount, and the step is the same idea: a way " +
        "to make x that uses coin c is a way to make x - c with one more c on top. Only the combining " +
        "changes. Minimum becomes sum, and the base case becomes ways[0] = 1 instead of 0 coins.\n\n" +
        "The new trap is double counting. Coin Change looped amounts outside and coins inside, which is " +
        "fine for a minimum. For counting, that order adds ways[x - c] for every last coin c, so 1 then 2 " +
        "and 2 then 1 count as two different ways: you get ordered sequences (for [1, 2] and 4 that is 5, " +
        "not 3). Put the coins in the OUTER loop instead. After processing coins c1..ci, ways[x] counts the " +
        "combinations that use only those coins, and adding coin c only ever puts c after the coins already " +
        "processed, so each combination is built in exactly one order.\n\n" +
        "The inner loop still runs upward from c to amount, exactly as in Coin Change, because reading " +
        "ways[x - c] from the current pass is what allows the same coin again. O(n · W) time for n coins " +
        "and amount W, and O(W) space.\n\n" +
        "The visualization fills ways for coins [1, 2, 5] and amount 5, one coin at a time.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences comparing this " +
        "with Coin Change. What stays the same in the recurrence, why does ways[0] start at 1, and why does " +
        "the order of the two loops decide whether you count combinations or sequences?";

    public List<string> RecognitionSignals =>
    [
        "\"How many ways\" to reach an exact total with pieces you can reuse, where the order of the pieces does not matter.",
        "A counting version of a minimum or feasibility problem you already know as unbounded knapsack.",
    ];

    public List<string> Gotchas =>
    [
        "Coins in the outer loop, amounts in the inner loop. The other order counts 1 + 2 and 2 + 1 separately.",
        "ways[0] = 1, not 0: the empty combination is the one way to make 0, and every other count is built from it.",
        "Counts can grow fast; these tests fit in an int, but real inputs may need a long.",
    ];

    public List<string> ConfusableWith =>
    [
        "Unbounded Knapsack: Coin Change asks for the fewest coins, so the loop order doesn't matter there. For counting combinations it does.",
        "Climbing Stairs counts ordered sequences of steps (1 then 2 differs from 2 then 1), which is what the amounts outside, coins inside order computes.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int CoinChangeWays(int[] coins, int amount)\n" +
            "    {\n" +
            "        // TODO: ways = new int[amount + 1], ways[0] = 1. For each coin c\n" +
            "        // (OUTER loop), for x from c up to amount (inner loop):\n" +
            "        // ways[x] += ways[x - c]. Return ways[amount].\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def coin_change_ways(coins, amount):\n" +
            "    # TODO: ways = [0] * (amount + 1), ways[0] = 1. For each coin c\n" +
            "    # (OUTER loop), for x from c up to amount (inner loop):\n" +
            "    # ways[x] += ways[x - c]. Return ways[amount].\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CoinChangeWays",
        ["python"] = "coin_change_ways",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 5]), Lit.Int(5)), "4"),
        new TestCase(Lit.Args(Lit.IntArray([2]), Lit.Int(3)), "0"),
        new TestCase(Lit.Args(Lit.IntArray([10]), Lit.Int(10)), "1"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 5]), Lit.Int(0)), "1"),
        new TestCase(Lit.Args(Lit.IntArray([]), Lit.Int(0)), "1"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2]), Lit.Int(4)), "3"),
        new TestCase(Lit.Args(Lit.IntArray([3, 5, 7]), Lit.Int(12)), "2"),
        new TestCase(Lit.Args(Lit.IntArray([7]), Lit.Int(3)), "0"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 5, 10, 20, 50, 100, 200]), Lit.Int(500)), "6295434"),
    ];

    public string CSharpCallTemplate => "Solution.CoinChangeWays({input})";
    public string PythonCallTemplate => "coin_change_ways({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] coins = [1, 2, 5];
        const int amount = 5;
        var ways = new int[amount + 1];
        ways[0] = 1;
        object[] Snapshot() => ways.Select(v => (object)v).ToArray();
        var steps = new List<VisualizationStep>
        {
            new(
                new Dictionary<string, object> { ["array"] = Snapshot() },
                [0],
                "ways[x] = combinations making x. Before any coin, only ways[0] = 1: the empty combination."
            ),
        };

        var used = new List<int>();
        foreach (var c in coins)
        {
            used.Add(c);
            for (var x = c; x <= amount; x++)
            {
                var before = ways[x];
                ways[x] += ways[x - c];
                steps.Add(new VisualizationStep(
                    new Dictionary<string, object> { ["array"] = Snapshot(), ["tracker"] = c, ["trackerLabel"] = "coin" },
                    [x],
                    $"Coin {c}: ways[{x}] += ways[{x} - {c}] = {before} + {ways[x - c]} = {ways[x]}. Combinations of {string.Join(", ", used)} that make {x}."
                ));
            }
        }

        steps.Add(new VisualizationStep(
            new Dictionary<string, object> { ["array"] = Snapshot() },
            [amount],
            $"Done: {ways[amount]} combinations make {amount}. Each was built in one coin order (1s, then 2s, then 5s), so none is counted twice."
        ));
        return steps;
    }
}
