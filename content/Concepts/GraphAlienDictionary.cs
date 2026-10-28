namespace DsaAcademy.Content.Concepts;

public class GraphAlienDictionary : IConcept
{
    public string Id => "graph-alien-dictionary";
    public string Track => "patterns";
    public string Title => "Graphs: Alien Dictionary";
    public string OneLiner => "Recover an unknown alphabet from a sorted word list: each adjacent pair of words gives one letter-before-letter rule, and a topological sort of those rules is the alphabet.";
    public string KeyTakeaway =>
        "Compare each pair of neighbouring words: the first position where they differ says letter a comes " +
        "before letter b, an edge a -> b. Everything else about the pair says nothing. Topologically sort the " +
        "letters (Kahn's algorithm); a cycle, or a word followed by its own prefix, means no valid order " +
        "exists.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "An alien language uses lowercase English letters in an unknown order. You are given its dictionary, " +
        "a list of words sorted in that order. Return a string of all the letters that appear, in an order " +
        "consistent with the dictionary, or \"\" if no order is possible. When several orders are possible, " +
        "this exercise asks for one specific one: whenever more than one letter is free to come next, take " +
        "the alphabetically smallest (a min-heap, or a sorted set, as the ready pool). For [\"wrt\", \"wrf\", " +
        "\"er\", \"ett\", \"rftt\"] the answer is \"wertf\".\n\n" +
        "Step 1, extract rules. Sorted order means each word compares less than or equal to the next. For one " +
        "adjacent pair, scan to the first position where the letters differ: that pair of letters is the only " +
        "thing the comparison tells you (\"wrt\" before \"wrf\" means t before f). Later positions tell you " +
        "nothing. Only adjacent pairs matter; non-adjacent ones follow from them.\n\n" +
        "One special case: if no position differs and the first word is longer, as in [\"abc\", \"ab\"], the list " +
        "cannot be sorted in any alphabet (a prefix always comes first), so return \"\".\n\n" +
        "Step 2, order the letters. Letters are nodes, rules are edges a -> b, and you need an order with " +
        "every edge pointing forwards: a topological sort, as in Topological Sort and Course Schedule. Count " +
        "each letter's in-degree, start with the letters that have none, repeatedly output the smallest ready " +
        "letter and decrement its successors. If fewer letters come out than exist, the rules contain a cycle " +
        "(like z before x and x before z) and the answer is \"\". Remember to include letters that appear in no " +
        "rule at all.\n\n" +
        "Building the rules reads every character once, O(C) for C total characters. The sort is over at most " +
        "26 letters and their edges, so it is tiny; with the heap it is O(U log U + E) for U distinct " +
        "letters. Overall O(C).\n\n" +
        "The visualization runs [\"wrt\", \"wrf\", \"er\", \"ett\", \"rftt\"].";

    public List<string> RecognitionSignals => [
        "An unknown ordering must be inferred from examples that are already sorted.",
        "Pairwise \"comes before\" facts and you need one total order, or to detect that none exists: topological sort.",
    ];

    public List<string> Gotchas => [
        "Only the FIRST differing character of an adjacent pair is a rule; stop scanning after it.",
        "A word followed by its own prefix ([\"abc\", \"ab\"]) is invalid even though no letters differ.",
        "Letters that appear in no rule must still be in the answer.",
        "Adding the same edge twice inflates the in-degree; keep edges in a set.",
    ];

    public List<string> ConfusableWith => [
        "Topological Sort and Course Schedule hand you the edges; here deriving the edges from the words is half the problem.",
        "Sorting words with a custom comparator (Verifying an Alien Dictionary) goes the other way: the alphabet is given and you check the list.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static string AlienOrder(string[] words)\n" +
            "    {\n" +
            "        var next = new Dictionary<char, HashSet<char>>();\n" +
            "        var indegree = new Dictionary<char, int>();\n" +
            "        foreach (var w in words)\n" +
            "            foreach (var c in w)\n" +
            "            {\n" +
            "                next.TryAdd(c, []);\n" +
            "                indegree.TryAdd(c, 0);\n" +
            "            }\n" +
            "        // TODO 1: for each adjacent pair (a, b), find the first index where they differ\n" +
            "        // and add edge a[i] -> b[i] (once; bump indegree). If none differs and\n" +
            "        // a is longer than b, return \"\".\n" +
            "        // TODO 2: Kahn's algorithm, always taking the smallest ready letter\n" +
            "        // (a SortedSet<char> or PriorityQueue). Return \"\" if not every letter came out.\n" +
            "        return \"\";\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "import heapq\n" +
            "\n" +
            "\n" +
            "def alien_order(words):\n" +
            "    nxt = {c: set() for w in words for c in w}\n" +
            "    indegree = {c: 0 for c in nxt}\n" +
            "    # TODO 1: for each adjacent pair (a, b), find the first index where they differ\n" +
            "    # and add edge a[i] -> b[i] (once; bump indegree). If none differs and\n" +
            "    # a is longer than b, return \"\".\n" +
            "    # TODO 2: Kahn's algorithm, always taking the smallest ready letter (heapq).\n" +
            "    # Return \"\" if not every letter came out.\n" +
            "    return \"\"\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.AlienOrder",
        ["python"] = "alien_order",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[\"wrt\", \"wrf\", \"er\", \"ett\", \"rftt\"]", "\"wertf\""),
        new TestCase("[\"z\", \"x\"]", "\"zx\""),
        new TestCase("[\"z\", \"x\", \"z\"]", "\"\""),
        new TestCase("[\"abc\", \"ab\"]", "\"\""),
        new TestCase("[\"z\", \"z\"]", "\"z\""),
        new TestCase("[\"ab\", \"adc\"]", "\"abcd\""),
        new TestCase("[\"baa\", \"abcd\", \"abca\", \"cab\", \"cad\"]", "\"bdac\""),
        new TestCase("[\"caa\", \"aaa\", \"aab\"]", "\"cab\""),
    ];

    public string CSharpCallTemplate => "Solution.AlienOrder({input})";
    public string PythonCallTemplate => "alien_order({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        string[] words = ["wrt", "wrf", "er", "ett", "rftt"];
        var steps = new List<VisualizationStep>();
        var rules = new List<string>();
        var next = new SortedDictionary<char, SortedSet<char>>();
        var indegree = new SortedDictionary<char, int>();
        foreach (var c in words.SelectMany(w => w)) { next.TryAdd(c, []); indegree.TryAdd(c, 0); }
        steps.Add(new(new() { ["array"] = words }, [], "Words in alien sorted order. Each adjacent pair can reveal one rule: its first differing letters."));
        for (var p = 0; p + 1 < words.Length; p++)
        {
            string a = words[p], b = words[p + 1];
            var i = 0;
            while (i < Math.Min(a.Length, b.Length) && a[i] == b[i]) i++;
            if (i < Math.Min(a.Length, b.Length) && next[a[i]].Add(b[i]))
            {
                indegree[b[i]]++;
                rules.Add($"{a[i]}<{b[i]}");
            }
            steps.Add(new(new() { ["array"] = words }, [p, p + 1],
                $"\"{a}\" before \"{b}\": first difference at index {i}, so {a[i]} comes before {b[i]}. Rules so far: {string.Join(", ", rules)}."));
        }
        var ready = new SortedSet<char>(indegree.Where(kv => kv.Value == 0).Select(kv => kv.Key));
        var order = new List<string>();
        while (ready.Count > 0)
        {
            var c = ready.Min;
            ready.Remove(c);
            order.Add(c.ToString());
            foreach (var d in next[c]) if (--indegree[d] == 0) ready.Add(d);
            steps.Add(new(new() { ["array"] = order.ToArray() }, [order.Count - 1],
                $"Output {c}, the smallest letter with no unplaced predecessor. Its successors lose one in-degree; ready now: [{string.Join(", ", ready)}]."));
        }
        steps.Add(new(new() { ["array"] = order.ToArray() }, [], $"All {order.Count} letters placed, so there was no cycle: \"{string.Concat(order)}\"."));
        return steps;
    }
}
