public class Solution
{
    public static int[] DfsTraversal(int[][] adjacencyList, int start)
    {
        var order = new List<int>();
        var visited = new bool[adjacencyList.Length];
        void Visit(int node)
        {
            visited[node] = true;
            order.Add(node);
            foreach (var next in adjacencyList[node])
                if (!visited[next]) Visit(next);
        }
        Visit(start);
        return order.ToArray();
    }
}
