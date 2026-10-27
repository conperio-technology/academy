public class Solution
{
    public static int MinCostClimb(int[] cost)
    {
        var n = cost.Length;
        var dp = new int[n];
        dp[0] = cost[0];
        dp[1] = cost[1];
        for (var i = 2; i < n; i++)
            dp[i] = cost[i] + Math.Min(dp[i - 1], dp[i - 2]);
        return Math.Min(dp[n - 1], dp[n - 2]);
    }
}
