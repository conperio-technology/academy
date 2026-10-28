public class Solution
{
    public static List<int> RightSideView(TreeNode? root)
    {
        var result = new List<int>();
        if (root is null) return result;
        var queue = new Queue<TreeNode>();
        queue.Enqueue(root);
        while (queue.Count > 0)
        {
            var count = queue.Count; // exactly the nodes on this level
            TreeNode node = null!;
            for (var i = 0; i < count; i++)
            {
                node = queue.Dequeue();
                if (node.Left is not null) queue.Enqueue(node.Left);
                if (node.Right is not null) queue.Enqueue(node.Right);
            }
            result.Add(node.Val); // the last node of the level
        }
        return result;
    }
}
