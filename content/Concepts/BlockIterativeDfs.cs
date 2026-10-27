namespace DsaAcademy.Content.Concepts;

public class BlockIterativeDfs : BuildingBlock
{
    public override string Id => "block-iterative-dfs";
    public override string Title => "Block: Iterative DFS With a Stack";
    public override string OneLiner => "Return the order a depth-first search visits nodes from a start, using an explicit stack instead of recursion.";
    public override string KeyTakeaway =>
        "With an explicit stack, check visited when you pop and push neighbours in reverse. That reproduces the recursive order exactly, and it never overflows the call stack.";

    public override string Explanation =>
        "adj[i] lists node i's neighbours in the order to explore them. Return the nodes in the order a recursive DFS from start would first visit them: visit a node, then fully explore its first unvisited neighbour, then the next.\n" +
        "\n" +
        "Keep a stack that starts with start. Pop a node; if it was already visited, skip it. Otherwise mark it, record it, and push its unvisited neighbours in reverse order, so the first-listed neighbour is on top and popped next.\n" +
        "\n" +
        "Why check on pop here, when BFS marks on push? A node can be pushed by an early neighbour and reached sooner through a deeper path; marking at push time would lock in the early position and give a different order from recursion. Checking on pop costs a few duplicate stack entries and gets the depth-first order right. Grids, flood fills and anything deep enough to overflow recursion use this block.";

    protected override string[] Plan =>
    [
        "Make an empty visited set, an empty order list, and a stack holding the start.",
        "While the stack is not empty, pop a node; skip it if it was already visited.",
        "Mark it visited and append it to the order.",
        "Push its unvisited neighbours in reverse, so the first-listed neighbour is popped next.",
        "Return the order.",
    ];

    protected override string CSharpSignature => "public static List<int> DfsOrder(int[][] adj, int start)";
    protected override string CSharpReturnStub => "return new List<int>();";
    protected override string PythonSignature => "def dfs_order(adj, start):";
    protected override string PythonReturnStub => "return []";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.DfsOrder",
        ["python"] = "dfs_order",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("[[1, 2], [0, 3], [0, 3], [1, 2]], 0", "[0,1,3,2]"),
        new TestCase("[[1, 2], [3], [3], []], 0", "[0,1,3,2]"),
        new TestCase("[[]], 0", "[0]"),
        new TestCase("[[1], [0], [3], [2]], 2", "[2,3]"),
        new TestCase("[[3, 1, 2], [0], [0], [0]], 0", "[0,3,1,2]"),
        new TestCase("[[1, 2], [2], [0, 3], [1]], 0", "[0,1,2,3]"),
    ];

    public override string CSharpCallTemplate => "Solution.DfsOrder({input})";
    public override string PythonCallTemplate => "dfs_order({input})";

    public override List<string> Gotchas =>
    [
        "Pushing neighbours in listed order, which explores the last neighbour first.",
        "Marking visited on push, which gives a different order from recursive DFS on graphs with cycles.",
    ];
}
