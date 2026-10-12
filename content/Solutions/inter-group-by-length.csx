public class Solution
{
    public static Dictionary<int, List<string>> GroupByLength(string[] words)
    {
        var groups = new Dictionary<int, List<string>>();
        foreach (var word in words)
        {
            if (!groups.TryGetValue(word.Length, out var list))
            {
                list = new List<string>();
                groups[word.Length] = list;
            }
            list.Add(word);
        }
        return groups;
        // Or: return words.GroupBy(w => w.Length).ToDictionary(g => g.Key, g => g.ToList());
    }
}
