public class Solution
{
    public static IEnumerable<List<int>> Chunks(IEnumerable<int> items, int size)
    {
        var chunk = new List<int>();
        foreach (var item in items)
        {
            chunk.Add(item);
            if (chunk.Count == size)
            {
                yield return chunk;
                chunk = new List<int>();   // a new list: the caller keeps the old one
            }
        }
        if (chunk.Count > 0) yield return chunk;
    }
}
