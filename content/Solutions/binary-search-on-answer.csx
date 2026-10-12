public class Solution
{
    public static int MinEatingSpeed(int[] piles, int h)
    {
        int lo = 1, hi = piles.Max();
        while (lo < hi)
        {
            var mid = lo + (hi - lo) / 2;
            if (HoursNeeded(piles, mid) <= h) hi = mid; // fast enough -- try slower
            else lo = mid + 1;                          // too slow
        }
        return lo;
    }

    private static long HoursNeeded(int[] piles, int k)
    {
        long hours = 0;
        foreach (var pile in piles) hours += (pile + k - 1) / k; // ceil(pile / k)
        return hours;
    }
}
