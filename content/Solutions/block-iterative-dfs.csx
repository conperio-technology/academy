public class Solution
{
    public static List<int> DfsOrder(int[][] adj, int start)
    {
        var visited = new HashSet<int>();
        var order = new List<int>();
        var stack = new Stack<int>();
        stack.Push(start);
        while (stack.Count > 0)
        {
            var node = stack.Pop();
            if (!visited.Add(node)) continue;
            order.Add(node);
            for (var i = adj[node].Length - 1; i >= 0; i--)
            {
                if (!visited.Contains(adj[node][i]))
                    stack.Push(adj[node][i]);
            }
        }
        return order;
    }
}
