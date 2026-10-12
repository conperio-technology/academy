public class Solution
{
    public static int[] FindRedundantConnection(int[][] edges)
    {
        var n = edges.Length; // a tree plus one edge: as many edges as nodes
        var parent = Enumerable.Range(0, n).ToArray();
        var size = Enumerable.Repeat(1, n).ToArray();

        int Find(int x)
        {
            while (parent[x] != x)
            {
                parent[x] = parent[parent[x]]; // path halving
                x = parent[x];
            }
            return x;
        }

        foreach (var edge in edges)
        {
            int ra = Find(edge[0]), rb = Find(edge[1]);
            if (ra == rb) return edge; // already connected: this edge closes the cycle
            if (size[ra] < size[rb]) (ra, rb) = (rb, ra);
            parent[rb] = ra;
            size[ra] += size[rb];
        }
        return new int[0];
    }
}
