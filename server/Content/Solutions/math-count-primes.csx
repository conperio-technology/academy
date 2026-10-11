public class Solution
{
    public static int CountPrimes(int n)
    {
        if (n < 3) return 0;
        var composite = new bool[n]; // false = still a candidate prime
        composite[0] = composite[1] = true;
        // (long) so p * p can't wrap negative for n near int.MaxValue.
        for (var p = 2; (long)p * p < n; p++)
        {
            if (composite[p]) continue;
            // Every multiple below p * p has a smaller prime factor and is already crossed out.
            for (var m = p * p; m < n; m += p) composite[m] = true;
        }
        var count = 0;
        foreach (var c in composite) if (!c) count++;
        return count;
    }
}
