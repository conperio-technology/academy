namespace DsaAcademy.Content.Concepts;

// Transfer exercise after Clone a Graph: the same original-to-copy map, on a linked list whose
// extra pointer can lead anywhere (including backwards and to the node itself).
public class LinkedListCopyRandom : IConcept
{
    public string Id => "linked-list-copy-random";
    public string Track => "patterns";
    public string Title => "Transfer: Copy a List with Random Pointers";
    public string OneLiner => "Deep-copy a linked list where every node also has a pointer to any node in the list (or null). The map from Clone a Graph does the work again.";
    public string KeyTakeaway =>
        "Whenever several references can reach the same object, a deep copy needs a map from each original " +
        "object to its copy, keyed by the object itself, not its value. Build all the copies first, then wire " +
        "every pointer by looking up the original target in the map.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;
    public string? TransferOf => "graph-clone";

    public string Explanation =>
        "This follows Clone a Graph. Each node of a singly linked list has a value, a next pointer and a " +
        "random pointer, which can point at any node in the list (an earlier one, a later one, the node " +
        "itself) or be null. Return a deep copy: new nodes only, with next and random wired exactly like the " +
        "original, and the original left untouched.\n\n" +
        "The tests describe the list as pairs [value, random index], with -1 meaning a null random pointer. " +
        "The harness builds real nodes, calls your function on the head, and checks that no node in your copy " +
        "is an original node, that every random pointer lands on a node of the copy, and that the original " +
        "list was not changed. Values can repeat, so a map keyed by value will mix nodes up.\n\n" +
        "Copying next pointers alone is easy: walk and make a new node per old one. The random pointers are " +
        "the problem. When you copy node 1 and its random points at node 4, the copy of node 4 may not exist " +
        "yet, and when it does exist you need a way to find it from the original node 4. That is exactly the " +
        "question the map answered in Clone a Graph: given an original node, where is its copy?\n\n" +
        "Two passes keep it simple. Pass 1 walks the list and creates the copy of every node, storing " +
        "original to copy in a dictionary. Pass 2 walks again and, for each original n, sets copy(n).next to " +
        "copy(n.next) and copy(n).random to copy(n.random), with null staying null. Every lookup succeeds " +
        "because every copy was made in pass 1. That is O(n) time and O(n) extra space for the map. (A known " +
        "O(1) space trick interleaves each copy right after its original, wires the random pointers through " +
        "that layout, then splits the two lists apart. It is worth knowing, but the map version is the one to " +
        "reach for first.)\n\n" +
        "The visualization copies the list [7, 13, 11, 10, 1] whose random pointers are null, 0, 4, 2 and 0. " +
        "Each cell shows a node's value and where its random pointer goes.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences on why the " +
        "original to copy map from Clone a Graph is what this problem needs. Cover what the random pointers " +
        "do to the shape of the list (is it still just a line?), which of the map's two jobs from Clone a " +
        "Graph you still need here and which one the plain next walk already does for you, and why the key has " +
        "to be the node object rather than its value.";

    public List<string> RecognitionSignals =>
    [
        "\"Deep copy\" of a structure where one object can be reached through more than one reference.",
        "A linked list with an extra pointer (random, child, sibling) that can point anywhere in the list.",
    ];

    public List<string> Gotchas =>
    [
        "Key the map by node, not by value: two nodes with the value 3 are different nodes.",
        "Look up random targets only after every copy exists (two passes), or create missing copies on demand when you first meet them.",
        "Don't return or reuse an original node anywhere in the copy, including through a random pointer.",
    ];

    public List<string> ConfusableWith =>
    [
        "Graph Traversal + Hash Map: Clone a Graph uses the same map, but there it is also the visited set that stops a cycle from being copied forever. A list walked with next has no cycles, so here the map only finds copies.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    // Node (provided): public int Val; public Node? Next; public Node? Random;\n" +
            "    public static Node? CopyRandomList(Node? head)\n" +
            "    {\n" +
            "        // TODO: pass 1: walk the list with Next and create a copy of every\n" +
            "        // node (new Node(n.Val)), storing original -> copy in a\n" +
            "        // Dictionary<Node, Node>. Pass 2: walk again and set the copy's Next\n" +
            "        // and Random by looking up the ORIGINAL node's Next and Random in the\n" +
            "        // map (null stays null). Return the head's copy, or null if head is null.\n" +
            "        return null;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "# Node (provided): node.val, node.next, node.random; create one with Node(val)\n" +
            "def copy_random_list(head):\n" +
            "    # TODO: pass 1: walk the list with .next and create a copy of every\n" +
            "    # node (Node(n.val)), storing original -> copy in a dict. Pass 2: walk\n" +
            "    # again and set the copy's next and random by looking up the ORIGINAL\n" +
            "    # node's next and random in the dict (None stays None). Return the\n" +
            "    # head's copy, or None if head is None.\n" +
            "    return None\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CopyRandomList",
        ["python"] = "copy_random_list",
    };

    // The harness builds the list from [value, random index] pairs, calls the learner's copy on
    // the head, checks it (no original nodes, random pointers inside the copy, original intact)
    // and turns the copy back into pairs. Any problem becomes a descriptive string instead.
    public string? CSharpHarnessPreamble =>
        "public class Node\n" +
        "{\n" +
        "    public int Val;\n" +
        "    public Node? Next;\n" +
        "    public Node? Random;\n" +
        "    public Node(int val) { Val = val; }\n" +
        "}\n" +
        "public static class RandomListHarness\n" +
        "{\n" +
        "    public static object Run(int[][] spec, Func<Node?, Node?> copy)\n" +
        "    {\n" +
        "        var original = spec.Select(p => new Node(p[0])).ToArray();\n" +
        "        for (var i = 0; i < original.Length; i++)\n" +
        "        {\n" +
        "            if (i + 1 < original.Length) original[i].Next = original[i + 1];\n" +
        "            if (spec[i][1] >= 0) original[i].Random = original[spec[i][1]];\n" +
        "        }\n" +
        "        var originals = new HashSet<Node>(original);\n" +
        "\n" +
        "        var head = copy(original.Length > 0 ? original[0] : null);\n" +
        "\n" +
        "        for (var i = 0; i < original.Length; i++)\n" +
        "        {\n" +
        "            var next = i + 1 < original.Length ? original[i + 1] : null;\n" +
        "            var random = spec[i][1] >= 0 ? original[spec[i][1]] : null;\n" +
        "            if (original[i].Val != spec[i][0] || original[i].Next != next || original[i].Random != random)\n" +
        "                return \"the original list was modified\";\n" +
        "        }\n" +
        "\n" +
        "        var copies = new List<Node>();\n" +
        "        var index = new Dictionary<Node, int>();\n" +
        "        for (var n = head; n != null; n = n.Next)\n" +
        "        {\n" +
        "            if (originals.Contains(n)) return $\"not a deep copy: node {copies.Count} is an original node\";\n" +
        "            if (index.ContainsKey(n)) return \"the copy's next pointers loop back on themselves\";\n" +
        "            if (copies.Count == original.Length) return \"the copy is longer than the original\";\n" +
        "            index[n] = copies.Count;\n" +
        "            copies.Add(n);\n" +
        "        }\n" +
        "\n" +
        "        var output = new List<int[]>();\n" +
        "        foreach (var n in copies)\n" +
        "        {\n" +
        "            if (n.Random == null) { output.Add(new[] { n.Val, -1 }); continue; }\n" +
        "            if (originals.Contains(n.Random)) return $\"node {output.Count}'s random points into the original list\";\n" +
        "            if (!index.TryGetValue(n.Random, out var r)) return $\"node {output.Count}'s random points outside the copied list\";\n" +
        "            output.Add(new[] { n.Val, r });\n" +
        "        }\n" +
        "        return output.ToArray();\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "class Node:\n" +
        "    def __init__(self, val, next=None, random=None):\n" +
        "        self.val = val\n" +
        "        self.next = next\n" +
        "        self.random = random\n" +
        "\n" +
        "def random_list_check(spec, copy):\n" +
        "    original = [Node(v) for v, _ in spec]\n" +
        "    for i, (_, r) in enumerate(spec):\n" +
        "        if i + 1 < len(original):\n" +
        "            original[i].next = original[i + 1]\n" +
        "        if r >= 0:\n" +
        "            original[i].random = original[r]\n" +
        "    originals = {id(n) for n in original}\n" +
        "\n" +
        "    head = copy(original[0] if original else None)\n" +
        "\n" +
        "    for i, (v, r) in enumerate(spec):\n" +
        "        nxt = original[i + 1] if i + 1 < len(original) else None\n" +
        "        rnd = original[r] if r >= 0 else None\n" +
        "        if original[i].val != v or original[i].next is not nxt or original[i].random is not rnd:\n" +
        "            return 'the original list was modified'\n" +
        "\n" +
        "    copies = []\n" +
        "    index = {}\n" +
        "    n = head\n" +
        "    while n is not None:\n" +
        "        if id(n) in originals:\n" +
        "            return f'not a deep copy: node {len(copies)} is an original node'\n" +
        "        if id(n) in index:\n" +
        "            return \"the copy's next pointers loop back on themselves\"\n" +
        "        if len(copies) == len(original):\n" +
        "            return 'the copy is longer than the original'\n" +
        "        index[id(n)] = len(copies)\n" +
        "        copies.append(n)\n" +
        "        n = n.next\n" +
        "\n" +
        "    out = []\n" +
        "    for n in copies:\n" +
        "        if n.random is None:\n" +
        "            out.append([n.val, -1])\n" +
        "        elif id(n.random) in originals:\n" +
        "            return f\"node {len(out)}'s random points into the original list\"\n" +
        "        elif id(n.random) not in index:\n" +
        "            return f\"node {len(out)}'s random points outside the copied list\"\n" +
        "        else:\n" +
        "            out.append([n.val, index[id(n.random)]])\n" +
        "    return out\n";

    public List<TestCase> TestCases =>
    [
        new TestCase("[[7, -1], [13, 0], [11, 4], [10, 2], [1, 0]]", "[[7,-1],[13,0],[11,4],[10,2],[1,0]]"),
        new TestCase("[[1, 1], [2, 1]]", "[[1,1],[2,1]]"),
        new TestCase("[[3, -1], [3, 0], [3, -1]]", "[[3,-1],[3,0],[3,-1]]"),
        new TestCase("[]", "[]"),
        new TestCase("[[5, 0]]", "[[5,0]]"),
        new TestCase("[[1, -1], [2, -1], [3, -1]]", "[[1,-1],[2,-1],[3,-1]]"),
        new TestCase("[[4, 3], [4, 3], [4, 0], [4, 1]]", "[[4,3],[4,3],[4,0],[4,1]]"),
    ];

    public string CSharpCallTemplate => "RandomListHarness.Run({input}, Solution.CopyRandomList)";
    public string PythonCallTemplate => "random_list_check({input}, copy_random_list)";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] values = [7, 13, 11, 10, 1];
        int[] random = [-1, 0, 4, 2, 0];
        var steps = new List<VisualizationStep>();
        var copied = 0;
        var wired = 0;

        object[] Cells() => values.Select((v, i) =>
        {
            var target = random[i] < 0 ? "null" : $"#{random[i]}";
            var state = i < wired ? "copy wired" : i < copied ? "copy made" : "original";
            return (object)$"#{i} {v} r:{target} ({state})";
        }).ToArray();

        Dictionary<string, object> State(string label, int tracker) => new()
        {
            ["array"] = Cells(),
            ["tracker"] = tracker,
            ["trackerLabel"] = label,
        };

        steps.Add(new VisualizationStep(
            State("copies in the map", 0),
            [],
            "Five nodes. Node #1's random pointer goes back to #0, node #2's jumps ahead to #4, and #4's goes back to #0. A copy of #2 can't point at the copy of #4 until that copy exists."
        ));

        for (var i = 0; i < values.Length; i++)
        {
            copied = i + 1;
            steps.Add(new VisualizationStep(
                State("copies in the map", copied),
                [i],
                $"Pass 1: create a new node with value {values[i]} and store original #{i} -> its copy in the map. No pointers yet."
            ));
        }

        for (var i = 0; i < values.Length; i++)
        {
            wired = i + 1;
            var nextText = i + 1 < values.Length ? $"next = map[#{i + 1}]" : "next = null (last node)";
            var randomText = random[i] < 0 ? "random = null" : $"random = map[#{random[i]}]";
            int[] highlight = random[i] < 0 ? [i] : [i, random[i]];
            steps.Add(new VisualizationStep(
                State("copies wired", wired),
                highlight,
                $"Pass 2, node #{i}: {nextText}, {randomText}. The lookup always succeeds because pass 1 made every copy."
            ));
        }

        steps.Add(new VisualizationStep(
            State("copies wired", wired),
            [],
            "Done: five new nodes, wired like the originals. The map did the same job as in Clone a Graph: from an original node to its copy in O(1)."
        ));
        return steps;
    }
}
