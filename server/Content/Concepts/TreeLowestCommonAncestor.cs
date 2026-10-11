namespace DsaAcademy.Content.Concepts;

public class TreeLowestCommonAncestor : IConcept
{
    public string Id => "tree-lowest-common-ancestor";
    public string Track => "patterns";
    public string Title => "Trees: Lowest Common Ancestor";
    public string OneLiner => "Each call reports back whether it found p or q below it; the first node that hears \"found\" from both sides is the answer.";
    public string KeyTakeaway =>
        "Recurse into both children. A call returns the node itself if it IS p or q, otherwise whatever non-null " +
        "result came back from its children. If BOTH children return something, p and q are on different sides " +
        "and this node is the lowest common ancestor. One post-order pass, O(n), no parent pointers needed.";
    public VisualizerKind VisualizerKind => VisualizerKind.Tree;

    public string Explanation =>
        "Given a binary tree (a general one, not a BST, so values tell you nothing about direction) and two " +
        "values p and q that are both in the tree, return the value of their lowest common ancestor: the " +
        "deepest node that has both p and q in its subtree. A node counts as its own ancestor, so if p sits " +
        "below q, the answer is q. Values are distinct, and the tree comes from a level-order array where null " +
        "marks a missing child.\n\n" +
        "Let each recursive call answer one question about its subtree: \"did you find p or q down there, and " +
        "if so, which node should I report?\" The rules are short. A null node reports nothing. A node that " +
        "IS p or q reports itself immediately, without looking further down. Otherwise ask both children. If " +
        "both report something, p is on one side and q on the other, so this node is where their paths split: " +
        "report this node. If only one side reports something, pass that up unchanged. At the root, whatever " +
        "comes back is the answer.\n\n" +
        "Why is it fine to stop at p without searching under it? If q is below p, then p is the answer, and " +
        "nothing above will ever see a second report from another side, so p's report travels all the way up. " +
        "If q is elsewhere, some ancestor will receive p from one side and q from the other. Either way the " +
        "right node surfaces. Each node is visited at most once: O(n) time, O(h) stack.\n\n" +
        "Common follow-ups: in a BST you don't need this at all -- walk down from the root, going left while " +
        "both values are smaller and right while both are larger; the first node between them is the LCA, in " +
        "O(h). If nodes have parent pointers, it becomes \"intersection of two linked lists\": walk both up. " +
        "And if p or q might be missing, this version can return the wrong node; you then need to count how " +
        "many of the two were actually found.";

    public List<string> RecognitionSignals =>
    [
        "\"Lowest common ancestor\", \"first shared manager of two employees\", or \"where do these two paths in a hierarchy meet?\"",
        "You need information from BOTH subtrees before you can decide at a node -- a bottom-up (post-order) DFS that returns something to the parent.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int LowestCommonAncestor(TreeNode? root, int p, int q)\n" +
            "    {\n" +
            "        // p and q are both guaranteed to be in the tree.\n" +
            "        var lca = Find(root, p, q);\n" +
            "        return lca == null ? -1 : lca.Val;\n" +
            "    }\n" +
            "\n" +
            "    private static TreeNode? Find(TreeNode? node, int p, int q)\n" +
            "    {\n" +
            "        // TODO: if node is null, or node.Val is p or q, return node.\n" +
            "        // Otherwise recurse left and right. If both sides return a node,\n" +
            "        // this node is the split point: return it. Otherwise return\n" +
            "        // whichever side is not null.\n" +
            "        return null;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def lowest_common_ancestor(root, p, q):\n" +
            "    # p and q are both guaranteed to be in the tree.\n" +
            "    def find(node):\n" +
            "        # TODO: if node is None, or node.val is p or q, return node.\n" +
            "        # Otherwise recurse left and right. If both sides return a node,\n" +
            "        # this node is the split point: return it. Otherwise return\n" +
            "        # whichever side is not None.\n" +
            "        return None\n" +
            "\n" +
            "    lca = find(root)\n" +
            "    return -1 if lca is None else lca.val\n",
    };

    public List<string> Gotchas =>
    [
        "Using the BST shortcut (compare values to decide left or right) on a general binary tree: values don't tell you which side anything is on here.",
        "Forgetting that a node can be its own ancestor: when q is in p's subtree the answer is p, which the early \"node is p or q, return it\" check handles for free.",
        "This version assumes both p and q exist. If one might be missing, it would wrongly return the one it found, so count the matches before trusting the result.",
    ];

    public List<string> ConfusableWith =>
    [
        "Binary Search Trees: Search uses the BST ordering to pick a direction; the BST version of LCA does the same, but a general binary tree has no ordering, so you must search both sides.",
        "Trees: Diameter of a Binary Tree (this track) has the same post-order \"children report to the parent\" shape, but returns a height instead of a found node.",
    ];

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.LowestCommonAncestor",
        ["python"] = "lowest_common_ancestor",
    };

    // Level-order arrays with null gaps: the C# builder takes int?[] and the Python
    // preamble defines `null = None`, so one literal is valid in both languages. The
    // input is "tree, p, q", so a small harness function builds the tree and forwards p
    // and q to the learner's function.
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
        "public static class LcaHarness\n" +
        "{\n" +
        "    public static int Run(int?[] values, int p, int q)\n" +
        "    {\n" +
        "        return Solution.LowestCommonAncestor(LevelOrderTree.Build(values), p, q);\n" +
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
        "def run_lca(values, p, q):\n" +
        "    return lowest_common_ancestor(build_level_order_tree(values), p, q)\n";

    private const string Sample = "[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Sample, Lit.Int(5), Lit.Int(1)), "3"),
        new TestCase(Lit.Args(Sample, Lit.Int(5), Lit.Int(4)), "5"),
        new TestCase(Lit.Args(Sample, Lit.Int(6), Lit.Int(4)), "5"),
        new TestCase(Lit.Args(Sample, Lit.Int(7), Lit.Int(8)), "3"),
        new TestCase(Lit.Args(Sample, Lit.Int(0), Lit.Int(8)), "1"),
        new TestCase(Lit.Args("[1, 2]", Lit.Int(2), Lit.Int(1)), "1"),
        new TestCase(Lit.Args("[1, 2, 3, null, 4, null, 5, null, null, 6]", Lit.Int(6), Lit.Int(5)), "5"),
    ];

    public string CSharpCallTemplate => "LcaHarness.Run({input})";
    public string PythonCallTemplate => "run_lca({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        // [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], keyed by heap index (children of i at
        // 2i+1, 2i+2) because that is the layout the Tree visualizer draws.
        var tree = new Dictionary<int, int>
        {
            [0] = 3, [1] = 5, [2] = 1, [3] = 6, [4] = 2, [5] = 0, [6] = 8, [9] = 7, [10] = 4,
        };
        const int p = 6, q = 4;
        var steps = new List<VisualizationStep>();
        var finished = new List<int>();

        Dictionary<string, object> Snapshot() => new()
        {
            ["tree"] = HeapSnapshot(tree),
            ["collected"] = finished.ToArray(),
        };

        steps.Add(new VisualizationStep(
            State: Snapshot(),
            HighlightIndices: [],
            Message: $"Find the LCA of p = {p} and q = {q}. Each call reports p or q if it finds one below it, or nothing (null)."
        ));

        int? Find(int index)
        {
            if (!tree.TryGetValue(index, out var val)) return null;
            if (val == p || val == q)
            {
                finished.Add(val);
                steps.Add(new VisualizationStep(
                    State: Snapshot(),
                    HighlightIndices: [index],
                    Message: $"Node {val} is {(val == p ? "p" : "q")}. Report it upward right away -- no need to look below it."
                ));
                return index;
            }
            var left = Find(2 * index + 1);
            var right = Find(2 * index + 2);
            finished.Add(val);
            int? result;
            string message;
            if (left is int l && right is int r)
            {
                result = index;
                message = $"Node {val} hears {tree[l]} from the left and {tree[r]} from the right. p and q split here, so {val} is the LCA: report {val}.";
            }
            else if (left is int only1)
            {
                result = only1;
                message = $"Node {val}: only the left side found something ({tree[only1]}). Pass {tree[only1]} up unchanged.";
            }
            else if (right is int only2)
            {
                result = only2;
                message = $"Node {val}: only the right side found something ({tree[only2]}). Pass {tree[only2]} up unchanged.";
            }
            else
            {
                result = null;
                message = $"Node {val}: neither side found p or q. Report null.";
            }
            steps.Add(new VisualizationStep(
                State: Snapshot(),
                HighlightIndices: result is int h ? new[] { index, h } : new[] { index },
                Message: message
            ));
            return result;
        }

        var answer = Find(0);

        steps.Add(new VisualizationStep(
            State: Snapshot(),
            HighlightIndices: answer is int a ? new[] { a } : Array.Empty<int>(),
            Message: $"The root returns {(answer is int b ? tree[b].ToString() : "null")}: that is the lowest common ancestor of {p} and {q}."
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
