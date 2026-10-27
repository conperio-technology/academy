public class Solution
{
    public static int EarliestAllConnected(int n, int[][] logs)
    {
        var parent = new int[n];
        var rank = new int[n];
        for (var i = 0; i < n; i++) parent[i] = i;
        var count = n;

        int Find(int x)
        {
            while (parent[x] != x)
            {
                parent[x] = parent[parent[x]];
                x = parent[x];
            }
            return x;
        }

        foreach (var log in logs)
        {
            int ra = Find(log[1]), rb = Find(log[2]);
            if (ra == rb) continue;
            if (rank[ra] < rank[rb]) (ra, rb) = (rb, ra);
            parent[rb] = ra;
            if (rank[ra] == rank[rb]) rank[ra]++;
            count--;
            if (count == 1) return log[0];
        }
        return -1;
    }
}
