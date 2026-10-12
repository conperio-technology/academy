public class Solution
{
    public static int LadderLength(string beginWord, string endWord, string[] wordList)
    {
        if (!wordList.Contains(endWord)) return 0;

        // "h*t" -> every listed word that matches it. Words sharing a bucket are one change apart.
        var buckets = new Dictionary<string, List<string>>();
        foreach (var word in wordList.Distinct())
            for (var i = 0; i < word.Length; i++)
            {
                var pattern = word[..i] + "*" + word[(i + 1)..];
                if (!buckets.TryGetValue(pattern, out var bucket)) buckets[pattern] = bucket = new List<string>();
                bucket.Add(word);
            }

        var visited = new HashSet<string> { beginWord };
        var queue = new Queue<(string Word, int Length)>();
        queue.Enqueue((beginWord, 1));
        while (queue.Count > 0)
        {
            var (word, length) = queue.Dequeue();
            if (word == endWord) return length;
            for (var i = 0; i < word.Length; i++)
            {
                var pattern = word[..i] + "*" + word[(i + 1)..];
                if (!buckets.TryGetValue(pattern, out var bucket)) continue;
                foreach (var next in bucket)
                    if (visited.Add(next)) queue.Enqueue((next, length + 1));
                bucket.Clear(); // every word in it is visited now, so never read it again
            }
        }
        return 0;
    }
}
