namespace DsaAcademy.Content.Concepts;

public class BlockIndexOfMax : BuildingBlock
{
    public override string Id => "block-index-of-max";
    public override string Title => "Block: Best So Far With an Index";
    public override string OneLiner => "Walk an array with its index and return the position of the largest value (the first one on a tie).";
    public override string KeyTakeaway =>
        "Start the best so far at the first element, never at 0: an array of negatives has no 0 in it.";

    public override string Explanation =>
        "Return the index of the largest value in nums, the first such index when it repeats, or -1 for an empty array.\n" +
        "\n" +
        "The construct is a loop that sees both the index and the value (a for loop with i in C#, enumerate in Python) plus one \"best so far\" variable. Seeding the best with element 0 instead of a made-up number is the habit to build.";

    protected override string[] Plan =>
    [
        "Return -1 straight away if the array is empty.",
        "Start the best index at 0, so the first element is the best so far.",
        "Walk the rest of the array with its index.",
        "When a value is strictly greater than the best so far, remember its index.",
        "Return the best index.",
    ];

    protected override string CSharpSignature => "public static int IndexOfMax(int[] nums)";
    protected override string CSharpReturnStub => "return -1;";
    protected override string PythonSignature => "def index_of_max(nums):";
    protected override string PythonReturnStub => "return -1";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.IndexOfMax",
        ["python"] = "index_of_max",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("[3, 7, 2, 7]", "1"),
        new TestCase("[-5, -2, -9]", "1"),
        new TestCase("[]", "-1"),
        new TestCase("[4]", "0"),
        new TestCase("[0, 0]", "0"),
        new TestCase("[-1]", "0"),
    ];

    public override string CSharpCallTemplate => "Solution.IndexOfMax({input})";
    public override string PythonCallTemplate => "index_of_max({input})";

    public override List<string> Gotchas =>
    [
        "Starting the best value at 0, which is wrong when every value is negative.",
        "Using >= instead of >, which returns the last index on a tie.",
    ];
}
