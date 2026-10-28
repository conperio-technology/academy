namespace DsaAcademy.Content.Concepts;

public class TreeInvert : IConcept
{
    public string Id => "tree-invert";
    public string Track => "patterns";
    public string Title => "Trees: Invert a Binary Tree";
    public string OneLiner => "Mirror a binary tree by swapping every node's left and right children. The smallest useful example of \"do something at each node, then recurse\".";
    public string KeyTakeaway =>
        "Inverting a tree is one rule applied everywhere: swap this node's two children, then invert both " +
        "subtrees (or invert them first and swap after; either order works). Every node is visited once, " +
        "O(n), and the recursion is as deep as the tree, O(h). A queue gives the same result iteratively.";
    public VisualizerKind VisualizerKind => VisualizerKind.Tree;

    public string Explanation =>
        "Invert a binary tree, meaning mirror it left to right, and return its root. [4, 2, 7, 1, 3, 6, 9] " +
        "becomes [4, 7, 2, 9, 6, 3, 1]: the whole left side moves to the right and every level reads " +
        "backwards.\n\n" +
        "Think about what the mirror of a tree is. The root stays put. Its new left subtree is the mirror of " +
        "its old right subtree, and its new right subtree is the mirror of its old left subtree. That " +
        "definition is already the code: if the node is null, return null; otherwise invert both children and " +
        "assign them swapped, root.Left = Invert(old right) and root.Right = Invert(old left).\n\n" +
        "Watch the classic slip: writing root.Left = Invert(root.Right) and then root.Right = " +
        "Invert(root.Left) reads root.Left after you already overwrote it. Save one side in a variable first, " +
        "or use a tuple swap that evaluates both sides before assigning.\n\n" +
        "Every node is visited once, so O(n) time. The recursion goes as deep as the tree is tall: O(log n) " +
        "for a balanced tree, O(n) for a chain. To avoid deep recursion, put the root in a queue (or stack), " +
        "and for each node you take out, swap its children and add the non-null ones. Any visiting order " +
        "works because each node's swap is independent of the others.\n\n" +
        "The visualization inverts [4, 2, 7, 1, 3, 6, 9] top down, one swap per step.";

    public List<string> RecognitionSignals => [
        "\"Mirror\", \"flip\" or \"invert\" a tree, or check whether two trees are mirrors (Symmetric Tree).",
        "A change that applies the same way at every node independently: any traversal order will do.",
    ];

    public List<string> Gotchas => [
        "Overwriting root.Left before reading it for the right side loses a subtree.",
        "Forgetting the null base case crashes on leaves' children.",
        "Swapping values instead of child pointers only works for complete trees and is not what is asked.",
    ];

    public List<string> ConfusableWith => [
        "Symmetric Tree compares a tree with its own mirror without building it, walking two pointers in opposite directions.",
        "Diameter of a Binary Tree also recurses on both children, but combines their results; here there is nothing to combine.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static TreeNode? InvertTree(TreeNode? root)\n" +
            "    {\n" +
            "        // TODO: if root is null return null. Otherwise invert both subtrees and\n" +
            "        // assign them swapped: the inverted old right becomes root.Left and\n" +
            "        // the inverted old left becomes root.Right. Return root.\n" +
            "        return root;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def invert_tree(root):\n" +
            "    # TODO: if root is None return None. Otherwise invert both subtrees and\n" +
            "    # assign them swapped: the inverted old right becomes root.left and\n" +
            "    # the inverted old left becomes root.right. Return root.\n" +
            "    return root\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.InvertTree",
        ["python"] = "invert_tree",
    };

    public string? CSharpHarnessPreamble => TreeHelpers.CSharpPreamble;

    public string? PythonHarnessPreamble => TreeHelpers.PythonPreamble;

    public List<TestCase> TestCases =>
    [
        new TestCase("[4, 2, 7, 1, 3, 6, 9]", "[4,7,2,9,6,3,1]"),
        new TestCase("[2, 1, 3]", "[2,3,1]"),
        new TestCase("[]", "[]"),
        new TestCase("[1, 2]", "[1,null,2]"),
        new TestCase("[1, null, 2, 3]", "[1,2,null,null,3]"),
        new TestCase("[1, 2, 3, 4, null, null, 5]", "[1,3,2,5,null,null,4]"),
    ];

    public string CSharpCallTemplate => "LevelOrderTree.ToList(Solution.InvertTree(LevelOrderTree.Build({input})))";
    public string PythonCallTemplate => "tree_to_list(invert_tree(build_level_order_tree({input})))";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int?[] values = [4, 2, 7, 1, 3, 6, 9];
        var tree = new Dictionary<int, int>();
        for (var i = 0; i < values.Length; i++) if (values[i] is int v) tree[i] = v;
        var steps = new List<VisualizationStep>
        {
            new(new() { ["tree"] = TreeHelpers.HeapSnapshot(tree) }, [], "Invert [4, 2, 7, 1, 3, 6, 9]: at every node, swap the left and right subtrees."),
        };

        // Swapping the subtrees under heap slot i means exchanging every slot below 2i + 1 with
        // the matching slot below 2i + 2.
        void SwapSubtrees(int a, int b)
        {
            var hasA = tree.TryGetValue(a, out var va);
            var hasB = tree.TryGetValue(b, out var vb);
            if (!hasA && !hasB) return;
            tree.Remove(a);
            tree.Remove(b);
            if (hasA) tree[b] = va;
            if (hasB) tree[a] = vb;
            if (2 * a + 1 >= 15 && 2 * b + 1 >= 15) return;
            var aLeft = 2 * a + 1;
            var bLeft = 2 * b + 1;
            SwapSubtrees(aLeft, bLeft);
            SwapSubtrees(aLeft + 1, bLeft + 1);
        }

        var queue = new Queue<int>();
        queue.Enqueue(0);
        while (queue.Count > 0)
        {
            var slot = queue.Dequeue();
            if (!tree.ContainsKey(slot)) continue;
            int left = 2 * slot + 1, right = left + 1;
            if (!tree.ContainsKey(left) && !tree.ContainsKey(right)) continue;
            SwapSubtrees(left, right);
            steps.Add(new(new() { ["tree"] = TreeHelpers.HeapSnapshot(tree) }, [slot],
                $"At {tree[slot]}: swap its left and right subtrees."));
            queue.Enqueue(left);
            queue.Enqueue(right);
        }
        steps.Add(new(new() { ["tree"] = TreeHelpers.HeapSnapshot(tree) }, [], "Mirrored: [4, 7, 2, 9, 6, 3, 1]. Each node was swapped once."));
        return steps;
    }
}
