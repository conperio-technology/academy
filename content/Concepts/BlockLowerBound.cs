namespace DsaAcademy.Content.Concepts;

public class BlockLowerBound : BuildingBlock
{
    public override string Id => "block-lower-bound";
    public override string Title => "Block: Binary Search for the First Index";
    public override string OneLiner => "In a sorted array, find the first index whose value is at least x, or the length if there is none.";
    public override string KeyTakeaway =>
        "Use the half-open template: lo = 0, hi = n, loop while lo < hi, then lo = mid + 1 or hi = mid. It never needs a special case and always ends with lo as the answer.";

    public override string Explanation =>
        "nums is sorted ascending. Return the smallest index i with nums[i] >= x, or nums.Length (len(nums)) if every value is smaller. This is lower_bound in C++ and bisect_left in Python.\n" +
        "\n" +
        "Keep the answer inside [lo, hi), with hi = n meaning \"not found\". Take mid = lo + (hi - lo) / 2. If nums[mid] < x, the answer is right of mid, so lo = mid + 1. Otherwise mid might be the answer, so hi = mid. When lo == hi, that is the answer. First and last position, search insert position and every \"first value that works\" search are this loop.";

    protected override string[] Plan =>
    [
        "Set lo = 0 and hi = n (one past the end, so not found returns n).",
        "While lo < hi, take mid = lo + (hi - lo) / 2.",
        "If nums[mid] < x, the answer is to the right: lo = mid + 1.",
        "Otherwise mid could be the answer: hi = mid.",
        "Return lo.",
    ];

    protected override string CSharpSignature => "public static int FirstAtLeast(int[] nums, int x)";
    protected override string CSharpReturnStub => "return -1;";
    protected override string PythonSignature => "def first_at_least(nums, x):";
    protected override string PythonReturnStub => "return -1";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.FirstAtLeast",
        ["python"] = "first_at_least",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("[1, 3, 3, 5, 8], 3", "1"),
        new TestCase("[1, 3, 3, 5, 8], 4", "3"),
        new TestCase("[1, 3, 3, 5, 8], 9", "5"),
        new TestCase("[1, 3, 3, 5, 8], 0", "0"),
        new TestCase("[], 7", "0"),
        new TestCase("[2, 2, 2], 2", "0"),
        new TestCase("[-5, -1, 0, 4], -1", "1"),
    ];

    public override string CSharpCallTemplate => "Solution.FirstAtLeast({input})";
    public override string PythonCallTemplate => "first_at_least({input})";

    public override List<string> Gotchas =>
    [
        "Mixing templates: lo <= hi with hi = mid loops forever; lo < hi with hi = n - 1 misses \"not found\".",
        "Writing hi = mid - 1 when mid itself could be the answer.",
    ];
}
