public class Solution
{
    public static int CoinChange(int[] coins, int amount)
    {
        const int Unreachable = int.MaxValue;
        var dp = new int[amount + 1];
        for (var x = 1; x <= amount; x++)
        {
            dp[x] = Unreachable;
            foreach (var c in coins) // ascending x: dp[x - c] may already use coin c again
            {
                if (c <= x && dp[x - c] != Unreachable)
                    dp[x] = Math.Min(dp[x], dp[x - c] + 1);
            }
        }
        return dp[amount] == Unreachable ? -1 : dp[amount];
    }
}
