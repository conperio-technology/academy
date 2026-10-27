public class Solution
{
    public static int CountComponents(int n, int[][] edges)
    {
        var adj = new List<int>[n];
        for (var i = 0; i < n; i++) adj[i] = new List<int>();
        foreach (var e in edges)
        {
            adj[e[0]].Add(e[1]);
            adj[e[1]].Add(e[0]);
        }

        var visited = new bool[n];
        void Dfs(int node)
        {
            visited[node] = true;
            foreach (var next in adj[node])
                if (!visited[next]) Dfs(next);
        }

        var components = 0;
        for (var i = 0; i < n; i++)
        {
            if (visited[i]) continue;
            components++;
            Dfs(i);
        }
        return components;
    }
}
