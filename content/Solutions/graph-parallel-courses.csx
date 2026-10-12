public class Solution
{
    public static int MinimumSemesters(int n, int[][] prerequisites)
    {
        var adj = new List<int>[n];
        for (var i = 0; i < n; i++) adj[i] = new List<int>();
        var indegree = new int[n];
        foreach (var p in prerequisites)
        {
            adj[p[0]].Add(p[1]);
            indegree[p[1]]++;
        }

        var queue = new Queue<int>();
        for (var i = 0; i < n; i++)
            if (indegree[i] == 0) queue.Enqueue(i);

        int semesters = 0, taken = 0;
        while (queue.Count > 0)
        {
            semesters++;
            // Everything ready at the start of this round is one semester.
            for (var size = queue.Count; size > 0; size--)
            {
                var course = queue.Dequeue();
                taken++;
                foreach (var next in adj[course])
                    if (--indegree[next] == 0) queue.Enqueue(next);
            }
        }
        return taken == n ? semesters : -1; // courses left over sit on a cycle
    }
}
