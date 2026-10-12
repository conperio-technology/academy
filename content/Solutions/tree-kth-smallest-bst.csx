public class Solution
{
    public static int KthSmallest(TreeNode? root, int k)
    {
        var stack = new Stack<TreeNode>();
        var current = root;
        var count = 0;
        while (current != null || stack.Count > 0)
        {
            while (current != null) // everything smaller is down the left spine
            {
                stack.Push(current);
                current = current.Left;
            }
            var node = stack.Pop(); // the next value in sorted order
            if (++count == k) return node.Val;
            current = node.Right;
        }
        return -1; // k is larger than the tree
    }
}
