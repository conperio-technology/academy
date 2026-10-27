public class Solution
{
    public static List<int> CourseOrder(int n, int[][] prereqs)
    {
        var adj = new List<int>[n];
        for (var i = 0; i < n; i++) adj[i] = new List<int>();
        var indegree = new int[n];
        foreach (var p in prereqs)
        {
            adj[p[1]].Add(p[0]);
            indegree[p[0]]++;
        }

        var queue = new Queue<int>();
        for (var i = 0; i < n; i++)
            if (indegree[i] == 0) queue.Enqueue(i);

        var order = new List<int>();
        while (queue.Count > 0)
        {
            var course = queue.Dequeue();
            order.Add(course);
            foreach (var next in adj[course])
            {
                indegree[next]--;
                if (indegree[next] == 0) queue.Enqueue(next);
            }
        }
        return order.Count == n ? order : new List<int>();
    }
}
