namespace DsaAcademy.Content.Concepts;

public class BlockRotateArray : BuildingBlock
{
    public override string Id => "block-rotate-array";
    public override string Title => "Block: Swap and Reverse a Range";
    public override string OneLiner => "Rotate an array right by k places in place, using three reversals.";
    public override string KeyTakeaway =>
        "Reversing a range with two pointers and a swap is a three-line helper worth having in your fingers. Rotation is three calls to it, after reducing k modulo the length.";

    public override string Explanation =>
        "Rotate nums to the right by k steps in place and return it: [1, 2, 3, 4, 5, 6, 7] with k = 3 becomes [5, 6, 7, 1, 2, 3, 4]. k can be larger than the length.\n" +
        "\n" +
        "Write a helper that reverses nums[lo..hi] by swapping the ends and stepping inward ((a[i], a[j]) = (a[j], a[i]) in C#, a[i], a[j] = a[j], a[i] in Python). Then reverse the whole array, reverse the first k elements, and reverse the rest. Reduce k with k % n first, and check for an empty array before that, since % 0 fails.";

    protected override string[] Plan =>
    [
        "If the array is empty, return it.",
        "Reduce k with k modulo the length, since rotating by the length changes nothing.",
        "Reverse the whole array.",
        "Reverse the first k elements, then reverse the rest.",
        "Return the array.",
    ];

    protected override string CSharpSignature => "public static int[] RotateRight(int[] nums, int k)";
    protected override string CSharpReturnStub => "return nums;";
    protected override string PythonSignature => "def rotate_right(nums, k):";
    protected override string PythonReturnStub => "return nums";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.RotateRight",
        ["python"] = "rotate_right",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("[1, 2, 3, 4, 5, 6, 7], 3", "[5,6,7,1,2,3,4]"),
        new TestCase("[1, 2], 5", "[2,1]"),
        new TestCase("[], 3", "[]"),
        new TestCase("[1], 0", "[1]"),
        new TestCase("[1, 2, 3], 3", "[1,2,3]"),
        new TestCase("[-1, -100, 3, 99], 2", "[3,99,-1,-100]"),
    ];

    public override string CSharpCallTemplate => "Solution.RotateRight({input})";
    public override string PythonCallTemplate => "rotate_right({input})";

    public override List<string> Gotchas =>
    [
        "Forgetting k % n, so k larger than the length reverses past the end.",
        "Taking k % n before checking for an empty array: division by zero.",
    ];
}
