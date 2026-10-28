public class Solution
{
    public static int FindCheapestPrice(int n, int[][] flights, int src, int dst, int k)
    {
        const int Inf = int.MaxValue;
        var price = Enumerable.Repeat(Inf, n).ToArray();
        price[src] = 0;
        for (var round = 0; round <= k; round++) // k stops = at most k + 1 flights
        {
            var next = price.ToArray(); // relax from last round's prices only
            foreach (var f in flights)
            {
                int u = f[0], v = f[1], w = f[2];
                if (price[u] != Inf && price[u] + w < next[v]) next[v] = price[u] + w;
            }
            price = next;
        }
        return price[dst] == Inf ? -1 : price[dst];
    }
}
