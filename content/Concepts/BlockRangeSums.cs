namespace DsaAcademy.Content.Concepts;

public class BlockRangeSums : BuildingBlock
{
    public override string Id => "block-range-sums";
    public override string Title => "Block: A Prefix Sum Array";
    public override string OneLiner => "Answer many range-sum queries with a prefix array one longer than the input.";
    public override string KeyTakeaway =>
        "Make the prefix array n + 1 long with prefix[0] = 0; then the sum of nums[l..r] is prefix[r + 1] minus prefix[l], with no special case for l = 0.";

    public override string Explanation =>
        "For each query [left, right] (inclusive, valid indices), return the sum of nums[left..right]. [1, 2, 3, 4] with queries [[0, 3], [1, 2]] gives [10, 5].\n" +
        "\n" +
        "Build prefix once: prefix[0] = 0 and prefix[i + 1] = prefix[i] + nums[i], so prefix[i] is the sum of the first i elements. Each query is then one subtraction. The extra leading 0 is what removes the off-by-one.";

    protected override string[] Plan =>
    [
        "Make a prefix array one longer than the input, starting with 0.",
        "Fill it so prefix[i + 1] = prefix[i] + nums[i].",
        "For each query [left, right], the sum is prefix[right + 1] minus prefix[left].",
        "Return the sums in query order.",
    ];

    protected override string CSharpSignature => "public static List<int> RangeSums(int[] nums, int[][] queries)";
    protected override string CSharpReturnStub => "return new List<int>();";
    protected override string PythonSignature => "def range_sums(nums, queries):";
    protected override string PythonReturnStub => "return []";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.RangeSums",
        ["python"] = "range_sums",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("[1, 2, 3, 4], [[0, 3], [1, 2], [2, 2]]", "[10,5,3]"),
        new TestCase("[5], [[0, 0]]", "[5]"),
        new TestCase("[-2, 0, 3, -5, 2, -1], [[0, 2], [2, 5], [0, 5]]", "[1,-1,-3]"),
        new TestCase("[1, 2], []", "[]"),
    ];

    public override string CSharpCallTemplate => "Solution.RangeSums({input})";
    public override string PythonCallTemplate => "range_sums({input})";

    public override List<string> Gotchas =>
    [
        "A prefix array of length n, which makes the l = 0 query a special case or an index error.",
        "prefix[r] - prefix[l] instead of prefix[r + 1] - prefix[l], dropping the last element.",
    ];
}
