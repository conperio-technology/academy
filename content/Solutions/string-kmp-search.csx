public class Solution
{
    public static List<int> FindOccurrences(string text, string pattern)
    {
        var lps = BuildLps(pattern);
        var result = new List<int>();
        var j = 0; // how many characters of pattern currently match
        for (var i = 0; i < text.Length; i++)
        {
            while (j > 0 && text[i] != pattern[j]) j = lps[j - 1]; // fall back, text pointer stays put
            if (text[i] == pattern[j]) j++;
            if (j == pattern.Length)
            {
                result.Add(i - j + 1);
                j = lps[j - 1]; // keep going so overlapping matches are found
            }
        }
        return result;
    }

    // lps[i] = length of the longest proper prefix of pattern[0..i] that is also a suffix of it.
    private static int[] BuildLps(string pattern)
    {
        var lps = new int[pattern.Length];
        var length = 0;
        for (var i = 1; i < pattern.Length; i++)
        {
            while (length > 0 && pattern[i] != pattern[length]) length = lps[length - 1];
            if (pattern[i] == pattern[length]) length++;
            lps[i] = length;
        }
        return lps;
    }
}
