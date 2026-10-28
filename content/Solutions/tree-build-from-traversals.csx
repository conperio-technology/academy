public class Solution
{
    public static TreeNode? BuildTree(int[] preorder, int[] inorder)
    {
        var indexOf = new Dictionary<int, int>(); // value -> position in inorder, O(1) splits
        for (var i = 0; i < inorder.Length; i++) indexOf[inorder[i]] = i;
        var next = 0;

        TreeNode? Build(int lo, int hi)
        {
            if (lo > hi) return null;
            var node = new TreeNode(preorder[next++]);
            var m = indexOf[node.Val];
            node.Left = Build(lo, m - 1); // left first: preorder lists the left subtree next
            node.Right = Build(m + 1, hi);
            return node;
        }

        return Build(0, inorder.Length - 1);
    }
}
