public class Solution
{
    public static int CharacterReplacement(string s, int k)
    {
        var counts = new int[26];
        int left = 0, maxCount = 0, best = 0;
        for (var right = 0; right < s.Length; right++)
        {
            counts[s[right] - 'A']++;
            maxCount = Math.Max(maxCount, counts[s[right] - 'A']);
            // Too many letters differ from the most common one: shrink from the left.
            while (right - left + 1 - maxCount > k)
            {
                counts[s[left] - 'A']--;
                left++;
            }
            best = Math.Max(best, right - left + 1);
        }
        return best;
    }
}
