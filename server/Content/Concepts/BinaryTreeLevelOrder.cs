namespace DsaAcademy.Content.Concepts;

public class BinaryTreeLevelOrder : IConcept
{
    public string Id => "binary-tree-level-order";
    public string Track => "trees";
    public string Title => "Binary Trees: Level-Order Traversal (BFS)";
    public string OneLiner => "Visit every node one whole depth-level at a time, using a queue instead of recursion.";
    public string KeyTakeaway =>
        "Breadth-first search explores level by level using a QUEUE (FIFO): push the root, then " +
        "repeatedly pop a node, visit it, and push its children -- because a queue preserves order, " +
        "every node at depth d (d steps below the root) gets pushed (and therefore visited) before any node at depth d+1. That " +
        "queue-driven shape is the actual difference from DFS, not just \"a different order to write " +
        "down\" -- DFS's recursion IS an implicit stack (dive all the way down one path before " +
        "backtracking), while BFS explicitly needs a queue to fan out level by level instead.";
    public VisualizerKind VisualizerKind => VisualizerKind.Tree;

    public string Explanation =>
        "Start with a queue containing just the root. Then loop: pop the front of the queue, record " +
        "its value, and push its (non-null) children onto the BACK of the queue. Because a queue is " +
        "FIFO, nodes come out in the exact order they were discovered -- which is level by level, " +
        "left to right within each level, since every node at one depth gets queued before any node " +
        "one level deeper. This is the queue lesson (Queues: Simulate Enqueue/Dequeue) applied " +
        "directly: BFS IS \"enqueue children, dequeue and process,\" repeated until the queue empties. " +
        "Watch out for the classic mix-up with DFS: reaching for recursion here would naturally " +
        "produce a depth-first order (preorder, most likely) instead, since recursive calls use the " +
        "call stack, not a queue -- BFS specifically needs an explicit queue data structure, it's not " +
        "just \"traversal, but organized differently.\"";

    public List<string> RecognitionSignals =>
    [
        "The problem cares about DEPTH or LEVEL specifically -- \"shortest path,\" \"minimum number of steps,\" \"nodes at distance k.\"",
        "You need to process things in the order they were discovered, level by level, rather than diving deep into one branch first.",
    ];

    public List<string> Gotchas =>
    [
        "Using a stack (or recursion, which implicitly uses the call stack) instead of a queue silently produces a depth-first order, not breadth-first -- same-looking code, wrong traversal shape.",
        "Forgetting to check for null children before pushing them onto the queue crashes (or corrupts the traversal) the same way forgetting a base case does in DFS.",
        "If you need to know WHICH level a node belongs to (not just the flat visit order), you have to explicitly track how many nodes were in the queue at the start of each level -- the queue itself doesn't remember level boundaries for you.",
    ];

    public List<string> ConfusableWith =>
    [
        "Binary Trees: Inorder Traversal (DFS) (this track) visits every node too, but dives fully into the left subtree before ever looking at a sibling -- the tell is whether the problem cares about DEPTH-first order (DFS) or LEVEL-first order (BFS).",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] LevelOrderTraversal(TreeNode? root)\n" +
            "    {\n" +
            "        // TODO: queue = [root] (if not null). While the queue isn't empty:\n" +
            "        // dequeue a node, record its value, enqueue its non-null children.\n" +
            "        return new int[0];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def level_order_traversal(root):\n" +
            "    # TODO: queue = [root] (if not None). While the queue isn't empty:\n" +
            "    # dequeue a node, record its value, enqueue its non-None children.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.LevelOrderTraversal",
        ["python"] = "level_order_traversal",
    };

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
        new TestCase(Lit.IntArray([5, 3, 8, 1, 4, 7, 9]), "[5,3,8,1,4,7,9]"),
        new TestCase(Lit.IntArray([1, 2, 3]), "[1,2,3]"),
        new TestCase(Lit.IntArray([42]), "[42]"),
        new TestCase(Lit.IntArray([]), "[]"),
        new TestCase(Lit.IntArray([3, 2, 1]), "[3,2,1]"),
    ];

    public string CSharpCallTemplate => "Solution.LevelOrderTraversal(TreeHarnessBuilder.BuildBstFromArray({input}))";
    public string PythonCallTemplate => "level_order_traversal(build_bst_from_array({input}))";

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
        var queue = new Queue<int>();
        queue.Enqueue(0);

        Dictionary<string, object> Snapshot() => new()
        {
            ["tree"] = LevelOrderSnapshot(tree),
            ["collected"] = collected.ToArray(),
        };

        steps.Add(new VisualizationStep(
            State: Snapshot(),
            HighlightIndices: [0],
            Message: "Queue = [root]. Dequeue a node, record it, enqueue its children -- repeat until the queue is empty."
        ));

        while (queue.Count > 0)
        {
            var index = queue.Dequeue();
            collected.Add(tree[index]);

            var leftIndex = 2 * index + 1;
            var rightIndex = 2 * index + 2;
            var childNames = new List<string>();
            if (tree.ContainsKey(leftIndex)) { queue.Enqueue(leftIndex); childNames.Add(tree[leftIndex].ToString()); }
            if (tree.ContainsKey(rightIndex)) { queue.Enqueue(rightIndex); childNames.Add(tree[rightIndex].ToString()); }

            steps.Add(new VisualizationStep(
                State: Snapshot(),
                HighlightIndices: [index],
                Message: childNames.Count > 0
                    ? $"Dequeue {tree[index]}, record it. Enqueue its children: [{string.Join(", ", childNames)}]."
                    : $"Dequeue {tree[index]}, record it. No children to enqueue."
            ));
        }

        steps.Add(new VisualizationStep(
            State: Snapshot(),
            HighlightIndices: [],
            Message: $"Queue is empty -- done. Level order: [{string.Join(", ", collected)}]."
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
