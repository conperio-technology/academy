public class Solution
{
    // Given: same helpers from earlier lessons.
    public static TreeNode? BuildBst(int[] values)
    {
        TreeNode? root = null;
        foreach (var v in values) root = Insert(root, v);
        return root;
    }
    private static TreeNode Insert(TreeNode? node, int val)
    {
        if (node == null) return new TreeNode(val);
        if (val < node.Val) node.Left = Insert(node.Left, val);
        else node.Right = Insert(node.Right, val);
        return node;
    }
    public static int[] InorderTraversal(TreeNode? root)
    {
        var result = new List<int>();
        void Walk(TreeNode? n)
        {
            if (n == null) return;
            Walk(n.Left);
            result.Add(n.Val);
            Walk(n.Right);
        }
        Walk(root);
        return result.ToArray();
    }

    public static int[] DeleteAndVerify(int[] values, int key)
    {
        var root = BuildBst(values);
        root = DeleteNode(root, key);
        return InorderTraversal(root);
    }

    public static TreeNode? DeleteNode(TreeNode? root, int key)
    {
        if (root == null) return null; // key isn't in the tree
        if (key < root.Val)
        {
            root.Left = DeleteNode(root.Left, key);
            return root;
        }
        if (key > root.Val)
        {
            root.Right = DeleteNode(root.Right, key);
            return root;
        }

        // Found it.
        if (root.Left == null) return root.Right;  // no children, or only a right child
        if (root.Right == null) return root.Left;  // only a left child

        // Two children: borrow the inorder successor's value, then delete the successor.
        var successor = root.Right;
        while (successor.Left != null) successor = successor.Left;
        root.Val = successor.Val;
        root.Right = DeleteNode(root.Right, successor.Val);
        return root;
    }
}
