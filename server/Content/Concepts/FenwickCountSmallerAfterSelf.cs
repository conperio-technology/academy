namespace DsaAcademy.Content.Concepts;

public class FenwickCountSmallerAfterSelf : IConcept
{
    public string Id => "fenwick-count-smaller-after-self";
    public string Track => "range queries";
    public int Order => 142;
    public string Title => "Fenwick Tree: Count of Smaller Numbers After Self";
    public string OneLiner => "For each element, count how many elements to its right are strictly smaller, in O(n log n), with a Fenwick tree indexed by value.";
    public string KeyTakeaway =>
        "Scan from right to left and keep a Fenwick tree of counts indexed by VALUE (after coordinate " +
        "compression, value rank 1..k). Everything already in the tree is to the right of the current element, " +
        "so the answer for it is prefix(rank - 1), the number of seen values strictly smaller. Then add(rank, 1). " +
        "n queries and n adds, each O(log n).";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given nums, return counts where counts[i] is the number of j > i with nums[j] < nums[i]. For [5, 2, 6, 1] " +
        "the answer is [2, 1, 1, 0]: two numbers after 5 are smaller (2 and 1), one after 2, one after 6, none " +
        "after 1. This is LeetCode 315 (Hard). The double loop is O(n^2), too slow for n = 100,000.\n\n" +
        "Reframe it. Walk from the right end towards the left, and keep a record of the values you have passed. " +
        "When you reach nums[i], every recorded value is to its right, so counts[i] = \"how many recorded values " +
        "are less than nums[i]\". That is a prefix count over values, and the record changes as you go: point " +
        "update, prefix query, exactly what a Fenwick tree does.\n\n" +
        "The Fenwick tree is indexed by value, not by position: slot v counts how many times value v has been " +
        "seen, and prefix(v - 1) counts the seen values below v. Values can be negative or as large as 10^9, " +
        "though, and a tree needs small positive indices. Coordinate compression fixes that: sort the distinct " +
        "values, and replace each value by its rank, its 1-based position in that sorted list. Ranks preserve " +
        "order (a < b exactly when rank(a) < rank(b)) and run from 1 to k, where k <= n is the number of distinct " +
        "values. Look ranks up with a dictionary or binary search.\n\n" +
        "Algorithm: ranks via compression; tree = new int[k + 1]; for i from n - 1 down to 0: r = rank(nums[i]); " +
        "counts[i] = prefix(r - 1); add(r, 1). The \"strictly smaller\" is the - 1: equal values share a rank and " +
        "are not counted.\n\n" +
        "Recall the two Fenwick loops (Range Queries tool): add(i, d) climbs with i += i & -i, prefix(i) descends " +
        "with i -= i & -i, where i & -i keeps only i's lowest set bit. Both are O(log k).\n\n" +
        "The other standard answer is merge sort: while merging, every element taken from the left half is " +
        "bigger than the right-half elements already taken, so add that many to its count. Also O(n log n), but " +
        "it must carry original indices through the sort. A segment tree over ranks works too. Mention one " +
        "alternative in an interview.\n\n" +
        "The visualization runs [2, 0, 1, -3, 5, -3, 2]. Distinct values sorted: -3, 0, 1, 2, 5, so ranks 1 to 5. " +
        "The array shown is the Fenwick tree over those ranks (cell 0 unused).";

    public List<string> RecognitionSignals =>
    [
        "\"For each element, how many elements after (or before) it are smaller / larger?\"",
        "A pair-counting problem over i < j with a value comparison: n^2 pairs, but n is 100,000.",
        "Values are large or negative but only their ORDER matters: compress them to ranks first.",
    ];

    public List<string> Gotchas =>
    [
        "Query before you add: the current element must not count itself.",
        "Strictly smaller means prefix(rank - 1), not prefix(rank); duplicates share a rank and must not count each other.",
        "Compress with the distinct sorted values; a rank of 0 would break the 1-indexed tree.",
        "Scan right to left so that what's in the tree is exactly the elements after i.",
    ];

    public List<string> ConfusableWith =>
    [
        "Fenwick Tree: Count Inversions (this track) is the sum of this answer array: count pairs, not per-element counts.",
        "Monotonic Stack: Find the Next Greater Element (Patterns) finds the NEAREST larger element to one side, not how many there are.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static List<int> CountSmaller(int[] nums)\n" +
            "    {\n" +
            "        // TODO: compress: sorted distinct values -> rank 1..k (Dictionary or binary search).\n" +
            "        // tree = new int[k + 1]. For i from n - 1 down to 0:\n" +
            "        //   r = rank of nums[i]; counts[i] = Prefix(r - 1); Add(r, 1).\n" +
            "        return new List<int>();\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def count_smaller(nums):\n" +
            "    # TODO: compress: rank = {v: i + 1 for i, v in enumerate(sorted(set(nums)))}\n" +
            "    # tree = [0] * (len(rank) + 1). For i from n - 1 down to 0:\n" +
            "    #   r = rank[nums[i]]; counts[i] = prefix(r - 1); add(r, 1)\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CountSmaller",
        ["python"] = "count_smaller",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([5, 2, 6, 1]), "[2, 1, 1, 0]"),
        new TestCase(Lit.IntArray([-1]), "[0]"),
        new TestCase(Lit.IntArray([-1, -1]), "[0, 0]"),
        new TestCase(Lit.IntArray([1, 2, 3, 4]), "[0, 0, 0, 0]"),
        new TestCase(Lit.IntArray([4, 3, 2, 1]), "[3, 2, 1, 0]"),
        new TestCase(Lit.IntArray([2, 0, 1, -3, 5, -3, 2]), "[4, 2, 2, 0, 2, 0, 0]"),
        new TestCase(Lit.IntArray([1000000000, -1000000000, 0, 999999999, -5]), "[4, 0, 1, 1, 0]"),
        new TestCase(Lit.IntArray([3, 3, 3, 1, 3]), "[1, 1, 1, 0, 0]"),
    ];

    public string CSharpCallTemplate => "Solution.CountSmaller({input})";
    public string PythonCallTemplate => "count_smaller({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [2, 0, 1, -3, 5, -3, 2];
        var sorted = nums.Distinct().Order().ToArray();
        var rank = sorted.Select((v, i) => (v, i + 1)).ToDictionary(p => p.v, p => p.Item2);
        var viz = new FenwickViz(sorted.Length, "counts[i]");
        var counts = new int[nums.Length];
        viz.Note($"nums = [{string.Join(", ", nums)}]. Compress: distinct sorted values {string.Join(", ", sorted)} get ranks 1 to {sorted.Length}. The Fenwick tree below counts seen values by rank; it starts empty.");
        for (var i = nums.Length - 1; i >= 0; i--)
        {
            var r = rank[nums[i]];
            var c = (int)viz.Prefix(r - 1, $"i = {i}, nums[i] = {nums[i]} (rank {r}). Strictly smaller seen values:", counts[i]);
            counts[i] = c;
            viz.Add(r, 1, $"counts[{i}] = {c}. Now record rank {r} as seen:", c);
        }
        viz.Note($"Done: counts = [{string.Join(", ", counts)}]. {nums.Length} prefix queries and {nums.Length} adds, each O(log k), so O(n log n) with the sort.", 0);
        return viz.Steps;
    }
}
