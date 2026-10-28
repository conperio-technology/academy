public class Solution
{
    public static string AlienOrder(string[] words)
    {
        var next = new Dictionary<char, HashSet<char>>();
        var indegree = new Dictionary<char, int>();
        foreach (var w in words)
            foreach (var c in w)
            {
                next.TryAdd(c, []);
                indegree.TryAdd(c, 0);
            }
        for (var p = 0; p + 1 < words.Length; p++)
        {
            string a = words[p], b = words[p + 1];
            var i = 0;
            while (i < a.Length && i < b.Length && a[i] == b[i]) i++;
            if (i < a.Length && i < b.Length)
            {
                if (next[a[i]].Add(b[i])) indegree[b[i]]++; // only the first difference is a rule
            }
            else if (a.Length > b.Length)
            {
                return ""; // a word before its own prefix: no alphabet sorts that way
            }
        }
        var ready = new SortedSet<char>(indegree.Where(kv => kv.Value == 0).Select(kv => kv.Key));
        var order = new System.Text.StringBuilder();
        while (ready.Count > 0)
        {
            var c = ready.Min;
            ready.Remove(c);
            order.Append(c);
            foreach (var d in next[c])
                if (--indegree[d] == 0) ready.Add(d);
        }
        return order.Length == indegree.Count ? order.ToString() : ""; // leftovers mean a cycle
    }
}
