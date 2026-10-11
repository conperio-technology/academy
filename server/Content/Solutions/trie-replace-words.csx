public class TrieNode
{
    public Dictionary<char, TrieNode> Children = new();
    public bool IsEnd; // a root ends at this node
}

public class Solution
{
    public static string ReplaceWords(string[] dictionary, string sentence)
    {
        var root = new TrieNode();
        foreach (var word in dictionary)
        {
            var node = root;
            foreach (var c in word)
            {
                if (!node.Children.TryGetValue(c, out var child))
                {
                    child = new TrieNode();
                    node.Children[c] = child;
                }
                node = child;
            }
            node.IsEnd = true;
        }

        var words = sentence.Split(' ');
        for (var i = 0; i < words.Length; i++)
        {
            var node = root;
            for (var j = 0; j < words[i].Length; j++)
            {
                if (!node.Children.TryGetValue(words[i][j], out var next)) break; // no root fits
                node = next;
                if (node.IsEnd)
                {
                    words[i] = words[i][..(j + 1)]; // the first end mark is the shortest root
                    break;
                }
            }
        }
        return string.Join(" ", words);
    }
}
