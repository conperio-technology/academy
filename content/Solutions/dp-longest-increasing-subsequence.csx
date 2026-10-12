public class Solution
{
    public static int LengthOfLIS(int[] nums)
    {
        if (nums.Length == 0) return 0;
        var dp = Enumerable.Repeat(1, nums.Length).ToArray();
        for (var i = 1; i < nums.Length; i++)
            for (var j = 0; j < i; j++)
                if (nums[j] < nums[i]) dp[i] = Math.Max(dp[i], dp[j] + 1);
        return dp.Max(); // the best run can end anywhere, not just at the last index
    }
}
