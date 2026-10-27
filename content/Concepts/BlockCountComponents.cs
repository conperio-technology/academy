namespace DsaAcademy.Content.Concepts;

public class BlockCountComponents : BuildingBlock
{
    public override string Id => "block-count-components";
    public override string Title => "Block: Recursive DFS Over Every Node";
    public override string OneLiner => "Count the connected components of an undirected graph by starting a DFS from every node not yet visited.";
    public override string KeyTakeaway =>
        "The outer loop over every node is half the block: each node still unvisited when the loop reaches it starts a new component.";

    public override string Explanation =>
        "There are n nodes, 0 to n - 1, and edges lists undirected edges [a, b]. Return how many connected components there are. Five nodes with edges [0, 1], [1, 2], [3, 4] form 2.\n" +
        "\n" +
        "Build an adjacency list, adding each edge in both directions. Write dfs(node): mark it, then call dfs on each unvisited neighbour. Then loop over all nodes; when one is unvisited, count a component and call dfs on it, which marks the whole component.";

    protected override string[] Plan =>
    [
        "Build an adjacency list, adding each edge in both directions.",
        "Make a visited array.",
        "Write dfs(node): mark it, then call dfs on each unvisited neighbour.",
        "Loop over every node; each one still unvisited starts a new component: count it and call dfs.",
        "Return the count.",
    ];

    protected override string CSharpSignature => "public static int CountComponents(int n, int[][] edges)";
    protected override string CSharpReturnStub => "return 0;";
    protected override string PythonSignature => "def count_components(n, edges):";
    protected override string PythonReturnStub => "return 0";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CountComponents",
        ["python"] = "count_components",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("5, [[0, 1], [1, 2], [3, 4]]", "2"),
        new TestCase("5, []", "5"),
        new TestCase("1, []", "1"),
        new TestCase("4, [[0, 1], [1, 2], [2, 3], [3, 0]]", "1"),
        new TestCase("6, [[0, 1], [2, 3], [4, 5], [1, 0]]", "3"),
    ];

    public override string CSharpCallTemplate => "Solution.CountComponents({input})";
    public override string PythonCallTemplate => "count_components({input})";

    public override List<string> Gotchas =>
    [
        "Adding each edge in one direction only, which splits components in an undirected graph.",
        "Forgetting the outer loop, so only the component of node 0 is ever explored.",
    ];
}
