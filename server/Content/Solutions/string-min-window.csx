public class Solution
{
    public static string MinWindow(string s, string t)
    {
        var need = new Dictionary<char, int>();
        foreach (var c in t) need[c] = need.GetValueOrDefault(c) + 1;
        var missing = t.Length; // characters of t (with multiplicity) not yet covered
        int bestStart = 0, bestLen = s.Length + 1;
        var left = 0;
        for (var right = 0; right < s.Length; right++)
        {
            var c = s[right];
            if (need.GetValueOrDefault(c) > 0) missing--;
            need[c] = need.GetValueOrDefault(c) - 1; // negative means a surplus inside the window
            while (missing == 0)
            {
                if (right - left + 1 < bestLen)
                {
                    bestStart = left;
                    bestLen = right - left + 1;
                }
                var outChar = s[left];
                need[outChar]++;
                if (need[outChar] > 0) missing++; // dropping it uncovered a needed character
                left++;
            }
        }
        return bestLen > s.Length ? "" : s.Substring(bestStart, bestLen);
    }
}
