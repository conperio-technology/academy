public class Solution
{
    public static int LongestKDistinct(string s, int k)
    {
        var counts = new Dictionary<char, int>();
        int left = 0, best = 0;
        for (var right = 0; right < s.Length; right++)
        {
            counts[s[right]] = counts.GetValueOrDefault(s[right]) + 1;
            while (counts.Count > k)
            {
                var c = s[left];
                counts[c]--;
                if (counts[c] == 0) counts.Remove(c);
                left++;
            }
            best = Math.Max(best, right - left + 1);
        }
        return best;
    }
}
