public class Solution
{
    public static int MaxSubArray(int[] nums)
    {
        int current = nums[0], best = nums[0];
        for (var i = 1; i < nums.Length; i++)
        {
            // Extend the run ending at i - 1, or start fresh if that run is a drag.
            current = Math.Max(nums[i], current + nums[i]);
            best = Math.Max(best, current);
        }
        return best;
    }
}
