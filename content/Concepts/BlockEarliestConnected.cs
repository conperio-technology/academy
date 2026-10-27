namespace DsaAcademy.Content.Concepts;

public class BlockEarliestConnected : BuildingBlock
{
    public override string Id => "block-earliest-connected";
    public override string Title => "Block: Union-Find";
    public override string OneLiner => "Process friendship logs in time order with union-find and return the moment everyone becomes connected.";
    public override string KeyTakeaway =>
        "Union-find is two short functions: find follows parents to the root (pointing nodes at it as it goes), and union joins two roots. Keep a component count and decrease it only when the roots differ.";

    public override string Explanation =>
        "n people, 0 to n - 1. logs holds [time, a, b], sorted by time: a and b become friends. Friendship is transitive. Return the earliest time at which everyone is connected, or -1 if that never happens.\n" +
        "\n" +
        "parent[i] = i to start and count = n. find(x) walks up to the root and sets parent links along the way to the root (path compression). union(a, b) finds both roots; if they differ, attach the lower-rank root under the other and decrease count. Return the log's time when count reaches 1. Redundant Connection, Kruskal's MST and Accounts Merge are this block.";

    protected override string[] Plan =>
    [
        "Make parent[i] = i, a rank array, and a component count of n.",
        "Write find(x): follow parents to the root and point the nodes on the way at it (path compression).",
        "Write union(a, b): find both roots; if they differ, attach the lower-rank root under the other and decrease the count.",
        "Process the logs in order; when the count reaches 1, return that log's time.",
        "If it never does, return -1.",
    ];

    protected override string CSharpSignature => "public static int EarliestAllConnected(int n, int[][] logs)";
    protected override string CSharpReturnStub => "return -1;";
    protected override string PythonSignature => "def earliest_all_connected(n, logs):";
    protected override string PythonReturnStub => "return -1";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.EarliestAllConnected",
        ["python"] = "earliest_all_connected",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("6, [[20190101, 0, 1], [20190104, 3, 4], [20190107, 2, 3], [20190211, 1, 5], [20190224, 2, 4], [20190301, 0, 3], [20190312, 1, 2], [20190322, 4, 5]]", "20190301"),
        new TestCase("4, [[0, 2, 0], [1, 0, 1], [3, 0, 3], [4, 1, 2], [7, 3, 1]]", "3"),
        new TestCase("3, [[1, 0, 1]]", "-1"),
        new TestCase("2, [[5, 0, 1], [6, 0, 1]]", "5"),
        new TestCase("3, [[1, 0, 1], [2, 1, 0], [3, 1, 2]]", "3"),
    ];

    public override string CSharpCallTemplate => "Solution.EarliestAllConnected({input})";
    public override string PythonCallTemplate => "earliest_all_connected({input})";

    public override List<string> Gotchas =>
    [
        "Setting parent[a] = b instead of joining the roots, which loses everything already attached to a.",
        "Decreasing the count when the two are already in the same set.",
    ];
}
