namespace DsaAcademy.Content.Concepts;

public class BlockDijkstra : BuildingBlock
{
    public override string Id => "block-dijkstra";
    public override string Title => "Block: Dijkstra With a Min-Heap";
    public override string OneLiner => "Return shortest path lengths from a source in a weighted directed graph, skipping stale heap entries instead of decreasing keys.";
    public override string KeyTakeaway =>
        "Push a new (distance, node) whenever a distance improves, and when you pop an entry worse than the best known, skip it. That lazy skip is the whole difference between Dijkstra and BFS with a heap.";

    public override string Explanation =>
        "There are n nodes and edges lists directed edges [u, v, w] with weight w >= 0. Return each node's shortest distance from src, or -1 if it can't be reached.\n" +
        "\n" +
        "Build an adjacency list of (neighbour, weight) and a distance array of infinity. Set dist[src] = 0 and push (0, src) onto a min-heap. Pop the smallest; if its distance is greater than dist[node], it is an old entry: skip it. Otherwise relax each edge, and when d + w beats dist[v], store it and push (d + w, v). Network Delay Time and cheapest-path problems are this block.";

    protected override string[] Plan =>
    [
        "Build an adjacency list of (neighbour, weight) and a distance array filled with infinity.",
        "Set the source's distance to 0 and push (0, source) onto a min-heap.",
        "Pop the smallest (distance, node); if the distance is worse than the best known for that node, it is stale: skip it.",
        "For each edge, if distance plus weight beats the neighbour's best, update it and push (new distance, neighbour).",
        "Return the distances, with -1 where a node stayed at infinity.",
    ];

    protected override string CSharpSignature => "public static int[] ShortestPaths(int n, int[][] edges, int src)";
    protected override string CSharpReturnStub => "return new int[n];";
    protected override string PythonSignature => "def shortest_paths(n, edges, src):";
    protected override string PythonReturnStub => "return [0] * n";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ShortestPaths",
        ["python"] = "shortest_paths",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("4, [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5]], 0", "[0,3,1,4]"),
        new TestCase("3, [[0, 1, 1]], 0", "[0,1,-1]"),
        new TestCase("1, [], 0", "[0]"),
        new TestCase("3, [[1, 0, 2], [1, 2, 3], [2, 0, 1]], 1", "[2,0,3]"),
        new TestCase("5, [[0, 1, 10], [0, 2, 3], [2, 1, 4], [1, 3, 2], [2, 3, 8], [3, 4, 7], [2, 4, 2]], 0", "[0,7,3,9,5]"),
    ];

    public override string CSharpCallTemplate => "Solution.ShortestPaths({input})";
    public override string PythonCallTemplate => "shortest_paths({input})";

    public override List<string> Gotchas =>
    [
        "Not skipping stale entries, which re-relaxes edges from outdated distances (still correct, but slow).",
        "Marking a node done when it is pushed rather than when it is popped with its best distance.",
    ];
}
