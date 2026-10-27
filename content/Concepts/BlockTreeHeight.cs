namespace DsaAcademy.Content.Concepts;

public class BlockTreeHeight : BuildingBlock
{
    public override string Id => "block-tree-height";
    public override string Title => "Block: Tree Recursion";
    public override string OneLiner => "Return the height of a binary tree: the number of nodes on its longest root-to-leaf path.";
    public override string KeyTakeaway =>
        "Tree recursion is three lines: the base case for null, recurse into both children, combine. Write the null case first and the rest follows.";

    public override string Explanation =>
        "Return the number of nodes on the longest path from the root down to a leaf. An empty tree has height 0 and a single node has height 1. Trees are given as LeetCode-style level-order lists, with null for a missing child.\n" +
        "\n" +
        "If the node is null, return 0. Otherwise ask for the height of the left subtree and of the right subtree, and return 1 plus the larger. Diameter, balanced-tree checks and path sums are all this shape with a different combine step.";

    protected override string[] Plan =>
    [
        "Base case: an empty tree (null node) has height 0.",
        "Ask for the height of the left subtree.",
        "Ask for the height of the right subtree.",
        "Return one more than the larger of the two.",
    ];
    protected override string[] CSharpProvided => ["TreeNode: int Val, TreeNode? Left, TreeNode? Right"];
    protected override string[] PythonProvided => ["TreeNode: val, left, right"];

    protected override string CSharpSignature => "public static int Height(TreeNode? root)";
    protected override string CSharpReturnStub => "return 0;";
    protected override string PythonSignature => "def height(root):";
    protected override string PythonReturnStub => "return 0";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Height",
        ["python"] = "height",
    };

    public override string? CSharpHarnessPreamble =>
        BlockHarness.TreeNodeCSharp;

    public override string? PythonHarnessPreamble =>
        BlockHarness.TreeNodePython;

    public override List<TestCase> TestCases =>
    [
        new TestCase("[3, 9, 20, null, null, 15, 7]", "3"),
        new TestCase("[]", "0"),
        new TestCase("[1]", "1"),
        new TestCase("[1, 2, null, 3, null, 4]", "4"),
        new TestCase("[1, null, 2]", "2"),
        new TestCase("[1, 2, 3, 4, 5, 6, 7]", "3"),
    ];

    public override string CSharpCallTemplate => "Solution.Height(LevelOrderTree.Build({input}))";
    public override string PythonCallTemplate => "height(build_level_order_tree({input}))";

    public override List<string> Gotchas =>
    [
        "Forgetting the null base case, or returning 1 for null, which makes every height one too big.",
    ];
}
