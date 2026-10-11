namespace DsaAcademy.Content.Concepts;

public class TreeValidateBst : IConcept
{
    public string Id => "tree-validate-bst";
    public string Track => "patterns";
    public string Title => "Trees: Validate a Binary Search Tree";
    public string OneLiner => "Pass an allowed (low, high) range down the tree; every node must fall strictly inside the range its ancestors set.";
    public string KeyTakeaway =>
        "A BST rule is about whole subtrees, not just parent and child: everything in the left subtree must be " +
        "smaller than the node, everything in the right subtree larger. Carry that as bounds: going left, the " +
        "node's value becomes the new HIGH; going right, it becomes the new LOW. One DFS, O(n).";
    public VisualizerKind VisualizerKind => VisualizerKind.Tree;

    public string Explanation =>
        "You get the root of a binary tree, built from a level-order array where null marks a missing child " +
        "(so [5, 4, 6, null, null, 3, 7] means 5 has children 4 and 6, 4 has none, and 6 has children 3 and 7). " +
        "Return true if it is a valid binary search tree: for every node, all values in its left subtree are " +
        "strictly smaller and all values in its right subtree are strictly larger. Duplicates make it invalid.\n\n" +
        "The tempting answer checks each node against its two children: left.val < node.val < right.val. That " +
        "is not enough. In [5, 4, 6, null, null, 3, 7] every parent-child pair looks fine (3 < 6 < 7), yet 3 " +
        "sits in the right subtree of 5, so the tree is broken. A local check can't see a rule that an " +
        "ancestor two levels up imposes.\n\n" +
        "The fix is to pass that information down. Each call gets the range (low, high) its value must sit " +
        "in. The root may be anything: (-∞, +∞). When you step into a left child, the current node's value " +
        "becomes the upper bound; into a right child, it becomes the lower bound; the other bound is inherited " +
        "unchanged. So 6 is checked against (5, +∞), and its left child 3 against (5, 6) -- and fails. A null " +
        "child is trivially valid. Every node is visited once: O(n) time, O(h) stack space.\n\n" +
        "Two equally good alternatives come up in interviews. An inorder traversal of a BST visits values in " +
        "strictly increasing order, so you can walk inorder and check that each value beats the previous one. " +
        "And follow-ups often ask about the sentinel: if values can be as small as the minimum int, using " +
        "int.MinValue as \"no lower bound\" wrongly rejects a node equal to it. Use a wider type (long), or a " +
        "null meaning \"no bound\".";

    public List<string> RecognitionSignals =>
    [
        "\"Is this a valid BST?\" or any rule that must hold for a node against ALL of its ancestors, not just its parent.",
        "Information flows top-down: what a node is allowed to be depends on the path from the root to it.",
        "The problem mentions sorted order in a tree, which is a hint that an inorder walk or range bounds will help.",
    ];

    public List<string> Gotchas =>
    [
        "Comparing a node only with its direct children passes trees like [5, 4, 6, null, null, 3, 7], where 3 is below 6 but still inside 5's right subtree.",
        "Using int.MinValue / int.MaxValue as \"no bound\" breaks when a node actually holds that value. Use long bounds or null.",
        "Use strict comparisons: a value equal to a bound (a duplicate) makes the tree invalid here.",
    ];

    public List<string> ConfusableWith =>
    [
        "Binary Trees: Inorder Traversal (DFS) visits nodes in sorted order for a BST; checking that the inorder sequence strictly increases is a valid second solution to this same problem.",
        "Binary Search Trees: Search walks ONE root-to-leaf path because it trusts the BST rule; validating has to visit every node because it is checking that rule.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static bool IsValidBst(TreeNode? root)\n" +
            "    {\n" +
            "        return Check(root, long.MinValue, long.MaxValue);\n" +
            "    }\n" +
            "\n" +
            "    private static bool Check(TreeNode? node, long low, long high)\n" +
            "    {\n" +
            "        // TODO: a null node is valid. If node.Val is not strictly between\n" +
            "        // low and high, return false. Otherwise check the left child with\n" +
            "        // (low, node.Val) and the right child with (node.Val, high).\n" +
            "        return false;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def is_valid_bst(root):\n" +
            "    def check(node, low, high):\n" +
            "        # TODO: a None node is valid. low/high are None when there is no bound.\n" +
            "        # If node.val is not strictly between low and high, return False.\n" +
            "        # Otherwise check node.left with (low, node.val) and node.right\n" +
            "        # with (node.val, high).\n" +
            "        return False\n" +
            "\n" +
            "    return check(root, None, None)\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.IsValidBst",
        ["python"] = "is_valid_bst",
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
        new TestCase("[2, 1, 3]", "true"),
        new TestCase("[5, 1, 4, null, null, 3, 6]", "false"),
        new TestCase("[5, 4, 6, null, null, 3, 7]", "false"),
        new TestCase("[10, 5, 15, 3, 12]", "false"),
        new TestCase("[]", "true"),
        new TestCase("[2, 2, 2]", "false"),
        new TestCase("[-2147483648, null, 2147483647]", "true"),
    ];

    public string CSharpCallTemplate => "Solution.IsValidBst(LevelOrderTree.Build({input}))";
    public string PythonCallTemplate => "is_valid_bst(build_level_order_tree({input}))";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        // [5, 4, 6, null, null, 3, 7], keyed by heap index (children of i at 2i+1, 2i+2)
        // because that is the layout the Tree visualizer draws.
        var tree = new Dictionary<int, int> { [0] = 5, [1] = 4, [2] = 6, [5] = 3, [6] = 7 };
        var steps = new List<VisualizationStep>();
        var checkedValues = new List<int>();

        Dictionary<string, object> Snapshot() => new()
        {
            ["tree"] = HeapSnapshot(tree),
            ["collected"] = checkedValues.ToArray(),
        };

        static string Bound(long? b, bool low) => b is long v ? v.ToString() : (low ? "-∞" : "+∞");

        steps.Add(new VisualizationStep(
            State: Snapshot(),
            HighlightIndices: [],
            Message: "Every parent-child pair here looks fine (4 < 5 < 6 and 3 < 6 < 7). Check it properly: carry an allowed (low, high) range down from the root."
        ));

        bool Check(int index, long? low, long? high)
        {
            if (!tree.TryGetValue(index, out var val)) return true;
            var range = $"({Bound(low, true)}, {Bound(high, false)})";
            if ((low is long lo && val <= lo) || (high is long hi && val >= hi))
            {
                steps.Add(new VisualizationStep(
                    State: Snapshot(),
                    HighlightIndices: [index],
                    Message: low is long l && val <= l
                        ? $"Node {val} must be inside {range}, but {val} <= {l}. It sits in the right subtree of {l}, so it must be larger. Invalid: return false all the way up."
                        : $"Node {val} must be inside {range}, but {val} >= {high}. It sits in the left subtree of {high}, so it must be smaller. Invalid: return false all the way up."
                ));
                return false;
            }
            checkedValues.Add(val);
            steps.Add(new VisualizationStep(
                State: Snapshot(),
                HighlightIndices: [index],
                Message: index == 0
                    ? $"Root {val} has no limits: range {range}. OK. Its left subtree must stay below {val}, its right subtree above {val}."
                    : $"Node {val} must be inside {range}. It is. Going left, {val} becomes the new high; going right, it becomes the new low."
            ));
            return Check(2 * index + 1, low, val) && Check(2 * index + 2, val, high);
        }

        var valid = Check(0, null, null);

        steps.Add(new VisualizationStep(
            State: Snapshot(),
            HighlightIndices: [],
            Message: valid
                ? "Every node was inside its range: the tree is a valid BST."
                : "Result: false. Comparing 3 only with its parent 6 would have missed this -- the bound 5 came from two levels up."
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
