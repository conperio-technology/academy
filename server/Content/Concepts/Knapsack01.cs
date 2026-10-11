namespace DsaAcademy.Content.Concepts;

public class Knapsack01 : IConcept
{
    public string Id => "knapsack-01";
    public string Track => "patterns";
    public string Title => "0/1 Knapsack: The Shape Behind Subset-Sum Problems";
    public string OneLiner => "Pick a subset of items, each usable at most once, to maximize value within a weight limit -- one descending loop is the entire difference from letting an item be reused.";
    public string KeyTakeaway =>
        "The inner loop over capacity w MUST run DESCENDING (from the limit down to the item's weight) " +
        "-- that single direction is what keeps every item usable at most once. Running it ascending " +
        "would let dp[w] see this SAME item's own update earlier in the same pass, silently turning " +
        "0/1 knapsack (each item once) into unbounded knapsack (each item any number of times).";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given a set of items, each with a weight and a value, and a capacity limit, choose a SUBSET " +
        "of items (each used at most once -- that's the \"0/1\": take it or don't) to maximize total " +
        "value without exceeding the weight capacity. This is the shape underneath a whole family of " +
        "problems that don't look like it at first -- \"can this array be partitioned into two equal-" +
        "sum halves,\" \"does some subset sum to exactly X\" -- all of them are 0/1 knapsack with the " +
        "value function simplified away.\n\n" +
        "The space-optimized solution keeps a single 1D array dp[w] = the best value achievable with " +
        "total weight AT MOST w, all zeros to start (for \"exactly w\" you'd set dp[0] = 0 and every " +
        "other entry to minus infinity, so unreachable weights can't win). Process items ONE AT A TIME; for each item (weight wt, " +
        "value v), loop w from the full capacity DOWN TO wt, updating dp[w] = max(dp[w], dp[w-wt] + v) " +
        "-- \"either skip this item (keep dp[w] as-is) or take it (dp[w-wt] plus this item's value).\" " +
        "The descending direction is the entire trick: it guarantees dp[w-wt] on the right-hand side " +
        "still reflects the PREVIOUS item's state, not this item's own just-written update -- reading " +
        "ascending would let this exact item get folded into its own answer more than once.\n\n" +
        "Watch the dp array evolve below, one item at a time -- by the end, dp[capacity] holds the best " +
        "achievable value using any subset of the items shown.";

    public List<string> RecognitionSignals =>
    [
        "You're choosing a SUBSET of items, each usable at most once, to maximize (or minimize) some value subject to a capacity/budget/weight limit.",
        "The problem is a variant of \"can a subset sum to exactly X\" or \"partition into two equal groups\" -- these are 0/1 knapsack wearing different clothes.",
    ];

    public List<string> Gotchas =>
    [
        "The inner loop over w MUST run DESCENDING (capacity down to the item's weight) -- ascending lets the same item get added to dp[w] more than once, turning 0/1 knapsack into unbounded knapsack by accident.",
        "dp[w - wt] on the right-hand side needs to still be the PREVIOUS item's value at that index -- that's only guaranteed by the descending order, not an accident of the formula itself.",
    ];

    public List<string> ConfusableWith =>
    [
        "Dynamic Programming: Climbing Stairs (Fundamentals track) fills a 1D dp array too, but every cell only ever depends on EARLIER cells filled in the same left-to-right pass -- knapsack's descending inner loop exists specifically to avoid that kind of same-item reuse within one item's pass.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int Knapsack(int[] weights, int[] values, int capacity)\n" +
            "    {\n" +
            "        // TODO: dp[w] = best value achievable with capacity w, all zeros\n" +
            "        // to start. For each item (weight wt, value v): for w from\n" +
            "        // capacity DOWN TO wt: dp[w] = max(dp[w], dp[w - wt] + v). The\n" +
            "        // DESCENDING inner loop is what keeps each item usable at most\n" +
            "        // once. Return dp[capacity].\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def knapsack(weights, values, capacity):\n" +
            "    # TODO: dp[w] = best value achievable with capacity w, all zeros\n" +
            "    # to start. For each item (weight wt, value v): for w from\n" +
            "    # capacity DOWN TO wt: dp[w] = max(dp[w], dp[w - wt] + v). The\n" +
            "    # DESCENDING inner loop is what keeps each item usable at most\n" +
            "    # once. Return dp[capacity].\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Knapsack",
        ["python"] = "knapsack",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([1, 3, 4, 5]), Lit.IntArray([1, 4, 5, 7]), Lit.Int(7)), "9"),
        new TestCase(Lit.Args(Lit.IntArray([2, 3, 4, 5]), Lit.IntArray([3, 4, 5, 6]), Lit.Int(5)), "7"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3]), Lit.IntArray([6, 10, 12]), Lit.Int(5)), "22"),
        new TestCase(Lit.Args(Lit.IntArray([5]), Lit.IntArray([10]), Lit.Int(3)), "0"),
        new TestCase(Lit.Args(Lit.IntArray([2]), Lit.IntArray([3]), Lit.Int(2)), "3"),
    ];

    public string CSharpCallTemplate => "Solution.Knapsack({input})";
    public string PythonCallTemplate => "knapsack({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] weights = [1, 3, 4, 5];
        int[] values = [1, 4, 5, 7];
        const int capacity = 7;
        var dp = new int[capacity + 1];
        var steps = new List<VisualizationStep>();

        object[] Snapshot() => dp.Select(v => (object)v).ToArray();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot() },
            HighlightIndices: [],
            Message: "dp[w] = best value with capacity w. All zeros -- no items considered yet."
        ));

        for (var i = 0; i < weights.Length; i++)
        {
            var wt = weights[i];
            var val = values[i];
            for (var w = capacity; w >= wt; w--)
            {
                dp[w] = Math.Max(dp[w], dp[w - wt] + val);
            }
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = Snapshot() },
                HighlightIndices: [capacity],
                Message: $"Item {i} (weight {wt}, value {val}) considered -- for w from {capacity} down to {wt}, dp[w] = max(dp[w], dp[w-{wt}] + {val})."
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot() },
            HighlightIndices: [capacity],
            Message: $"Done -- best value with capacity {capacity}: {dp[capacity]}."
        ));

        return steps;
    }
}
