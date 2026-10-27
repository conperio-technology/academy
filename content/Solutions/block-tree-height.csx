public class Solution
{
    public static int Height(TreeNode? root)
    {
        if (root == null) return 0;
        return 1 + Math.Max(Height(root.Left), Height(root.Right));
    }
}
