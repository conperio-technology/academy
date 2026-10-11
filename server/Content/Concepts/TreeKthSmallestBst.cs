namespace DsaAcademy.Content.Concepts;

// Transfer exercise after Validate a Binary Search Tree: the BST rule that lesson checked is now
// something to rely on. Because left < node < right for whole subtrees, inorder is sorted order.
public class TreeKthSmallestBst : IConcept
{
    public string Id => "tree-kth-smallest-bst";
    public string Track => "patterns";
    public string Title => "Transfer: Kth Smallest Value in a BST";
    public string OneLiner => "The BST rule you validated is now a promise: walk the tree inorder, which visits values in sorted order, and stop at the kth one.";
    public string KeyTakeaway =>
        "In a BST everything in a node's left subtree is smaller and everything in its right subtree is " +
        "larger, so an inorder walk (left, node, right) visits the values in increasing order. Count nodes " +
        "as the walk visits them and stop at the kth: O(h + k) time with an explicit stack.";
    public VisualizerKind VisualizerKind => VisualizerKind.Tree;
    public string? TransferOf => "tree-validate-bst";

    public string Explanation =>
        "This follows Validate a Binary Search Tree. That lesson checked the rule \"every value in the left " +
        "subtree is smaller, every value in the right subtree is larger\". Now you are given a tree that is " +
        "known to be a valid BST, built from the same level-order array format, and a number k between 1 and " +
        "the number of nodes. Return the kth smallest value (k = 1 is the minimum). For [5, 3, 6, 2, 4, " +
        "null, null, 1] and k = 3 the answer is 3.\n\n" +
        "You could collect every value and sort them, O(n log n). The BST rule gives the order for free. " +
        "Take any node: all of its left subtree comes before it in sorted order and all of its right subtree " +
        "after it. So \"left subtree, then the node, then the right subtree\", an inorder traversal, lists " +
        "the values in increasing order. The parent lesson mentioned this as its second solution: checking " +
        "that the inorder sequence increases is the same fact read the other way.\n\n" +
        "So walk inorder and count. The iterative version is the easiest to stop early: keep a stack, and " +
        "repeatedly push the current node and go left until you hit null; then pop a node, that is the next " +
        "value in sorted order, so count it, and if the count reaches k return its value; otherwise move to " +
        "its right child and repeat. A recursive walk with a counter works too, as long as it stops once the " +
        "answer is found.\n\n" +
        "The walk first goes down the left spine (up to h nodes) and then visits k nodes, so it costs " +
        "O(h + k) time, at worst O(n), and O(h) space for the stack, where h is the height.\n\n" +
        "The visualization runs [5, 3, 6, 2, 4, null, null, 1] with k = 3; the list under the tree is the " +
        "values visited so far, in order.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences comparing this " +
        "with Validate a Binary Search Tree. Which property of a BST did that lesson check and this one rely " +
        "on, why does it make the inorder walk come out sorted, and why can the walk stop after k values?";

    public List<string> RecognitionSignals =>
    [
        "A BST and a question about sorted order: kth smallest, kth largest, the median, or the next larger value.",
        "\"Without sorting\" or \"in O(h + k)\" on a binary search tree.",
    ];

    public List<string> Gotchas =>
    [
        "k is 1-based: k = 1 is the smallest value.",
        "A recursive walk must stop once it has the answer, or it keeps visiting the rest of the tree.",
        "Inorder is left, node, right. Preorder or level order are not sorted, even in a BST.",
    ];

    public List<string> ConfusableWith =>
    [
        "Trees: Validate a Binary Search Tree checks the ordering rule; this relies on it. Both rest on the same fact, that the inorder sequence of a BST increases.",
        "Top-K with a heap finds the k smallest of unordered data in O(n log k). A BST already holds the order, so a partial inorder walk is cheaper.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    // TreeNode (provided): public int Val; public TreeNode? Left, Right;\n" +
            "    public static int KthSmallest(TreeNode? root, int k)\n" +
            "    {\n" +
            "        // TODO: inorder walk with a Stack<TreeNode>. Loop: push the current node\n" +
            "        // and go left until null. Pop a node: it is the next value in sorted\n" +
            "        // order. Count it; when the count reaches k, return its Val. Otherwise\n" +
            "        // continue from its Right child.\n" +
            "        return -1;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "# TreeNode (provided): node.val, node.left, node.right\n" +
            "def kth_smallest(root, k):\n" +
            "    # TODO: inorder walk with a stack (a list). Loop: push the current node\n" +
            "    # and go left until None. Pop a node: it is the next value in sorted\n" +
            "    # order. Count it; when the count reaches k, return its val. Otherwise\n" +
            "    # continue from its right child.\n" +
            "    return -1\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.KthSmallest",
        ["python"] = "kth_smallest",
    };

    // Same level-order tree builder as Validate a BST, plus a wrapper that passes k along.
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
        "}\n" +
        "public static class KthHarness\n" +
        "{\n" +
        "    public static int Run(int?[] values, int k)\n" +
        "    {\n" +
        "        return Solution.KthSmallest(LevelOrderTree.Build(values), k);\n" +
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
        "    return root\n" +
        "\n" +
        "def run_kth(values, k):\n" +
        "    return kth_smallest(build_level_order_tree(values), k)\n";

    private const string Sample = "[5, 3, 6, 2, 4, null, null, 1]";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args("[3, 1, 4, null, 2]", Lit.Int(1)), "1"),
        new TestCase(Lit.Args(Sample, Lit.Int(3)), "3"),
        new TestCase(Lit.Args(Sample, Lit.Int(1)), "1"),
        new TestCase(Lit.Args(Sample, Lit.Int(6)), "6"),
        new TestCase(Lit.Args("[1]", Lit.Int(1)), "1"),
        new TestCase(Lit.Args("[2, 1, 3]", Lit.Int(3)), "3"),
        new TestCase(Lit.Args("[1, null, 2, null, 3]", Lit.Int(2)), "2"),
        new TestCase(Lit.Args("[20, 10, 30, 5, 15, 25, 35, null, null, 12, 17]", Lit.Int(5)), "17"),
    ];

    public string CSharpCallTemplate => "KthHarness.Run({input})";
    public string PythonCallTemplate => "run_kth({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        // [5, 3, 6, 2, 4, null, null, 1], keyed by heap index (children of i at 2i+1, 2i+2)
        // because that is the layout the Tree visualizer draws.
        var tree = new Dictionary<int, int> { [0] = 5, [1] = 3, [2] = 6, [3] = 2, [4] = 4, [7] = 1 };
        const int k = 3;
        var steps = new List<VisualizationStep>();
        var visited = new List<int>();

        Dictionary<string, object> Snapshot() => new()
        {
            ["tree"] = HeapSnapshot(tree),
            ["collected"] = visited.ToArray(),
        };

        steps.Add(new VisualizationStep(Snapshot(), [],
            $"Find the {k}rd smallest value. Inorder (left, node, right) visits a BST in increasing order, so count values as they are visited."));

        var stack = new Stack<int>();
        int? current = 0;
        while (current is not null || stack.Count > 0)
        {
            var path = new List<int>();
            while (current is int c)
            {
                stack.Push(c);
                path.Add(tree[c]);
                current = tree.ContainsKey(2 * c + 1) ? 2 * c + 1 : null;
            }
            if (path.Count > 0)
            {
                steps.Add(new VisualizationStep(Snapshot(), [stack.Peek()],
                    $"Go left as far as possible, pushing {string.Join(", ", path)}. Nothing is smaller than {tree[stack.Peek()]} in what is left to visit."));
            }

            var node = stack.Pop();
            visited.Add(tree[node]);
            if (visited.Count == k)
            {
                steps.Add(new VisualizationStep(Snapshot(), [node],
                    $"Pop {tree[node]}: value number {visited.Count} in sorted order. That is k = {k}, so return {tree[node]} without visiting the rest of the tree."));
                return steps;
            }
            steps.Add(new VisualizationStep(Snapshot(), [node],
                $"Pop {tree[node]}: value number {visited.Count} in sorted order. Continue with its right subtree."));
            current = tree.ContainsKey(2 * node + 2) ? 2 * node + 2 : null;
        }

        return steps;
    }

    private static object HeapSnapshot(Dictionary<int, int> tree)
    {
        var result = new int?[tree.Keys.Max() + 1];
        foreach (var kv in tree) result[kv.Key] = kv.Value;
        return result;
    }
}
