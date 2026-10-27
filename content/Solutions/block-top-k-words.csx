public class Solution
{
    public static List<string> TopKWords(string[] words, int k)
    {
        var counts = new Dictionary<string, int>();
        foreach (var w in words)
            counts[w] = counts.GetValueOrDefault(w) + 1;

        var heap = new PriorityQueue<string, (int Count, string Word)>(
            Comparer<(int Count, string Word)>.Create((a, b) =>
                a.Count != b.Count ? a.Count.CompareTo(b.Count) : string.CompareOrdinal(a.Word, b.Word)));
        foreach (var (word, count) in counts)
            heap.Enqueue(word, (-count, word));

        var result = new List<string>();
        for (var i = 0; i < k; i++)
            result.Add(heap.Dequeue());
        return result;
    }
}
