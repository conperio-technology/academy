public class Solution
{
    public static int[] Dijkstra(int[][][] adjacencyList, int source)
    {
        var dist = Enumerable.Repeat(int.MaxValue, adjacencyList.Length).ToArray();
        dist[source] = 0;
        var queue = new PriorityQueue<int, int>(); // node, prioritized by distance
        queue.Enqueue(source, 0);
        while (queue.TryDequeue(out var node, out var d))
        {
            if (d != dist[node]) continue; // stale entry -- a shorter path already won
            foreach (var edge in adjacencyList[node])
            {
                int neighbor = edge[0], weight = edge[1];
                if (d + weight < dist[neighbor])
                {
                    dist[neighbor] = d + weight;
                    queue.Enqueue(neighbor, dist[neighbor]);
                }
            }
        }
        return dist.Select(x => x == int.MaxValue ? -1 : x).ToArray();
    }
}
