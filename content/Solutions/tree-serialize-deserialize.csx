public class Codec
{
    public static string Serialize(TreeNode? root)
    {
        var tokens = new List<string>();
        void Walk(TreeNode? node)
        {
            if (node is null)
            {
                tokens.Add("#"); // record the empty child so the shape is unambiguous
                return;
            }
            tokens.Add(node.Val.ToString());
            Walk(node.Left);
            Walk(node.Right);
        }
        Walk(root);
        return string.Join(",", tokens);
    }

    public static TreeNode? Deserialize(string data)
    {
        var tokens = data.Split(',');
        var next = 0;
        TreeNode? Read()
        {
            var token = tokens[next++];
            if (token == "#") return null;
            var node = new TreeNode(int.Parse(token));
            node.Left = Read();
            node.Right = Read();
            return node;
        }
        return Read();
    }
}
