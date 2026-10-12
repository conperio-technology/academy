public class Solution
{
    public static int[] InorderTraversal(TreeNode? root)
    {
        var result = new List<int>();
        void Walk(TreeNode? node)
        {
            if (node == null) return;
            Walk(node.Left);
            result.Add(node.Val);
            Walk(node.Right);
        }
        Walk(root);
        return result.ToArray();
    }
}
