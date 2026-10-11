public class Solution
{
    public static int NetworkDelayTime(int[][] times, int n, int k)
    {
        var adj = new List<(int To, int W)>[n];
        for (var i = 0; i < n; i++) adj[i] = new List<(int, int)>();
        foreach (var t in times) adj[t[0]].Add((t[1], t[2])); // one way only

        var dist = Enumerable.Repeat(int.MaxValue, n).ToArray();
        dist[k] = 0;
        var queue = new PriorityQueue<int, int>(); // node, prioritized by distance
        queue.Enqueue(k, 0);
        while (queue.TryDequeue(out var node, out var d))
        {
            if (d != dist[node]) continue; // stale entry
            foreach (var (to, w) in adj[node])
            {
                if (d + w < dist[to])
                {
                    dist[to] = d + w;
                    queue.Enqueue(to, dist[to]);
                }
            }
        }

        var latest = dist.Max(); // everyone has the signal once the slowest arrival happens
        return latest == int.MaxValue ? -1 : latest;
    }
}
