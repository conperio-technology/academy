namespace DsaAcademy.Content.Concepts;

public class TwoPointersSortedTwoSum : IConcept
{
    public string Id => "two-pointers-sorted-two-sum";
    public string Track => "patterns";
    public string Title => "Two Pointers: Two Sum on a Sorted Array";
    public string OneLiner => "Same \"find a pair that sums to target\" shape as Hash Map Two Sum -- but sorted input means zero extra memory.";
    public string KeyTakeaway =>
        "When the input is sorted, two pointers moving inward from opposite ends can solve \"find a " +
        "pair\" problems in O(1) extra space -- comparing the sum to the target tells you unambiguously " +
        "which pointer has to move, because moving the other one could only make things worse.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "left starts at index 0, right starts at the last index. At each step, look at nums[left] + " +
        "nums[right]: if it equals the target, you're done. If it's TOO SMALL, the only way to " +
        "increase it is to move left forward (right is already the biggest reachable value, so moving " +
        "it down only makes things smaller) -- so left++. If it's TOO BIG, symmetrically, right--. " +
        "Because the array is sorted, every comparison eliminates one candidate pair for good, so the " +
        "whole scan is O(n) with O(1) extra space -- no map needed. This is the array-reversal " +
        "two-pointer idea from Fundamentals, generalized: instead of always swapping, you're now " +
        "making a decision (which side to move) based on a comparison.";

    public List<string> RecognitionSignals =>
    [
        "The input is sorted (or you're allowed to sort it) and you need a pair/triplet that hits a target sum.",
        "You need O(1) extra space, not just O(n) time -- if space doesn't matter, a hash map often solves the same shape.",
        "The problem involves comparing values from both ends of a range moving toward the middle.",
    ];

    public List<string> Gotchas =>
    [
        "Only works because the array is sorted -- on unsorted input you'd need to sort first (O(n log n)) or reach for a hash map instead.",
        "Stopping condition is `left < right`, not `left <= right` -- on an odd-length array with `<=` you'd compare the middle element to itself.",
        "If the problem needs the ORIGINAL (pre-sort) indices, sorting destroys them -- you'd need to sort (index, value) pairs together, or use the hash map approach instead.",
    ];

    public List<string> ConfusableWith =>
    [
        "Hash Maps: Two Sum (Fundamentals) solves the identical-shaped problem on UNSORTED input in O(n) time but O(n) space. The deciding question: is the array sorted (or cheap to sort) and do you need to save space? -> two pointers. Is it unsorted and you need original indices preserved? -> hash map.",
        "Sliding Window (this track) also uses two indices into an array, but both move in the SAME direction (the window slides forward) rather than toward each other from opposite ends -- the tell is whether you're looking at a CONTIGUOUS range (sliding window) or a PAIR from the two ends (two pointers).",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] TwoSumSorted(int[] nums, int target)\n" +
            "    {\n" +
            "        // TODO: left = 0, right = nums.Length - 1.\n" +
            "        // While left < right: compare nums[left] + nums[right] to target.\n" +
            "        // Equal -> return [left, right]. Too small -> left++. Too big -> right--.\n" +
            "        return new int[0];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def two_sum_sorted(nums, target):\n" +
            "    # TODO: left = 0, right = len(nums) - 1.\n" +
            "    # While left < right: compare nums[left] + nums[right] to target.\n" +
            "    # Equal -> return [left, right]. Too small -> left += 1. Too big -> right -= 1.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.TwoSumSorted",
        ["python"] = "two_sum_sorted",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4, 6]), Lit.Int(6)), "[1,3]"),
        new TestCase(Lit.Args(Lit.IntArray([2, 3, 4]), Lit.Int(6)), "[0,2]"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4, 5]), Lit.Int(9)), "[3,4]"),
        new TestCase(Lit.Args(Lit.IntArray([0, 0, 3, 4]), Lit.Int(0)), "[0,1]"),
    ];

    public string CSharpCallTemplate => "Solution.TwoSumSorted({input})";
    public string PythonCallTemplate => "two_sum_sorted({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [1, 2, 3, 4, 6];
        const int target = 6;
        var steps = new List<VisualizationStep>();
        var left = 0;
        var right = nums.Length - 1;

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = nums },
            HighlightIndices: [left, right],
            Message: $"left = 0, right = {right}. Looking for a pair that sums to {target}."
        ));

        while (left < right)
        {
            var sum = nums[left] + nums[right];
            if (sum == target)
            {
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = nums },
                    HighlightIndices: [left, right],
                    Message: $"nums[{left}] + nums[{right}] = {nums[left]} + {nums[right]} = {sum} -- matches! Return [{left}, {right}]."
                ));
                break;
            }

            if (sum < target)
            {
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = nums },
                    HighlightIndices: [left, right],
                    Message: $"nums[{left}] + nums[{right}] = {sum} -- too small. Move left forward: left++."
                ));
                left++;
            }
            else
            {
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = nums },
                    HighlightIndices: [left, right],
                    Message: $"nums[{left}] + nums[{right}] = {sum} -- too big. Move right backward: right--."
                ));
                right--;
            }
        }

        return steps;
    }
}
