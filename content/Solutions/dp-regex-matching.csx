public class Solution
{
    public static bool IsMatch(string s, string p)
    {
        int n = s.Length, m = p.Length;
        var dp = new bool[n + 1, m + 1];   // dp[i, j]: s[0..i) matches p[0..j)
        dp[0, 0] = true;
        for (var j = 2; j <= m; j++)
            if (p[j - 1] == '*') dp[0, j] = dp[0, j - 2];   // x* can match nothing
        for (var i = 1; i <= n; i++)
        {
            for (var j = 1; j <= m; j++)
            {
                if (p[j - 1] == '*')
                {
                    var repeatOk = p[j - 2] == s[i - 1] || p[j - 2] == '.';
                    dp[i, j] = dp[i, j - 2] || (repeatOk && dp[i - 1, j]);   // zero copies, or one more
                }
                else
                {
                    dp[i, j] = (p[j - 1] == s[i - 1] || p[j - 1] == '.') && dp[i - 1, j - 1];
                }
            }
        }
        return dp[n, m];
    }
}
