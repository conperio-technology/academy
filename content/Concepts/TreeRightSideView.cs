namespace DsaAcademy.Content.Concepts;

public class TreeRightSideView : IConcept
{
    public string Id => "tree-right-side-view";
    public string Track => "patterns";
    public string Title => "Trees: Right Side View";
    public string OneLiner => "List the nodes you would see looking at a tree from the right: the last node of each level in a level-order (BFS) traversal.";
    public string KeyTakeaway =>
        "The right side view is the last node of every level. Run level-order BFS, processing one level at a " +
        "time (take the queue's size before the loop), and record the last node you dequeue in each level. " +
        "O(n) time, O(n) queue space. A DFS that visits right before left and records the first node at each " +
        "new depth gives the same answer.";
    public VisualizerKind VisualizerKind => VisualizerKind.Tree;

    public string Explanation =>
        "Imagine standing to the right of a binary tree. Return the values you can see, top to bottom. For " +
        "[1, 2, 3, null, 5, null, 4] that is [1, 3, 4]. Careful: it is not just the rightmost branch. In [1, " +
        "2, 3, 4] the bottom level has only 4, on the left, and it is still visible: the answer is [1, 3, 4].\n\n" +
        "\"One answer per level\" means level-order traversal, which you met in Binary Tree Level-Order " +
        "Traversal. Put the root in a queue. While the queue is not empty, read its current size, which is " +
        "exactly the number of nodes on this level, and dequeue that many nodes, enqueueing their children. " +
        "The last node you dequeue in that batch is the rightmost node of the level, so add its value to the " +
        "answer.\n\n" +
        "The DFS alternative is just as short: recurse with a depth, visiting the right child before the " +
        "left, and whenever depth equals the answer's length you are the first node seen at a new depth, " +
        "which from the right is the visible one. It uses O(h) stack instead of a queue as wide as a level.\n\n" +
        "Both visit every node once: O(n). The BFS queue holds at most one level, up to about n/2 nodes for a " +
        "full tree, so O(n) space. The same \"take the size, process one level\" loop answers level averages, " +
        "the largest value in each row, zigzag order and minimum depth.\n\n" +
        "The visualization runs BFS on [1, 2, 3, null, 5, null, 4] and highlights each level's last node.";

    public List<string> RecognitionSignals => [
        "One value per depth: the rightmost, leftmost, largest, average of each level.",
        "\"View from the side\" or \"visible from the right\".",
    ];

    public List<string> Gotchas => [
        "Following only right children misses levels whose last node sits in the left subtree.",
        "Without snapshotting the queue size at the start of each level, levels blur together.",
        "Return [] for an empty tree instead of enqueueing null.",
    ];

    public List<string> ConfusableWith => [
        "Binary Tree Level-Order Traversal returns every node grouped by level; this keeps one per level.",
        "Invert a Binary Tree also touches every node, but changes the tree instead of reading it level by level.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static List<int> RightSideView(TreeNode? root)\n" +
            "    {\n" +
            "        var result = new List<int>();\n" +
            "        // TODO: if root is null return result. BFS with a Queue<TreeNode>:\n" +
            "        // while it is not empty, take count = queue.Count, dequeue that many nodes\n" +
            "        // (enqueue their non-null children), and add the LAST one's Val to result.\n" +
            "        return result;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "from collections import deque\n" +
            "\n" +
            "\n" +
            "def right_side_view(root):\n" +
            "    result = []\n" +
            "    # TODO: if root is None return result. BFS with a deque:\n" +
            "    # while it is not empty, take count = len(queue), pop that many nodes\n" +
            "    # (append their children), and add the LAST one's val to result.\n" +
            "    return result\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.RightSideView",
        ["python"] = "right_side_view",
    };

    public string? CSharpHarnessPreamble => TreeHelpers.CSharpPreamble;

    public string? PythonHarnessPreamble => TreeHelpers.PythonPreamble;

    public List<TestCase> TestCases =>
    [
        new TestCase("[1, 2, 3, null, 5, null, 4]", "[1,3,4]"),
        new TestCase("[1, null, 3]", "[1,3]"),
        new TestCase("[]", "[]"),
        new TestCase("[1, 2, 3, 4]", "[1,3,4]"),
        new TestCase("[1, 2]", "[1,2]"),
        new TestCase("[1, 2, 3, 4, 5, 6, 7, null, null, 8]", "[1,3,7,8]"),
    ];

    public string CSharpCallTemplate => "Solution.RightSideView(LevelOrderTree.Build({input}))";
    public string PythonCallTemplate => "right_side_view(build_level_order_tree({input}))";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        // [1, 2, 3, null, 5, null, 4] keyed by heap index.
        var tree = new Dictionary<int, int> { [0] = 1, [1] = 2, [2] = 3, [4] = 5, [6] = 4 };
        var steps = new List<VisualizationStep>();
        var seen = new List<int>();
        steps.Add(new(new() { ["tree"] = TreeHelpers.HeapSnapshot(tree), ["collected"] = seen.ToArray() }, [], "BFS one level at a time. The last node taken from each level is the one visible from the right."));
        var level = new List<int> { 0 };
        var depth = 0;
        while (level.Count > 0)
        {
            var last = level[^1];
            seen.Add(tree[last]);
            steps.Add(new(new() { ["tree"] = TreeHelpers.HeapSnapshot(tree), ["collected"] = seen.ToArray() }, level.ToArray(),
                $"Level {depth} has {level.Count} node{(level.Count == 1 ? "" : "s")}: {string.Join(", ", level.Select(i => tree[i]))}. The last one, {tree[last]}, is visible."));
            level = level.SelectMany(i => new[] { 2 * i + 1, 2 * i + 2 }).Where(tree.ContainsKey).ToList();
            depth++;
        }
        steps.Add(new(new() { ["tree"] = TreeHelpers.HeapSnapshot(tree), ["collected"] = seen.ToArray() }, [], $"Right side view: [{string.Join(", ", seen)}]."));
        return steps;
    }
}
