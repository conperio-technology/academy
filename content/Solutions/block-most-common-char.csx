public class Solution
{
    public static string MostCommonChar(string s)
    {
        var counts = new Dictionary<char, int>();
        foreach (var c in s)
            counts[c] = counts.GetValueOrDefault(c) + 1;

        var best = "";
        var bestCount = 0;
        foreach (var c in s)
        {
            if (counts[c] > bestCount)
            {
                best = c.ToString();
                bestCount = counts[c];
            }
        }
        return best;
    }
}
