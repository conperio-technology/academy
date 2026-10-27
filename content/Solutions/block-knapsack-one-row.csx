public class Solution
{
    public static int MaxValue(int[] weights, int[] values, int capacity)
    {
        var dp = new int[capacity + 1];
        for (var i = 0; i < weights.Length; i++)
        {
            for (var c = capacity; c >= weights[i]; c--)
                dp[c] = Math.Max(dp[c], dp[c - weights[i]] + values[i]);
        }
        return dp[capacity];
    }
}
