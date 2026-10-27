namespace DsaAcademy.Content.Concepts;

public class BlockBfsDistances : BuildingBlock
{
    public override string Id => "block-bfs-distances";
    public override string Title => "Block: BFS With a Visited Set";
    public override string OneLiner => "Return every node's distance in edges from a start node, using a queue and marking nodes visited when you push them.";
    public override string KeyTakeaway =>
        "Mark a node visited when you push it, not when you pop it. Marking on pop lets the same node into the queue several times.";

    public override string Explanation =>
        "adj[i] lists the nodes reachable from node i in one step (edges are directed). Return an array where entry i is the fewest edges from start to node i, or -1 if i can't be reached.\n" +
        "\n" +
        "A distance array filled with -1 doubles as the visited set. Set dist[start] = 0 and enqueue start. Pop from the front; for each neighbour still at -1, set its distance to the current node's plus one and enqueue it. Because BFS pops nodes in order of distance, the first time a node is reached is the shortest.\n" +
        "\n" +
        "The full lesson is Graphs: Breadth-First Search; this block is the template on its own.";

    protected override string[] Plan =>
    [
        "Make a distance array filled with -1; it doubles as the visited set.",
        "Set the start's distance to 0 and put it in a queue.",
        "While the queue is not empty, take the node at the front.",
        "For each neighbour still at -1, set its distance to the node's plus 1 and enqueue it (mark when you push).",
        "Return the distances.",
    ];

    protected override string CSharpSignature => "public static int[] BfsDistances(int[][] adj, int start)";
    protected override string CSharpReturnStub => "return new int[adj.Length];";
    protected override string PythonSignature => "def bfs_distances(adj, start):";
    protected override string PythonReturnStub => "return [0] * len(adj)";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.BfsDistances",
        ["python"] = "bfs_distances",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("[[1, 2], [0, 3], [0, 3], [1, 2, 4], [3], []], 0", "[0,1,1,2,3,-1]"),
        new TestCase("[[]], 0", "[0]"),
        new TestCase("[[1], [2], [0]], 1", "[2,0,1]"),
        new TestCase("[[1, 2, 3], [0], [0], [0]], 2", "[1,2,0,2]"),
        new TestCase("[[1], [2], [3], [4], [0]], 0", "[0,1,2,3,4]"),
    ];

    public override string CSharpCallTemplate => "Solution.BfsDistances({input})";
    public override string PythonCallTemplate => "bfs_distances({input})";

    public override List<string> Gotchas =>
    [
        "Marking visited when popping instead of when pushing, so a node can be queued several times.",
        "Using a Python list with pop(0) as the queue: use collections.deque.",
    ];
}
