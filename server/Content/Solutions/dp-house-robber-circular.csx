public class Solution
{
    public static int RobCircle(int[] nums)
    {
        if (nums.Length == 0) return 0;
        if (nums.Length == 1) return nums[0];
        // House 0 and house n - 1 can't both be robbed, so one of them is skipped.
        return Math.Max(RobLine(nums, 0, nums.Length - 2), RobLine(nums, 1, nums.Length - 1));
    }

    // The linear House Robber on nums[lo..hi], both ends included.
    private static int RobLine(int[] nums, int lo, int hi)
    {
        int prev2 = 0, prev1 = 0;
        for (var i = lo; i <= hi; i++)
        {
            var cur = Math.Max(prev1, prev2 + nums[i]);
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
}
