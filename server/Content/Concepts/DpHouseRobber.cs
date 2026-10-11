namespace DsaAcademy.Content.Concepts;

public class DpHouseRobber : IConcept
{
    public string Id => "dp-house-robber";
    public string Track => "patterns";
    public string Title => "1-D DP: House Robber";
    public string OneLiner => "Pick values from a row to maximize the total, never taking two neighbors -- decided one house at a time with two numbers.";
    public string KeyTakeaway =>
        "At each house there are only two choices: skip it (keep the best total up to the previous house) or " +
        "rob it (its value plus the best total up to two houses back). best[i] = max(best[i-1], best[i-2] + " +
        "nums[i]), and since only the last two answers are ever read, two rolling variables replace the array.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "A row of houses holds nums[i] money each. Robbing two adjacent houses sets off an alarm, so you can't " +
        "pick neighbors. What's the most you can collect? For [2, 7, 9, 3, 1] the answer is 12 (2 + 9 + 1).\n\n" +
        "Greedy shortcuts fail. \"Take every other house\" misses [2, 1, 1, 2], where the best is 2 + 2 = 4 " +
        "using houses 0 and 3, which are three apart. \"Always take the biggest remaining\" fails on [5, 6, 5], " +
        "where taking 6 blocks both 5s. You need to consider both options at every house, and DP does that " +
        "without trying all 2^n subsets.\n\n" +
        "Define best[i] as the most money from houses 0 through i. For house i, either you skip it, and the " +
        "answer is best[i-1], or you rob it, so house i-1 is off limits and the answer is nums[i] + best[i-2]. " +
        "Take the larger. With best[-1] = best[-2] = 0 the formula also covers the first two houses. Notice " +
        "that each step reads only the previous two answers, so keep two variables: prev2 (best two houses " +
        "back) and prev1 (best up to the previous house). Each house computes cur = max(prev1, prev2 + " +
        "nums[i]), then shifts: prev2 = prev1, prev1 = cur. That's O(n) time and O(1) space.\n\n" +
        "This \"take it or skip it, and taking it rules out the neighbor\" recurrence is the template for a " +
        "family of problems. Common follow-ups: the houses are in a CIRCLE (house 0 and house n-1 are " +
        "neighbors, so run the linear version twice, once without the first house and once without the last, " +
        "and take the max), the houses form a binary tree (each node returns a pair: best if robbed, best if " +
        "not), or \"delete and earn\", which turns into house robber after bucketing values.\n\n" +
        "The visualization walks [2, 7, 9, 3, 1]. The highlighted house is being decided; the tracker shows " +
        "prev1, the best total so far.";

    public List<string> RecognitionSignals =>
    [
        "Choose a subset of items in a line to maximize a sum, where choosing one item forbids its immediate neighbor(s).",
        "Each position has a small, fixed set of choices (take or skip), and the best answer for a prefix depends only on the last one or two prefixes.",
    ];

    public List<string> Gotchas =>
    [
        "Empty input returns 0 and a single house returns its own value -- seed prev1 = prev2 = 0 and the loop handles both.",
        "Shift the variables in the right order: compute cur first, then prev2 = prev1, then prev1 = cur. Overwriting prev1 before reading it loses the skip option.",
        "\"Every other house\" (sum of even indices vs. odd indices) is not the answer; the best picks can be more than one house apart.",
    ];

    public List<string> ConfusableWith =>
    [
        "Dynamic Programming: Climbing Stairs (Fundamentals) has the same two-variable rolling shape, but adds the previous two answers (counting ways) instead of taking a max over a choice.",
        "0/1 Knapsack (this track) is also take-or-skip per item, but the constraint is a weight budget, so it needs a second dimension. Here the only constraint is adjacency, so one dimension is enough.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int Rob(int[] nums)\n" +
            "    {\n" +
            "        // TODO: prev2 = best up to two houses back, prev1 = best up to the\n" +
            "        // previous house, both 0 to start. For each house:\n" +
            "        // cur = max(prev1 (skip it), prev2 + house (rob it)),\n" +
            "        // then prev2 = prev1, prev1 = cur. Return prev1.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def rob(nums):\n" +
            "    # TODO: prev2 = best up to two houses back, prev1 = best up to the\n" +
            "    # previous house, both 0 to start. For each house:\n" +
            "    # cur = max(prev1 (skip it), prev2 + house (rob it)),\n" +
            "    # then prev2, prev1 = prev1, cur. Return prev1.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Rob",
        ["python"] = "rob",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([1, 2, 3, 1]), "4"),
        new TestCase(Lit.IntArray([2, 7, 9, 3, 1]), "12"),
        new TestCase(Lit.IntArray([2, 1, 1, 2]), "4"),
        new TestCase(Lit.IntArray([]), "0"),
        new TestCase(Lit.IntArray([5]), "5"),
        new TestCase(Lit.IntArray([5, 6, 5]), "10"),
        new TestCase(Lit.IntArray([100, 1, 1, 100, 1, 1, 100]), "300"),
    ];

    public string CSharpCallTemplate => "Solution.Rob({input})";
    public string PythonCallTemplate => "rob({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] houses = [2, 7, 9, 3, 1];
        var arr = houses.Select(h => (object)h).ToArray();
        var steps = new List<VisualizationStep>();
        int prev2 = 0, prev1 = 0;

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = arr, ["tracker"] = 0, ["trackerLabel"] = "best so far (prev1)" },
            HighlightIndices: [],
            Message: "Houses [2, 7, 9, 3, 1]; no two neighbors. prev2 = prev1 = 0 before the first house."
        ));

        for (var i = 0; i < houses.Length; i++)
        {
            var skip = prev1;
            var take = prev2 + houses[i];
            var cur = Math.Max(skip, take);
            var choice = take > skip
                ? $"rob it ({prev2} + {houses[i]} = {take}) beats skipping ({skip})"
                : take == skip
                    ? $"robbing ({prev2} + {houses[i]} = {take}) ties skipping ({skip})"
                    : $"skipping ({skip}) beats robbing it ({prev2} + {houses[i]} = {take})";
            prev2 = prev1;
            prev1 = cur;
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = arr, ["tracker"] = prev1, ["trackerLabel"] = "best so far (prev1)" },
                HighlightIndices: [i],
                Message: $"House {i} (worth {houses[i]}): {choice}. Now prev2 = {prev2}, prev1 = {prev1}."
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = arr, ["tracker"] = prev1, ["trackerLabel"] = "best so far (prev1)" },
            HighlightIndices: [0, 2, 4],
            Message: $"Done: {prev1}, from houses 0, 2 and 4 (2 + 9 + 1). Two variables were enough because each step only looked two houses back."
        ));
        return steps;
    }
}
