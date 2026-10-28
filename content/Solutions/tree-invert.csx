public class Solution
{
    public static TreeNode? InvertTree(TreeNode? root)
    {
        if (root is null) return null;
        // The tuple evaluates both sides before assigning, so neither child is lost.
        (root.Left, root.Right) = (InvertTree(root.Right), InvertTree(root.Left));
        return root;
    }
}
