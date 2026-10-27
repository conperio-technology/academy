namespace DsaAcademy.Content.Concepts;

public class BlockPreviousSmaller : BuildingBlock
{
    public override string Id => "block-previous-smaller";
    public override string Title => "Block: A Monotonic Stack";
    public override string OneLiner => "For each element, find the index of the nearest element to its left that is strictly smaller, with a stack of indices.";
    public override string KeyTakeaway =>
        "A monotonic stack pops everything that can never be an answer again before it pushes. Store indices, not values, and get the strict or non-strict comparison right for the question.";

    public override string Explanation =>
        "Return an array where entry i is the index of the closest j < i with nums[j] < nums[i], or -1 if there is none. [3, 7, 8, 4] gives [-1, 0, 1, 0].\n" +
        "\n" +
        "Walk left to right with a stack of indices whose values increase from bottom to top. Before handling nums[i], pop every index whose value is greater than or equal to nums[i]: those can't be the answer for i or anything after it, because nums[i] is closer and no larger. The top of the stack, if any, is the answer; then push i. Next Greater Element, Daily Temperatures and Largest Rectangle in Histogram are this block facing the other way or with a different comparison.";

    protected override string[] Plan =>
    [
        "Make a result array and an empty stack of indices.",
        "Walk the array left to right.",
        "Pop indices while the value on top is greater than or equal to the current value: they can never be an answer again.",
        "The answer is the index now on top of the stack, or -1 if it is empty; then push the current index.",
        "Return the result.",
    ];

    protected override string CSharpSignature => "public static int[] PreviousSmaller(int[] nums)";
    protected override string CSharpReturnStub => "return new int[nums.Length];";
    protected override string PythonSignature => "def previous_smaller(nums):";
    protected override string PythonReturnStub => "return [0] * len(nums)";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.PreviousSmaller",
        ["python"] = "previous_smaller",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("[3, 7, 8, 4]", "[-1,0,1,0]"),
        new TestCase("[]", "[]"),
        new TestCase("[5, 5, 5]", "[-1,-1,-1]"),
        new TestCase("[1, 2, 3]", "[-1,0,1]"),
        new TestCase("[3, 2, 1]", "[-1,-1,-1]"),
        new TestCase("[2, 5, 1, 4, 3]", "[-1,0,-1,2,2]"),
    ];

    public override string CSharpCallTemplate => "Solution.PreviousSmaller({input})";
    public override string PythonCallTemplate => "previous_smaller({input})";

    public override List<string> Gotchas =>
    [
        "Using > instead of >= when popping, so equal values are wrongly reported as smaller.",
        "Pushing values instead of indices, then having no index to report.",
    ];
}
