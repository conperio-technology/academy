public class Solution
{
    public static int CountComponents(int n, int[][] edges)
    {
        var parent = Enumerable.Range(0, n).ToArray();
        var size = Enumerable.Repeat(1, n).ToArray();
        int Find(int x)
        {
            while (parent[x] != x)
            {
                parent[x] = parent[parent[x]]; // path compression (halving)
                x = parent[x];
            }
            return x;
        }

        var components = n;
        foreach (var edge in edges)
        {
            int a = Find(edge[0]), b = Find(edge[1]);
            if (a == b) continue; // already connected
            if (size[a] < size[b]) (a, b) = (b, a); // union by size: hang the smaller tree under the larger
            parent[b] = a;
            size[a] += size[b];
            components--;
        }
        return components;
    }
}
