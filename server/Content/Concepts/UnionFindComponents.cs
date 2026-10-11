namespace DsaAcademy.Content.Concepts;

public class UnionFindComponents : IConcept
{
    public string Id => "union-find-components";
    public string Track => "patterns";
    public string Title => "Union-Find: Count Connected Components";
    public string OneLiner => "Instead of re-traversing the graph from scratch every time a new connection arrives, union-find merges two groups in almost constant time and remembers the merge forever.";
    public string KeyTakeaway =>
        "A union-find (disjoint set) structure answers \"are these two already connected?\" and \"merge " +
        "these two groups\" incrementally, edge by edge -- unlike a fresh BFS/DFS from every unvisited " +
        "node, it never has to re-explore the whole graph when one more connection shows up, which is " +
        "exactly what algorithms like Kruskal's MST need when edges arrive one at a time.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "A union-find structure starts with n separate singleton groups, tracked in a `parent` array " +
        "where parent[i] = i for every i -- every node is its own group's root. Two operations: Find(x) " +
        "walks parent pointers up from x until it reaches a node that's its own parent (the root of " +
        "x's group); Union(a, b) finds both roots and, if they differ, makes one root point at the " +
        "other -- merging the two groups into one.\n\n" +
        "Processing a list of edges is then just: for each edge (a, b), call Union(a, b). If Find(a) " +
        "already equals Find(b), they're already in the same group -- nothing changes. If they differ, " +
        "the merge reduces the total component count by exactly one. After every edge is processed, " +
        "the number of distinct roots remaining IS the number of connected components.\n\n" +
        "Watch the parent array below: notice most entries stay unchanged for a long time -- a merge " +
        "overwrites only one root's entry, and Find may also shorten the paths it walks; union-find only ever touches what a merge " +
        "actually requires, not the whole structure.";

    public List<string> RecognitionSignals =>
    [
        "The problem is about grouping items into connected sets based on pairwise connections (edges, \"these two are the same group\"), and asks how many groups exist, or whether two items end up in the same group.",
        "You need to repeatedly ask \"are these two already connected?\" and \"merge these two groups\" as new connections arrive, without re-scanning everything each time.",
    ];

    public List<string> Gotchas =>
    [
        "Skipping path compression (or union by rank/size) still gives a correct answer, but Find can degrade toward O(n) per call on a long chain -- fine for small inputs, worth knowing for anything performance-sensitive.",
        "Forgetting to check Find(a) == Find(b) before unioning (and decrementing the component count) either double-counts a merge or corrupts the running count.",
    ];

    public List<string> ConfusableWith =>
    [
        "Graphs: BFS Traversal / DFS Traversal (Fundamentals track) can also answer \"how many connected components,\" by running a traversal from every unvisited node -- union-find answers the same question incrementally, one edge at a time, which matters when edges arrive over time (like in Kruskal's MST algorithm) rather than being fully known up front.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int CountComponents(int n, int[][] edges)\n" +
            "    {\n" +
            "        // TODO: parent[i] = i initially. Find(x): follow parent pointers to\n" +
            "        // the root (optionally compressing the path). Union(a, b): if\n" +
            "        // Find(a) != Find(b), merge them and decrement a running\n" +
            "        // \"component count\" starting at n. Process every edge, then\n" +
            "        // return the component count.\n" +
            "        return n;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def count_components(n, edges):\n" +
            "    # TODO: parent[i] = i initially. find(x): follow parent pointers to\n" +
            "    # the root (optionally compressing the path). union(a, b): if\n" +
            "    # find(a) != find(b), merge them and decrement a running\n" +
            "    # \"component count\" starting at n. Process every edge, then\n" +
            "    # return the component count.\n" +
            "    return n\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CountComponents",
        ["python"] = "count_components",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.Int(5), "[[0, 1], [1, 2], [3, 4]]"), "2"),
        new TestCase(Lit.Args(Lit.Int(5), "[]" ), "5"),
        new TestCase(Lit.Args(Lit.Int(1), "[]"), "1"),
        new TestCase(Lit.Args(Lit.Int(6), "[[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]]"), "1"),
        new TestCase(Lit.Args(Lit.Int(4), "[[0, 1], [2, 3]]"), "2"),
    ];

    public string CSharpCallTemplate => "Solution.CountComponents({input})";
    public string PythonCallTemplate => "count_components({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int n = 6;
        int[][] edges = [[0, 1], [2, 3], [1, 2], [4, 5]];
        var parent = Enumerable.Range(0, n).ToArray();
        var components = n;
        var steps = new List<VisualizationStep>();

        int Find(int x)
        {
            while (parent[x] != x) x = parent[x];
            return x;
        }

        object[] Snapshot() => parent.Select(v => (object)v).ToArray();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot(), ["tracker"] = components, ["trackerLabel"] = "components remaining" },
            HighlightIndices: [],
            Message: $"parent[i] = i for all {n} nodes -- {components} separate components to start."
        ));

        foreach (var edge in edges)
        {
            var a = edge[0];
            var b = edge[1];
            var ra = Find(a);
            var rb = Find(b);
            if (ra == rb)
            {
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = Snapshot(), ["tracker"] = components, ["trackerLabel"] = "components remaining" },
                    HighlightIndices: [a, b],
                    Message: $"Edge ({a},{b}): both already in the same component (root {ra}) -- nothing to do."
                ));
            }
            else
            {
                parent[ra] = rb;
                components--;
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = Snapshot(), ["tracker"] = components, ["trackerLabel"] = "components remaining" },
                    HighlightIndices: [ra, rb],
                    Message: $"Edge ({a},{b}): different roots ({ra} vs {rb}) -- union them: parent[{ra}] = {rb}. {components} component(s) left."
                ));
            }
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot(), ["tracker"] = components, ["trackerLabel"] = "components remaining" },
            HighlightIndices: [],
            Message: $"Done -- {components} connected component(s)."
        ));

        return steps;
    }
}
