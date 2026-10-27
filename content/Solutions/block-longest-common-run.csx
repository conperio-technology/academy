public class Solution
{
    public static int LongestCommonRun(string a, string b)
    {
        var dp = new int[a.Length + 1, b.Length + 1];
        var best = 0;
        for (var i = 1; i <= a.Length; i++)
        {
            for (var j = 1; j <= b.Length; j++)
            {
                if (a[i - 1] == b[j - 1])
                {
                    dp[i, j] = dp[i - 1, j - 1] + 1;
                    best = Math.Max(best, dp[i, j]);
                }
            }
        }
        return best;
    }
}
