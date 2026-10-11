public class Solution
{
    public static int LongestPalindromeLength(string s)
    {
        var n = s.Length;
        if (n == 0) return 0;
        var dp = new bool[n, n];
        var best = 1;
        for (var len = 1; len <= n; len++)         // shortest ranges first
        {
            for (var i = 0; i + len - 1 < n; i++)
            {
                var j = i + len - 1;
                if (len == 1) dp[i, j] = true;
                else if (len == 2) dp[i, j] = s[i] == s[j];
                else dp[i, j] = s[i] == s[j] && dp[i + 1, j - 1];
                if (dp[i, j]) best = Math.Max(best, len);
            }
        }
        return best;
    }
}
