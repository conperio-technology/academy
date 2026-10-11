namespace DsaAcademy.Content.Concepts;

// Transfer exercise after Count Connected Components: the same Find/Union pass over the edges,
// but the interesting moment is now the union that does nothing, because it closes a cycle.
public class UnionFindRedundantConnection : IConcept
{
    public string Id => "union-find-redundant-connection";
    public string Track => "patterns";
    public string Title => "Transfer: Redundant Connection";
    public string OneLiner => "A tree got one extra edge. Find the edge to remove. Union-find again, watching for the one union whose two ends are already connected.";
    public string KeyTakeaway =>
        "Add the edges one by one with union-find. An edge whose two ends already have the same root joins " +
        "two nodes that are already connected, so it closes a cycle. A tree plus one edge has exactly one " +
        "cycle, and the first such edge is the last of that cycle's edges in the input, which is the answer.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;
    public string? TransferOf => "union-find-components";

    public string Explanation =>
        "This follows Union-Find: Count Connected Components with the question changed. A tree on n nodes, " +
        "numbered 0 to n - 1, had one extra edge added between two different nodes, giving n edges in " +
        "total. edges[i] = [a, b] is an undirected edge. Return an edge whose removal leaves a tree again; " +
        "if several would work, return the one that appears last in edges.\n\n" +
        "In the parent lesson, an edge whose ends already shared a root changed nothing and was skipped. " +
        "Here that edge is the whole point. If Find(a) == Find(b) before the union, a and b were already " +
        "connected by edges seen earlier, so this edge plus that path forms a cycle. Return it.\n\n" +
        "Why is that the right one to return? Adding one edge to a tree creates exactly one cycle, and " +
        "removing any edge on it restores a tree; edges off the cycle are needed. Processing in input order, " +
        "union-find first reports a cycle at the moment its last edge arrives, since before then the cycle " +
        "isn't closed. So the first redundant edge found is the cycle edge that appears last, which is the " +
        "tie-break the problem asks for.\n\n" +
        "You don't need n as a parameter: a tree plus one edge has as many edges as nodes, so n is " +
        "edges.Length. With path compression and union by size each operation is effectively O(1), so the " +
        "pass is effectively O(n) time and O(n) space.\n\n" +
        "The visualization runs [[0, 1], [1, 2], [2, 3], [0, 3], [0, 4]] and shows the parent array.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences comparing this " +
        "with Count Connected Components. What does Find(a) == Find(b) mean in both problems, why is the " +
        "first such edge also the last cycle edge in the input, and why does union-find suit edges arriving " +
        "one at a time?";

    public List<string> RecognitionSignals =>
    [
        "Edges arrive one at a time and you must spot the first one that connects two already connected nodes.",
        "\"A tree with one extra edge\", \"which connection creates a loop\", or cycle detection in an undirected graph.",
    ];

    public List<string> Gotchas =>
    [
        "Check Find(a) == Find(b) BEFORE the union; after it they always match.",
        "Return the edge exactly as it appears in the input, in its original order [a, b].",
        "There are as many nodes as edges here; size the parent array from edges.Length.",
    ];

    public List<string> ConfusableWith =>
    [
        "Union-Find: Count Connected Components counts the unions that merge two groups; this returns the one union that finds both ends already in one group.",
        "Cycle Detection: Course Schedule finds cycles in a DIRECTED graph and needs the three colour DFS. In an undirected graph, union-find detects a cycle with no colours at all.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] FindRedundantConnection(int[][] edges)\n" +
            "    {\n" +
            "        // TODO: n = edges.Length nodes, parent[i] = i. Find(x): follow parent\n" +
            "        // pointers to the root (compress the path if you like). For each edge\n" +
            "        // [a, b] in order: if Find(a) == Find(b), they are already connected,\n" +
            "        // so return this edge. Otherwise union the two roots.\n" +
            "        return new int[0];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def find_redundant_connection(edges):\n" +
            "    # TODO: n = len(edges) nodes, parent[i] = i. find(x): follow parent\n" +
            "    # pointers to the root (compress the path if you like). For each edge\n" +
            "    # [a, b] in order: if find(a) == find(b), they are already connected,\n" +
            "    # so return this edge. Otherwise union the two roots.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.FindRedundantConnection",
        ["python"] = "find_redundant_connection",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[[0, 1], [0, 2], [1, 2]]", "[1,2]"),
        new TestCase("[[0, 1], [1, 2], [2, 3], [0, 3], [0, 4]]", "[0,3]"),
        new TestCase("[[0, 1], [1, 2], [2, 0]]", "[2,0]"),
        new TestCase("[[2, 3], [0, 1], [1, 2], [0, 3]]", "[0,3]"),
        new TestCase("[[0, 4], [3, 4], [0, 3], [0, 2], [1, 2]]", "[0,3]"),
        new TestCase("[[3, 4], [0, 1], [1, 2], [2, 3], [4, 1], [0, 5]]", "[4,1]"),
    ];

    public string CSharpCallTemplate => "Solution.FindRedundantConnection({input})";
    public string PythonCallTemplate => "find_redundant_connection({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[][] edges = [[0, 1], [1, 2], [2, 3], [0, 3], [0, 4]];
        var n = edges.Length;
        var parent = Enumerable.Range(0, n).ToArray();
        var steps = new List<VisualizationStep>();

        int Find(int x)
        {
            while (parent[x] != x) x = parent[x];
            return x;
        }

        object[] Snapshot() => parent.Select(v => (object)v).ToArray();

        steps.Add(new VisualizationStep(
            new Dictionary<string, object> { ["array"] = Snapshot() },
            [],
            $"{n} edges, so {n} nodes. parent[i] = i: every node is its own root. Add the edges in order."
        ));

        foreach (var edge in edges)
        {
            int a = edge[0], b = edge[1];
            int ra = Find(a), rb = Find(b);
            if (ra == rb)
            {
                steps.Add(new VisualizationStep(
                    new Dictionary<string, object> { ["array"] = Snapshot() },
                    [a, b],
                    $"Edge [{a}, {b}]: Find({a}) = Find({b}) = {ra}. They are already connected, so this edge closes a cycle. Return [{a}, {b}]."
                ));
                return steps;
            }
            parent[ra] = rb;
            steps.Add(new VisualizationStep(
                new Dictionary<string, object> { ["array"] = Snapshot() },
                [ra, rb],
                $"Edge [{a}, {b}]: roots {ra} and {rb} differ, so the edge joins two separate groups. Union: parent[{ra}] = {rb}."
            ));
        }

        return steps;
    }
}
