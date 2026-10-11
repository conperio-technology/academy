public class Solution
{
    public static int Knapsack(int[] weights, int[] values, int capacity)
    {
        var dp = new int[capacity + 1];
        for (var item = 0; item < weights.Length; item++)
        {
            int wt = weights[item], v = values[item];
            for (var w = capacity; w >= wt; w--) // descending: each item used at most once
                dp[w] = Math.Max(dp[w], dp[w - wt] + v);
        }
        return dp[capacity];
    }
}
