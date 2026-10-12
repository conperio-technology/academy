namespace DsaAcademy.Content.Concepts;

public class BstInsert : IConcept
{
    public string Id => "bst-insert";
    public string Track => "trees";
    public string Title => "Binary Search Trees: Insert";
    public string OneLiner => "Walk down comparing at each node -- smaller goes left, bigger or equal goes right -- until you find the empty spot this value belongs in.";
    public string KeyTakeaway =>
        "A tree is made of nodes: the top one is the root, each node in a binary tree has up to two children (left and right), a node with no children is a leaf, and a node plus everything below it is a subtree. A binary search tree keeps one invariant (a rule that is always true) at every single node: everything in its LEFT " +
        "subtree is smaller, everything in its RIGHT subtree is bigger or equal (these lessons send " +
        "duplicates right). Insertion just walks that " +
        "invariant downward -- compare, go left or right, repeat -- until it falls off the tree into " +
        "an empty spot, which is exactly where the new value belongs.";
    public VisualizerKind VisualizerKind => VisualizerKind.Tree;

    public string Explanation =>
        "Starting from the root, compare the value being inserted to the current node: smaller means " +
        "\"it belongs somewhere in the left subtree,\" so move to the left child and repeat the " +
        "comparison there; bigger (or equal, by convention here) means move right instead. Eventually " +
        "this walk reaches a node with no child on the side it needs to go -- that empty spot is " +
        "exactly where the new value belongs, becoming a new leaf. Insert several values one at a time " +
        "this way and the whole tree builds itself, always keeping the BST property (left < node <= " +
        "right, with equal values going right, at every node, not just the root) intact. Watch out for what the ORDER of insertion " +
        "does to the tree's shape: inserting already-sorted values one at a time (1, 2, 3, 4...) " +
        "produces a tree that's really just a linked list leaning one direction -- every operation degrades " +
        "to O(n) instead of the O(log n) a balanced tree (one whose left and right sides are about equally deep) gives you. (Keeping a BST balanced " +
        "under insertion is a real algorithm in its own right -- AVL and red-black trees -- out of " +
        "scope here, but worth knowing the plain version doesn't self-balance.)";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static TreeNode? BuildBst(int[] values)\n" +
            "    {\n" +
            "        // TODO: start with an empty tree (root = null). For each value, walk from\n" +
            "        // the root -- smaller goes left, bigger or equal goes right -- until you reach an\n" +
            "        // empty spot, then place a new node there.\n" +
            "        return null;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def build_bst(values):\n" +
            "    # TODO: start with an empty tree (root = None). For each value, walk from\n" +
            "    # the root -- smaller goes left, bigger or equal goes right -- until you reach an\n" +
            "    # empty spot, then place a new node there.\n" +
            "    return None\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.BuildBst",
        ["python"] = "build_bst",
    };

    // The user only ever sees/writes Solution -- TreeNode and the tree->array
    // serializer are infrastructure, injected ahead of their code. ToLevelOrderArray
    // exists for the same reason DoublyLinkedListReverse's ToArray does: returning the
    // node graph directly and letting the executor serialize IT would work here (a
    // plain binary tree has no back-pointers, so no circular-reference risk) -- but a
    // level-order array with explicit gaps is a far more readable expected/actual value
    // in the test results panel than a nested node dump would be.
    public string? CSharpHarnessPreamble =>
        "public class TreeNode\n" +
        "{\n" +
        "    public int Val;\n" +
        "    public TreeNode? Left;\n" +
        "    public TreeNode? Right;\n" +
        "    public TreeNode(int val) { Val = val; }\n" +
        "}\n" +
        "public static class TreeSerializer\n" +
        "{\n" +
        "    public static int?[] ToLevelOrderArray(TreeNode? root)\n" +
        "    {\n" +
        "        if (root == null) return Array.Empty<int?>();\n" +
        "        var slots = new Dictionary<int, int>();\n" +
        "        var queue = new Queue<(TreeNode node, int index)>();\n" +
        "        queue.Enqueue((root, 0));\n" +
        "        var maxIndex = 0;\n" +
        "        while (queue.Count > 0)\n" +
        "        {\n" +
        "            var (node, index) = queue.Dequeue();\n" +
        "            slots[index] = node.Val;\n" +
        "            if (index > maxIndex) maxIndex = index;\n" +
        "            if (node.Left != null) queue.Enqueue((node.Left, 2 * index + 1));\n" +
        "            if (node.Right != null) queue.Enqueue((node.Right, 2 * index + 2));\n" +
        "        }\n" +
        "        var result = new int?[maxIndex + 1];\n" +
        "        foreach (var kv in slots) result[kv.Key] = kv.Value;\n" +
        "        return result;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "class TreeNode:\n" +
        "    def __init__(self, val):\n" +
        "        self.val = val\n" +
        "        self.left = None\n" +
        "        self.right = None\n" +
        "\n" +
        "def to_level_order_array(root):\n" +
        "    if root is None:\n" +
        "        return []\n" +
        "    slots = {}\n" +
        "    queue = [(root, 0)]\n" +
        "    max_index = 0\n" +
        "    while queue:\n" +
        "        node, index = queue.pop(0)\n" +
        "        slots[index] = node.val\n" +
        "        max_index = max(max_index, index)\n" +
        "        if node.left is not None:\n" +
        "            queue.append((node.left, 2 * index + 1))\n" +
        "        if node.right is not None:\n" +
        "            queue.append((node.right, 2 * index + 2))\n" +
        "    result = [None] * (max_index + 1)\n" +
        "    for k, v in slots.items():\n" +
        "        result[k] = v\n" +
        "    return result\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([5, 3, 8, 1, 4, 7, 9]), "[5,3,8,1,4,7,9]"),
        new TestCase(Lit.IntArray([1, 2, 3]), "[1,null,2,null,null,null,3]"),
        new TestCase(Lit.IntArray([42]), "[42]"),
        new TestCase(Lit.IntArray([]), "[]"),
        new TestCase(Lit.IntArray([3, 2, 1]), "[3,2,null,1]"),
    ];

    public string CSharpCallTemplate => "TreeSerializer.ToLevelOrderArray(Solution.BuildBst({input}))";
    public string PythonCallTemplate => "to_level_order_array(build_bst({input}))";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] values = [5, 3, 8, 1, 4];
        var tree = new Dictionary<int, int>();
        var steps = new List<VisualizationStep>();

        object Snapshot() => LevelOrderSnapshot(tree);

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["tree"] = Snapshot() },
            HighlightIndices: [],
            Message: $"Inserting [{string.Join(", ", values)}] one at a time into an empty BST."
        ));

        foreach (var v in values)
        {
            if (tree.Count == 0)
            {
                tree[0] = v;
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["tree"] = Snapshot() },
                    HighlightIndices: [0],
                    Message: $"Insert {v}: tree is empty -- {v} becomes the root."
                ));
                continue;
            }

            var index = 0;
            while (true)
            {
                var current = tree[index];
                var goLeft = v < current;
                var childIndex = goLeft ? 2 * index + 1 : 2 * index + 2;

                if (!tree.ContainsKey(childIndex))
                {
                    tree[childIndex] = v;
                    steps.Add(new VisualizationStep(
                        State: new Dictionary<string, object> { ["tree"] = Snapshot() },
                        HighlightIndices: [childIndex],
                        Message: $"Insert {v}: {v} {(goLeft ? "<" : ">=")} {current}, go {(goLeft ? "left" : "right")} -- empty spot, place {v} here."
                    ));
                    break;
                }

                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["tree"] = Snapshot() },
                    HighlightIndices: [index],
                    Message: $"Insert {v}: {v} {(goLeft ? "<" : ">=")} {current}, go {(goLeft ? "left" : "right")}."
                ));
                index = childIndex;
            }
        }

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
