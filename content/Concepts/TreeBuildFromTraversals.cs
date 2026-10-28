namespace DsaAcademy.Content.Concepts;

public class TreeBuildFromTraversals : IConcept
{
    public string Id => "tree-build-from-traversals";
    public string Track => "patterns";
    public string Title => "Trees: Build From Preorder and Inorder";
    public string OneLiner => "Rebuild a binary tree from its preorder and inorder traversals: preorder names each root, inorder splits the rest into left and right subtrees.";
    public string KeyTakeaway =>
        "The first value in preorder is the root. Its position in inorder splits inorder into the left " +
        "subtree (everything before it) and the right subtree (everything after). Recurse left first, then " +
        "right, consuming preorder from the front as you go. A value-to-index map makes each lookup O(1), so " +
        "the whole build is O(n).";
    public VisualizerKind VisualizerKind => VisualizerKind.Tree;

    public string Explanation =>
        "preorder and inorder are two traversals of the same binary tree with distinct values. Build the tree " +
        "and return its root. The grader prints your tree in level order with null for missing children, so " +
        "for preorder [3, 9, 20, 15, 7] and inorder [9, 3, 15, 20, 7] the answer is [3, 9, 20, null, null, " +
        "15, 7].\n\n" +
        "Recall the orders from Binary Tree Inorder Traversal: preorder visits node, left, right; inorder " +
        "visits left, node, right. So preorder[0] is the root, 3. In inorder, everything left of 3 ([9]) is " +
        "the left subtree and everything right of it ([15, 20, 7]) is the right subtree. The same holds " +
        "inside each subtree, which is the recursion.\n\n" +
        "Write build(lo, hi), meaning \"build the subtree whose values are inorder[lo..hi]\". If lo > hi, " +
        "return null. Otherwise take the next unused value from preorder (keep a running index), make it the " +
        "node, find its position m in inorder, then build the left child from (lo, m - 1) and the right child " +
        "from (m + 1, hi). Left must be built before right, because that is the order preorder lists them.\n\n" +
        "Searching inorder for each root is O(n) per node and O(n²) overall on a skewed tree. Put every " +
        "value's inorder index in a hash map first and each lookup becomes O(1): O(n) time, O(n) space for " +
        "the map plus O(h) recursion. This needs distinct values; with duplicates the split point is " +
        "ambiguous and the tree is not unique.\n\n" +
        "Preorder alone cannot rebuild a tree: [1, 2] could be 2 as the left or the right child. Inorder pins " +
        "down the left/right split. Postorder plus inorder works the same way, taking roots from the back of " +
        "postorder and building right before left.\n\n" +
        "The visualization rebuilds [3, 9, 20, 15, 7] / [9, 3, 15, 20, 7] one node at a time.";

    public List<string> RecognitionSignals => [
        "Two traversals of a tree are given and you must reconstruct it.",
        "A sequence where the first (or last) element is a root that splits the rest into two ranges, recursively.",
    ];

    public List<string> Gotchas => [
        "Building the right subtree before the left consumes preorder values in the wrong order.",
        "Searching inorder linearly for every root is O(n²); precompute a value-to-index map.",
        "Slicing new arrays at every call also costs O(n²) in copying; pass index bounds instead.",
    ];

    public List<string> ConfusableWith => [
        "Serialize and Deserialize a Binary Tree rebuilds from ONE traversal because it records the null children explicitly; here no nulls are given, so you need two orders.",
        "Convert Sorted Array to a BST picks the middle element as each root; here preorder dictates the roots.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static TreeNode? BuildTree(int[] preorder, int[] inorder)\n" +
            "    {\n" +
            "        var indexOf = new Dictionary<int, int>();\n" +
            "        for (var i = 0; i < inorder.Length; i++) indexOf[inorder[i]] = i;\n" +
            "        var next = 0; // next unused position in preorder\n" +
            "\n" +
            "        TreeNode? Build(int lo, int hi)\n" +
            "        {\n" +
            "            // TODO: if lo > hi return null. Otherwise take preorder[next++] as the\n" +
            "            // node's value, find its inorder index m with indexOf, then set\n" +
            "            // node.Left = Build(lo, m - 1) BEFORE node.Right = Build(m + 1, hi).\n" +
            "            return null;\n" +
            "        }\n" +
            "\n" +
            "        return Build(0, inorder.Length - 1);\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def build_tree(preorder, inorder):\n" +
            "    index_of = {v: i for i, v in enumerate(inorder)}\n" +
            "    next_pre = 0  # next unused position in preorder\n" +
            "\n" +
            "    def build(lo, hi):\n" +
            "        nonlocal next_pre\n" +
            "        # TODO: if lo > hi return None. Otherwise take preorder[next_pre] as the\n" +
            "        # node's value (then next_pre += 1), find its inorder index m, then set\n" +
            "        # node.left = build(lo, m - 1) BEFORE node.right = build(m + 1, hi).\n" +
            "        return None\n" +
            "\n" +
            "    return build(0, len(inorder) - 1)\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.BuildTree",
        ["python"] = "build_tree",
    };

    public string? CSharpHarnessPreamble => TreeHelpers.CSharpPreamble;

    public string? PythonHarnessPreamble => TreeHelpers.PythonPreamble;

    public List<TestCase> TestCases =>
    [
        new TestCase("[3, 9, 20, 15, 7], [9, 3, 15, 20, 7]", "[3,9,20,null,null,15,7]"),
        new TestCase("[-1], [-1]", "[-1]"),
        new TestCase("[], []", "[]"),
        new TestCase("[1, 2], [2, 1]", "[1,2]"),
        new TestCase("[1, 2], [1, 2]", "[1,null,2]"),
        new TestCase("[1, 2, 4, 5, 3, 6, 7], [4, 2, 5, 1, 6, 3, 7]", "[1,2,3,4,5,6,7]"),
        new TestCase("[5, 4, 3, 2, 1], [1, 2, 3, 4, 5]", "[5,4,null,3,null,2,null,1]"),
        new TestCase("[1, 2, 3, 4], [2, 1, 4, 3]", "[1,2,3,null,null,4]"),
    ];

    public string CSharpCallTemplate => "LevelOrderTree.ToList(Solution.BuildTree({input}))";
    public string PythonCallTemplate => "tree_to_list(build_tree({input}))";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] preorder = [3, 9, 20, 15, 7];
        int[] inorder = [9, 3, 15, 20, 7];
        var tree = new Dictionary<int, int>();
        var steps = new List<VisualizationStep>
        {
            new(new() { ["tree"] = TreeHelpers.HeapSnapshot(tree) }, [], "preorder [3, 9, 20, 15, 7], inorder [9, 3, 15, 20, 7]. Each preorder value is the next root; inorder says what falls to its left and right."),
        };
        var next = 0;

        void Build(int lo, int hi, int slot)
        {
            if (lo > hi) return;
            var value = preorder[next++];
            var m = Array.IndexOf(inorder, value);
            tree[slot] = value;
            var left = m > lo ? $"[{string.Join(", ", inorder[lo..m])}]" : "nothing";
            var right = m < hi ? $"[{string.Join(", ", inorder[(m + 1)..(hi + 1)])}]" : "nothing";
            steps.Add(new(new() { ["tree"] = TreeHelpers.HeapSnapshot(tree) }, [slot],
                $"Next in preorder is {value}: make it the root of inorder[{lo}..{hi}]. It sits at inorder index {m}, so its left subtree is {left} and its right subtree is {right}."));
            Build(lo, m - 1, 2 * slot + 1);
            Build(m + 1, hi, 2 * slot + 2);
        }

        Build(0, inorder.Length - 1, 0);
        steps.Add(new(new() { ["tree"] = TreeHelpers.HeapSnapshot(tree) }, [], "Every preorder value was used once, in order. Level order: [3, 9, 20, null, null, 15, 7]."));
        return steps;
    }
}
