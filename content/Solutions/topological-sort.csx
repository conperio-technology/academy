public class Solution
{
    public static int[] TopologicalOrder(int n, int[][] prerequisites)
    {
        var inDegree = new int[n];
        var next = Enumerable.Range(0, n).Select(_ => new List<int>()).ToArray();
        foreach (var p in prerequisites)
        {
            next[p[0]].Add(p[1]);
            inDegree[p[1]]++;
        }

        // A min-priority queue, so ties always go to the smallest-numbered task.
        var ready = new PriorityQueue<int, int>();
        for (var i = 0; i < n; i++)
            if (inDegree[i] == 0) ready.Enqueue(i, i);

        var order = new List<int>();
        while (ready.TryDequeue(out var task, out _))
        {
            order.Add(task);
            foreach (var after in next[task])
                if (--inDegree[after] == 0) ready.Enqueue(after, after);
        }
        return order.Count == n ? order.ToArray() : new int[0]; // leftovers mean a cycle
    }
}
