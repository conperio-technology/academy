namespace DsaAcademy.Content.Concepts;

public class BlockBracketStack : BuildingBlock
{
    public override string Id => "block-bracket-stack";
    public override string Title => "Block: Push, Pop and Peek a Stack";
    public override string OneLiner => "Check that every bracket in a string is closed in the right order, ignoring other characters.";
    public override string KeyTakeaway =>
        "Before every pop, ask whether the stack is empty. That one check is the difference between a stack block that works and one that throws on \")\".";

    public override string Explanation =>
        "Return true if the brackets (), [] and {} in s are balanced: every opener is closed by the matching closer, in the right order. Other characters are ignored, so \"f(a[0]) + {b}\" is balanced and \"([)]\" isn't.\n" +
        "\n" +
        "Push openers. On a closer, the stack must be non-empty and its top must be the matching opener; then pop. A small map from closer to opener saves three if statements. The string is balanced only if the stack is empty at the end.";

    protected override string[] Plan =>
    [
        "Make an empty stack and a map from each closing bracket to its opener.",
        "For each character, push it if it is an opening bracket.",
        "If it is a closing bracket, fail when the stack is empty or its top is not the matching opener; otherwise pop.",
        "Ignore every other character.",
        "Return true only if the stack is empty at the end.",
    ];

    protected override string CSharpSignature => "public static bool IsBalanced(string s)";
    protected override string CSharpReturnStub => "return false;";
    protected override string PythonSignature => "def is_balanced(s):";
    protected override string PythonReturnStub => "return False";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.IsBalanced",
        ["python"] = "is_balanced",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("\"([]{})\"", "true"),
        new TestCase("\"([)]\"", "false"),
        new TestCase("\"\"", "true"),
        new TestCase("\"((\"", "false"),
        new TestCase("\"))\"", "false"),
        new TestCase("\"f(a[0]) + {b}\"", "true"),
        new TestCase("\"}\"", "false"),
    ];

    public override string CSharpCallTemplate => "Solution.IsBalanced({input})";
    public override string PythonCallTemplate => "is_balanced({input})";

    public override List<string> Gotchas =>
    [
        "Popping or peeking an empty stack on a closer with no opener.",
        "Returning true at the end without checking the stack is empty, so \"((\" passes.",
    ];
}
