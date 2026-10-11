using System.Collections.Generic;

public class Solution
{
    public static int LengthOfLongestSubstring(string s)
    {
        var window = new HashSet<char>();
        int left = 0, best = 0;
        for (var right = 0; right < s.Length; right++)
        {
            while (window.Contains(s[right])) // shrink until the repeat is gone
            {
                window.Remove(s[left]);
                left++;
            }
            window.Add(s[right]);
            best = Math.Max(best, right - left + 1);
        }
        return best;
    }
}
