namespace DsaAcademy.Content.Concepts;

public class PrefixSumsRangeQuery : IConcept
{
    public string Id => "prefix-sums-range-query";
    public string Track => "patterns";
    public string Title => "Prefix Sums: Answer Range-Sum Queries in O(1)";
    public string OneLiner => "Precompute running totals once, and any \"sum of elements from i to j\" becomes a single subtraction instead of a fresh loop.";
    public string KeyTakeaway =>
        "A prefix sum array where prefix[i] = sum of the first i elements turns any range sum [i..j] " +
        "into prefix[j+1] - prefix[i] -- O(1) per query after an O(n) one-time setup, instead of O(n) " +
        "EVERY query if you re-sum the range from scratch each time.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "If a problem asks for the sum of elements between two indices MANY times (not just once), " +
        "re-looping over the range from scratch every single query costs O(n) per query -- fine once, " +
        "expensive across many queries on a big array. A PREFIX SUM array fixes this: prefix[0] = 0, " +
        "and prefix[i] = prefix[i-1] + nums[i-1] for i from 1 to n -- each entry is the running total " +
        "of everything before it. Once built (a single O(n) pass), the sum of any range [i, j] " +
        "(inclusive) is just prefix[j+1] - prefix[i] -- one subtraction, regardless of how wide the " +
        "range is.\n\n" +
        "This works because prefix[j+1] already contains \"everything up to and including j,\" and " +
        "prefix[i] contains \"everything up to but not including i\" -- subtracting the second from " +
        "the first cancels out everything before index i, leaving exactly the range [i, j]. Building " +
        "this once and answering every query off it turns \"M queries over an array of size N\" from " +
        "O(N*M) into O(N + M) -- the entire point when M is large.\n\n" +
        "Watch the array below fill left to right into a prefix sum array, then see a range query " +
        "resolve in one subtraction instead of a fresh scan.";

    public List<string> RecognitionSignals =>
    [
        "The problem asks for the sum (or average) of a RANGE/SUBARRAY, and especially if it asks for MANY such ranges.",
        "You're about to write a loop inside a loop to sum a range for every query -- that's the O(N*M) shape prefix sums exist to avoid.",
    ];

    public List<string> Gotchas =>
    [
        "Off-by-one is the constant danger: prefix has N+1 entries (prefix[0] = 0), and the range [left, right] inclusive is prefix[right+1] - prefix[left], not prefix[right] - prefix[left].",
        "Rebuilding the prefix array for every query defeats the entire point -- build it ONCE, answer every query off the same array.",
    ];

    public List<string> ConfusableWith =>
    [
        "Sliding Window (this track) also processes a range of an array, but recomputes a WINDOW incrementally as it slides one element at a time; prefix sums answer a fixed, already-known range in one lookup with no incremental step needed.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int RangeSum(int[] nums, int left, int right)\n" +
            "    {\n" +
            "        // TODO: build a prefix array where prefix[i] = sum of nums[0..i-1].\n" +
            "        // Then return prefix[right + 1] - prefix[left].\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def range_sum(nums, left, right):\n" +
            "    # TODO: build a prefix array where prefix[i] = sum of nums[0..i-1].\n" +
            "    # Then return prefix[right + 1] - prefix[left].\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.RangeSum",
        ["python"] = "range_sum",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4, 5]), Lit.Int(1), Lit.Int(3)), "9"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4, 5]), Lit.Int(0), Lit.Int(4)), "15"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4, 5]), Lit.Int(2), Lit.Int(2)), "3"),
        new TestCase(Lit.Args(Lit.IntArray([-2, 4, -1, 3, 5]), Lit.Int(1), Lit.Int(3)), "6"),
        new TestCase(Lit.Args(Lit.IntArray([10]), Lit.Int(0), Lit.Int(0)), "10"),
    ];

    public string CSharpCallTemplate => "Solution.RangeSum({input})";
    public string PythonCallTemplate => "range_sum({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [3, 1, 4, 1, 5, 9];
        var steps = new List<VisualizationStep>();
        var prefix = new List<int> { 0 };

        object[] Snapshot() => prefix.Select(v => (object)v).ToArray();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot(), ["tracker"] = 0, ["trackerLabel"] = "prefix so far" },
            HighlightIndices: [0],
            Message: "prefix[0] = 0 -- the sum of nothing before index 0."
        ));

        for (var i = 0; i < nums.Length; i++)
        {
            var next = prefix[^1] + nums[i];
            prefix.Add(next);
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = Snapshot(), ["tracker"] = next, ["trackerLabel"] = "prefix so far" },
                HighlightIndices: [i + 1],
                Message: $"prefix[{i + 1}] = prefix[{i}] + nums[{i}] = {prefix[i]} + {nums[i]} = {next}."
            ));
        }

        const int left = 1, right = 4;
        var rangeSum = prefix[right + 1] - prefix[left];
        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot(), ["tracker"] = rangeSum, ["trackerLabel"] = $"sum of nums[{left}..{right}]" },
            HighlightIndices: [left, right + 1],
            Message: $"Query sum(nums[{left}..{right}]) = prefix[{right + 1}] - prefix[{left}] = {prefix[right + 1]} - {prefix[left]} = {rangeSum}. One subtraction, no rescanning."
        ));

        return steps;
    }
}
