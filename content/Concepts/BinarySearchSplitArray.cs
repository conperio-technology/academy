namespace DsaAcademy.Content.Concepts;

public class BinarySearchSplitArray : IConcept
{
    public string Id => "binary-search-split-array";
    public string Track => "patterns";
    public string Title => "Binary Search on Answer: Split Array Largest Sum";
    public string OneLiner => "Instead of choosing where to cut, guess the largest allowed part sum and check greedily whether k parts are enough; then binary search the guess.";
    public string KeyTakeaway =>
        "\"Minimize the maximum\" is usually binary search on the answer. Fix a cap on the part sum: a greedy " +
        "left-to-right pass tells you the fewest parts that respect it, and that count only goes down as the " +
        "cap goes up. So the smallest cap needing at most k parts is a boundary you can binary search between " +
        "max(nums) and sum(nums).";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given an array of non-negative integers nums and an integer k (1 <= k <= nums.length), split nums " +
        "into k non-empty contiguous parts so that the largest part sum is as small as possible, and return " +
        "that largest sum. For [7, 2, 5, 10, 8] with k = 2 the best split is [7, 2, 5] and [10, 8], giving " +
        "max(14, 18) = 18.\n\n" +
        "Trying every set of k - 1 cut positions is exponential. A DP over (prefix, parts used) works in " +
        "O(k·n²). The faster idea is to turn the question around: instead of asking \"where do I cut?\", ask " +
        "\"if no part may exceed cap, how many parts do I need?\" That second question has a simple greedy " +
        "answer: walk left to right, adding each number to the current part, and start a new part only when " +
        "the next number would push the current one over cap. Closing a part as late as possible can never " +
        "hurt, so this gives the fewest parts for that cap in one O(n) pass.\n\n" +
        "partsNeeded(cap) is monotonic: a bigger cap never needs more parts. The answer is the smallest cap " +
        "with partsNeeded(cap) <= k. (Needing fewer than k parts is fine, because you can always split a part " +
        "further without raising the maximum, as long as there are enough elements, which k <= n guarantees.) " +
        "The search range is [max(nums), sum(nums)]: below max(nums) the biggest element can't fit in any " +
        "part, and sum(nums) always works with one part. Binary search it with the same lower-boundary loop " +
        "as Koko: if partsNeeded(mid) <= k, hi = mid; otherwise lo = mid + 1.\n\n" +
        "That is O(n log S), where S = sum - max is the size of the answer range, and O(1) extra space. The " +
        "same shape solves \"capacity to ship packages within D days\" (identical, with days instead of " +
        "parts), \"painter's partition\", and \"allocate minimum pages\". When you see minimize the maximum " +
        "(or maximize the minimum, as in \"aggressive cows\" or \"magnetic force between balls\"), look for the " +
        "monotonic feasibility check first.\n\n" +
        "The visualization shows the candidate caps from 10 to 32 for [7, 2, 5, 10, 8] and k = 2, with the " +
        "greedy split for each midpoint in the message.";

    public List<string> RecognitionSignals =>
    [
        "\"Minimize the largest\" (or \"maximize the smallest\") something over all ways to split, assign, or schedule.",
        "Contiguous parts in a fixed order: days, workers, painters, or subarrays that must keep the original order.",
        "Checking one candidate answer is easy (a greedy pass) even though building the best split directly is not.",
    ];

    public List<string> Gotchas =>
    [
        "The low end is max(nums), not 0 or 1: with a cap smaller than the biggest element, the greedy check still puts that element in a part of its own and counts it, so it can report a cap as feasible when no valid split exists.",
        "Feasible means partsNeeded(cap) <= k, not == k. Requiring exactly k parts breaks monotonicity and can skip the real answer.",
        "In the greedy check, start a new part when current + x > cap (strictly greater). Using >= closes parts that would have fit exactly and overcounts.",
    ];

    public List<string> ConfusableWith =>
    [
        "Binary Search on Answer: Minimum Eating Speed (this track) is the same pattern with a different feasibility check (hours needed at speed k). Recognizing that both are \"smallest value where a monotonic check flips\" is the whole skill.",
        "Dynamic programming over (prefix, parts used) also solves this, in O(k·n²). It's correct and worth mentioning, but the binary search is much faster and simpler to write.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int SplitArray(int[] nums, int k)\n" +
            "    {\n" +
            "        // TODO: binary search the cap in [max(nums), sum(nums)]. partsNeeded(cap):\n" +
            "        // walk left to right, start a new part when current + x > cap, count parts.\n" +
            "        // lo = max, hi = sum; while lo < hi: mid = lo + (hi - lo) / 2;\n" +
            "        // if partsNeeded(mid) <= k, hi = mid, else lo = mid + 1. Return lo.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def split_array(nums, k):\n" +
            "    # TODO: binary search the cap in [max(nums), sum(nums)]. parts_needed(cap):\n" +
            "    # walk left to right, start a new part when current + x > cap, count parts.\n" +
            "    # lo = max, hi = sum; while lo < hi: mid = (lo + hi) // 2;\n" +
            "    # if parts_needed(mid) <= k, hi = mid, else lo = mid + 1. Return lo.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.SplitArray",
        ["python"] = "split_array",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([7, 2, 5, 10, 8]), Lit.Int(2)), "18"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4, 5]), Lit.Int(2)), "9"),
        new TestCase(Lit.Args(Lit.IntArray([1, 4, 4]), Lit.Int(3)), "4"),
        new TestCase(Lit.Args(Lit.IntArray([5]), Lit.Int(1)), "5"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4, 5]), Lit.Int(1)), "15"),
        new TestCase(Lit.Args(Lit.IntArray([2, 3, 1, 2, 4, 3]), Lit.Int(5)), "4"),
        new TestCase(Lit.Args(Lit.IntArray([10, 5, 13, 4, 8, 4, 5, 11, 14, 9, 16, 10, 20, 8]), Lit.Int(8)), "25"),
        new TestCase(Lit.Args(Lit.IntArray([0, 0, 0, 7]), Lit.Int(2)), "7"),
    ];

    public string CSharpCallTemplate => "Solution.SplitArray({input})";
    public string PythonCallTemplate => "split_array({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [7, 2, 5, 10, 8];
        const int k = 2;
        var steps = new List<VisualizationStep>();
        var lo = nums.Max();
        var hi = nums.Sum();

        List<List<int>> Greedy(int cap)
        {
            var parts = new List<List<int>> { new() };
            var current = 0;
            foreach (var x in nums)
            {
                if (current + x > cap)
                {
                    parts.Add([]);
                    current = 0;
                }
                parts[^1].Add(x);
                current += x;
            }
            return parts;
        }

        string Show(List<List<int>> parts) =>
            string.Join(" ", parts.Select(p => $"[{string.Join(", ", p)}]"));

        object[] Snapshot() => Enumerable.Range(lo, hi - lo + 1).Select(v => (object)v).ToArray();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot() },
            HighlightIndices: [],
            Message: $"nums = [7, 2, 5, 10, 8], k = {k}. The answer is a cap between max = {lo} and sum = {hi}. Find the smallest cap the greedy split can meet with at most {k} parts."
        ));

        while (lo < hi)
        {
            var mid = lo + (hi - lo) / 2;
            var parts = Greedy(mid);
            var fits = parts.Count <= k;
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = Snapshot(), ["tracker"] = parts.Count, ["trackerLabel"] = $"partsNeeded({mid})" },
                HighlightIndices: [mid - lo],
                Message: fits
                    ? $"cap {mid}: greedy split {Show(parts)} uses {parts.Count} part(s) <= {k}. Feasible, try smaller (hi = {mid})."
                    : $"cap {mid}: greedy split {Show(parts)} needs {parts.Count} parts > {k}. Too small, try bigger (lo = {mid + 1})."
            ));
            if (fits) hi = mid; else lo = mid + 1;
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot(), ["tracker"] = Greedy(lo).Count, ["trackerLabel"] = $"partsNeeded({lo})" },
            HighlightIndices: [0],
            Message: $"lo == hi == {lo}. Smallest feasible cap: {lo}, from the split {Show(Greedy(lo))}."
        ));
        return steps;
    }
}
