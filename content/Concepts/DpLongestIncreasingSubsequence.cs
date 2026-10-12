namespace DsaAcademy.Content.Concepts;

public class DpLongestIncreasingSubsequence : IConcept
{
    public string Id => "dp-longest-increasing-subsequence";
    public string Track => "dynamic-programming";
    public string Title => "Dynamic Programming: Longest Increasing Subsequence";
    public string OneLiner => "For every index, the best increasing run ENDING there only depends on the best runs ending at every SMALLER, earlier value -- the same overlapping-subproblem shape as Climbing Stairs, one dimension wider.";
    public string KeyTakeaway =>
        "dp[i] = the length of the longest increasing subsequence that ENDS at index i (not just " +
        "\"up to i\") -- computed as 1 + the best dp[j] among every earlier j where nums[j] < nums[i], " +
        "or just 1 if no such j exists. The answer to the whole problem is the MAXIMUM value anywhere " +
        "in the finished dp array, not dp[n-1] -- the longest increasing run doesn't have to end at " +
        "the last element.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "A subsequence keeps elements in their original order but doesn't require them to be " +
        "adjacent -- [10, 9, 2, 5, 3, 7] has the increasing subsequence [2, 5, 7] (skipping 10, 9, and " +
        "3) even though those three values aren't next to each other. \"Longest Increasing " +
        "Subsequence\" asks for the length of the longest such run.\n\n" +
        "The DP insight: define dp[i] as the length of the longest increasing subsequence that ENDS " +
        "exactly at index i (using nums[i] as its last element, not just anywhere up to i). To compute " +
        "dp[i], look at every earlier index j: if nums[j] < nums[i], then nums[i] could extend " +
        "whatever increasing run ends at j, giving a candidate length of dp[j] + 1. dp[i] is the best " +
        "(maximum) of all those candidates, or just 1 on its own if nothing earlier is smaller (every " +
        "single element is trivially an increasing subsequence of length 1).\n\n" +
        "This is the same \"break a problem into smaller already-solved subproblems\" shape as " +
        "Climbing Stairs, just checking ALL earlier indices instead of only the two right before it -- " +
        "which is what makes this O(n^2) instead of O(n). One easy mistake: the final answer isn't " +
        "dp[n-1] (the last cell) -- it's the MAXIMUM value anywhere in the dp array, since the longest " +
        "run doesn't have to end at the array's last element at all.\n\n" +
        "Watch dp fill left to right below -- each cell shows which earlier, smaller value it " +
        "extended (or that it started fresh at length 1), and the tracker shows the best length found " +
        "so far across the whole array.";

    public List<string> RecognitionSignals =>
    [
        "The problem asks for the longest/shortest run, subsequence, or subset that must stay in ORDER but doesn't require adjacency -- \"subsequence\" (not \"subarray\" or \"substring\") is the signal word.",
        "A greedy \"just track the running best\" approach doesn't work because an early bad choice can block a better later run -- you need to know the best answer ending at EVERY index, not just the overall best so far.",
    ];

    public List<string> Gotchas =>
    [
        "The answer is max(dp), not dp[n-1] -- the longest increasing run can end anywhere in the array, not necessarily at the last element.",
        "dp[i] means \"ends AT i,\" not \"best subsequence somewhere in the first i elements\" -- mixing those two definitions up breaks the recurrence.",
    ];

    public List<string> ConfusableWith =>
    [
        "0/1 Knapsack (patterns track) is also \"build a dp array from smaller solved subproblems,\" but Knapsack's state is a fixed capacity dimension, not \"which earlier index did I extend.\"",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int LengthOfLIS(int[] nums)\n" +
            "    {\n" +
            "        // TODO: dp[i] = 1 for every i (every element is its own subsequence of length\n" +
            "        // 1). For each i, check every earlier j: if nums[j] < nums[i], dp[i] can become\n" +
            "        // max(dp[i], dp[j] + 1). Return the MAXIMUM value in dp, not dp[last].\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def length_of_lis(nums):\n" +
            "    # TODO: dp[i] = 1 for every i (every element is its own subsequence of length 1).\n" +
            "    # For each i, check every earlier j: if nums[j] < nums[i], dp[i] can become\n" +
            "    # max(dp[i], dp[j] + 1). Return the MAXIMUM value in dp, not dp[-1].\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.LengthOfLIS",
        ["python"] = "length_of_lis",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([10, 9, 2, 5, 3, 7, 101, 18]), "4"),
        new TestCase(Lit.IntArray([0, 1, 0, 3, 2, 3]), "4"),
        new TestCase(Lit.IntArray([7, 7, 7, 7]), "1"),
        new TestCase(Lit.IntArray([1, 2, 3, 4, 5]), "5"),
        new TestCase(Lit.IntArray([5, 4, 3, 2, 1]), "1"),
        new TestCase(Lit.IntArray([]), "0"),
    ];

    public string CSharpCallTemplate => "Solution.LengthOfLIS({input})";
    public string PythonCallTemplate => "length_of_lis({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [10, 9, 2, 5, 3, 7];
        var n = nums.Length;
        var dp = new int[n];
        var best = 0;
        var steps = new List<VisualizationStep>();

        object[] Snapshot() => Enumerable.Range(0, n).Select(k => dp[k] == 0 ? (object)"" : dp[k]).ToArray();

        for (var i = 0; i < n; i++)
        {
            dp[i] = 1;
            var bestJ = -1;
            for (var j = 0; j < i; j++)
            {
                if (nums[j] < nums[i] && dp[j] + 1 > dp[i])
                {
                    dp[i] = dp[j] + 1;
                    bestJ = j;
                }
            }
            best = Math.Max(best, dp[i]);

            var message = bestJ >= 0
                ? $"dp[{i}] (value {nums[i]}): best extension is index {bestJ} (value {nums[bestJ]} < {nums[i]}), so dp[{i}] = dp[{bestJ}] + 1 = {dp[i]}."
                : $"dp[{i}] (value {nums[i]}): no earlier smaller value to extend, so dp[{i}] = 1.";

            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = Snapshot(), ["tracker"] = best, ["trackerLabel"] = "longest so far" },
                HighlightIndices: bestJ >= 0 ? [i, bestJ] : [i],
                Message: message
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot(), ["tracker"] = best, ["trackerLabel"] = "longest so far" },
            HighlightIndices: [],
            Message: $"Done -- longest increasing subsequence length is max(dp) = {best}."
        ));

        return steps;
    }
}
