namespace DsaAcademy.Content.Concepts;

public class GraphDfsTraversal : IConcept
{
    public string Id => "graph-dfs-traversal";
    public string Track => "graphs";
    public string Title => "Graphs: DFS Traversal";
    public string OneLiner => "Same graph, same start node as BFS -- but diving all the way down one path before backtracking produces a completely different visit order.";
    public string KeyTakeaway =>
        "DFS on a graph is the same recursive shape as a PREORDER tree traversal (record the node, then " +
        "recurse into its neighbors), plus the one " +
        "addition every graph traversal needs that a tree never does: a VISITED set, since a graph " +
        "(unlike a tree) can have cycles that would otherwise recurse forever.";
    public VisualizerKind VisualizerKind => VisualizerKind.Graph;

    // Same fixed sample graph as Graphs: BFS Traversal -- see that file for why it's
    // shaped the way it is (two cycles, one isolated node, pre-sorted neighbor lists).
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
        "DFS explores as far as possible down one path before backtracking: recurse into a node, mark " +
        "it visited, then recurse into its first unvisited neighbor, and that neighbor's first " +
        "unvisited neighbor, and so on -- only backtracking (returning to try the NEXT neighbor) once " +
        "a path runs out of new nodes to reach. That's the same recursive pattern as the tree DFS in " +
        "Binary Trees: Inorder Traversal, but recording each node BEFORE its neighbors -- PREORDER. A " +
        "graph node's neighbors have no left/right split, so there's no \"inorder\" slot between them. " +
        "Graph DFS adds one thing a tree traversal never needed: the VISITED check. A tree " +
        "has no cycles, so recursion naturally never revisits a node; a graph can (see Graphs: BFS " +
        "Traversal for the cycle in this sample graph), so without checking \"if visited, skip\" " +
        "before recursing, DFS on a cyclic graph recurses forever.\n\n" +
        "Compare this traversal's order against BFS's on the exact same graph, from the exact same " +
        "start node (0): BFS fans out one whole ring of distance at a time; DFS commits to node 1's " +
        "entire branch before ever coming back to try node 2 -- same graph, same starting point, " +
        "genuinely different visit order. That's the concrete version of \"BFS finds the shortest path " +
        "first, DFS doesn't\" -- DFS might stumble onto a long, winding path to a nearby node before " +
        "ever trying the short direct edge, because it commits to a direction instead of looking " +
        "around at every option first.\n\n" +
        "Try it below -- watch the current node's border light up, and the path back to the start " +
        "(amber) shrink each time DFS backtracks.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] DfsTraversal(int[][] adjacencyList, int start)\n" +
            "    {\n" +
            "        // TODO: mark start visited, record it, then recurse into each unvisited\n" +
            "        // neighbor (in the order the adjacency list gives them) before returning.\n" +
            "        return new int[0];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def dfs_traversal(adjacency_list, start):\n" +
            "    # TODO: mark start visited, record it, then recurse into each unvisited\n" +
            "    # neighbor (in the order the adjacency list gives them) before returning.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.DfsTraversal",
        ["python"] = "dfs_traversal",
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
        new TestCase(Lit.Int(0), "[0,1,3,2,4,5,6]"),
        new TestCase(Lit.Int(3), "[3,1,0,2,4,5,6]"),
        new TestCase(Lit.Int(6), "[6,5,3,1,0,2,4]"),
        new TestCase(Lit.Int(7), "[7]"),
    ];

    public string CSharpCallTemplate => "Solution.DfsTraversal(GraphHarness.SampleGraph(), {input})";
    public string PythonCallTemplate => "dfs_traversal(sample_graph(), {input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int start = 0;
        var steps = new List<VisualizationStep>();
        var visited = new HashSet<int>();
        var order = new List<int>();
        var path = new List<int>();

        Dictionary<string, object> Snapshot(int? current) => new()
        {
            ["visited"] = order.ToArray(),
            ["current"] = current,
            ["frontier"] = path.ToArray(),
        };

        steps.Add(new VisualizationStep(
            State: Snapshot(null),
            HighlightIndices: [start],
            Message: $"Start DFS at node {start}. Recurse depth-first, visiting neighbors in order, backtracking when stuck."
        ));

        void Dfs(int node)
        {
            visited.Add(node);
            order.Add(node);
            path.Add(node);

            steps.Add(new VisualizationStep(
                State: Snapshot(node),
                HighlightIndices: [node],
                Message: $"Visit {node}, mark it visited. Recurse into its unvisited neighbors, in order."
            ));

            foreach (var neighbor in SampleGraph[node])
            {
                if (!visited.Contains(neighbor)) Dfs(neighbor);
            }

            path.RemoveAt(path.Count - 1);
            if (path.Count > 0)
            {
                steps.Add(new VisualizationStep(
                    State: Snapshot(path[^1]),
                    HighlightIndices: [path[^1]],
                    Message: $"Done exploring from {node} -- backtrack to {path[^1]}."
                ));
            }
        }

        Dfs(start);

        steps.Add(new VisualizationStep(
            State: Snapshot(null),
            HighlightIndices: [],
            Message: $"Done -- DFS order: [{string.Join(", ", order)}]."
        ));

        return steps;
    }
}
