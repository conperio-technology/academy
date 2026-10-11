namespace DsaAcademy.Content.Concepts;

public class GraphClone : IConcept
{
    public string Id => "graph-clone";
    public string Track => "patterns";
    public string Title => "Graph Traversal + Hash Map: Clone a Graph";
    public string OneLiner => "Deep-copy a graph that has cycles: walk it once, and keep a map from each original node to its copy so you never copy a node twice.";
    public string KeyTakeaway =>
        "The map from original node to copy does two jobs at once: it is the visited set (a node is in the map " +
        "once it has been copied) and it is how you find the copy to wire an edge to. Create a node's copy the " +
        "first time you SEE it, before exploring its neighbours, so a cycle that leads back to it finds the copy " +
        "in the map instead of copying it again forever.";
    public VisualizerKind VisualizerKind => VisualizerKind.Graph;

    public string Explanation =>
        "You get one node of a connected, undirected graph. Each node has a value and a list of neighbours. " +
        "Return a deep copy: a brand-new node for every original node, wired up the same way, with no node " +
        "object shared between the two graphs. If the input is null (an empty graph), return null.\n\n" +
        "In this lesson node i has the value i, and the tests describe the graph as an adjacency list: entry i " +
        "lists node i's neighbours. The harness builds real Node objects from that list, hands your function " +
        "node 0, then walks what you return. It fails the test if any node in your result is one of the " +
        "original objects (so returning the input does not pass), if a value was copied more than once, or if " +
        "the wiring differs. Keep each neighbour list in its original order.\n\n" +
        "A recursive \"copy this node, then copy each neighbour\" never finishes on a graph: 0's neighbour is 1, " +
        "1's neighbour is 0, and so on around every edge. The fix is a dictionary from original node to copy. " +
        "With BFS: create the copy of the start node, put it in the map, and enqueue the original. Then dequeue " +
        "a node u and look at each neighbour v. If v is not in the map yet, create its copy, store it, and " +
        "enqueue v. Either way, append map[v] to map[u]'s neighbour list. Every node enters the queue once (the " +
        "moment its copy is made) and every edge is wired from both ends, once each.\n\n" +
        "DFS works the same way: clone(u) returns map[u] if it exists; otherwise it creates the copy, stores it " +
        "in the map FIRST, then appends clone(v) for each neighbour. Storing before recursing is what stops the " +
        "loop: when the recursion comes back around to u, the copy is already there.\n\n" +
        "Each node is copied once and each edge is looked at twice (once from each end), so the cost is " +
        "O(V + E) time and O(V) extra space for the map and the queue, not counting the copy itself. The same " +
        "\"map from old object to new object\" trick copies a linked list whose nodes have an extra random " +
        "pointer, and any other structure where several references can lead to the same object.\n\n" +
        "The visualization copies a 4-node cycle with BFS. The original is on the left; copies appear on the " +
        "right as they are created, labelled with the node they copy.";

    public List<string> RecognitionSignals =>
    [
        "\"Deep copy\", \"clone\", or \"duplicate\" a structure built from linked objects, where several references can reach the same object.",
        "A copy where shared or circular references must stay shared and circular in the result, instead of being copied again.",
        "Anything shaped like \"rebuild this graph (or list with random pointers) with new nodes\", where you need to go from an old node to its new twin.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    // Node (provided): public int Val; public List<Node> Neighbors;\n" +
            "    public static Node? CloneGraph(Node? node)\n" +
            "    {\n" +
            "        // TODO: if node is null, return null. Keep a Dictionary<Node, Node>\n" +
            "        // from original to copy. Copy the start node, store it, and enqueue\n" +
            "        // the original. While the queue isn't empty, dequeue u and for each\n" +
            "        // neighbour v: if v has no copy yet, create one (new Node(v.Val)),\n" +
            "        // store it, and enqueue v. Then add copies[v] to copies[u].Neighbors.\n" +
            "        // Return the start node's copy.\n" +
            "        return null;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "# Node (provided): node.val, node.neighbors (a list of Node)\n" +
            "def clone_graph(node):\n" +
            "    # TODO: if node is None, return None. Keep a dict from original to\n" +
            "    # copy. Copy the start node, store it, and enqueue the original. While\n" +
            "    # the queue isn't empty, pop u and for each neighbour v: if v has no\n" +
            "    # copy yet, create one (Node(v.val)), store it, and enqueue v. Then\n" +
            "    # append copies[v] to copies[u].neighbors. Return the start's copy.\n" +
            "    return None\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CloneGraph",
        ["python"] = "clone_graph",
    };

    // The harness builds Node objects from the adjacency list, calls the learner's clone on
    // node 0, and checks the result before turning it back into an adjacency list. Any node
    // object shared with the original, a value copied twice, or a damaged original turns
    // into a descriptive string instead, which never matches the expected JSON array.
    public string? CSharpHarnessPreamble =>
        "public class Node\n" +
        "{\n" +
        "    public int Val;\n" +
        "    public List<Node> Neighbors = new List<Node>();\n" +
        "    public Node(int val) { Val = val; }\n" +
        "}\n" +
        "public static class CloneHarness\n" +
        "{\n" +
        "    private static int[][] ToAdjacency(Node? start, int count)\n" +
        "    {\n" +
        "        var result = new int[count][];\n" +
        "        if (start == null) return result;\n" +
        "        var seen = new HashSet<Node> { start };\n" +
        "        var queue = new Queue<Node>();\n" +
        "        queue.Enqueue(start);\n" +
        "        while (queue.Count > 0)\n" +
        "        {\n" +
        "            var u = queue.Dequeue();\n" +
        "            result[u.Val] = u.Neighbors.Select(v => v.Val).ToArray();\n" +
        "            foreach (var v in u.Neighbors) if (seen.Add(v)) queue.Enqueue(v);\n" +
        "        }\n" +
        "        return result;\n" +
        "    }\n" +
        "\n" +
        "    public static object Run(int[][] adjacency, Func<Node?, Node?> clone)\n" +
        "    {\n" +
        "        var original = Enumerable.Range(0, adjacency.Length).Select(i => new Node(i)).ToArray();\n" +
        "        for (var i = 0; i < adjacency.Length; i++)\n" +
        "            foreach (var j in adjacency[i]) original[i].Neighbors.Add(original[j]);\n" +
        "        var originals = new HashSet<Node>(original);\n" +
        "\n" +
        "        var copy = clone(original.Length > 0 ? original[0] : null);\n" +
        "        if (original.Length == 0) return copy == null ? (object)new int[0][] : \"expected null for an empty graph\";\n" +
        "        if (copy == null) return \"returned null for a non-empty graph\";\n" +
        "\n" +
        "        var byValue = new Dictionary<int, Node>();\n" +
        "        var seen = new HashSet<Node> { copy };\n" +
        "        var queue = new Queue<Node>();\n" +
        "        queue.Enqueue(copy);\n" +
        "        while (queue.Count > 0)\n" +
        "        {\n" +
        "            var u = queue.Dequeue();\n" +
        "            if (originals.Contains(u)) return $\"not a deep copy: node {u.Val} in the result is an original node\";\n" +
        "            if (u.Val < 0 || u.Val >= adjacency.Length) return $\"unexpected node value {u.Val}\";\n" +
        "            if (byValue.ContainsKey(u.Val)) return $\"node {u.Val} was copied more than once\";\n" +
        "            byValue[u.Val] = u;\n" +
        "            foreach (var v in u.Neighbors) if (seen.Add(v)) queue.Enqueue(v);\n" +
        "        }\n" +
        "\n" +
        "        var before = ToAdjacency(original[0], adjacency.Length);\n" +
        "        for (var i = 0; i < adjacency.Length; i++)\n" +
        "            if (before[i] == null || !before[i].SequenceEqual(adjacency[i])) return \"the original graph was modified\";\n" +
        "        return ToAdjacency(copy, adjacency.Length).Select(row => row ?? new int[0]).ToArray();\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "class Node:\n" +
        "    def __init__(self, val):\n" +
        "        self.val = val\n" +
        "        self.neighbors = []\n" +
        "\n" +
        "def _clone_to_adjacency(start, count):\n" +
        "    result = [None] * count\n" +
        "    if start is None:\n" +
        "        return result\n" +
        "    seen = {id(start)}\n" +
        "    queue = [start]\n" +
        "    i = 0\n" +
        "    while i < len(queue):\n" +
        "        u = queue[i]\n" +
        "        i += 1\n" +
        "        result[u.val] = [v.val for v in u.neighbors]\n" +
        "        for v in u.neighbors:\n" +
        "            if id(v) not in seen:\n" +
        "                seen.add(id(v))\n" +
        "                queue.append(v)\n" +
        "    return result\n" +
        "\n" +
        "def clone_check(adjacency, clone):\n" +
        "    original = [Node(i) for i in range(len(adjacency))]\n" +
        "    for i, row in enumerate(adjacency):\n" +
        "        for j in row:\n" +
        "            original[i].neighbors.append(original[j])\n" +
        "    originals = {id(n) for n in original}\n" +
        "\n" +
        "    copy = clone(original[0] if original else None)\n" +
        "    if not original:\n" +
        "        return [] if copy is None else 'expected None for an empty graph'\n" +
        "    if copy is None:\n" +
        "        return 'returned None for a non-empty graph'\n" +
        "\n" +
        "    by_value = {}\n" +
        "    seen = {id(copy)}\n" +
        "    queue = [copy]\n" +
        "    i = 0\n" +
        "    while i < len(queue):\n" +
        "        u = queue[i]\n" +
        "        i += 1\n" +
        "        if id(u) in originals:\n" +
        "            return f'not a deep copy: node {u.val} in the result is an original node'\n" +
        "        if not isinstance(u.val, int) or not 0 <= u.val < len(adjacency):\n" +
        "            return f'unexpected node value {u.val}'\n" +
        "        if u.val in by_value:\n" +
        "            return f'node {u.val} was copied more than once'\n" +
        "        by_value[u.val] = u\n" +
        "        for v in u.neighbors:\n" +
        "            if id(v) not in seen:\n" +
        "                seen.add(id(v))\n" +
        "                queue.append(v)\n" +
        "\n" +
        "    if _clone_to_adjacency(original[0], len(adjacency)) != [list(row) for row in adjacency]:\n" +
        "        return 'the original graph was modified'\n" +
        "    return [row if row is not None else [] for row in _clone_to_adjacency(copy, len(adjacency))]\n";

    public List<TestCase> TestCases =>
    [
        new TestCase("[[1, 3], [0, 2], [1, 3], [0, 2]]", "[[1,3],[0,2],[1,3],[0,2]]"),
        new TestCase("[[]]", "[[]]"),
        new TestCase("[]", "[]"),
        new TestCase("[[1], [0]]", "[[1],[0]]"),
        new TestCase("[[1, 2], [0, 2], [0, 1]]", "[[1,2],[0,2],[0,1]]"),
        new TestCase("[[1], [0, 2], [1, 3], [2]]", "[[1],[0,2],[1,3],[2]]"),
        new TestCase("[[1, 2, 3], [0, 2, 3], [0, 1, 3], [0, 1, 2]]", "[[1,2,3],[0,2,3],[0,1,3],[0,1,2]]"),
        new TestCase("[[2, 1], [0], [0, 4, 3], [2, 4], [3, 2]]", "[[2,1],[0],[0,4,3],[2,4],[3,2]]"),
    ];

    public string CSharpCallTemplate => "CloneHarness.Run({input}, Solution.CloneGraph)";
    public string PythonCallTemplate => "clone_check({input}, clone_graph)";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        // Original nodes 0-3 (a 4-cycle) on the left; copy of node i is drawn as node i + 4 on the right.
        int[][] adj = [[1, 3], [0, 2], [1, 3], [0, 2]];
        const int n = 4;
        var originalPos = new (int X, int Y)[] { (70, 50), (190, 50), (190, 150), (70, 150) };
        var copyPos = originalPos.Select(p => (p.X + 300, p.Y)).ToArray();

        var copies = new HashSet<int>();
        var copyEdges = new List<(int A, int B)>();
        var processed = new List<int>();
        var queue = new Queue<int>();
        var steps = new List<VisualizationStep>();

        Dictionary<string, object> Snapshot(int? current, List<int>? justWired)
        {
            var positions = new Dictionary<string, object>();
            var labels = new Dictionary<string, string>();
            for (var i = 0; i < n; i++)
            {
                positions[i.ToString()] = new { x = originalPos[i].X, y = originalPos[i].Y };
                labels[i.ToString()] = "original";
            }
            foreach (var c in copies)
            {
                positions[(c + n).ToString()] = new { x = copyPos[c].Item1, y = copyPos[c].Item2 };
                labels[(c + n).ToString()] = $"copy of {c}";
            }
            var edges = new List<int[]> { new[] { 0, 1 }, new[] { 1, 2 }, new[] { 2, 3 }, new[] { 3, 0 } };
            edges.AddRange(copyEdges.Select(e => new[] { e.A + n, e.B + n }));
            var chosen = (justWired ?? []).Select(w => 4 + w).ToArray();
            return new()
            {
                ["positions"] = positions,
                ["edges"] = edges.ToArray(),
                ["visited"] = processed.Concat(copies.Select(c => c + n)).ToArray(),
                ["frontier"] = queue.ToArray(),
                ["current"] = current,
                ["distances"] = labels,
                ["chosenEdges"] = chosen,
            };
        }

        copies.Add(0);
        queue.Enqueue(0);
        steps.Add(new VisualizationStep(
            Snapshot(null, null),
            [0],
            "The original graph is the cycle 0-1-2-3-0. Copy the start node 0 (right side), store original 0 -> copy in the map, and enqueue original 0."
        ));

        while (queue.Count > 0)
        {
            var u = queue.Dequeue();
            var notes = new List<string>();
            var newEdges = new List<int>();
            foreach (var v in adj[u])
            {
                var isNew = copies.Add(v);
                if (isNew) queue.Enqueue(v);
                // Draw each undirected copy edge once, the first time either end wires it.
                if (!copyEdges.Contains((u, v)) && !copyEdges.Contains((v, u)))
                {
                    copyEdges.Add((u, v));
                    newEdges.Add(copyEdges.Count - 1);
                }
                notes.Add(isNew
                    ? $"{v} has no copy yet, so create one, store it, and enqueue {v}; add copy {v} to copy {u}'s neighbours"
                    : $"{v} is already in the map, so just add its existing copy to copy {u}'s neighbours");
            }
            processed.Add(u);
            steps.Add(new VisualizationStep(
                Snapshot(u, newEdges),
                [u],
                $"Dequeue original {u}. " + string.Join(". ", notes) + "."
            ));
        }

        steps.Add(new VisualizationStep(
            Snapshot(null, null),
            [],
            "The queue is empty. Four new nodes, wired exactly like the originals, and none of them is an original object. Note how node 2 was reached from both 1 and 3 but copied only once: the map lookup is what made the second visit reuse it."
        ));
        return steps;
    }
}
