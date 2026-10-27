public class Solution
{
    public static int[] BfsDistances(int[][] adj, int start)
    {
        var dist = new int[adj.Length];
        Array.Fill(dist, -1);
        dist[start] = 0;
        var queue = new Queue<int>();
        queue.Enqueue(start);
        while (queue.Count > 0)
        {
            var node = queue.Dequeue();
            foreach (var next in adj[node])
            {
                if (dist[next] != -1) continue;
                dist[next] = dist[node] + 1;
                queue.Enqueue(next);
            }
        }
        return dist;
    }
}
