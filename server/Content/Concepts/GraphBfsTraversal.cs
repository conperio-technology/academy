namespace DsaAcademy.Content.Concepts;

public class GraphBfsTraversal : IConcept
{
    public string Id => "graph-bfs-traversal";
    public string Track => "graphs";
    public string Title => "Graphs: BFS Traversal";
    public string OneLiner => "Same \"visit every node\" goal as a tree traversal, but a graph can have cycles and no single root -- so a VISITED set stops you looping forever.";
    public string KeyTakeaway =>
        "BFS on a graph is the exact same queue-driven algorithm as Binary Trees: Level-Order " +
        "Traversal -- the only new thing a graph adds is a VISITED set, because unlike a tree (where " +
        "you can only reach a node one way, from its parent), a graph can have cycles, so without " +
        "tracking what's already been discovered the same node gets enqueued and re-processed forever.";
    public VisualizerKind VisualizerKind => VisualizerKind.Graph;

    // Fixed sample graph: 8 nodes (0-7). Nodes 0-6 form a connected component with two
    // cycles (0-1-3-2-0 and 2-3-5-4-2); node 7 is deliberately isolated to test what
    // happens starting from a node with nothing reachable. Each node's neighbor list is
    // already sorted ascending, so "visit neighbors in the order the adjacency list
    // gives them" is naturally deterministic -- no extra sorting for a solution to get
    // right or wrong, and no output-order ambiguity for the test harness either.
    private static readonly int[][] SampleGraph =
    [
        [1, 2],
        [0, 3],
        [0, 3, 4],
        [1, 2, 5],
        [2, 5],
        [3, 4, 6],
        [5],
        [],
    ];

    public string Explanation =>
        "A graph is a set of nodes (also called vertices) joined by edges, like cities joined by roads; unlike a tree, any node may connect to any other. It is usually stored as an ADJACENCY LIST: an array (or map) where index i holds the " +
        "list of nodes i connects to directly -- this sample graph has 8 nodes (0-7), where node 7 is " +
        "deliberately isolated (no edges) to test what happens when nothing is reachable from the " +
        "start node. Unlike the trees earlier in this app, a graph has no single designated root and " +
        "CAN have cycles (0 connects to 1 and 2, which both connect onward to 3 -- a loop back), so a " +
        "traversal has to explicitly track which nodes it's already visited, or it would enqueue the " +
        "same node forever chasing that cycle.\n\n" +
        "BFS itself is identical to Level-Order Traversal from the Trees track: start with a queue " +
        "containing just the start node, marked visited IMMEDIATELY -- not when it's dequeued, when " +
        "it's discovered, which is what stops the same node getting queued twice from two different " +
        "directions in a graph with cycles. Then loop: dequeue a node, record it, and enqueue every " +
        "unvisited neighbor, marking each one visited the moment it's enqueued. Because a queue is " +
        "FIFO, this explores the graph one whole \"ring\" of distance from the start at a time -- " +
        "exactly why BFS is the standard algorithm for \"shortest path in an unweighted graph\" (one where every edge counts the same).\n\n" +
        "Try it below -- the visualization starts at node 0 and shows the queue (amber) growing as new " +
        "nodes are discovered, and each node turning green the moment it's actually dequeued and " +
        "processed. See Graphs: DFS Traversal for the same graph, same start node, explored " +
        "depth-first instead -- notice how different the visit order turns out.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] BfsTraversal(int[][] adjacencyList, int start)\n" +
            "    {\n" +
            "        // TODO: queue = [start], mark start visited. While the queue isn't empty:\n" +
            "        // dequeue a node, record it, and enqueue any unvisited neighbors (marking\n" +
            "        // them visited immediately, so the same node never gets enqueued twice).\n" +
            "        return new int[0];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def bfs_traversal(adjacency_list, start):\n" +
            "    # TODO: queue = [start], mark start visited. While the queue isn't empty:\n" +
            "    # dequeue a node, record it, and enqueue any unvisited neighbors (marking them\n" +
            "    # visited immediately, so the same node never gets enqueued twice).\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.BfsTraversal",
        ["python"] = "bfs_traversal",
    };

    public string? CSharpHarnessPreamble =>
        "internal static class GraphHarness\n" +
        "{\n" +
        "    public static int[][] SampleGraph() => new int[][]\n" +
        "    {\n" +
        "        new[] { 1, 2 }, new[] { 0, 3 }, new[] { 0, 3, 4 }, new[] { 1, 2, 5 },\n" +
        "        new[] { 2, 5 }, new[] { 3, 4, 6 }, new[] { 5 }, new int[] { },\n" +
        "    };\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def sample_graph():\n" +
        "    return [[1, 2], [0, 3], [0, 3, 4], [1, 2, 5], [2, 5], [3, 4, 6], [5], []]\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Int(0), "[0,1,2,3,4,5,6]"),
        new TestCase(Lit.Int(3), "[3,1,2,5,0,4,6]"),
        new TestCase(Lit.Int(6), "[6,5,3,4,1,2,0]"),
        new TestCase(Lit.Int(7), "[7]"),
    ];

    public string CSharpCallTemplate => "Solution.BfsTraversal(GraphHarness.SampleGraph(), {input})";
    public string PythonCallTemplate => "bfs_traversal(sample_graph(), {input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int start = 0;
        var steps = new List<VisualizationStep>();
        var visited = new HashSet<int> { start };
        var order = new List<int>();
        var queue = new Queue<int>();
        queue.Enqueue(start);

        Dictionary<string, object> Snapshot(int? current) => new()
        {
            ["visited"] = order.ToArray(),
            ["current"] = current,
            ["frontier"] = queue.ToArray(),
        };

        steps.Add(new VisualizationStep(
            State: Snapshot(null),
            HighlightIndices: [start],
            Message: $"Start BFS at node {start}. Mark it visited and enqueue it."
        ));

        while (queue.Count > 0)
        {
            var node = queue.Dequeue();
            order.Add(node);

            var discovered = new List<int>();
            foreach (var neighbor in SampleGraph[node])
            {
                if (visited.Add(neighbor))
                {
                    queue.Enqueue(neighbor);
                    discovered.Add(neighbor);
                }
            }

            steps.Add(new VisualizationStep(
                State: Snapshot(node),
                HighlightIndices: [node],
                Message: discovered.Count > 0
                    ? $"Dequeue {node}, record it. Discover and enqueue: [{string.Join(", ", discovered)}]."
                    : $"Dequeue {node}, record it. No new neighbors to discover."
            ));
        }

        steps.Add(new VisualizationStep(
            State: Snapshot(null),
            HighlightIndices: [],
            Message: $"Queue is empty -- done. BFS order: [{string.Join(", ", order)}]."
        ));

        return steps;
    }
}
