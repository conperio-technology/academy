namespace DsaAcademy.Content.Concepts;

public class BstDelete : IConcept
{
    public string Id => "bst-delete";
    public string Track => "trees";
    public string Title => "Binary Search Trees: Delete";
    public string OneLiner => "Three cases, one for each possible number of children the node being removed has.";
    public string KeyTakeaway =>
        "Deleting a leaf or a one-child node is easy (remove it, or splice its child into its spot). " +
        "Deleting a node with TWO children is the hard case, solved by not actually deleting it: copy " +
        "in its inorder successor's value (the smallest value in its right subtree), then delete THAT " +
        "successor instead -- which is guaranteed to have at most one child, reducing back to an easy " +
        "case.";
    public VisualizerKind VisualizerKind => VisualizerKind.Tree;

    public string Explanation =>
        "Find the node first, using the same left/right walk as Search. Once found, there are exactly " +
        "three shapes it can be in: NO children (a leaf) -- just remove it, nothing to reconnect. ONE " +
        "child -- splice that child directly into the removed node's spot (the parent now points at " +
        "the grandchild). TWO children -- this is the case that needs a trick, because there's no " +
        "single child to promote without breaking the BST property. The fix: find the inorder " +
        "SUCCESSOR (the smallest value in the right subtree -- keep walking left from root.Right until " +
        "there's no more left), copy that successor's VALUE into the node being \"deleted\" (the node " +
        "itself never actually moves), then recursively delete the successor from the right subtree. " +
        "The successor is guaranteed to have no left child (that's what made it the smallest), so " +
        "deleting it is always one of the two easy cases -- the hard case reduces itself to an easy " +
        "one instead of needing its own separate logic. Watch out for forgetting to RECONNECT the " +
        "result of each recursive call back to the parent's Left/Right pointer -- deletion has to " +
        "rebuild the path back up, not just find and detach the target node.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    // Given: same helpers from earlier lessons.\n" +
            "    public static TreeNode? BuildBst(int[] values)\n" +
            "    {\n" +
            "        TreeNode? root = null;\n" +
            "        foreach (var v in values) root = Insert(root, v);\n" +
            "        return root;\n" +
            "    }\n" +
            "    private static TreeNode Insert(TreeNode? node, int val)\n" +
            "    {\n" +
            "        if (node == null) return new TreeNode(val);\n" +
            "        if (val < node.Val) node.Left = Insert(node.Left, val);\n" +
            "        else node.Right = Insert(node.Right, val);\n" +
            "        return node;\n" +
            "    }\n" +
            "    public static int[] InorderTraversal(TreeNode? root)\n" +
            "    {\n" +
            "        var result = new List<int>();\n" +
            "        void Walk(TreeNode? n)\n" +
            "        {\n" +
            "            if (n == null) return;\n" +
            "            Walk(n.Left);\n" +
            "            result.Add(n.Val);\n" +
            "            Walk(n.Right);\n" +
            "        }\n" +
            "        Walk(root);\n" +
            "        return result.ToArray();\n" +
            "    }\n" +
            "\n" +
            "    public static int[] DeleteAndVerify(int[] values, int key)\n" +
            "    {\n" +
            "        var root = BuildBst(values);\n" +
            "        root = DeleteNode(root, key);\n" +
            "        return InorderTraversal(root);\n" +
            "    }\n" +
            "\n" +
            "    public static TreeNode? DeleteNode(TreeNode? root, int key)\n" +
            "    {\n" +
            "        // TODO: find `key` (like Search). Once found:\n" +
            "        // - no children: return null\n" +
            "        // - one child: return that child\n" +
            "        // - two children: find the inorder successor (leftmost node of the right\n" +
            "        //   subtree), copy its value onto this node, then delete the successor from\n" +
            "        //   the right subtree instead.\n" +
            "        // Don't forget to reconnect: root.Left = DeleteNode(root.Left, key), etc.\n" +
            "        return root;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "# Given: same helpers from earlier lessons.\n" +
            "def build_bst(values):\n" +
            "    root = None\n" +
            "    for v in values:\n" +
            "        root = insert(root, v)\n" +
            "    return root\n" +
            "\n" +
            "def insert(node, val):\n" +
            "    if node is None:\n" +
            "        return TreeNode(val)\n" +
            "    if val < node.val:\n" +
            "        node.left = insert(node.left, val)\n" +
            "    else:\n" +
            "        node.right = insert(node.right, val)\n" +
            "    return node\n" +
            "\n" +
            "def inorder_traversal(root):\n" +
            "    result = []\n" +
            "    def walk(n):\n" +
            "        if n is None:\n" +
            "            return\n" +
            "        walk(n.left)\n" +
            "        result.append(n.val)\n" +
            "        walk(n.right)\n" +
            "    walk(root)\n" +
            "    return result\n" +
            "\n" +
            "def delete_and_verify(values, key):\n" +
            "    root = build_bst(values)\n" +
            "    root = delete_node(root, key)\n" +
            "    return inorder_traversal(root)\n" +
            "\n" +
            "def delete_node(root, key):\n" +
            "    # TODO: find `key` (like Search). Once found:\n" +
            "    # - no children: return None\n" +
            "    # - one child: return that child\n" +
            "    # - two children: find the inorder successor (leftmost node of the right\n" +
            "    #   subtree), copy its value onto this node, then delete the successor from\n" +
            "    #   the right subtree instead.\n" +
            "    # Don't forget to reconnect: root.left = delete_node(root.left, key), etc.\n" +
            "    return root\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.DeleteAndVerify",
        ["python"] = "delete_and_verify",
    };

    // Deliberately returning the INORDER TRAVERSAL of the post-delete tree, not its raw
    // structure -- "delete a value from a BST" has more than one equally-correct result
    // shape (successor-copy vs. predecessor-copy for the two-children case produce
    // different but equally valid trees), the same non-determinism problem
    // BacktrackingSubsets hit with subset ordering. Comparing the sorted inorder
    // sequence instead sidesteps it entirely: any correct implementation, regardless of
    // which strategy it picks, produces the same remaining sorted values.
    public string? CSharpHarnessPreamble =>
        "public class TreeNode\n" +
        "{\n" +
        "    public int Val;\n" +
        "    public TreeNode? Left;\n" +
        "    public TreeNode? Right;\n" +
        "    public TreeNode(int val) { Val = val; }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "class TreeNode:\n" +
        "    def __init__(self, val):\n" +
        "        self.val = val\n" +
        "        self.left = None\n" +
        "        self.right = None\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([5, 3, 8, 1, 4, 7, 9]), Lit.Int(1)), "[3,4,5,7,8,9]"),
        new TestCase(Lit.Args(Lit.IntArray([5, 3, 8, 1, 4, 7, 9]), Lit.Int(3)), "[1,4,5,7,8,9]"),
        new TestCase(Lit.Args(Lit.IntArray([5, 3, 8, 1, 4, 7, 9]), Lit.Int(5)), "[1,3,4,7,8,9]"),
        new TestCase(Lit.Args(Lit.IntArray([5, 3, 8, 1, 4, 7, 9]), Lit.Int(8)), "[1,3,4,5,7,9]"),
        new TestCase(Lit.Args(Lit.IntArray([5, 3, 8, 1, 4, 7, 9]), Lit.Int(100)), "[1,3,4,5,7,8,9]"),
        new TestCase(Lit.Args(Lit.IntArray([5, 3, 4]), Lit.Int(3)), "[4,5]"),
    ];

    public string CSharpCallTemplate => "Solution.DeleteAndVerify({input})";
    public string PythonCallTemplate => "delete_and_verify({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] insertOrder = [5, 3, 8, 1, 4, 7, 9];
        const int key = 3; // two-children case, the interesting one
        var tree = new Dictionary<int, int>();

        void Insert(int v)
        {
            if (tree.Count == 0) { tree[0] = v; return; }
            var index = 0;
            while (true)
            {
                var goLeft = v < tree[index];
                var childIndex = goLeft ? 2 * index + 1 : 2 * index + 2;
                if (!tree.ContainsKey(childIndex)) { tree[childIndex] = v; return; }
                index = childIndex;
            }
        }
        foreach (var v in insertOrder) Insert(v);

        var steps = new List<VisualizationStep>();
        object Snapshot() => LevelOrderSnapshot(tree);

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["tree"] = Snapshot() },
            HighlightIndices: [1],
            Message: $"Deleting {key}. Found it at this node -- it has TWO children, the hard case."
        ));

        // Node 3 is at index 1 (children indices 3=1, 4=4).
        const int targetIndex = 1;
        const int rightChildIndex = 4; // value 4, the only node in 3's right subtree

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["tree"] = Snapshot() },
            HighlightIndices: [rightChildIndex],
            Message: $"Find the inorder successor: walk into the right subtree ({tree[rightChildIndex]}), then keep going left. It has no left child, so {tree[rightChildIndex]} IS the successor."
        ));

        var successorVal = tree[rightChildIndex];
        tree[targetIndex] = successorVal;
        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["tree"] = Snapshot() },
            HighlightIndices: [targetIndex],
            Message: $"Copy the successor's value ({successorVal}) onto the node being deleted -- {key} is gone from this spot, replaced by {successorVal}."
        ));

        tree.Remove(rightChildIndex);
        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["tree"] = Snapshot() },
            HighlightIndices: [],
            Message: $"Now delete the successor's original node ({successorVal}) from the right subtree -- it was a leaf, so this is the easy \"no children\" case. Done."
        ));

        return steps;
    }

    private static object LevelOrderSnapshot(Dictionary<int, int> tree)
    {
        if (tree.Count == 0) return Array.Empty<int?>();
        var maxIndex = tree.Keys.Max();
        var result = new int?[maxIndex + 1];
        foreach (var kv in tree) result[kv.Key] = kv.Value;
        return result;
    }
}
