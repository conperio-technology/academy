public class Solution
{
    public static int[] ShortestPaths(int n, int[][] edges, int src)
    {
        var adj = new List<(int To, int Weight)>[n];
        for (var i = 0; i < n; i++) adj[i] = new List<(int, int)>();
        foreach (var e in edges) adj[e[0]].Add((e[1], e[2]));

        var dist = new int[n];
        Array.Fill(dist, int.MaxValue);
        dist[src] = 0;
        var heap = new PriorityQueue<int, int>();
        heap.Enqueue(src, 0);
        while (heap.TryDequeue(out var node, out var d))
        {
            if (d > dist[node]) continue;
            foreach (var (to, weight) in adj[node])
            {
                if (d + weight < dist[to])
                {
                    dist[to] = d + weight;
                    heap.Enqueue(to, dist[to]);
                }
            }
        }
        for (var i = 0; i < n; i++)
            if (dist[i] == int.MaxValue) dist[i] = -1;
        return dist;
    }
}
