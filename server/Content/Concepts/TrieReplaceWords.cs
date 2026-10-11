namespace DsaAcademy.Content.Concepts;

// Transfer exercise after Trie: Prefix Search: the trie is built the same way, but the walk now
// goes the other direction (which stored word is a prefix of this word?) and stops early.
public class TrieReplaceWords : IConcept
{
    public string Id => "trie-replace-words";
    public string Track => "patterns";
    public string Title => "Transfer: Replace Words with Their Shortest Root";
    public string OneLiner => "Replace every word in a sentence by the shortest dictionary root it starts with. Same trie, but now you look for a stored word that is a prefix of the query.";
    public string KeyTakeaway =>
        "Mark the node where each root ends. To shorten a word, walk its letters down the trie and stop at " +
        "the first end mark: that is the shortest root. Falling off the trie first means no root fits, so " +
        "keep the word. Each word costs at most its own length, however many roots there are.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;
    public string? TransferOf => "trie-prefix-count";

    public string Explanation =>
        "This follows Trie: Prefix Search with the question turned around. You get a dictionary of roots " +
        "and a sentence of lowercase words separated by single spaces. Replace each word that starts with " +
        "some root by the shortest such root, leave other words alone, and return the new sentence. With " +
        "roots cat, bat and rat, \"the cattle was rattled by the battery\" becomes \"the cat was rat by the " +
        "bat\".\n\n" +
        "In the parent lesson the query was the prefix, and the answer was how many stored words continue " +
        "it. Here the stored roots are the prefixes, and for each query word you want the shortest stored " +
        "root that it starts with. The naive way checks every root against every word: with r roots that " +
        "is O(r · L) per word.\n\n" +
        "Build the trie from the roots as before, but instead of a count, mark the node where each root " +
        "ends (an IsEnd flag). For a word, walk its letters from the root of the trie. After each letter, " +
        "if the node you are on is marked, the letters so far are a root, and since you are walking from " +
        "the shortest prefix up, it is the shortest one: stop and use it. If the next letter has no child, " +
        "no root fits this word: keep it unchanged. If the word runs out before any mark, keep it too " +
        "(\"ab\" is not shortened by the root \"abc\").\n\n" +
        "Building costs O(total length of the roots) and each word costs at most its own length, so the " +
        "whole job is linear in the input size. Stopping at the first mark is also why a longer root such " +
        "as \"catt\" never wins over \"cat\".\n\n" +
        "The visualization walks each word of \"the cattle was rattled by the battery\" through a trie of " +
        "cat, bat and rat.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences comparing this " +
        "with Trie: Prefix Search. In which direction does the prefix relationship go in each problem, what " +
        "did you store on the nodes instead of a count, and why is the first end mark you meet the shortest " +
        "root?";

    public List<string> RecognitionSignals =>
    [
        "For each query string, find a stored string that is a prefix of it (the shortest, the longest, or any).",
        "Many queries against one fixed set of roots, prefixes or routes, where checking every stored string per query is too slow.",
    ];

    public List<string> Gotchas =>
    [
        "Mark where each root ENDS; passing through a node that only continues to a longer root is not a match.",
        "Stop at the first end mark to get the shortest root; don't keep walking for a longer one.",
        "A word shorter than every matching path (\"ab\" with root \"abc\") is kept as it is.",
    ];

    public List<string> ConfusableWith =>
    [
        "Trie: Prefix Search asks how many stored words start with the query. This asks which stored root the query starts with: the same tree, walked for a different answer.",
        "A hash set of roots also works: try every prefix of the word from short to long. That costs O(L²) per word for building the prefix strings, where the trie walk is O(L).",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class TrieNode\n" +
            "{\n" +
            "    public Dictionary<char, TrieNode> Children = new();\n" +
            "    public bool IsEnd; // a root ends at this node\n" +
            "}\n\n" +
            "public class Solution\n" +
            "{\n" +
            "    public static string ReplaceWords(string[] dictionary, string sentence)\n" +
            "    {\n" +
            "        // TODO: insert every root into a trie, setting IsEnd on its last node.\n" +
            "        // Then for each word of sentence.Split(' '): walk its letters from the\n" +
            "        // root. Stop at the first node with IsEnd (use that prefix), or when a\n" +
            "        // letter has no child (keep the word). Join the results with spaces.\n" +
            "        return sentence;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "class TrieNode:\n" +
            "    def __init__(self):\n" +
            "        self.children = {}\n" +
            "        self.is_end = False  # a root ends at this node\n\n\n" +
            "def replace_words(dictionary, sentence):\n" +
            "    # TODO: insert every root into a trie, setting is_end on its last node.\n" +
            "    # Then for each word of sentence.split(' '): walk its letters from the\n" +
            "    # root. Stop at the first node with is_end (use that prefix), or when a\n" +
            "    # letter has no child (keep the word). Join the results with spaces.\n" +
            "    return sentence\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ReplaceWords",
        ["python"] = "replace_words",
    };

    private static string Words(params string[] w) => "[" + string.Join(", ", w.Select(Lit.Str)) + "]";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Words("cat", "bat", "rat"), Lit.Str("the cattle was rattled by the battery")), "\"the cat was rat by the bat\""),
        new TestCase(Lit.Args(Words("a", "b", "c"), Lit.Str("aadsfasf absbs bbab cadsfafs")), "\"a a b c\""),
        new TestCase(Lit.Args(Words(), Lit.Str("hello world")), "\"hello world\""),
        new TestCase(Lit.Args(Words("a", "aa"), Lit.Str("aaa aa a")), "\"a a a\""),
        new TestCase(Lit.Args(Words("catt", "cat", "bat"), Lit.Str("the cattle")), "\"the cat\""),
        new TestCase(Lit.Args(Words("the"), Lit.Str("the then there")), "\"the the the\""),
        new TestCase(Lit.Args(Words("abc"), Lit.Str("ab abc abcd")), "\"ab abc abc\""),
        new TestCase(Lit.Args(Words("re", "rep", "bat"), Lit.Str("replay repeat battle bathe rebate")), "\"re re bat bat re\""),
    ];

    public string CSharpCallTemplate => "Solution.ReplaceWords({input})";
    public string PythonCallTemplate => "replace_words({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        string[] roots = ["cat", "bat", "rat"];
        var words = "the cattle was rattled by the battery".Split(' ');
        var shown = words.Select(w => (object)w).ToArray();
        var steps = new List<VisualizationStep>();
        var replaced = 0;

        Dictionary<string, object> State() => new()
        {
            ["array"] = shown,
            ["tracker"] = replaced,
            ["trackerLabel"] = "words replaced",
        };

        steps.Add(new VisualizationStep(State(), [],
            $"Insert the roots {string.Join(", ", roots)} into a trie and mark the node where each one ends. Then walk every word of the sentence."));

        for (var i = 0; i < words.Length; i++)
        {
            var word = words[i];
            string? root = null;
            var fellOffAt = -1;
            for (var len = 1; len <= word.Length; len++)
            {
                var prefix = word[..len];
                if (!roots.Any(r => r.StartsWith(prefix, StringComparison.Ordinal))) { fellOffAt = len - 1; break; }
                if (roots.Contains(prefix)) { root = prefix; break; }
            }

            string message;
            if (root is not null)
            {
                replaced++;
                shown[i] = root;
                message = $"\"{word}\": walk {string.Join(", ", root.Select(c => c.ToString()))} and land on an end mark after \"{root}\". Stop there: replace the word with \"{root}\".";
            }
            else if (fellOffAt == 0)
                message = $"\"{word}\": no root starts with '{word[0]}', so the walk falls off at once. Keep the word.";
            else if (fellOffAt > 0)
                message = $"\"{word}\": \"{word[..fellOffAt]}\" is in the trie but has no child '{word[fellOffAt]}', and no end mark was passed. Keep the word.";
            else
                message = $"\"{word}\": the word runs out before any end mark. Keep the word.";

            steps.Add(new VisualizationStep(State(), [i], message));
        }

        steps.Add(new VisualizationStep(State(), [],
            $"Result: \"{string.Join(" ", shown)}\". Each word cost at most its own length, no matter how many roots there are."));
        return steps;
    }
}
