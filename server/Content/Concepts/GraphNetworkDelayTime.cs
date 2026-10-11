namespace DsaAcademy.Content.Concepts;

// Transfer exercise after Dijkstra's Shortest Path: the graph arrives as a directed edge list and
// the question is "when has everyone heard?", which is the largest shortest distance.
public class GraphNetworkDelayTime : IConcept
{
    public string Id => "graph-network-delay-time";
    public string Track => "graphs";
    public string Title => "Transfer: Network Delay Time";
    public string OneLiner => "A signal leaves one node and travels along directed, timed links. How long until every node has it? Dijkstra, then one more question about its answer.";
    public string KeyTakeaway =>
        "A signal spreading from k reaches each node first along that node's shortest path, so every arrival " +
        "time is a Dijkstra distance. Everyone has the signal once the slowest arrival happens: the answer is " +
        "the largest distance, or -1 if any node is never reached.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;
    public string? TransferOf => "graph-dijkstra-shortest-path";

    public string Explanation =>
        "This follows Dijkstra's Shortest Path with the problem dressed differently. A network has n nodes " +
        "numbered 0 to n - 1. times[i] = [u, v, w] means a signal sent from u reaches v after w time units; " +
        "links are one way, and there may be several links between the same two nodes. A signal starts at " +
        "node k at time 0 and every node forwards it along all its links the moment it arrives. Return the " +
        "time at which every node has received it, or -1 if some node never does.\n\n" +
        "Two things changed from the parent lesson. The graph comes as a list of directed edges, so you " +
        "build the adjacency list yourself (an edge u -> v goes only into u's list). And the answer isn't " +
        "the distance array but one number derived from it.\n\n" +
        "When does node v first get the signal? The signal tries every route at once, so v hears it at " +
        "the length of its fastest route from k: exactly dist[v] from Dijkstra. All nodes have it once the " +
        "last of them hears it, at max(dist). If some dist is still infinity, that node is unreachable and " +
        "the answer is -1.\n\n" +
        "So: build adj from times, run Dijkstra from k with a priority queue of (distance, node), skip stale " +
        "entries, relax edges, then take the maximum. Parallel edges need no special care, since relaxing " +
        "picks the cheaper one. With E links and V = n nodes it is O((V + E) log V) time and O(V + E) space, " +
        "as in the parent lesson.\n\n" +
        "The visualization runs n = 5, k = 0 over six links and shows dist after each node is finalized; " +
        "\"inf\" means not reached yet.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences on why this is " +
        "Dijkstra in disguise. Why is the time a node first hears the signal the same as its shortest path " +
        "distance, why is the answer the maximum and not the sum, and what does an unreachable node do to it?";

    public List<string> RecognitionSignals =>
    [
        "Something spreads from one source along weighted links (signal, rumour, infection, water) and the question is when the last place is reached.",
        "Non-negative travel times and \"how long until everyone\", which is the largest of the shortest distances.",
    ];

    public List<string> Gotchas =>
    [
        "The links are directed: add u -> v only, not v -> u.",
        "Return -1 if any node is unreachable; the maximum of the reachable distances alone is wrong.",
        "The answer is the largest shortest distance, not the sum of the edge times on some spanning tree.",
    ];

    public List<string> ConfusableWith =>
    [
        "Graphs: Dijkstra's Shortest Path returns every distance from the source; this is the same computation followed by one max over the result.",
        "Minimum spanning tree also picks cheap edges, but it minimises the total edge weight, not how long the farthest node waits.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int NetworkDelayTime(int[][] times, int n, int k)\n" +
            "    {\n" +
            "        // TODO: build adj: for each [u, v, w], add (v, w) to adj[u] (one way only).\n" +
            "        // Dijkstra from k: dist[k] = 0, the rest int.MaxValue, and a\n" +
            "        // PriorityQueue<int, int> of nodes by distance. Pop, skip stale\n" +
            "        // entries, relax each edge. Return -1 if any dist is still\n" +
            "        // int.MaxValue, otherwise the largest dist.\n" +
            "        return -1;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "import heapq\n" +
            "\n" +
            "def network_delay_time(times, n, k):\n" +
            "    # TODO: build adj: for each [u, v, w], add (v, w) to adj[u] (one way only).\n" +
            "    # Dijkstra from k: dist[k] = 0, the rest infinity, and a heap of\n" +
            "    # (distance, node). Pop, skip stale entries, relax each edge.\n" +
            "    # Return -1 if any dist is still infinite, otherwise the largest dist.\n" +
            "    return -1\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.NetworkDelayTime",
        ["python"] = "network_delay_time",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args("[[1, 0, 1], [1, 2, 1], [2, 3, 1]]", Lit.Int(4), Lit.Int(1)), "2"),
        new TestCase(Lit.Args("[[0, 1, 1]]", Lit.Int(2), Lit.Int(0)), "1"),
        new TestCase(Lit.Args("[[0, 1, 1]]", Lit.Int(2), Lit.Int(1)), "-1"),
        new TestCase(Lit.Args("[]", Lit.Int(1), Lit.Int(0)), "0"),
        new TestCase(Lit.Args("[[0, 1, 5], [0, 1, 1]]", Lit.Int(2), Lit.Int(0)), "1"),
        new TestCase(Lit.Args("[[0, 1, 1], [1, 2, 2], [0, 2, 4]]", Lit.Int(3), Lit.Int(0)), "3"),
        new TestCase(Lit.Args("[[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5], [3, 4, 3]]", Lit.Int(5), Lit.Int(0)), "7"),
        new TestCase(Lit.Args("[[0, 1, 2], [1, 2, 3], [2, 0, 1], [3, 0, 7]]", Lit.Int(4), Lit.Int(0)), "-1"),
        new TestCase(Lit.Args("[[0, 1, 1], [1, 0, 1]]", Lit.Int(3), Lit.Int(0)), "-1"),
    ];

    public string CSharpCallTemplate => "Solution.NetworkDelayTime({input})";
    public string PythonCallTemplate => "network_delay_time({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int n = 5;
        const int k = 0;
        int[][] times = [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5], [3, 4, 3]];
        var adj = Enumerable.Range(0, n).Select(_ => new List<(int To, int W)>()).ToArray();
        foreach (var t in times) adj[t[0]].Add((t[1], t[2]));

        var dist = new int?[n];
        dist[k] = 0;
        var done = new bool[n];
        var steps = new List<VisualizationStep>();

        object[] Snapshot() => dist.Select(d => (object)(d?.ToString() ?? "inf")).ToArray();

        steps.Add(new VisualizationStep(
            new Dictionary<string, object> { ["array"] = Snapshot(), ["tracker"] = 0, ["trackerLabel"] = "latest arrival" },
            [k],
            $"Links: {string.Join(", ", times.Select(t => $"{t[0]}->{t[1]} ({t[2]})"))}. The signal starts at node {k} at time 0."
        ));

        var latest = 0;
        while (true)
        {
            var next = -1;
            for (var i = 0; i < n; i++)
                if (!done[i] && dist[i] is not null && (next == -1 || dist[i] < dist[next])) next = i;
            if (next == -1) break;

            done[next] = true;
            latest = dist[next]!.Value;
            var updates = new List<string>();
            foreach (var (to, w) in adj[next])
            {
                var candidate = dist[next]!.Value + w;
                if (!done[to] && (dist[to] is null || candidate < dist[to]))
                {
                    dist[to] = candidate;
                    updates.Add($"dist[{to}] = {candidate}");
                }
            }
            steps.Add(new VisualizationStep(
                new Dictionary<string, object> { ["array"] = Snapshot(), ["tracker"] = latest, ["trackerLabel"] = "latest arrival" },
                [next],
                updates.Count > 0
                    ? $"Node {next} hears the signal at time {dist[next]} (the smallest unfinished distance). Relax its links: {string.Join(", ", updates)}."
                    : $"Node {next} hears the signal at time {dist[next]}. Its links offer nothing faster."
            ));
        }

        steps.Add(new VisualizationStep(
            new Dictionary<string, object> { ["array"] = Snapshot(), ["tracker"] = latest, ["trackerLabel"] = "latest arrival" },
            [],
            dist.All(d => d is not null)
                ? $"Every node is reached. The last one hears it at time {dist.Max()}, so the answer is {dist.Max()}."
                : "Some node was never reached, so the answer is -1."
        ));
        return steps;
    }
}
