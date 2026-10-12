namespace DsaAcademy.Content.Concepts;

public class GraphMinimumSpanningTree : IConcept
{
    public string Id => "graph-minimum-spanning-tree";
    public string Track => "patterns";
    public string Title => "Minimum Spanning Tree (Kruskal's Algorithm)";
    public string OneLiner => "Connect every node as cheaply as possible: take edges cheapest-first, skipping any that would close a loop.";
    public string KeyTakeaway =>
        "Sort the edges by weight and walk them in order. Use Union-Find to ask \"are these two ends " +
        "already connected?\": if not, take the edge and union them; if so, the edge would make a cycle, " +
        "so skip it. Stop after n - 1 edges. Fewer than n - 1 means the graph isn't connected.";
    public VisualizerKind VisualizerKind => VisualizerKind.Graph;

    public string Explanation =>
        "You need to cable six buildings together. Each possible link has a cost, and you want every " +
        "building reachable from every other for the least total spend. Any cheapest answer will be a tree: " +
        "a loop always contains an edge you could remove while keeping everything connected. That tree is " +
        "the minimum spanning tree (MST), and it has exactly n - 1 edges for n nodes.\n\n" +
        "Kruskal's algorithm is greedy, and here greedy is provably right. Sort all edges from cheapest to " +
        "most expensive. Go through them in that order; take an edge if its two ends are not yet connected " +
        "by the edges you've already taken, otherwise skip it. The check \"already connected?\" is exactly " +
        "what Union-Find (this track) answers in nearly O(1): find(u) == find(v) means same component. " +
        "Taking an edge is union(u, v).\n\n" +
        "In this lesson edges are [u, v, weight] for nodes 0..n-1. Return the total weight of the MST, or " +
        "-1 if some node can't be reached (you took fewer than n - 1 edges).\n\n" +
        "Watch the visualization: edges are tried cheapest first; the 4-cost edge from 0 to 1 is skipped " +
        "because 0 and 1 are already joined through 2.";

    public List<string> RecognitionSignals =>
    [
        "Connect ALL points/nodes with minimum total cost, and any connection pattern is allowed as long as everything ends up connected.",
        "The answer is a set of edges (or its total weight), not a path between two particular nodes.",
    ];

    public List<string> Gotchas =>
    [
        "Sort by WEIGHT, not by node number -- the greedy argument only holds cheapest-first.",
        "Check connectivity with Union-Find before taking an edge; taking one between already-connected nodes makes a cycle and overpays.",
        "A disconnected graph has no spanning tree: if you finish with fewer than n - 1 edges, report that (here, -1) instead of a partial sum.",
    ];

    public List<string> ConfusableWith =>
    [
        "Dijkstra's Algorithm: also weighted edges and greedy, but it finds the shortest PATH from one source. An MST minimizes the total of all edges used; the MST path between two nodes can be longer than their shortest path.",
        "Union-Find (this track) is the building block here -- the MST lesson is Union-Find plus sorting.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "using System;\n" +
            "using System.Linq;\n\n" +
            "public class Solution\n" +
            "{\n" +
            "    public static int MinSpanningTreeCost(int n, int[][] edges)\n" +
            "    {\n" +
            "        // TODO: sort edges by weight (edge[2]). Union-Find over n nodes.\n" +
            "        // For each edge [u, v, w]: if find(u) != find(v), union them, add w\n" +
            "        // and count the edge. Return the total if you took n - 1 edges,\n" +
            "        // otherwise -1.\n" +
            "        return -1;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def min_spanning_tree_cost(n, edges):\n" +
            "    # TODO: sort edges by weight (edge[2]). Union-Find over n nodes.\n" +
            "    # For each edge [u, v, w]: if find(u) != find(v), union them, add w\n" +
            "    # and count the edge. Return the total if you took n - 1 edges,\n" +
            "    # otherwise -1.\n" +
            "    return -1\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MinSpanningTreeCost",
        ["python"] = "min_spanning_tree_cost",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.Int(6), "[[0, 1, 4], [0, 2, 1], [1, 2, 2], [1, 3, 5], [2, 3, 8], [2, 4, 10], [3, 4, 3], [4, 5, 6], [3, 5, 7]]"), "17"),
        new TestCase(Lit.Args(Lit.Int(4), "[[0, 1, 1], [1, 2, 2], [2, 3, 3], [3, 0, 4], [0, 2, 5]]"), "6"),
        new TestCase(Lit.Args(Lit.Int(3), "[[0, 1, 7], [1, 2, 7], [0, 2, 7]]"), "14"),
        new TestCase(Lit.Args(Lit.Int(4), "[[0, 1, 1], [2, 3, 1]]"), "-1"),
        new TestCase(Lit.Args(Lit.Int(1), "[]"), "0"),
        new TestCase(Lit.Args(Lit.Int(5), "[[0, 1, 10], [0, 2, 1], [0, 3, 1], [0, 4, 1], [1, 2, 2], [3, 4, 9]]"), "5"),
    ];

    public string CSharpCallTemplate => "Solution.MinSpanningTreeCost({input})";
    public string PythonCallTemplate => "min_spanning_tree_cost({input})";

    private static readonly Dictionary<int, (int X, int Y)> Positions = new()
    {
        [0] = (70, 110),
        [1] = (220, 50),
        [2] = (220, 165),
        [3] = (370, 50),
        [4] = (500, 110),
        [5] = (430, 175),
    };

    private static readonly (int From, int To, int Weight)[] Edges =
    [
        (0, 1, 4), (0, 2, 1), (1, 2, 2), (1, 3, 5), (2, 3, 8), (2, 4, 10), (3, 4, 3), (4, 5, 6), (3, 5, 7),
    ];

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int n = 6;
        var parent = Enumerable.Range(0, n).ToArray();
        int Find(int x) => parent[x] == x ? x : parent[x] = Find(parent[x]);

        var chosen = new List<int>();
        var total = 0;
        var steps = new List<VisualizationStep>();

        Dictionary<string, object> State(int? tried, int? rejected) => new()
        {
            ["visited"] = Enumerable.Range(0, n).Where(i => chosen.Any(e => Edges[e].From == i || Edges[e].To == i)).ToArray(),
            ["current"] = null!,
            ["frontier"] = tried is int t ? new[] { Edges[t].From, Edges[t].To } : Array.Empty<int>(),
            ["positions"] = Positions.ToDictionary(kv => kv.Key.ToString(), kv => (object)new { x = kv.Value.X, y = kv.Value.Y }),
            ["edges"] = Edges.Select(e => (object)new[] { e.From, e.To, e.Weight }).ToArray(),
            ["chosenEdges"] = chosen.ToArray(),
            ["rejectedEdges"] = rejected is int r ? new[] { r } : Array.Empty<int>(),
        };

        steps.Add(new VisualizationStep(
            State: State(null, null),
            HighlightIndices: [],
            Message: "Sort the 9 edges by weight: 1, 2, 3, 4, 5, 6, 7, 8, 10. Every node starts in its own component."
        ));

        foreach (var e in Enumerable.Range(0, Edges.Length).OrderBy(i => Edges[i].Weight))
        {
            if (chosen.Count == n - 1) break;
            var (u, v, w) = Edges[e];
            if (Find(u) != Find(v))
            {
                parent[Find(u)] = Find(v);
                chosen.Add(e);
                total += w;
                steps.Add(new VisualizationStep(
                    State: State(e, null),
                    HighlightIndices: [],
                    Message: $"Edge {u}–{v} (cost {w}): {u} and {v} are in different components, so take it. Total {total}, {chosen.Count} of {n - 1} edges."
                ));
            }
            else
            {
                steps.Add(new VisualizationStep(
                    State: State(e, e),
                    HighlightIndices: [],
                    Message: $"Edge {u}–{v} (cost {w}): {u} and {v} are already connected, so this edge would close a loop. Skip it."
                ));
            }
        }

        steps.Add(new VisualizationStep(
            State: State(null, null),
            HighlightIndices: [],
            Message: $"{n - 1} edges taken, every node connected. Minimum total cost: {total}. Edges 2–3 and 2–4 were never needed."
        ));
        return steps;
    }
}
