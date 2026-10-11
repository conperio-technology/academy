public class Solution
{
    public static bool IsBipartite(int[][] graph)
    {
        var colour = new int[graph.Length]; // 0 = uncoloured, 1 = group A, -1 = group B

        // Every component needs its own start; the clash may not be reachable from node 0.
        for (var start = 0; start < graph.Length; start++)
        {
            if (colour[start] != 0) continue;
            colour[start] = 1;
            var queue = new Queue<int>();
            queue.Enqueue(start);
            while (queue.Count > 0)
            {
                var u = queue.Dequeue();
                foreach (var v in graph[u])
                {
                    if (colour[v] == 0)
                    {
                        colour[v] = -colour[u];
                        queue.Enqueue(v);
                    }
                    else if (colour[v] == colour[u])
                    {
                        return false; // both ends of u-v in the same group
                    }
                }
            }
        }
        return true;
    }
}
