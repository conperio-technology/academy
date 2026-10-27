public class Solution
{
    public static int MinCapacity(int[] weights, int days)
    {
        int lo = weights.Max(), hi = weights.Sum();
        while (lo < hi)
        {
            var mid = lo + (hi - lo) / 2;
            if (CanShip(weights, days, mid))
                hi = mid;
            else
                lo = mid + 1;
        }
        return lo;
    }

    private static bool CanShip(int[] weights, int days, int capacity)
    {
        int used = 1, load = 0;
        foreach (var w in weights)
        {
            if (load + w > capacity)
            {
                used++;
                load = 0;
            }
            load += w;
        }
        return used <= days;
    }
}
