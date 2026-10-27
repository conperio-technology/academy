namespace DsaAcademy.Content.Concepts;

public class BlockLongestSumK : BuildingBlock
{
    public override string Id => "block-longest-sum-k";
    public override string Title => "Block: Prefix Sum Plus a Hashmap";
    public override string OneLiner => "Find the longest subarray that sums to k by remembering where each running sum first appeared.";
    public override string KeyTakeaway =>
        "A subarray sums to k when two running sums differ by k. Seed the map with {0: -1} so subarrays starting at index 0 count, and keep only the first index of each sum.";

    public override string Explanation =>
        "Return the length of the longest contiguous subarray of nums whose sum is exactly k, or 0 if there is none. Values can be negative, which is why a sliding window doesn't work here.\n" +
        "\n" +
        "Walk the array keeping the running sum. If sum - k was seen before at index j, the elements after j up to here sum to k, so i - j is a candidate. Store each running sum's index only the first time you see it: the earliest start gives the longest subarray. Subarray Sum Equals K is this block with counts in the map instead of indices.";

    protected override string[] Plan =>
    [
        "Make a map from running sum to the first index it appeared at, seeded with {0: -1} for the empty prefix.",
        "Walk the array keeping a running sum.",
        "If sum - k is in the map, the subarray after that index sums to k: update the best length.",
        "Store the sum's index only if the sum is not in the map yet.",
        "Return the best length.",
    ];

    protected override string CSharpSignature => "public static int LongestSubarraySumK(int[] nums, int k)";
    protected override string CSharpReturnStub => "return 0;";
    protected override string PythonSignature => "def longest_subarray_sum_k(nums, k):";
    protected override string PythonReturnStub => "return 0";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.LongestSubarraySumK",
        ["python"] = "longest_subarray_sum_k",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("[1, -1, 5, -2, 3], 3", "4"),
        new TestCase("[-2, -1, 2, 1], 1", "2"),
        new TestCase("[1, 2, 3], 7", "0"),
        new TestCase("[], 0", "0"),
        new TestCase("[0, 0, 0], 0", "3"),
        new TestCase("[3], 3", "1"),
        new TestCase("[1, 2, 1, 2, 1], 3", "2"),
    ];

    public override string CSharpCallTemplate => "Solution.LongestSubarraySumK({input})";
    public override string PythonCallTemplate => "longest_subarray_sum_k({input})";

    public override List<string> Gotchas =>
    [
        "Forgetting the {0: -1} seed, which misses subarrays that start at index 0.",
        "Overwriting a sum's index with a later one, which shortens the subarrays found.",
    ];
}
