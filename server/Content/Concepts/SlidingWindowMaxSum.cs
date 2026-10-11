namespace DsaAcademy.Content.Concepts;

public class SlidingWindowMaxSum : IConcept
{
    public string Id => "sliding-window-max-sum";
    public string Track => "patterns";
    public string Title => "Sliding Window: Max Sum Subarray of Size K";
    public string OneLiner => "Don't recompute the whole window every time -- slide it: subtract what leaves, add what enters.";
    public string KeyTakeaway =>
        "Recomputing a window's sum from scratch every time you move it is O(n*k). Sliding the window " +
        "instead -- subtract the element leaving on the left, add the element entering on the right -- " +
        "turns that into O(n) total: the whole array is visited a constant number of times, not once " +
        "per window.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Build the first window's sum normally (add up the first k elements). Then, to move the " +
        "window one step to the right, don't recompute the sum -- just subtract the element that's " +
        "now outside the window on the left, and add the new element that just entered on the right. " +
        "Track the best sum seen across all windows as you go. This is the fixed-size version of the " +
        "sliding window pattern; a variable-size version (grow the window until some condition breaks, " +
        "then shrink it) is the same core idea applied to problems like \"longest substring without " +
        "repeating characters.\" Watch out for the classic off-by-one: the window [left, right] has " +
        "size (right - left + 1), not (right - left).";

    public List<string> RecognitionSignals =>
    [
        "The problem is about a CONTIGUOUS subarray or substring (not any subset -- contiguous specifically).",
        "There's a size constraint (\"subarray of size k\") or a condition to maintain (\"no repeated characters\", \"sum <= target\").",
        "The brute-force solution recomputes something for every possible window -- that recomputation is usually avoidable by sliding.",
    ];

    public List<string> Gotchas =>
    [
        "Window size is (right - left + 1), not (right - left) -- an easy off-by-one.",
        "For a FIXED-size window, only start updating \"best so far\" once the window has reached full size k, not before.",
        "For a VARIABLE-size window (not this lesson, but the more common real-world version), remember to shrink from the left while a condition is violated, not just grow from the right.",
    ];

    public List<string> ConfusableWith =>
    [
        "Two Pointers (this track) also uses two indices into an array, but they move toward each other from opposite ends; sliding window's two indices move in the SAME direction as the window slides forward. The tell: pair from two ends (two pointers) vs. a contiguous range that grows/slides (sliding window).",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int MaxSumSubarray(int[] nums, int k)\n" +
            "    {\n" +
            "        // TODO: sum the first k elements as the starting window.\n" +
            "        // Then slide: for each next index, add nums[i] and subtract nums[i - k],\n" +
            "        // tracking the best sum seen.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def max_sum_subarray(nums, k):\n" +
            "    # TODO: sum the first k elements as the starting window.\n" +
            "    # Then slide: for each next index, add nums[i] and subtract nums[i - k],\n" +
            "    # tracking the best sum seen.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MaxSumSubarray",
        ["python"] = "max_sum_subarray",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([2, 1, 5, 1, 3, 2]), Lit.Int(3)), "9"),
        new TestCase(Lit.Args(Lit.IntArray([2, 3, 4, 1, 5]), Lit.Int(2)), "7"),
        new TestCase(Lit.Args(Lit.IntArray([1, 1, 1, 1]), Lit.Int(2)), "2"),
        new TestCase(Lit.Args(Lit.IntArray([5, 2, 8, 1, 4]), Lit.Int(1)), "8"),
    ];

    public string CSharpCallTemplate => "Solution.MaxSumSubarray({input})";
    public string PythonCallTemplate => "max_sum_subarray({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [2, 1, 5, 1, 3, 2];
        const int k = 3;
        var steps = new List<VisualizationStep>();

        var windowSum = 0;
        for (var i = 0; i < k; i++) windowSum += nums[i];
        var best = windowSum;

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = nums, ["tracker"] = windowSum, ["trackerLabel"] = "window sum" },
            HighlightIndices: Enumerable.Range(0, k).ToArray(),
            Message: $"Build the first window of size {k}: sum = {windowSum}. Best so far: {best}."
        ));

        for (var right = k; right < nums.Length; right++)
        {
            var left = right - k;
            windowSum += nums[right] - nums[left];
            var improved = windowSum > best;
            if (improved) best = windowSum;

            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = nums, ["tracker"] = windowSum, ["trackerLabel"] = "window sum" },
                HighlightIndices: Enumerable.Range(left + 1, k).ToArray(),
                Message: $"Slide right: add nums[{right}]={nums[right]}, subtract nums[{left}]={nums[left]} -> window sum = {windowSum}." +
                    (improved ? $" New best: {best}." : $" Best stays {best}.")
            ));
        }

        return steps;
    }
}
