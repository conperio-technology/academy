namespace DsaAcademy.Content.Concepts;

public class GraphCourseSchedule : IConcept
{
    public string Id => "graph-course-schedule";
    public string Track => "patterns";
    public string Title => "Cycle Detection: Course Schedule";
    public string OneLiner => "Can every course be finished? Only if the prerequisite graph has no cycle, and a DFS that remembers which nodes are on its current path finds one.";
    public string KeyTakeaway =>
        "Give every node one of three colours: unvisited, on the current DFS path, or done. While exploring " +
        "a node, reaching a neighbour that is ON THE PATH means you have walked in a circle: a cycle. Reaching " +
        "a DONE neighbour is fine, because everything after it was already checked. A plain visited set can't " +
        "tell those two cases apart, which is why it needs the third colour.";
    public VisualizerKind VisualizerKind => VisualizerKind.Graph;

    public string Explanation =>
        "There are numCourses courses, numbered 0 to numCourses - 1. Each pair [a, b] in prerequisites means " +
        "you must take course b before course a. Return true if it is possible to finish every course, false " +
        "otherwise.\n\n" +
        "Draw each pair as a directed edge b -> a (\"b unlocks a\"). If following edges ever brings you back to " +
        "where you started, those courses each wait on another one in the loop, so none of them can be taken " +
        "first. If there is no such loop, the graph is a DAG (directed acyclic graph) and some order always " +
        "works. So the question is just: does this directed graph contain a cycle?\n\n" +
        "Depth-first search answers it if you track three states per node. Unvisited (white) nodes haven't been " +
        "reached yet. A node turns gray when DFS enters it, meaning it is on the path from the current starting " +
        "point down to where the search is now. It turns black (done) when every edge out of it has been fully " +
        "explored. Run DFS from every node that is still white. Inside DFS(u): mark u gray, then for each edge " +
        "u -> v, if v is gray you have found a cycle (v is an ancestor of u on the current path, and the edge " +
        "goes back up to it); if v is white, recurse into it; if v is black, skip it. After the loop, mark u " +
        "black.\n\n" +
        "Why not one visited set? Take the diamond 0 -> 1, 0 -> 2, 1 -> 3, 2 -> 3. DFS goes 0, 1, 3, finishes, " +
        "backs out to 0, then goes to 2 and sees 3 again. 3 was visited, but it is not on the current path " +
        "(0, 2), so this is not a loop: two routes merging into the same course is perfectly fine. Only the " +
        "gray/black split tells \"I'm standing on a node I came through\" apart from \"I already finished that " +
        "node earlier\".\n\n" +
        "Each node is entered once and each edge followed once, so the cost is O(V + E) time, with O(V + E) " +
        "space for the adjacency list plus the colour array and the recursion stack. A long chain of " +
        "prerequisites makes the recursion as deep as the chain; for very large inputs use an explicit stack, or " +
        "use Kahn's in-degree algorithm instead (see the topological sort lesson), which answers the same " +
        "question by checking whether every course gets processed.\n\n" +
        "The visualization runs DFS on edges 0 -> 1, 0 -> 2, 1 -> 3, 2 -> 3, 2 -> 4, 4 -> 5, 5 -> 2. Lines are " +
        "drawn without arrowheads, so the message says which way each edge points. Dashed amber nodes are gray " +
        "(on the path) and green nodes are done.";

    public List<string> RecognitionSignals =>
    [
        "Tasks, courses, or build steps with prerequisites, and the question is only WHETHER they can all be done, not in which order.",
        "\"Is there a circular dependency?\", \"can this deadlock?\", or \"does this directed graph have a cycle?\" in any disguise.",
        "The edges are one-way. (For an undirected graph, cycle detection is simpler: any visited neighbour other than the parent you came from closes a loop.)",
    ];

    public List<string> Gotchas =>
    [
        "A single visited set reports false cycles on diamond shapes, where two paths reach the same node. You need separate \"on the current path\" and \"done\" states.",
        "Mark the node done (black) AFTER exploring all its edges, not when you enter it; marking it early hides real cycles that pass through it.",
        "Start a DFS from every still-unvisited node, not just from node 0. The cycle can be in a part of the graph that 0 can't reach.",
        "A pair [a, a] is a course that requires itself: a cycle of length 1. The gray check catches it as long as you mark the node gray before looking at its edges.",
    ];

    public List<string> ConfusableWith =>
    [
        "Topological Sort: Order Tasks by Dependency (this track) works on the same prerequisite graph but has to RETURN an order, which Kahn's in-degree algorithm produces directly. Kahn's also answers this lesson's question (a cycle exists exactly when some course never reaches in-degree 0), so either approach is fine here.",
        "Union-Find: Count Connected Components (this track) detects cycles in UNDIRECTED graphs (an edge joining two nodes already in the same set). It doesn't work for directed edges: a -> b and c -> b share a set but form no cycle.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static bool CanFinish(int numCourses, int[][] prerequisites)\n" +
            "    {\n" +
            "        // TODO: build an adjacency list with an edge b -> a for each pair [a, b].\n" +
            "        // Keep a state per course: 0 = unvisited, 1 = on the current DFS path,\n" +
            "        // 2 = done. For every course still at 0, run DFS(u): set state 1, then\n" +
            "        // for each neighbour v: state 1 means a cycle (return false), state 0\n" +
            "        // means recurse. Set state 2 when u's neighbours are all explored.\n" +
            "        // No cycle anywhere means every course can be finished.\n" +
            "        return false;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def can_finish(num_courses, prerequisites):\n" +
            "    # TODO: build an adjacency list with an edge b -> a for each pair [a, b].\n" +
            "    # Keep a state per course: 0 = unvisited, 1 = on the current DFS path,\n" +
            "    # 2 = done. For every course still at 0, run dfs(u): set state 1, then\n" +
            "    # for each neighbour v: state 1 means a cycle (return False), state 0\n" +
            "    # means recurse. Set state 2 when u's neighbours are all explored.\n" +
            "    # No cycle anywhere means every course can be finished.\n" +
            "    return False\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CanFinish",
        ["python"] = "can_finish",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.Int(2), "[[1, 0]]"), "true"),
        new TestCase(Lit.Args(Lit.Int(2), "[[1, 0], [0, 1]]"), "false"),
        new TestCase(Lit.Args(Lit.Int(3), "[]"), "true"),
        new TestCase(Lit.Args(Lit.Int(4), "[[1, 0], [2, 0], [3, 1], [3, 2]]"), "true"),
        new TestCase(Lit.Args(Lit.Int(4), "[[1, 0], [2, 1], [3, 2], [1, 3]]"), "false"),
        new TestCase(Lit.Args(Lit.Int(1), "[[0, 0]]"), "false"),
        new TestCase(Lit.Args(Lit.Int(6), "[[1, 0], [2, 1], [4, 3], [5, 4], [3, 5]]"), "false"),
        new TestCase(Lit.Args(Lit.Int(5), "[[1, 0], [2, 0], [3, 1], [3, 2], [4, 3], [4, 0]]"), "true"),
    ];

    public string CSharpCallTemplate => "Solution.CanFinish({input})";
    public string PythonCallTemplate => "can_finish({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        // Directed edges from -> to ("from" must be taken first). 5 -> 2 closes the loop 2 -> 4 -> 5 -> 2.
        int[][] edges = [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [4, 5], [5, 2]];
        const int n = 6;
        var positions = new Dictionary<string, object>
        {
            ["0"] = new { x = 60, y = 100 },
            ["1"] = new { x = 180, y = 50 },
            ["2"] = new { x = 180, y = 150 },
            ["3"] = new { x = 320, y = 50 },
            ["4"] = new { x = 320, y = 150 },
            ["5"] = new { x = 460, y = 60 },
        };
        var adj = new List<int>[n];
        for (var i = 0; i < n; i++) adj[i] = [];
        foreach (var e in edges) adj[e[0]].Add(e[1]);

        var state = new int[n]; // 0 unvisited, 1 on path, 2 done
        var path = new List<int>();
        var steps = new List<VisualizationStep>();
        int? backEdge = null;

        Dictionary<string, object> Snapshot(int? current)
        {
            var labels = new Dictionary<string, string>();
            for (var i = 0; i < n; i++)
                labels[i.ToString()] = state[i] switch { 1 => "path", 2 => "done", _ => "" };
            return new()
            {
                ["positions"] = positions,
                ["edges"] = edges,
                ["visited"] = Enumerable.Range(0, n).Where(i => state[i] == 2).ToArray(),
                ["frontier"] = Enumerable.Range(0, n).Where(i => state[i] == 1).ToArray(),
                ["current"] = current,
                ["distances"] = labels,
                ["rejectedEdges"] = backEdge is { } b ? new[] { b } : Array.Empty<int>(),
            };
        }

        string PathText() => string.Join(" -> ", path);

        steps.Add(new VisualizationStep(
            Snapshot(null),
            [],
            "Edges point from a prerequisite to the course it unlocks: 0 -> 1, 0 -> 2, 1 -> 3, 2 -> 3, 2 -> 4, 4 -> 5, 5 -> 2. Every course starts unvisited. Start DFS from course 0."
        ));

        bool Dfs(int u)
        {
            state[u] = 1;
            path.Add(u);
            steps.Add(new VisualizationStep(
                Snapshot(u),
                [u],
                $"Enter {u} and mark it as on the path. Current path: {PathText()}."
            ));
            foreach (var v in adj[u])
            {
                if (state[v] == 1)
                {
                    backEdge = Array.FindIndex(edges, e => e[0] == u && e[1] == v);
                    steps.Add(new VisualizationStep(
                        Snapshot(u),
                        [u, v],
                        $"Edge {u} -> {v}, and {v} is ON the current path ({PathText()}). Following edges led back to {v}: that is a cycle, so return false."
                    ));
                    return false;
                }
                if (state[v] == 2)
                {
                    steps.Add(new VisualizationStep(
                        Snapshot(u),
                        [u, v],
                        $"Edge {u} -> {v}, but {v} is already done. It was reached by another route and fully checked, so this is not a loop. Skip it."
                    ));
                    continue;
                }
                if (!Dfs(v)) return false;
            }
            state[u] = 2;
            path.RemoveAt(path.Count - 1);
            steps.Add(new VisualizationStep(
                Snapshot(path.Count > 0 ? path[^1] : null),
                [u],
                adj[u].Count == 0
                    ? $"{u} has no outgoing edges. Mark it done and step back."
                    : $"Every edge out of {u} is explored without finding a loop. Mark it done and step back{(path.Count > 0 ? $" to {path[^1]}" : "")}."
            ));
            return true;
        }

        for (var s = 0; s < n; s++)
        {
            if (state[s] != 0) continue;
            if (!Dfs(s)) break;
        }

        steps.Add(new VisualizationStep(
            Snapshot(null),
            [],
            "The cycle 2 -> 4 -> 5 -> 2 means courses 2, 4 and 5 each wait on another one of them, so not every course can be finished. Remove the edge 5 -> 2 and the same search would mark everything done and return true."
        ));
        return steps;
    }
}
