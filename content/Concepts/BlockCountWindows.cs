namespace DsaAcademy.Content.Concepts;

public class BlockCountWindows : BuildingBlock
{
    public override string Id => "block-count-windows";
    public override string Title => "Block: A Fixed-Size Sliding Window";
    public override string OneLiner => "Count the windows of exactly k elements whose sum reaches a target, updating the sum as the window slides.";
    public override string KeyTakeaway =>
        "A fixed window keeps one running sum: add the element entering, subtract the one leaving (index i - k). Build the first window before the loop.";

    public override string Explanation =>
        "Return how many contiguous runs of exactly k elements have a sum of at least target. If k is longer than the array, there are none.\n" +
        "\n" +
        "Sum nums[0..k-1] first. Then for each i from k to the end, add nums[i] and subtract nums[i - k]; each update is the next window. Check the first window and every slid one. Maximum Average Subarray and fixed-length anagram searches are this block.";

    protected override string[] Plan =>
    [
        "If k is longer than the array, no window fits: return 0.",
        "Sum the first k elements; that is the first window.",
        "Count it if it reaches the target.",
        "Slide: for each i from k to the end, add nums[i] and subtract nums[i - k], then check again.",
        "Return the count.",
    ];

    protected override string CSharpSignature => "public static int CountWindows(int[] nums, int k, int target)";
    protected override string CSharpReturnStub => "return 0;";
    protected override string PythonSignature => "def count_windows(nums, k, target):";
    protected override string PythonReturnStub => "return 0";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CountWindows",
        ["python"] = "count_windows",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("[2, 2, 2, 2, 5, 5, 5, 8], 3, 12", "3"),
        new TestCase("[1, 1, 1], 4, 1", "0"),
        new TestCase("[5], 1, 5", "1"),
        new TestCase("[1, 2, 3, 4, 5], 2, 7", "2"),
        new TestCase("[-1, -2, 3], 2, 0", "1"),
        new TestCase("[0, 0, 0, 0], 2, 0", "3"),
    ];

    public override string CSharpCallTemplate => "Solution.CountWindows({input})";
    public override string PythonCallTemplate => "count_windows({input})";

    public override List<string> Gotchas =>
    [
        "Forgetting to check the very first window.",
        "Subtracting nums[i - k + 1] instead of nums[i - k].",
    ];
}
