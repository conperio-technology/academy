public class Solution
{
    public static Dictionary<string, int> WordFrequency(string text)
    {
        var counts = new Dictionary<string, int>();
        foreach (string word in text.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries))
        {
            // A missing key reads as 0, so the first sighting becomes 1.
            counts[word] = counts.GetValueOrDefault(word) + 1;
        }
        return counts;
    }
}
