namespace DsaAcademy.Content.Concepts;

public class BinaryTreeInorderTraversal : IConcept
{
    public string Id => "binary-tree-inorder-traversal";
    public string Track => "trees";
    public string Title => "Binary Trees: Inorder Traversal (DFS)";
    public string OneLiner => "Left subtree, then this node, then right subtree -- on a BST, that order comes out sorted for free.";
    public string KeyTakeaway =>
        "Inorder traversal (left, node, right) is one of three classic depth-first orders " +
        "(preorder is node-left-right, postorder is left-right-node) -- all three are the same \"go " +
        "as deep as possible before backtracking (going back up to try the next branch)\" DFS (depth-first search) shape, just differing in WHEN you visit the " +
        "current node relative to its children. On a binary SEARCH tree specifically, inorder always " +
        "produces values in fully sorted order -- not a coincidence, it's a direct consequence of the " +
        "BST invariant (left < node <= right, with equal values going right) applied recursively at every level.";
    public VisualizerKind VisualizerKind => VisualizerKind.Tree;

    public string Explanation =>
        "Depth-first traversal means fully exploring one subtree before moving to the next, rather " +
        "than sweeping across a level at a time (that's breadth-first instead). Inorder specifically " +
        "means: recursively traverse the whole left subtree first, then visit the current node, then " +
        "recursively traverse the whole right subtree. On a plain binary tree that's just one " +
        "particular visiting order among several valid ones -- but on a BST, it's guaranteed to " +
        "produce every value in ascending sorted order, because at every single node, the entire left " +
        "subtree is smaller and the entire right subtree is bigger or equal, all the way down. Watch out for " +
        "the base case: an empty subtree (a null child) contributes nothing and returns immediately -- " +
        "forgetting that check, or visiting the current node before fully finishing the left subtree, " +
        "are the two most common ways to get the order wrong.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] InorderTraversal(TreeNode? root)\n" +
            "    {\n" +
            "        // TODO: recursively visit the left subtree, then this node's value,\n" +
            "        // then the right subtree. Collect values in that order.\n" +
            "        return new int[0];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def inorder_traversal(root):\n" +
            "    # TODO: recursively visit the left subtree, then this node's value,\n" +
            "    # then the right subtree. Collect values in that order.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.InorderTraversal",
        ["python"] = "inorder_traversal",
    };

    public List<string> RecognitionSignals =>
    [
        "You need to visit every node of a tree, and the RELATIVE order of visiting matters (not just \"touch everything\").",
        "The problem is naturally recursive: \"the answer for this tree = something combined with the answer for its left subtree and its right subtree.\"",
    ];

    public List<string> Gotchas =>
    [
        "Forgetting the null-child base case turns the recursion into a crash (NullReferenceException / AttributeError on None) instead of just contributing nothing.",
        "Visiting the node before recursing left (that's preorder, not inorder) is the single most common mix-up between the three DFS orders.",
        "On a tree that ISN'T a BST, inorder traversal still runs fine -- it just doesn't come out sorted. The sorted guarantee is a BST-specific consequence, not a property of inorder traversal itself.",
    ];

    public List<string> ConfusableWith =>
    [
        "Binary Search Trees: Insert (this track) builds the shape inorder traversal reads back out -- insertion and traversal are opposite directions through the same invariant.",
        "Binary Trees: Level-Order Traversal (BFS) visits nodes a whole depth-level at a time using a queue, rather than fully diving into one subtree first with recursion -- the tell is whether \"depth\" or \"level\" is what the problem cares about.",
    ];

    // TreeNode + a tree-BUILDING helper (not a traversal helper -- that's the whole
    // point of this lesson) are infrastructure, hidden from the student the same way
    // LinkedListTraversal's ListBuilder is. Reusing plain insertion sequences as input
    // (rather than a level-order array with gaps) sidesteps needing a null-capable
    // literal that's simultaneously valid C#/Python/JSON source -- JSON's `null` isn't
    // valid Python (`None` is spelled differently), so a tree-with-gaps LITERAL can't
    // reuse the same "one string for all three languages" trick a plain int array can.
    public string? CSharpHarnessPreamble =>
        "public class TreeNode\n" +
        "{\n" +
        "    public int Val;\n" +
        "    public TreeNode? Left;\n" +
        "    public TreeNode? Right;\n" +
        "    public TreeNode(int val) { Val = val; }\n" +
        "}\n" +
        "public static class TreeHarnessBuilder\n" +
        "{\n" +
        "    public static TreeNode? BuildBstFromArray(int[] values)\n" +
        "    {\n" +
        "        TreeNode? root = null;\n" +
        "        foreach (var v in values) root = InsertHelper(root, v);\n" +
        "        return root;\n" +
        "    }\n" +
        "    private static TreeNode InsertHelper(TreeNode? node, int val)\n" +
        "    {\n" +
        "        if (node == null) return new TreeNode(val);\n" +
        "        if (val < node.Val) node.Left = InsertHelper(node.Left, val);\n" +
        "        else node.Right = InsertHelper(node.Right, val);\n" +
        "        return node;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "class TreeNode:\n" +
        "    def __init__(self, val):\n" +
        "        self.val = val\n" +
        "        self.left = None\n" +
        "        self.right = None\n" +
        "\n" +
        "def _insert_helper(node, val):\n" +
        "    if node is None:\n" +
        "        return TreeNode(val)\n" +
        "    if val < node.val:\n" +
        "        node.left = _insert_helper(node.left, val)\n" +
        "    else:\n" +
        "        node.right = _insert_helper(node.right, val)\n" +
        "    return node\n" +
        "\n" +
        "def build_bst_from_array(values):\n" +
        "    root = None\n" +
        "    for v in values:\n" +
        "        root = _insert_helper(root, v)\n" +
        "    return root\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([5, 3, 8, 1, 4, 7, 9]), "[1,3,4,5,7,8,9]"),
        new TestCase(Lit.IntArray([1, 2, 3]), "[1,2,3]"),
        new TestCase(Lit.IntArray([42]), "[42]"),
        new TestCase(Lit.IntArray([]), "[]"),
        new TestCase(Lit.IntArray([3, 2, 1]), "[1,2,3]"),
    ];

    public string CSharpCallTemplate => "Solution.InorderTraversal(TreeHarnessBuilder.BuildBstFromArray({input}))";
    public string PythonCallTemplate => "inorder_traversal(build_bst_from_array({input}))";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] insertOrder = [5, 3, 8, 1, 4, 7, 9];
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
        var collected = new List<int>();

        Dictionary<string, object> Snapshot() => new()
        {
            ["tree"] = LevelOrderSnapshot(tree),
            ["collected"] = collected.ToArray(),
        };

        steps.Add(new VisualizationStep(
            State: Snapshot(),
            HighlightIndices: [],
            Message: "Inorder = left subtree, then this node, then right subtree. Start at the root."
        ));

        void Inorder(int index)
        {
            if (!tree.ContainsKey(index)) return;

            steps.Add(new VisualizationStep(
                State: Snapshot(),
                HighlightIndices: [index],
                Message: $"At node {tree[index]}: recurse into the left subtree first."
            ));

            Inorder(2 * index + 1);

            collected.Add(tree[index]);
            steps.Add(new VisualizationStep(
                State: Snapshot(),
                HighlightIndices: [index],
                Message: $"Left subtree of {tree[index]} is done -- visit it now: record {tree[index]}."
            ));

            Inorder(2 * index + 2);
        }

        Inorder(0);

        steps.Add(new VisualizationStep(
            State: Snapshot(),
            HighlightIndices: [],
            Message: $"Done. Inorder sequence: [{string.Join(", ", collected)}] -- sorted, because this tree is a BST."
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
