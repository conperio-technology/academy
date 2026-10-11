public class Solution
{
    private static long Gcd(long a, long b)
    {
        while (b != 0) (a, b) = (b, a % b);
        return a;
    }

    public static long[] GcdAndLcm(int[] nums)
    {
        long g = nums[0], l = nums[0];
        for (var i = 1; i < nums.Length; i++)
        {
            long x = nums[i];
            g = Gcd(g, x);
            l = l / Gcd(l, x) * x; // divide first: l * x could overflow long even when the LCM fits
        }
        return new[] { g, l };
    }
}
