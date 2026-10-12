public class Solution
{
    public static int[] BfsTraversal(int[][] adjacencyList, int start)
    {
        var order = new List<int>();
        var visited = new bool[adjacencyList.Length];
        var queue = new Queue<int>();
        queue.Enqueue(start);
        visited[start] = true;
        while (queue.Count > 0)
        {
            var node = queue.Dequeue();
            order.Add(node);
            foreach (var next in adjacencyList[node])
            {
                if (visited[next]) continue;
                visited[next] = true; // mark on enqueue, not on dequeue
                queue.Enqueue(next);
            }
        }
        return order.ToArray();
    }
}
