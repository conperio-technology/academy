namespace DsaAcademy.Content.Concepts;

public class BlockFirstRepeat : BuildingBlock
{
    public override string Id => "block-first-repeat";
    public override string Title => "Block: A Set of Seen Values";
    public override string OneLiner => "Walk an array with a set of values seen so far and return the index where a value shows up for the second time.";
    public override string KeyTakeaway =>
        "A seen set answers \"have I met this before?\" in O(1). Check first, then add: the order of those two lines is the whole construct.";

    public override string Explanation =>
        "Return the index of the first element whose value already appeared earlier in the array, or -1 if every value is distinct. In [2, 1, 3, 1, 2] the answer is 3: the second 1 comes before the second 2.\n" +
        "\n" +
        "Keep a set of the values you have passed. For each element, ask the set first; if it is there, you have your answer. Only then add the value. The same check-then-add shape is the visited set in BFS and DFS.";

    protected override string[] Plan =>
    [
        "Make an empty set of values seen so far.",
        "Walk the array with its index.",
        "If the value is already in the set, return its index.",
        "Otherwise add the value to the set.",
        "After the loop, return -1.",
    ];

    protected override string CSharpSignature => "public static int FirstRepeatIndex(int[] nums)";
    protected override string CSharpReturnStub => "return -1;";
    protected override string PythonSignature => "def first_repeat_index(nums):";
    protected override string PythonReturnStub => "return -1";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.FirstRepeatIndex",
        ["python"] = "first_repeat_index",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("[2, 1, 3, 1, 2]", "3"),
        new TestCase("[]", "-1"),
        new TestCase("[1, 2, 3]", "-1"),
        new TestCase("[5, 5]", "1"),
        new TestCase("[-1, 4, -1]", "2"),
        new TestCase("[7, 8, 9, 7, 8]", "3"),
    ];

    public override string CSharpCallTemplate => "Solution.FirstRepeatIndex({input})";
    public override string PythonCallTemplate => "first_repeat_index({input})";

    public override List<string> Gotchas =>
    [
        "Adding the value before checking it, which makes every value look like a repeat.",
    ];
}
