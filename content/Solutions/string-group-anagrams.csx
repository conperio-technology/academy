public class Solution
{
    public static List<List<string>> GroupAnagrams(string[] words)
    {
        var groups = new Dictionary<string, List<string>>();
        foreach (var word in words)
        {
            var chars = word.ToCharArray();
            Array.Sort(chars);
            var key = new string(chars); // every anagram sorts to the same key
            if (!groups.TryGetValue(key, out var group))
            {
                group = new List<string>();
                groups[key] = group;
            }
            group.Add(word);
        }
        return groups.Values.ToList();
    }
}
