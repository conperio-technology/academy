namespace DsaAcademy.Content.Concepts;

// Transfer exercise after Two Sum: the "have I already seen the value I need?" lookup, applied to
// prefix sums instead of the numbers themselves.
public class HashMapSubarraySumK : IConcept
{
    public string Id => "hashmap-subarray-sum-k";
    public string Track => "patterns";
    public string Title => "Transfer: Count Subarrays That Sum to K";
    public string OneLiner => "Count the contiguous runs that add up to k, negatives allowed, in one pass: Two Sum's lookup, run on prefix sums.";
    public string KeyTakeaway =>
        "A subarray sum is a difference of two prefix sums: sum(i..j) = prefix[j + 1] - prefix[i]. So \"which " +
        "earlier prefix makes this run equal k?\" is \"have I already seen prefix - k?\", the same complement " +
        "lookup as Two Sum, with a count per prefix instead of an index.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;
    public string? TransferOf => "hashmap-two-sum";

    public string Explanation =>
        "This follows Two Sum, and it uses the prefix sums from Prefix Sums: Answer Range-Sum Queries. Given nums (negatives and zeros " +
        "allowed) and k, return how many contiguous subarrays add up to exactly k. For [1, 2, 1, 2, 1] and " +
        "k = 3 the answer is 4: [1, 2] twice and [2, 1] twice.\n\n" +
        "The brute force tries every start and every end, O(n^2). A sliding window does not rescue it: with " +
        "negative numbers, growing the window can make the sum smaller, so you never know which end to move.\n\n" +
        "Write running for the sum of everything up to and including the current element, and say a run " +
        "ending here starts just after some earlier point whose running sum was p. That run sums to running " +
        "minus p. It equals k exactly when p = running - k. So at each element the question is: how many " +
        "earlier prefixes had the value running - k? Keep a dictionary from prefix value to how many times " +
        "it has occurred, seeded with {0: 1} for the empty prefix before the first element (that is what lets " +
        "a run starting at index 0 count). For each number: add it to running, add counts[running - k] (0 if " +
        "missing) to the answer, then record running in the map.\n\n" +
        "Order matters in the same way as in Two Sum: look up first, then record, so the current prefix " +
        "never pairs with itself. One pass, O(n) time, O(n) space for the map.\n\n" +
        "The visualization runs [1, 2, 1, 2, 1] with k = 3; the tracker is the count so far.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences comparing this " +
        "with Two Sum. In Two Sum you looked up target - x among values you had already seen. What plays " +
        "the role of x and of target here, why does the map store a count instead of an index, and why " +
        "does the seed {0: 1} matter?";

    public List<string> RecognitionSignals =>
    [
        "Count (or find) contiguous subarrays whose sum, or another additive total, equals a target.",
        "Negative numbers are allowed, which rules out a sliding window.",
    ];

    public List<string> Gotchas =>
    [
        "Seed the map with prefix 0 seen once, or every run that starts at index 0 is missed.",
        "Look up running - k before you record running; recording first counts an empty run when k is 0.",
        "Store how many times each prefix occurred, not just whether it occurred: [0, 0, 0] with k = 0 has six runs.",
    ];

    public List<string> ConfusableWith =>
    [
        "Sliding Window: Max Sum Subarray of Size K also looks at contiguous runs, but a window only works when every number is non-negative, so the sum grows as the window grows.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int SubarraySum(int[] nums, int k)\n" +
            "    {\n" +
            "        // TODO: counts = a Dictionary<int, int> from prefix sum to how many\n" +
            "        // times it has occurred, starting with counts[0] = 1. Keep a running\n" +
            "        // sum. For each number: add it to running, add counts[running - k]\n" +
            "        // (0 if missing) to the answer, THEN count running in the map.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def subarray_sum(nums, k):\n" +
            "    # TODO: counts = a dict from prefix sum to how many times it has\n" +
            "    # occurred, starting with {0: 1}. Keep a running sum. For each number:\n" +
            "    # add it to running, add counts.get(running - k, 0) to the answer,\n" +
            "    # THEN count running in the dict.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.SubarraySum",
        ["python"] = "subarray_sum",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([1, 1, 1]), Lit.Int(2)), "2"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3]), Lit.Int(3)), "2"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 1, 2, 1]), Lit.Int(3)), "4"),
        new TestCase(Lit.Args(Lit.IntArray([1, -1, 0]), Lit.Int(0)), "3"),
        new TestCase(Lit.Args(Lit.IntArray([0, 0, 0]), Lit.Int(0)), "6"),
        new TestCase(Lit.Args(Lit.IntArray([]), Lit.Int(0)), "0"),
        new TestCase(Lit.Args(Lit.IntArray([3]), Lit.Int(3)), "1"),
        new TestCase(Lit.Args(Lit.IntArray([3, 4, -7, 3, 1, 3, 1, -4, -2, -2]), Lit.Int(7)), "3"),
    ];

    public string CSharpCallTemplate => "Solution.SubarraySum({input})";
    public string PythonCallTemplate => "subarray_sum({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [1, 2, 1, 2, 1];
        const int k = 3;
        var arr = nums.Select(n => (object)n).ToArray();
        var counts = new Dictionary<int, int> { [0] = 1 };
        var running = 0;
        var found = 0;
        var steps = new List<VisualizationStep>();

        string MapText() => "{" + string.Join(", ", counts.Select(kv => $"{kv.Key}: {kv.Value}")) + "}";

        steps.Add(new VisualizationStep(
            new Dictionary<string, object> { ["array"] = arr, ["tracker"] = 0, ["trackerLabel"] = "runs found" },
            [],
            $"k = {k}. running = 0 and the map of prefix counts starts as {MapText()}: the empty prefix before index 0."
        ));

        for (var i = 0; i < nums.Length; i++)
        {
            running += nums[i];
            var need = running - k;
            var hits = counts.GetValueOrDefault(need);
            found += hits;
            var lookup = hits > 0
                ? $"prefix {need} was seen {hits} time{(hits == 1 ? "" : "s")}, so {hits} run{(hits == 1 ? "" : "s")} ending here sum{(hits == 1 ? "s" : "")} to {k}"
                : $"prefix {need} hasn't been seen, so no run ending here sums to {k}";
            counts[running] = counts.GetValueOrDefault(running) + 1;
            steps.Add(new VisualizationStep(
                new Dictionary<string, object> { ["array"] = arr, ["tracker"] = found, ["trackerLabel"] = "runs found" },
                [i],
                $"Add {nums[i]}: running = {running}. Look up running - k = {need}: {lookup}. Then record {running}: map is {MapText()}."
            ));
        }

        steps.Add(new VisualizationStep(
            new Dictionary<string, object> { ["array"] = arr, ["tracker"] = found, ["trackerLabel"] = "runs found" },
            [],
            $"Done in one pass: {found} subarrays sum to {k}. Each lookup was Two Sum's \"have I seen the complement?\", asked of prefix sums."
        ));
        return steps;
    }
}
