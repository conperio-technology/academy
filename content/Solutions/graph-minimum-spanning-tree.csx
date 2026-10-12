using System;
using System.Linq;

public class Solution
{
    public static int MinSpanningTreeCost(int n, int[][] edges)
    {
        var parent = Enumerable.Range(0, n).ToArray();
        int Find(int x) => parent[x] == x ? x : parent[x] = Find(parent[x]);

        int total = 0, taken = 0;
        foreach (var edge in edges.OrderBy(e => e[2])) // cheapest first
        {
            int rootU = Find(edge[0]), rootV = Find(edge[1]);
            if (rootU == rootV) continue; // already connected: this edge would close a loop
            parent[rootU] = rootV;
            total += edge[2];
            taken++;
        }
        return taken == n - 1 ? total : -1;
    }
}
