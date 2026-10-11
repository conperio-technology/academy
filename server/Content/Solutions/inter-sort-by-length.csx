public class Solution
{
    public static List<string> SortWords(string[] words)
    {
        return words.OrderBy(w => w.Length)
                    .ThenBy(w => w, StringComparer.Ordinal)
                    .ToList();
    }
}
