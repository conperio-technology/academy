namespace DsaAcademy.Content.Concepts;

public class GreedyMaxSubarray : IConcept
{
    public string Id => "greedy-max-subarray";
    public string Track => "greedy";
    public int Order => 111;
    public string Title => "Greedy: Maximum Subarray (Kadane's Algorithm)";
    public string OneLiner => "The largest sum of any contiguous run: a running sum that has gone negative only drags the next element down, so drop it and start fresh.";
    public string KeyTakeaway =>
        "Keep current, the best sum of a run ENDING at i: current = max(nums[i], current + nums[i]). That says " +
        "\"extend the run if what came before helps, otherwise start over here\". The answer is the best current " +
        "seen. One pass, O(n) time, O(1) space, and it handles all-negative arrays if you start from nums[0] " +
        "rather than 0.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given an integer array, return the largest sum of a non-empty contiguous subarray (a run of neighbouring " +
        "elements). For [-2, 1, -3, 4, -1, 2, 1, -5, 4] the answer is 6, from [4, -1, 2, 1].\n\n" +
        "Trying every start and end is O(n^2) even with a running sum. Kadane's algorithm does it in one pass by " +
        "asking a smaller question at each index: what is the best sum of a run that ENDS exactly here? Call it " +
        "current. A run ending at i is either nums[i] alone or the best run ending at i - 1 with nums[i] tacked " +
        "on, so current = max(nums[i], current + nums[i]). The overall answer is the largest current you ever see.\n\n" +
        "The greedy reading of the same line: if the running sum before i is negative, it can only make anything " +
        "after it smaller, so throw it away and restart at i. Keeping a negative prefix is never better, which is " +
        "the exchange argument in one sentence. (It's also the simplest example of dynamic programming: current " +
        "is dp[i], and only the previous cell is ever needed, so the table shrinks to one variable.)\n\n" +
        "Start both current and best at nums[0], not at 0. With [-3, -1, -2] the answer is -1 (the subarray must " +
        "be non-empty); starting best at 0 would wrongly return 0.\n\n" +
        "Overflow: the sum of many large ints can pass int.MaxValue (2,147,483,647) in C#, where int arithmetic " +
        "silently wraps round to negative numbers unless you use long or a checked block. Python ints never " +
        "overflow. The tests here stay inside int range.\n\n" +
        "The visualization walks the example; the tracker is best, and the highlighted cells are the run that " +
        "current is summing.";

    public List<string> RecognitionSignals =>
    [
        "\"Largest / maximum sum of a contiguous subarray\" (or the stock-profit variant: the largest rise between two days).",
        "Negative numbers are allowed, so a sliding window can't decide when to shrink.",
        "Each position's best answer depends only on the previous position's best answer.",
    ];

    public List<string> Gotchas =>
    [
        "Initialise with nums[0], not 0, or an all-negative array returns 0 instead of its largest element.",
        "Update best after updating current at every index, not only when you restart.",
        "Restart when current + nums[i] < nums[i] (equivalently, when current < 0), not when nums[i] is negative: a negative element inside a good run is fine.",
    ];

    public List<string> ConfusableWith =>
    [
        "Sliding Window: works for max sum of a FIXED-size window or when all numbers are positive; with negatives and any length, Kadane's is the tool.",
        "Prefix Sums: the best subarray is the largest prefix[j] - prefix[i]; tracking the smallest prefix so far gives the same O(n) answer.",
        "Gas Station (this track) uses the same \"a negative running sum is never worth keeping\" restart.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int MaxSubArray(int[] nums)\n" +
            "    {\n" +
            "        // TODO: current = best = nums[0].\n" +
            "        // For each later element x: current = max(x, current + x); best = max(best, current).\n" +
            "        // Return best.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def max_sub_array(nums):\n" +
            "    # TODO: current = best = nums[0].\n" +
            "    # For each later element x: current = max(x, current + x); best = max(best, current).\n" +
            "    # Return best.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MaxSubArray",
        ["python"] = "max_sub_array",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[-2, 1, -3, 4, -1, 2, 1, -5, 4]", "6"),
        new TestCase("[1]", "1"),
        new TestCase("[5, 4, -1, 7, 8]", "23"),
        new TestCase("[-3, -1, -2]", "-1"),
        new TestCase("[-1]", "-1"),
        new TestCase("[0, -3, 1, 1]", "2"),
        new TestCase("[2, -1, 2, -1, 2]", "4"),
        new TestCase("[8, -19, 5, -4, 20]", "21"),
    ];

    public string CSharpCallTemplate => "Solution.MaxSubArray({input})";
    public string PythonCallTemplate => "max_sub_array({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
        var steps = new List<VisualizationStep>();
        int current = nums[0], best = nums[0], runStart = 0;

        Dictionary<string, object> State() => new()
        {
            ["array"] = nums,
            ["tracker"] = best,
            ["trackerLabel"] = "best",
        };

        steps.Add(new VisualizationStep(State(), [0],
            $"nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]. Start with current = best = nums[0] = {nums[0]}."));

        for (var i = 1; i < nums.Length; i++)
        {
            var extend = current + nums[i];
            string how;
            if (nums[i] > extend)
            {
                how = $"current + {nums[i]} = {extend} is worse than {nums[i]} alone (the run before was negative): restart here.";
                current = nums[i];
                runStart = i;
            }
            else
            {
                how = $"extending gives {extend}, at least as good as {nums[i]} alone: keep the run.";
                current = extend;
            }
            var improved = current > best;
            best = Math.Max(best, current);
            steps.Add(new VisualizationStep(State(), Enumerable.Range(runStart, i - runStart + 1).ToArray(),
                $"i = {i}: {how} current = {current}." + (improved ? $" New best = {best}." : $" best stays {best}.")));
        }

        steps.Add(new VisualizationStep(State(), [3, 4, 5, 6], $"Done: the best run is [4, -1, 2, 1] with sum {best}."));
        return steps;
    }
}
