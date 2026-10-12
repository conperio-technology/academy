public class Solution
{
    public static int LowestCommonAncestor(TreeNode? root, int p, int q)
    {
        return Find(root, p, q)!.Val;
    }

    private static TreeNode? Find(TreeNode? node, int p, int q)
    {
        if (node == null || node.Val == p || node.Val == q) return node;
        var left = Find(node.Left, p, q);
        var right = Find(node.Right, p, q);
        if (left != null && right != null) return node; // p and q are on different sides: this is the split point
        return left ?? right;
    }
}
