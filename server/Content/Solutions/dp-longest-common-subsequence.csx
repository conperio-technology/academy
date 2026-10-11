public class Solution
{
    public static int LongestCommonSubsequence(string a, string b)
    {
        var dp = new int[a.Length + 1, b.Length + 1]; // row 0 and column 0 stay 0
        for (var i = 1; i <= a.Length; i++)
        {
            for (var j = 1; j <= b.Length; j++)
            {
                dp[i, j] = a[i - 1] == b[j - 1]
                    ? dp[i - 1, j - 1] + 1
                    : Math.Max(dp[i - 1, j], dp[i, j - 1]);
            }
        }
        return dp[a.Length, b.Length];
    }
}
