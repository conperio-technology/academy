public class Solution
{
    public static int NumDecodings(string s)
    {
        if (s.Length == 0) return 0;
        int prev2 = 1, prev1 = s[0] != '0' ? 1 : 0; // ways of the first i - 2 and i - 1 digits
        for (var i = 1; i < s.Length; i++)
        {
            var cur = 0;
            if (s[i] != '0') cur += prev1; // the last digit alone
            var pair = (s[i - 1] - '0') * 10 + (s[i] - '0');
            if (pair >= 10 && pair <= 26) cur += prev2; // the last two digits together
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
}
