namespace DsaAcademy.Content.Concepts;

public class TriePrefixCount : IConcept
{
    public string Id => "trie-prefix-count";
    public string Track => "patterns";
    public string Title => "Trie: Prefix Search";
    public string OneLiner => "A tree of characters where every word that shares a prefix shares the path -- so \"how many words start with app?\" is one walk, not a scan.";
    public string KeyTakeaway =>
        "Each trie node is one character position; its children are keyed by the next character. Store a " +
        "count on every node of how many words pass through it, and any prefix query is a walk of " +
        "length L down from the root: O(L), no matter how many words are stored.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Autocomplete, spell-checkers and routing tables all ask the same question: which stored strings " +
        "start with this? A hash set can only answer \"is this exact word here?\". A list makes you check " +
        "every word. A trie (from retrieval, usually said \"try\") is built for prefixes.\n\n" +
        "Start with an empty root node. To insert a word, walk it one character at a time: if the " +
        "current node has a child for that character, move into it; if not, create one. Words that share " +
        "a start (app, apple, apply) share those first nodes and only branch where they differ. If every " +
        "node also counts how many inserted words passed through it, then answering \"how many words start " +
        "with p\" is: walk p's characters from the root. If you fall off (no child for some character), the " +
        "answer is 0; otherwise it's the count on the node where you stop.\n\n" +
        "A node is usually a small class holding a dictionary of children (or a 26-slot array for " +
        "lowercase letters) and an integer count; add an end-of-word flag when you also need exact-match " +
        "lookups. In this lesson, insert every word, then answer each prefix query in order.\n\n" +
        "The visualization below inserts four words and shows, after each one, how many new nodes it " +
        "had to create -- notice how shared prefixes make later words cheap.";

    public List<string> RecognitionSignals =>
    [
        "The question is about PREFIXES of strings: autocomplete, \"starts with\", longest common prefix, word search over a dictionary.",
        "Many strings are queried against the same fixed dictionary, so building a structure once up front pays off.",
    ];

    public List<string> Gotchas =>
    [
        "Increment the count on EVERY node along the path while inserting, not only on the last one -- otherwise prefix counts only count words that end exactly there.",
        "Falling off the trie partway through a query means 0 matches; don't return the count of the last node you did reach.",
        "The empty prefix matches every word: the root's count (or just the number of words) is the answer.",
    ];

    public List<string> ConfusableWith =>
    [
        "Hash Map (Fundamentals): a set of words answers exact membership in O(L) too, but has no notion of prefixes -- you'd have to store every prefix of every word to fake it.",
        "Binary Search: sorting the words and binary searching for the prefix range also works (O(L log n) per query); a trie trades memory for skipping the log n.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "using System.Collections.Generic;\n\n" +
            "public class TrieNode\n" +
            "{\n" +
            "    public Dictionary<char, TrieNode> Children = new();\n" +
            "    public int Count; // how many inserted words pass through this node\n" +
            "}\n\n" +
            "public class Solution\n" +
            "{\n" +
            "    public static int[] CountPrefixes(string[] words, string[] prefixes)\n" +
            "    {\n" +
            "        // TODO: insert every word -- walk its characters from a root\n" +
            "        // TrieNode, creating children as needed and incrementing Count on\n" +
            "        // each node you pass through. Then for each prefix, walk it the\n" +
            "        // same way: 0 if you fall off, otherwise that node's Count.\n" +
            "        return new int[prefixes.Length];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "class TrieNode:\n" +
            "    def __init__(self):\n" +
            "        self.children = {}\n" +
            "        self.count = 0  # how many inserted words pass through this node\n\n\n" +
            "def count_prefixes(words, prefixes):\n" +
            "    # TODO: insert every word -- walk its characters from a root\n" +
            "    # TrieNode, creating children as needed and incrementing count on\n" +
            "    # each node you pass through. Then for each prefix, walk it the\n" +
            "    # same way: 0 if you fall off, otherwise that node's count.\n" +
            "    return [0] * len(prefixes)\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CountPrefixes",
        ["python"] = "count_prefixes",
    };

    private static string Words(params string[] w) => "[" + string.Join(", ", w.Select(Lit.Str)) + "]";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Words("apple", "app", "apply", "ape", "bat"), Words("app", "ap", "b", "c", "apple")), "[3,4,1,0,1]"),
        new TestCase(Lit.Args(Words("car", "card", "care", "cart", "dog"), Words("car", "card", "ca", "do", "cars")), "[4,1,4,1,0]"),
        new TestCase(Lit.Args(Words("a", "b"), Words("", "a", "ab")), "[2,1,0]"),
        new TestCase(Lit.Args(Words("same", "same"), Words("sa", "same", "samey")), "[2,2,0]"),
        new TestCase(Lit.Args(Words(), Words("x")), "[0]"),
    ];

    public string CSharpCallTemplate => "Solution.CountPrefixes({input})";
    public string PythonCallTemplate => "count_prefixes({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        string[] words = ["app", "apple", "apply", "bat"];
        var root = new Dictionary<string, int>(); // prefix -> count, a flattened view of the trie
        var steps = new List<VisualizationStep>();
        var nodes = 0;

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Array.Empty<object>(), ["tracker"] = 0, ["trackerLabel"] = "nodes in trie" },
            HighlightIndices: [],
            Message: "An empty trie: just the root."
        ));

        foreach (var word in words)
        {
            var created = new List<int>();
            for (var i = 1; i <= word.Length; i++)
            {
                var prefix = word[..i];
                if (!root.ContainsKey(prefix))
                {
                    root[prefix] = 0;
                    nodes++;
                    created.Add(i - 1);
                }
                root[prefix]++;
            }
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object>
                {
                    ["array"] = word.Select(c => (object)c.ToString()).ToArray(),
                    ["tracker"] = nodes,
                    ["trackerLabel"] = "nodes in trie",
                },
                HighlightIndices: created.ToArray(),
                Message: created.Count == word.Length
                    ? $"Insert \"{word}\": nothing shared yet, so all {word.Length} characters get new nodes (highlighted)."
                    : created.Count == 0
                        ? $"Insert \"{word}\": its whole path already exists -- no new nodes, just counts bumped."
                        : $"Insert \"{word}\": the first {word.Length - created.Count} characters reuse existing nodes; only {created.Count} new node(s) (highlighted)."
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = new object[] { "a", "p", "p" }, ["tracker"] = root["app"], ["trackerLabel"] = "words starting with \"app\"" },
            HighlightIndices: [0, 1, 2],
            Message: $"Query \"app\": walk a → p → p and read that node's count: {root["app"]} words (app, apple, apply)."
        ));

        return steps;
    }
}
