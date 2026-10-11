public class Solution
{
    public static TreeNode? BuildBst(int[] values)
    {
        TreeNode? root = null;
        foreach (var v in values) root = Insert(root, v);
        return root;
    }

    private static TreeNode Insert(TreeNode? node, int val)
    {
        if (node == null) return new TreeNode(val);
        if (val < node.Val) node.Left = Insert(node.Left, val);
        else node.Right = Insert(node.Right, val);
        return node;
    }
}
