namespace DsaAcademy.Content.Concepts;

// Shared harness code for binary tree exercises that take a LeetCode-style level-order
// array (null marks a missing child) and may hand a tree back. The C# builder takes int?[]
// and the Python preamble defines `null = None`, so one literal is valid in both languages.
// ToList turns a returned tree back into the same level-order form, trailing nulls trimmed.
public static class TreeHelpers
{
    public const string CSharpPreamble =
        "public class TreeNode\n" +
        "{\n" +
        "    public int Val;\n" +
        "    public TreeNode? Left;\n" +
        "    public TreeNode? Right;\n" +
        "    public TreeNode(int val) { Val = val; }\n" +
        "}\n" +
        "public static class LevelOrderTree\n" +
        "{\n" +
        "    // Builds a tree from a level-order array; null marks a missing child.\n" +
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
        "\n" +
        "    // The tree as a level-order list with null for missing children, trailing nulls trimmed.\n" +
        "    public static List<int?> ToList(TreeNode? root)\n" +
        "    {\n" +
        "        var result = new List<int?>();\n" +
        "        var queue = new Queue<TreeNode?>();\n" +
        "        queue.Enqueue(root);\n" +
        "        while (queue.Count > 0)\n" +
        "        {\n" +
        "            var node = queue.Dequeue();\n" +
        "            if (node is null) { result.Add(null); continue; }\n" +
        "            result.Add(node.Val);\n" +
        "            queue.Enqueue(node.Left);\n" +
        "            queue.Enqueue(node.Right);\n" +
        "        }\n" +
        "        while (result.Count > 0 && result[^1] is null) result.RemoveAt(result.Count - 1);\n" +
        "        return result;\n" +
        "    }\n" +
        "}\n";

    public const string PythonPreamble =
        "null = None\n" +
        "\n" +
        "class TreeNode:\n" +
        "    def __init__(self, val):\n" +
        "        self.val = val\n" +
        "        self.left = None\n" +
        "        self.right = None\n" +
        "\n" +
        "def build_level_order_tree(values):\n" +
        "    # Builds a tree from a level-order list; null (None) marks a missing child.\n" +
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
        "def tree_to_list(root):\n" +
        "    # The tree as a level-order list with None for missing children, trailing Nones trimmed.\n" +
        "    result = []\n" +
        "    queue = [root]\n" +
        "    head = 0\n" +
        "    while head < len(queue):\n" +
        "        node = queue[head]\n" +
        "        head += 1\n" +
        "        if node is None:\n" +
        "            result.append(None)\n" +
        "            continue\n" +
        "        result.append(node.val)\n" +
        "        queue.append(node.left)\n" +
        "        queue.append(node.right)\n" +
        "    while result and result[-1] is None:\n" +
        "        result.pop()\n" +
        "    return result\n";

    // A tree keyed by heap index (children of i at 2i+1 and 2i+2), as the Tree visualizer
    // draws it, flattened to an int?[] with null gaps.
    public static object HeapSnapshot(Dictionary<int, int> tree)
    {
        if (tree.Count == 0) return Array.Empty<int?>();
        var result = new int?[tree.Keys.Max() + 1];
        foreach (var kv in tree) result[kv.Key] = kv.Value;
        return result;
    }
}
