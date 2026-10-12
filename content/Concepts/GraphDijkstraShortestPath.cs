namespace DsaAcademy.Content.Concepts;

public class GraphDijkstraShortestPath : IConcept
{
    public string Id => "graph-dijkstra-shortest-path";
    public string Track => "graphs";
    public string Title => "Graphs: Dijkstra's Shortest Path";
    public string OneLiner => "BFS finds the shortest path by HOP COUNT; Dijkstra finds it by total WEIGHT, always finalizing whichever undiscovered node currently has the smallest known distance next.";
    public string KeyTakeaway =>
        "BFS's queue works because every edge costs exactly 1, so \"discovered earliest\" and " +
        "\"closest\" are the same thing -- once edges have different weights that's no longer true, so " +
        "Dijkstra replaces the queue with a PRIORITY QUEUE ordered by current known distance, and " +
        "always finalizes the closest undiscovered node next, relaxing (potentially shortening) its " +
        "neighbors' distances every time a node is finalized.";
    public VisualizerKind VisualizerKind => VisualizerKind.Graph;

    // A separate, smaller weighted sample graph from the one BFS/DFS/Union-Find/Topological
    // Sort share -- deliberately NOT reusing that graph, since it's unweighted and several
    // other concepts' test cases are pinned to its exact shape. Node 5 is isolated on
    // purpose (same "what if nothing's reachable" test BFS/DFS's node 7 already covers).
    // Edge weights: 0-1:4, 0-2:1, 1-2:2, 1-3:5, 2-3:8, 2-4:10, 3-4:3.
    private static readonly int[][][] SampleWeightedGraph =
    [
        [[1, 4], [2, 1]],                    // node 0
        [[0, 4], [2, 2], [3, 5]],             // node 1
        [[0, 1], [1, 2], [3, 8], [4, 10]],    // node 2
        [[1, 5], [2, 8], [4, 3]],             // node 3
        [[3, 3], [2, 10]],                    // node 4
        [],                                    // node 5 -- isolated
    ];

    public string Explanation =>
        "BFS (Graphs: BFS Traversal) finds shortest paths correctly only because every edge in an " +
        "unweighted graph costs the same -- exactly 1 hop -- so processing nodes in the order they're " +
        "DISCOVERED automatically processes them in order of distance too. The moment edges have " +
        "different weights (a road network where some roads are longer than others, say), that " +
        "guarantee breaks: a node discovered EARLY via an expensive edge might actually be farther " +
        "away than a node discovered LATER via a cheap one.\n\n" +
        "Dijkstra's fix: replace BFS's plain queue with a PRIORITY QUEUE (a queue that always hands " +
        "back the smallest item first, usually built on a heap) ordered by each node's current best-known distance from the source. Start with dist[source] = 0 and every other " +
        "node at infinity. Repeatedly pop the closest not-yet-finalized node, mark it finalized, and " +
        "RELAX every one of its edges -- for each neighbor, check whether going through the just-" +
        "finalized node beats the neighbor's current best distance (dist[node] + edgeWeight < " +
        "dist[neighbor]), updating it if so. Because the priority queue always hands back the globally " +
        "closest remaining node, once a node is popped and finalized, its distance is guaranteed " +
        "correct and permanent (this breaks down with NEGATIVE edge weights, which is exactly why " +
        "Dijkstra requires non-negative weights and a different algorithm, like Bellman-Ford, handles " +
        "negative ones).\n\n" +
        "The relaxation step is the one genuinely new idea beyond BFS: a node can be discovered " +
        "MULTIPLE times with different candidate distances before it's finally popped and finalized, " +
        "and only the smallest candidate that made it into the priority queue wins.\n\n" +
        "Watch the graph below run Dijkstra from node 0 -- each step finalizes the closest remaining " +
        "node (green) and relaxes its edges, with every node's current best-known distance shown live.";

    public List<string> RecognitionSignals =>
    [
        "The problem is \"shortest path\" but edges have different costs/weights/distances -- if every edge weighs the same, plain BFS is simpler and sufficient.",
        "All edge weights are non-negative. A negative edge weight anywhere means Dijkstra's \"once finalized, never revisited\" guarantee breaks -- that's a different algorithm's problem (Bellman-Ford), not this one.",
    ];

    public List<string> Gotchas =>
    [
        "A node can sit in the priority queue with more than one candidate distance at once (an earlier, worse one and a later, better one) -- when the worse, STALE entry is eventually popped, it must be skipped rather than reprocessed, since the node's true shortest distance was already finalized by the better entry.",
        "Dijkstra assumes non-negative weights. With a negative edge, a node already finalized (and \"locked in\") could later turn out to have a shorter path after all -- something Dijkstra's greedy finalize-and-never-revisit step can't handle.",
    ];

    public List<string> ConfusableWith =>
    [
        "Graphs: BFS Traversal (this track) is the special case of Dijkstra where every edge weighs exactly 1 -- BFS's plain queue is a priority queue that never needs actual re-prioritizing under those conditions.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] Dijkstra(int[][][] adjacencyList, int source)\n" +
            "    {\n" +
            "        // TODO: dist[i] = int.MaxValue for all i except dist[source] = 0. Use a priority\n" +
            "        // queue of (distance, node), starting with (0, source). While it's not empty, pop\n" +
            "        // the smallest; skip it if its distance no longer matches dist[node] (a stale\n" +
            "        // entry). Otherwise relax every neighbor: if dist[node] + weight < dist[neighbor],\n" +
            "        // update it and push (newDistance, neighbor). Return dist, using -1 for any node\n" +
            "        // still at infinity (unreachable) at the end.\n" +
            "        return new int[adjacencyList.Length];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def dijkstra(adjacency_list, source):\n" +
            "    # TODO: dist[i] = infinity for all i except dist[source] = 0. Use a min-heap of\n" +
            "    # (distance, node), starting with (0, source). While it's not empty, pop the\n" +
            "    # smallest; skip it if its distance no longer matches dist[node] (a stale entry).\n" +
            "    # Otherwise relax every neighbor: if dist[node] + weight < dist[neighbor], update it\n" +
            "    # and push (new_distance, neighbor). Return dist, using -1 for any node still at\n" +
            "    # infinity (unreachable) at the end.\n" +
            "    return [0] * len(adjacency_list)\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Dijkstra",
        ["python"] = "dijkstra",
    };

    public string? CSharpHarnessPreamble =>
        "internal static class DijkstraHarness\n" +
        "{\n" +
        "    public static int[][][] SampleWeightedGraph() => new int[][][]\n" +
        "    {\n" +
        "        new[] { new[] { 1, 4 }, new[] { 2, 1 } },\n" +
        "        new[] { new[] { 0, 4 }, new[] { 2, 2 }, new[] { 3, 5 } },\n" +
        "        new[] { new[] { 0, 1 }, new[] { 1, 2 }, new[] { 3, 8 }, new[] { 4, 10 } },\n" +
        "        new[] { new[] { 1, 5 }, new[] { 2, 8 }, new[] { 4, 3 } },\n" +
        "        new[] { new[] { 3, 3 }, new[] { 2, 10 } },\n" +
        "        new int[][] { },\n" +
        "    };\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def sample_weighted_graph():\n" +
        "    return [\n" +
        "        [[1, 4], [2, 1]],\n" +
        "        [[0, 4], [2, 2], [3, 5]],\n" +
        "        [[0, 1], [1, 2], [3, 8], [4, 10]],\n" +
        "        [[1, 5], [2, 8], [4, 3]],\n" +
        "        [[3, 3], [2, 10]],\n" +
        "        [],\n" +
        "    ]\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Int(0), "[0,3,1,8,11,-1]"),
        new TestCase(Lit.Int(2), "[1,2,0,7,10,-1]"),
        new TestCase(Lit.Int(4), "[11,8,10,3,0,-1]"),
        new TestCase(Lit.Int(5), "[-1,-1,-1,-1,-1,0]"),
    ];

    public string CSharpCallTemplate => "Solution.Dijkstra(DijkstraHarness.SampleWeightedGraph(), {input})";
    public string PythonCallTemplate => "dijkstra(sample_weighted_graph(), {input})";

    // Hand-placed layout for this graph specifically (not the shared BFS/DFS one) --
    // smuggled through each step's `state` bag rather than a new prop, since
    // GraphVisualizer.tsx already reads optional extra fields off `state` the same way
    // ArrayVisualizer reads `tracker`. Falls back to GraphVisualizer's own default
    // graph/positions when a step doesn't set these, so every other Graph concept is
    // completely unaffected.
    // Node 3 is deliberately NOT positioned between 2 and 4 in x -- since 2-3, 3-4, and
    // 2-4 are all real edges (a triangle), placing 3 on the 2-4 line's path would make
    // that edge's weight label collide with node 3's distance readout. Putting 3 on the
    // opposite row from both 2 and 4 keeps every edge clear of every other node.
    private static readonly Dictionary<int, (int X, int Y)> Positions = new()
    {
        [0] = (70, 110),
        [1] = (220, 50),
        [2] = (220, 165),
        [3] = (370, 50),
        [4] = (500, 110),
        [5] = (500, 165),
    };

    private static readonly (int From, int To, int Weight)[] Edges =
    [
        (0, 1, 4), (0, 2, 1), (1, 2, 2), (1, 3, 5), (2, 3, 8), (2, 4, 10), (3, 4, 3),
    ];

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int source = 0;
        const int n = 6;
        var dist = new int?[n];
        dist[source] = 0;
        var finalized = new HashSet<int>();
        var steps = new List<VisualizationStep>();

        Dictionary<string, object> BaseState(int? current) => new()
        {
            ["visited"] = finalized.ToArray(),
            ["current"] = current,
            ["frontier"] = Array.Empty<int>(),
            ["distances"] = Enumerable.Range(0, n).ToDictionary(i => i.ToString(), i => (object)(dist[i]?.ToString() ?? "inf")),
            ["positions"] = Positions.ToDictionary(kv => kv.Key.ToString(), kv => (object)new { x = kv.Value.X, y = kv.Value.Y }),
            ["edges"] = Edges.Select(e => (object)new[] { e.From, e.To, e.Weight }).ToArray(),
        };

        steps.Add(new VisualizationStep(
            State: BaseState(null),
            HighlightIndices: [],
            Message: $"Start Dijkstra from node {source}. dist[{source}] = 0, every other node starts at infinity."
        ));

        while (finalized.Count < n)
        {
            // Pick the closest not-yet-finalized node with a known distance (simulates
            // popping the priority queue's minimum, skipping stale/unreachable entries).
            var next = -1;
            foreach (var i in Enumerable.Range(0, n))
            {
                if (finalized.Contains(i) || dist[i] is null) continue;
                if (next == -1 || dist[i] < dist[next]) next = i;
            }
            if (next == -1) break; // everything remaining is unreachable

            finalized.Add(next);
            var updates = new List<string>();
            foreach (var edge in SampleWeightedGraph[next])
            {
                var neighbor = edge[0];
                var weight = edge[1];
                if (finalized.Contains(neighbor)) continue;
                var candidate = dist[next]!.Value + weight;
                if (dist[neighbor] is null || candidate < dist[neighbor])
                {
                    dist[neighbor] = candidate;
                    updates.Add($"dist[{neighbor}] = {candidate}");
                }
            }

            steps.Add(new VisualizationStep(
                State: BaseState(next),
                HighlightIndices: [],
                Message: updates.Count > 0
                    ? $"Finalize node {next} (distance {dist[next]}). Relax its edges: {string.Join(", ", updates)}."
                    : $"Finalize node {next} (distance {dist[next]}). No shorter distances found through it."
            ));
        }

        var summary = string.Join(", ", Enumerable.Range(0, n).Select(i => $"{i}:{dist[i]?.ToString() ?? "unreachable"}"));
        steps.Add(new VisualizationStep(
            State: BaseState(null),
            HighlightIndices: [],
            Message: $"Done -- every reachable node finalized. Shortest distances from {source}: {summary}."
        ));

        return steps;
    }
}
