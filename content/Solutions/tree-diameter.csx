public class Solution
{
    private static int best;

    public static int DiameterOfBinaryTree(TreeNode? root)
    {
        best = 0;
        Height(root);
        return best;
    }

    private static int Height(TreeNode? node)
    {
        if (node == null) return 0;
        var left = Height(node.Left);
        var right = Height(node.Right);
        // The longest path that bends at this node uses left + right edges.
        best = Math.Max(best, left + right);
        return 1 + Math.Max(left, right);
    }
}
