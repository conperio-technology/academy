public class Solution
{
    public static int[] LevelOrderTraversal(TreeNode? root)
    {
        var result = new List<int>();
        if (root == null) return result.ToArray();
        var queue = new Queue<TreeNode>();
        queue.Enqueue(root);
        while (queue.Count > 0)
        {
            var node = queue.Dequeue();
            result.Add(node.Val);
            if (node.Left != null) queue.Enqueue(node.Left);
            if (node.Right != null) queue.Enqueue(node.Right);
        }
        return result.ToArray();
    }
}
