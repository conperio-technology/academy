public class Solution
{
    public static bool IsValidBst(TreeNode? root)
    {
        return Check(root, long.MinValue, long.MaxValue);
    }

    private static bool Check(TreeNode? node, long low, long high)
    {
        if (node == null) return true;
        // Every node must sit strictly inside the range its ancestors allow.
        if (node.Val <= low || node.Val >= high) return false;
        return Check(node.Left, low, node.Val) && Check(node.Right, node.Val, high);
    }
}
