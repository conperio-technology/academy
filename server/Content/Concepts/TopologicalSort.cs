namespace DsaAcademy.Content.Concepts;

public class TopologicalSort : IConcept
{
    public string Id => "topological-sort";
    public string Track => "patterns";
    public string Title => "Topological Sort: Order Tasks by Dependency";
    public string OneLiner => "Given a pile of tasks with prerequisites, find a valid order to do them in -- or discover there isn't one, because some of them depend on each other in a loop.";
    public string KeyTakeaway =>
        "Kahn's algorithm processes tasks by IN-DEGREE (how many unfinished prerequisites each task " +
        "still has): repeatedly take any task with zero remaining prerequisites, \"do\" it, and " +
        "decrement its dependents' counts. If every task eventually reaches zero, that processing " +
        "order IS a valid topological order; if some tasks never reach zero, they're stuck in a CYCLE " +
        "and no valid order exists.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given n tasks and a list of prerequisite pairs (a, b) meaning \"a must be done before b,\" " +
        "find a valid order to do every task in -- or determine no valid order exists. This is a " +
        "DIRECTED graph problem: each prerequisite pair is an edge from a to b, and the question is " +
        "whether that directed graph has a cycle (impossible) or is a DAG (directed acyclic graph -- " +
        "always orderable).\n\n" +
        "Kahn's algorithm solves it by tracking each task's IN-DEGREE: how many prerequisites it still " +
        "has outstanding. Start by finding every task with in-degree 0 (no prerequisites at all) -- " +
        "those can go first. Process one: add it to the order, then decrement the in-degree of every " +
        "task that depended on it (one of its prerequisites is now satisfied). Any task that just hit " +
        "in-degree 0 becomes available too. Repeat until every task is processed. When multiple tasks " +
        "are available at the same time, this lesson always processes the SMALLEST-numbered one, so " +
        "there's exactly one correct order to check against.\n\n" +
        "If the process ever runs out of in-degree-0 tasks while tasks remain unprocessed, those " +
        "remaining tasks form a CYCLE -- each is waiting on a prerequisite that's itself waiting, all " +
        "the way around, so none of them can ever legally go first. That's the graph-native reason " +
        "\"can I finish all these courses\" and \"is a valid order possible\" are the same question.\n\n" +
        "Watch the in-degree array below drop to zero for each task as its prerequisites get satisfied " +
        "one by one.";

    public List<string> RecognitionSignals =>
    [
        "The problem describes tasks/courses/steps with PREREQUISITES or DEPENDENCIES, and asks for a valid order to do them in (or whether a valid order even exists).",
        "The dependency structure is a DIRECTED graph, and \"cycle = impossible\" is part of the problem (you can't finish a course that indirectly depends on itself).",
    ];

    public List<string> Gotchas =>
    [
        "A cycle means SOME tasks never reach in-degree 0 -- if the algorithm finishes with fewer tasks ordered than exist in total, that's the cycle signal, not a bug in the algorithm.",
        "This builds a directed graph -- prerequisite (a, b) means an edge FROM a TO b (a unlocks b), the opposite direction from how some problem statements phrase \"b depends on a.\" Double check which direction a problem's pairs mean.",
    ];

    public List<string> ConfusableWith =>
    [
        "Graphs: BFS Traversal (Fundamentals track) also processes nodes via a queue-like frontier, but on an UNDIRECTED graph with no notion of prerequisites -- topological sort's in-degree tracking and directed edges are what make ORDERING (not just reachability) meaningful.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] TopologicalOrder(int n, int[][] prerequisites)\n" +
            "    {\n" +
            "        // TODO: build in-degree counts and an adjacency list from\n" +
            "        // prerequisites (a \"before\" b means an edge a -> b). Repeatedly\n" +
            "        // pick the SMALLEST-numbered task with in-degree 0, add it to the\n" +
            "        // order, and decrement its neighbors' in-degrees (adding any that\n" +
            "        // reach 0 to the candidate pool). If you run out of in-degree-0\n" +
            "        // tasks before every task is ordered, there's a cycle -- return an\n" +
            "        // empty array. Otherwise return the full order.\n" +
            "        return new int[0];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def topological_order(n, prerequisites):\n" +
            "    # TODO: build in-degree counts and an adjacency list from\n" +
            "    # prerequisites (a \"before\" b means an edge a -> b). Repeatedly\n" +
            "    # pick the SMALLEST-numbered task with in-degree 0, add it to the\n" +
            "    # order, and decrement its neighbors' in-degrees (adding any that\n" +
            "    # reach 0 to the candidate pool). If you run out of in-degree-0\n" +
            "    # tasks before every task is ordered, there's a cycle -- return an\n" +
            "    # empty list. Otherwise return the full order.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.TopologicalOrder",
        ["python"] = "topological_order",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.Int(4), "[[0, 1], [0, 2], [1, 3], [2, 3]]"), "[0,1,2,3]"),
        new TestCase(Lit.Args(Lit.Int(4), "[[1, 0], [2, 0], [3, 1], [3, 2]]"), "[3,1,2,0]"),
        new TestCase(Lit.Args(Lit.Int(3), "[]"), "[0,1,2]"),
        new TestCase(Lit.Args(Lit.Int(2), "[[0, 1], [1, 0]]"), "[]"),
        new TestCase(Lit.Args(Lit.Int(5), "[[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]]"), "[0,1,2,3,4]"),
    ];

    public string CSharpCallTemplate => "Solution.TopologicalOrder({input})";
    public string PythonCallTemplate => "topological_order({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int n = 5;
        int[][] prereqs = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]];
        var adj = new List<int>[n];
        for (var i = 0; i < n; i++) adj[i] = [];
        var indegree = new int[n];
        foreach (var p in prereqs)
        {
            adj[p[0]].Add(p[1]);
            indegree[p[1]]++;
        }

        var steps = new List<VisualizationStep>();
        var order = new List<int>();
        var processed = new bool[n];

        object[] Snapshot() => indegree.Select(v => (object)v).ToArray();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot() },
            HighlightIndices: [],
            Message: "in-degree[i] = number of prerequisites task i still needs. Repeatedly process the SMALLEST task with in-degree 0."
        ));

        while (order.Count < n)
        {
            var next = -1;
            for (var i = 0; i < n; i++)
            {
                if (!processed[i] && indegree[i] == 0) { next = i; break; }
            }

            if (next == -1)
            {
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = Snapshot() },
                    HighlightIndices: [],
                    Message: "No task has in-degree 0 but tasks remain -- that's a cycle. Return []."
                ));
                return steps;
            }

            processed[next] = true;
            order.Add(next);
            foreach (var neighbor in adj[next]) indegree[neighbor]--;

            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = Snapshot() },
                HighlightIndices: [next],
                Message: $"Process task {next} (in-degree 0) -- order so far: [{string.Join(", ", order)}]. Decrement in-degree of its dependents."
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot() },
            HighlightIndices: [],
            Message: $"Done -- topological order: [{string.Join(", ", order)}]."
        ));

        return steps;
    }
}
