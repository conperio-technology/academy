public class Solution
{
    public static List<string> PassingNames(string[] names, int[] scores, int passMark)
    {
        return names.Zip(scores)
                    .Where(p => p.Second >= passMark)
                    .OrderByDescending(p => p.Second)
                    .ThenBy(p => p.First, StringComparer.Ordinal)
                    .Select(p => p.First)
                    .ToList();
    }
}
