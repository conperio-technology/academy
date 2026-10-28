public class Solution
{
    private static int best;

    public static int MaxPathSum(TreeNode? root)
    {
        best = int.MinValue; // not 0: an all-negative tree's answer is negative
        Gain(root);
        return best;
    }

    private static int Gain(TreeNode? node)
    {
        if (node is null) return 0;
        var left = Math.Max(0, Gain(node.Left)); // a negative branch is better left out
        var right = Math.Max(0, Gain(node.Right));
        best = Math.Max(best, node.Val + left + right); // the path that bends here
        return node.Val + Math.Max(left, right); // the parent can extend only one side
    }
}
