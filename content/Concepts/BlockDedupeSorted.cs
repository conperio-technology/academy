namespace DsaAcademy.Content.Concepts;

public class BlockDedupeSorted : BuildingBlock
{
    public override string Id => "block-dedupe-sorted";
    public override string Title => "Block: Fast and Slow Pointers";
    public override string OneLiner => "Remove duplicates from a sorted array in place with a slow pointer that writes and a fast pointer that reads.";
    public override string KeyTakeaway =>
        "One pointer reads every element, the other marks where the next keeper goes. Compare against what you last kept, not against the previous element you read.";

    public override string Explanation =>
        "nums is sorted. Move its distinct values to the front, in order, without a second array, and return that front part. [0, 0, 1, 1, 1, 2] gives [0, 1, 2].\n" +
        "\n" +
        "slow is the index of the last value kept, starting at 0. fast walks from 1 to the end. When nums[fast] differs from nums[slow], move slow forward one and copy nums[fast] there. The first slow + 1 elements are the answer. Move Zeroes, Remove Element and partition steps are this block with a different keep test.";

    protected override string[] Plan =>
    [
        "If the array is empty, return it.",
        "Keep a slow pointer at the last unique value written, starting at index 0.",
        "Move a fast pointer from index 1 to the end.",
        "When nums[fast] differs from nums[slow], move slow forward and copy the value there.",
        "Return the first slow + 1 elements.",
    ];

    protected override string CSharpSignature => "public static int[] DedupeSorted(int[] nums)";
    protected override string CSharpReturnStub => "return nums;";
    protected override string PythonSignature => "def dedupe_sorted(nums):";
    protected override string PythonReturnStub => "return nums";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.DedupeSorted",
        ["python"] = "dedupe_sorted",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("[1, 1, 2]", "[1,2]"),
        new TestCase("[]", "[]"),
        new TestCase("[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]", "[0,1,2,3,4]"),
        new TestCase("[5]", "[5]"),
        new TestCase("[-3, -3, -3]", "[-3]"),
        new TestCase("[1, 2, 3]", "[1,2,3]"),
    ];

    public override string CSharpCallTemplate => "Solution.DedupeSorted({input})";
    public override string PythonCallTemplate => "dedupe_sorted({input})";

    public override List<string> Gotchas =>
    [
        "Starting slow at -1 or fast at 0, which compares an element with itself or reads out of range.",
        "Returning slow elements instead of slow + 1.",
    ];
}
