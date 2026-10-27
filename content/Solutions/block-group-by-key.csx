public class Solution
{
    public static List<List<string>> GroupByFirstLetter(string[] words)
    {
        var groups = new Dictionary<char, List<string>>();
        var order = new List<char>();
        foreach (var word in words)
        {
            var key = char.ToLower(word[0]);
            if (!groups.TryGetValue(key, out var group))
            {
                group = new List<string>();
                groups[key] = group;
                order.Add(key);
            }
            group.Add(word);
        }
        return order.Select(key => groups[key]).ToList();
    }
}
