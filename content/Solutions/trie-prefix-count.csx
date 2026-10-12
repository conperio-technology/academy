using System.Collections.Generic;

public class TrieNode
{
    public Dictionary<char, TrieNode> Children = new();
    public int Count; // how many inserted words pass through this node
}

public class Solution
{
    public static int[] CountPrefixes(string[] words, string[] prefixes)
    {
        var root = new TrieNode();
        foreach (var word in words)
        {
            var node = root;
            node.Count++;
            foreach (var c in word)
            {
                if (!node.Children.TryGetValue(c, out var next))
                    node.Children[c] = next = new TrieNode();
                node = next;
                node.Count++;
            }
        }

        var result = new int[prefixes.Length];
        for (var i = 0; i < prefixes.Length; i++)
        {
            var node = root;
            foreach (var c in prefixes[i])
            {
                if (!node.Children.TryGetValue(c, out node)) break; // fell off: no word has this prefix
            }
            result[i] = node?.Count ?? 0;
        }
        return result;
    }
}
