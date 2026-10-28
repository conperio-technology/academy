public class Solution
{
    public static bool WordBreak(string s, string[] wordDict)
    {
        var words = new HashSet<string>(wordDict);
        var dp = new bool[s.Length + 1]; // dp[i]: the first i characters can be segmented
        dp[0] = true;
        for (var i = 1; i <= s.Length; i++)
        {
            for (var j = 0; j < i; j++)
            {
                if (dp[j] && words.Contains(s[j..i]))
                {
                    dp[i] = true;
                    break;
                }
            }
        }
        return dp[s.Length];
    }
}
