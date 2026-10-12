namespace DsaAcademy.Content.Concepts;

public class TreeDiameter : IConcept
{
    public string Id => "tree-diameter";
    public string Track => "patterns";
    public string Title => "Trees: Diameter of a Binary Tree";
    public string OneLiner => "Post-order DFS that returns each subtree's height to its parent while updating a global best path length on the side.";
    public string KeyTakeaway =>
        "The longest path bends at exactly one highest node, and its length there is height(left) + height(right). " +
        "So run one post-order DFS where each call RETURNS its height (what the parent needs) and, as a side " +
        "effect, UPDATES a global best with left + right (what the answer needs). Returning one thing while " +
        "tracking another is the trick.";
    public VisualizerKind VisualizerKind => VisualizerKind.Tree;

    public string Explanation =>
        "The diameter of a binary tree is the number of EDGES on the longest path between any two nodes. The " +
        "path doesn't have to pass through the root. For [1, 2, 3, 4, 5] the answer is 3 (4 -> 2 -> 1 -> 3, or " +
        "5 -> 2 -> 1 -> 3). The tree comes from a level-order array where null marks a missing child.\n\n" +
        "Think about any path in a tree: it climbs up from one end to a single highest node, then goes down " +
        "to the other end. At that highest node, the path's length is (deepest reach into the left subtree) + " +
        "(deepest reach into the right subtree). Define height(node) as the number of nodes on the longest " +
        "downward path from node, with height(null) = 0. Then the best path bending at a node has exactly " +
        "height(left) + height(right) edges.\n\n" +
        "So you want two different numbers from each subtree, and that is where people get stuck. The parent " +
        "needs your HEIGHT, to compute its own height (1 + max of the two) and its own bend. The final answer " +
        "needs the best BEND seen anywhere. Return the height, and keep the best bend in a variable outside " +
        "the recursion (a field in C#, nonlocal in Python), updating it at every node. Children must be " +
        "finished before the parent can use their heights, so this is a post-order traversal, and every node " +
        "is visited once: O(n) time, O(h) stack.\n\n" +
        "The naive version calls a separate height() function from every node, which is O(n²) on a skewed " +
        "tree. The same \"return one thing, update a global with another\" shape solves Binary Tree Maximum " +
        "Path Sum (return the best single downward branch, update the best bend with left + node + right), " +
        "Longest Univalue Path, and checking whether a tree is balanced.";

    public List<string> RecognitionSignals =>
    [
        "\"Longest path between any two nodes\", where the path may not pass through the root.",
        "The answer at a node depends on BOTH children, but what the parent needs from a child is a different, simpler value (a height or a single branch).",
        "A first draft calls height() from inside another recursion -- a sign you can fold both into one post-order pass.",
    ];

    public List<string> Gotchas =>
    [
        "Edges versus nodes: the diameter here counts edges. With height(null) = 0 and height(leaf) = 1, left + right is already the edge count -- don't add 1.",
        "Returning only the diameter through the root misses paths that bend lower down, like a deep left subtree with a short right side.",
        "In C#, a static best field must be reset at the start of each call to the public method, or the answer leaks between test cases.",
    ];

    public List<string> ConfusableWith =>
    [
        "Binary Trees: Level-Order Traversal (BFS) also visits every node, but top-down by depth; diameter needs children's answers first, so it is a bottom-up (post-order) DFS.",
        "Trees: Lowest Common Ancestor (this track) is the same post-order shape where each call returns something to its parent, but there the return value is a found node, not a height.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    private static int best;\n" +
            "\n" +
            "    public static int DiameterOfBinaryTree(TreeNode? root)\n" +
            "    {\n" +
            "        best = 0;\n" +
            "        Height(root);\n" +
            "        return best;\n" +
            "    }\n" +
            "\n" +
            "    private static int Height(TreeNode? node)\n" +
            "    {\n" +
            "        // TODO: height(null) = 0. Otherwise get the left and right heights\n" +
            "        // (post-order), update best with left + right (the path that bends\n" +
            "        // here), and return 1 + the larger of the two.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def diameter_of_binary_tree(root):\n" +
            "    best = 0\n" +
            "\n" +
            "    def height(node):\n" +
            "        nonlocal best\n" +
            "        # TODO: height(None) = 0. Otherwise get the left and right heights\n" +
            "        # (post-order), update best with left + right (the path that bends\n" +
            "        # here), and return 1 + the larger of the two.\n" +
            "        return 0\n" +
            "\n" +
            "    height(root)\n" +
            "    return best\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.DiameterOfBinaryTree",
        ["python"] = "diameter_of_binary_tree",
    };

    // Level-order arrays with null gaps: the C# builder takes int?[] and the Python
    // preamble defines `null = None`, so one literal is valid in both languages.
    public string? CSharpHarnessPreamble =>
        "public class TreeNode\n" +
        "{\n" +
        "    public int Val;\n" +
        "    public TreeNode? Left;\n" +
        "    public TreeNode? Right;\n" +
        "    public TreeNode(int val) { Val = val; }\n" +
        "}\n" +
        "public static class LevelOrderTree\n" +
        "{\n" +
        "    // Builds a tree from a LeetCode-style level-order array; null marks a missing child.\n" +
        "    public static TreeNode? Build(int?[] values)\n" +
        "    {\n" +
        "        if (values.Length == 0 || values[0] is not int rootValue) return null;\n" +
        "        var root = new TreeNode(rootValue);\n" +
        "        var queue = new Queue<TreeNode>();\n" +
        "        queue.Enqueue(root);\n" +
        "        var i = 1;\n" +
        "        while (queue.Count > 0 && i < values.Length)\n" +
        "        {\n" +
        "            var node = queue.Dequeue();\n" +
        "            if (values[i] is int leftValue)\n" +
        "            {\n" +
        "                node.Left = new TreeNode(leftValue);\n" +
        "                queue.Enqueue(node.Left);\n" +
        "            }\n" +
        "            i++;\n" +
        "            if (i < values.Length && values[i] is int rightValue)\n" +
        "            {\n" +
        "                node.Right = new TreeNode(rightValue);\n" +
        "                queue.Enqueue(node.Right);\n" +
        "            }\n" +
        "            i++;\n" +
        "        }\n" +
        "        return root;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "null = None\n" +
        "\n" +
        "class TreeNode:\n" +
        "    def __init__(self, val):\n" +
        "        self.val = val\n" +
        "        self.left = None\n" +
        "        self.right = None\n" +
        "\n" +
        "def build_level_order_tree(values):\n" +
        "    # Builds a tree from a LeetCode-style level-order list; null (None) marks a missing child.\n" +
        "    if not values or values[0] is None:\n" +
        "        return None\n" +
        "    root = TreeNode(values[0])\n" +
        "    queue = [root]\n" +
        "    head = 0\n" +
        "    i = 1\n" +
        "    while head < len(queue) and i < len(values):\n" +
        "        node = queue[head]\n" +
        "        head += 1\n" +
        "        if values[i] is not None:\n" +
        "            node.left = TreeNode(values[i])\n" +
        "            queue.append(node.left)\n" +
        "        i += 1\n" +
        "        if i < len(values) and values[i] is not None:\n" +
        "            node.right = TreeNode(values[i])\n" +
        "            queue.append(node.right)\n" +
        "        i += 1\n" +
        "    return root\n";

    public List<TestCase> TestCases =>
    [
        new TestCase("[1, 2, 3, 4, 5]", "3"),
        new TestCase("[1, 2]", "1"),
        new TestCase("[1]", "0"),
        new TestCase("[]", "0"),
        new TestCase("[1, 2, null, 3, null, 4]", "3"),
        new TestCase("[1, 2, null, 3, 4, 5, null, null, 6, 7, null, null, 8]", "6"),
        new TestCase("[4, -7, -3, null, null, -9, -3, 9, -7, -4, null, 6, null, -6, -6, null, null, 0, 6, 5, null, 9, null, null, -1, -4, null, null, null, -2]", "8"),
    ];

    public string CSharpCallTemplate => "Solution.DiameterOfBinaryTree(LevelOrderTree.Build({input}))";
    public string PythonCallTemplate => "diameter_of_binary_tree(build_level_order_tree({input}))";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        // [1, 2, null, 4, 5, null, null, 6, null, null, 7], keyed by heap index (children
        // of i at 2i+1, 2i+2) because that is the layout the Tree visualizer draws. The
        // longest path, 6 -> 4 -> 2 -> 5 -> 7, bends at 2, not at the root.
        var tree = new Dictionary<int, int> { [0] = 1, [1] = 2, [3] = 4, [4] = 5, [7] = 6, [10] = 7 };
        var steps = new List<VisualizationStep>();
        var finished = new List<int>();
        var best = 0;

        Dictionary<string, object> Snapshot() => new()
        {
            ["tree"] = HeapSnapshot(tree),
            ["collected"] = finished.ToArray(),
        };

        steps.Add(new VisualizationStep(
            State: Snapshot(),
            HighlightIndices: [],
            Message: "Post-order DFS: each call returns its subtree's height to the parent and updates best = max(best, left + right). best starts at 0."
        ));

        int Height(int index)
        {
            if (!tree.TryGetValue(index, out var val)) return 0;
            var left = Height(2 * index + 1);
            var right = Height(2 * index + 2);
            var bend = left + right;
            var improved = bend > best;
            best = Math.Max(best, bend);
            finished.Add(val);
            var height = 1 + Math.Max(left, right);
            steps.Add(new VisualizationStep(
                State: Snapshot(),
                HighlightIndices: [index],
                Message: left == 0 && right == 0
                    ? $"Node {val} is a leaf: both children have height 0, so the path bending here has 0 edges. Return height 1."
                    : $"Node {val}: left height {left}, right height {right}. A path bending here has {left} + {right} = {bend} edges" +
                      (improved ? $", the new best. " : $"; best stays {best}. ") +
                      $"Return height 1 + max({left}, {right}) = {height}."
            ));
            return height;
        }

        Height(0);

        steps.Add(new VisualizationStep(
            State: Snapshot(),
            HighlightIndices: [7, 3, 1, 4, 10],
            Message: $"Done: the diameter is {best} edges (6 -> 4 -> 2 -> 5 -> 7). It bends at node 2, so only checking the root (3 edges) would have been wrong."
        ));
        return steps;
    }

    private static object HeapSnapshot(Dictionary<int, int> tree)
    {
        if (tree.Count == 0) return Array.Empty<int?>();
        var result = new int?[tree.Keys.Max() + 1];
        foreach (var kv in tree) result[kv.Key] = kv.Value;
        return result;
    }
}
