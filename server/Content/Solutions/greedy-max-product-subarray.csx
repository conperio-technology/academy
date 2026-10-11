public class Solution
{
    public static int MaxProduct(int[] nums)
    {
        int hi = nums[0], lo = nums[0], best = nums[0];
        for (var i = 1; i < nums.Length; i++)
        {
            var x = nums[i];
            int a = hi * x, b = lo * x; // both from the OLD hi and lo
            hi = Math.Max(x, Math.Max(a, b));
            lo = Math.Min(x, Math.Min(a, b));
            best = Math.Max(best, hi);
        }
        return best;
    }
}
