namespace DsaAcademy.Content.Concepts;

public class GraphBipartite : IConcept
{
    public string Id => "graph-bipartite";
    public string Track => "patterns";
    public string Title => "Graph 2-Colouring: Is a Graph Bipartite?";
    public string OneLiner => "Can the nodes be split into two groups so every edge crosses between them? Try to colour the graph with two colours and see whether any edge ends up with both ends the same.";
    public string KeyTakeaway =>
        "Colouring one node decides its whole connected component: every neighbour must get the opposite " +
        "colour, and their neighbours the opposite again. So BFS (or DFS) from each uncoloured node, giving each " +
        "newly reached node the opposite of the node it came from. If an edge ever joins two nodes of the SAME " +
        "colour, the graph is not bipartite; that happens exactly when it contains a cycle of odd length.";
    public VisualizerKind VisualizerKind => VisualizerKind.Graph;

    public string Explanation =>
        "You get an undirected graph as an adjacency list: graph[i] lists the neighbours of node i, and if j is " +
        "in graph[i] then i is in graph[j]. Return true if the nodes can be split into two groups A and B so that " +
        "every edge connects a node in A to a node in B, and false otherwise. The graph may be disconnected, and " +
        "a node may have no edges at all.\n\n" +
        "Think of it as colouring. Pick any uncoloured node and colour it A. Its neighbours are now forced: they " +
        "must all be B. Their neighbours must all be A, and so on outward. There is never a real choice inside a " +
        "connected component once the first node is coloured (swapping A and B everywhere gives the same split), " +
        "so a simple traversal either completes the colouring or runs into a contradiction.\n\n" +
        "With BFS: keep colour[i] = 0 for uncoloured, 1 for A, -1 for B. For every node s that is still 0, set " +
        "colour[s] = 1 and BFS from it. When you dequeue u, look at each neighbour v. If v is uncoloured, give it " +
        "-colour[u] and enqueue it. If v already has the SAME colour as u, the edge u-v has both ends in one " +
        "group: return false. If v has the opposite colour, that edge is fine. If every component finishes " +
        "without a conflict, return true. DFS works identically; only the order in which nodes get coloured " +
        "changes.\n\n" +
        "The outer loop over every node is not optional. In a disconnected graph a traversal from node 0 only " +
        "colours node 0's component, and the conflict might be in another one. Isolated nodes are trivially fine " +
        "(colour them anything).\n\n" +
        "Why does a conflict mean an odd cycle? Colours alternate along every path BFS takes, so two nodes at the " +
        "same colour that are joined by an edge, together with their paths back to the start, close a loop with " +
        "an odd number of edges. A triangle is the smallest example: three nodes can't alternate between two " +
        "colours around a loop of three. Every node is coloured once and every edge checked from both ends, so " +
        "the cost is O(V + E) time and O(V) space.\n\n" +
        "Union-Find also works: for each node, all of its neighbours must be in the same group as each other, so " +
        "union them together, and fail if any neighbour already shares a set with the node itself. The " +
        "visualization colours a graph with two components using BFS. Green nodes are group A, dashed amber nodes " +
        "are group B.";

    public List<string> RecognitionSignals =>
    [
        "Split people, items, or nodes into TWO groups so that certain pairs (rivals, conflicts, edges) always land in different groups.",
        "\"Is a 2-colouring possible?\", \"can these be divided into two teams?\", or \"does this graph contain an odd cycle?\".",
        "Constraints that only say \"these two must differ\", with exactly two options per item: each constraint is an edge, and the two options are the two colours.",
    ];

    public List<string> Gotchas =>
    [
        "Start a traversal from EVERY uncoloured node, not just node 0. A disconnected graph can be fine in one component and broken in another.",
        "A neighbour that is already coloured is not automatically a problem: it is only a conflict if its colour equals the current node's.",
        "Colour a node when you enqueue it, not when you dequeue it, or the same node can be queued twice with different colours.",
        "Three or more groups is a different problem. 2-colouring is O(V + E); deciding whether 3 colours suffice is NP-complete, so there is no similar trick for it.",
    ];

    public List<string> ConfusableWith =>
    [
        "Union-Find: Count Connected Components (this track) groups nodes that are CONNECTED. Bipartite checking needs the opposite relation: neighbours go into DIFFERENT groups. Union-Find can still do it by unioning each node's neighbours with each other.",
        "Cycle Detection: Course Schedule (this track) asks whether a directed graph has ANY cycle. Here cycles are fine as long as every one of them has even length.",
        "Grid Flood Fill: Number of Islands (this track) uses the same \"traverse from every unvisited node\" outer loop, but only marks nodes visited instead of assigning them alternating colours.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static bool IsBipartite(int[][] graph)\n" +
            "    {\n" +
            "        // TODO: colour[i] = 0 (uncoloured), 1 or -1. For every node s still at 0:\n" +
            "        // colour it 1 and BFS from it with a Queue<int>. For each neighbour v of\n" +
            "        // the dequeued node u: if v is uncoloured, set colour[v] = -colour[u] and\n" +
            "        // enqueue it; if colour[v] == colour[u], return false. If every node gets\n" +
            "        // coloured without a clash, return true.\n" +
            "        return false;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def is_bipartite(graph):\n" +
            "    # TODO: colour[i] = 0 (uncoloured), 1 or -1. For every node s still at 0:\n" +
            "    # colour it 1 and BFS from it with a deque. For each neighbour v of the\n" +
            "    # popped node u: if v is uncoloured, set colour[v] = -colour[u] and\n" +
            "    # enqueue it; if colour[v] == colour[u], return False. If every node gets\n" +
            "    # coloured without a clash, return True.\n" +
            "    return False\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.IsBipartite",
        ["python"] = "is_bipartite",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]]", "false"),
        new TestCase("[[1, 3], [0, 2], [1, 3], [0, 2]]", "true"),
        new TestCase("[[]]", "true"),
        new TestCase("[[1], [0], [3], [2]]", "true"),
        new TestCase("[[1], [0], [3, 4], [2, 4], [2, 3]]", "false"),
        new TestCase("[[1, 5], [0, 2], [1, 3], [2, 4], [3, 5], [4, 0]]", "true"),
        new TestCase("[[1, 4], [0, 2], [1, 3], [2, 4], [3, 0]]", "false"),
        new TestCase("[[], [2, 4, 6], [1, 4, 8, 9], [7, 8], [1, 2, 8, 9], [6, 9], [1, 5, 7, 8, 9], [3, 6, 9], [2, 3, 4, 6, 9], [2, 4, 5, 6, 7, 8]]", "false"),
    ];

    public string CSharpCallTemplate => "Solution.IsBipartite({input})";
    public string PythonCallTemplate => "is_bipartite({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        // Component 1: square 0-1-2-3 with a tail 2-4 (bipartite). Component 2: triangle 5-6-7 (not).
        int[][] edges = [[0, 1], [1, 2], [2, 3], [3, 0], [2, 4], [5, 6], [6, 7], [7, 5]];
        const int n = 8;
        var positions = new Dictionary<string, object>
        {
            ["0"] = new { x = 60, y = 50 },
            ["1"] = new { x = 180, y = 50 },
            ["2"] = new { x = 180, y = 150 },
            ["3"] = new { x = 60, y = 150 },
            ["4"] = new { x = 300, y = 150 },
            ["5"] = new { x = 390, y = 50 },
            ["6"] = new { x = 510, y = 50 },
            ["7"] = new { x = 450, y = 150 },
        };
        var adj = new List<int>[n];
        for (var i = 0; i < n; i++) adj[i] = [];
        foreach (var e in edges)
        {
            adj[e[0]].Add(e[1]);
            adj[e[1]].Add(e[0]);
        }
        foreach (var list in adj) list.Sort();

        var colour = new int[n];
        var steps = new List<VisualizationStep>();
        int? conflict = null;

        Dictionary<string, object> Snapshot(int? current) => new()
        {
            ["positions"] = positions,
            ["edges"] = edges,
            ["visited"] = Enumerable.Range(0, n).Where(i => colour[i] == 1).ToArray(),
            ["frontier"] = Enumerable.Range(0, n).Where(i => colour[i] == -1).ToArray(),
            ["current"] = current,
            ["distances"] = Enumerable.Range(0, n).ToDictionary(i => i.ToString(), i => colour[i] switch { 1 => "A", -1 => "B", _ => "" }),
            ["rejectedEdges"] = conflict is { } c ? new[] { c } : Array.Empty<int>(),
        };

        string Name(int c) => c == 1 ? "A" : "B";
        string List(List<int> nodes) => nodes.Count == 1 ? nodes[0].ToString() : string.Join(", ", nodes.Take(nodes.Count - 1)) + " and " + nodes[^1];

        steps.Add(new VisualizationStep(
            Snapshot(null),
            [],
            "Two components: a square 0-1-2-3 with an extra node 4 hanging off 2, and a triangle 5-6-7. Nothing is coloured yet. Scan the nodes in order and start a BFS from each one that is still uncoloured."
        ));

        for (var s = 0; s < n; s++)
        {
            if (colour[s] != 0) continue;
            colour[s] = 1;
            var queue = new Queue<int>();
            queue.Enqueue(s);
            steps.Add(new VisualizationStep(
                Snapshot(s),
                [s],
                s == 0
                    ? "Node 0 is uncoloured: colour it A and start a BFS from it."
                    : $"The first component is fully coloured with no clash. Node {s} is the next uncoloured node, so it starts a new component: colour it A and BFS from it."
            ));
            while (queue.Count > 0)
            {
                var u = queue.Dequeue();
                var coloured = new List<int>();
                var fine = new List<int>();
                foreach (var v in adj[u])
                {
                    if (colour[v] == 0)
                    {
                        colour[v] = -colour[u];
                        queue.Enqueue(v);
                        coloured.Add(v);
                    }
                    else if (colour[v] == colour[u])
                    {
                        conflict = Array.FindIndex(edges, e => (e[0] == u && e[1] == v) || (e[0] == v && e[1] == u));
                        steps.Add(new VisualizationStep(
                            Snapshot(u),
                            [u, v],
                            $"Dequeue {u} ({Name(colour[u])}). Neighbour {v} is ALSO {Name(colour[v])}: the edge {u}-{v} has both ends in the same group. The triangle is an odd cycle, so no 2-colouring exists. Return false."
                        ));
                        steps.Add(new VisualizationStep(
                            Snapshot(null),
                            [],
                            "The first component alone would have been fine (A: 0, 2; B: 1, 3, 4). One bad component is enough to make the whole graph non-bipartite, which is why the outer loop has to visit every component."
                        ));
                        return steps;
                    }
                    else fine.Add(v);
                }
                var parts = new List<string>();
                if (coloured.Count > 0)
                    parts.Add($"colour {List(coloured)} {Name(-colour[u])} and enqueue {(coloured.Count == 1 ? "it" : "them")}");
                if (fine.Count > 0)
                    parts.Add($"{List(fine)} {(fine.Count == 1 ? "is" : "are")} already {Name(-colour[u])}, the opposite colour, so {(fine.Count == 1 ? "that edge is" : "those edges are")} fine");
                steps.Add(new VisualizationStep(
                    Snapshot(u),
                    [u],
                    $"Dequeue {u} ({Name(colour[u])}): " + string.Join("; ", parts) + "."
                ));
            }
        }

        return steps;
    }
}
