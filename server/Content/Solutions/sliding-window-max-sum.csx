public class Solution
{
    public static int MaxSumSubarray(int[] nums, int k)
    {
        var window = 0;
        for (var i = 0; i < k; i++) window += nums[i];
        var best = window;
        for (var i = k; i < nums.Length; i++)
        {
            window += nums[i] - nums[i - k]; // slide: one in, one out
            best = Math.Max(best, window);
        }
        return best;
    }
}
