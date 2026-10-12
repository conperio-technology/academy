public class Solution
{
    public static Node? CloneGraph(Node? node)
    {
        if (node == null) return null;

        // Original -> copy. Doubles as the visited set: a node is in here once it's copied.
        var copies = new Dictionary<Node, Node> { [node] = new Node(node.Val) };
        var queue = new Queue<Node>();
        queue.Enqueue(node);
        while (queue.Count > 0)
        {
            var u = queue.Dequeue();
            foreach (var v in u.Neighbors)
            {
                if (!copies.ContainsKey(v))
                {
                    copies[v] = new Node(v.Val);
                    queue.Enqueue(v);
                }
                copies[u].Neighbors.Add(copies[v]);
            }
        }
        return copies[node];
    }
}
