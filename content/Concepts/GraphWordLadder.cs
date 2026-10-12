namespace DsaAcademy.Content.Concepts;

public class GraphWordLadder : IConcept
{
    public string Id => "graph-word-ladder";
    public string Track => "patterns";
    public string Title => "BFS on an Implicit Graph: Word Ladder";
    public string OneLiner => "The fewest one-letter changes from one word to another: the words are nodes, \"differs by one letter\" is an edge, and BFS finds the shortest path.";
    public string KeyTakeaway =>
        "Nobody hands you the graph, but it is there: each word is a node, and two words are joined when they " +
        "differ in exactly one position. Every step costs the same, so BFS finds the shortest ladder. To find a " +
        "word's neighbours fast, group the word list by wildcard patterns (\"hot\" belongs to \"*ot\", \"h*t\" and " +
        "\"ho*\"): words in the same bucket are exactly one change apart.";
    public VisualizerKind VisualizerKind => VisualizerKind.Graph;

    public string Explanation =>
        "Given beginWord, endWord and a list of allowed words, a ladder changes one letter at a time, and every " +
        "word after beginWord (including endWord) must be in wordList. Return the number of words in the " +
        "shortest ladder, counting both ends, or 0 if there is none. All words have the same length and use " +
        "lowercase letters. beginWord does not have to be in the list. For \"hit\" to \"cog\" with [hot, dot, " +
        "dog, lot, log, cog] the answer is 5: hit, hot, dot, dog, cog.\n\n" +
        "Treat it as a graph. The nodes are the words, and there is an edge between two words that differ in " +
        "exactly one position. Each change costs one step, so \"shortest ladder\" is \"shortest path in an " +
        "unweighted graph\", which is what BFS gives you: it explores every word 1 change away, then every word " +
        "2 changes away, and so on, so the first time it dequeues endWord it has found the shortest ladder. DFS " +
        "would find some ladder, not necessarily the shortest.\n\n" +
        "The part that needs thought is finding neighbours without building every edge. Comparing a word with " +
        "every other word costs O(n · L) per word and O(n² · L) overall. Instead, build wildcard buckets once: " +
        "for each word and each position i, replace letter i with '*' and add the word to that pattern's " +
        "bucket. \"hot\" goes into \"*ot\", \"h*t\" and \"ho*\"; \"dot\" goes into \"*ot\", \"d*t\" and \"do*\". Two words " +
        "are neighbours exactly when they share a bucket, so during BFS you generate the current word's L " +
        "patterns and read the words in those buckets. Building each pattern costs O(L), so the total is " +
        "O(n · L²) time and O(n · L²) space for the buckets. (The other common approach tries all 26 letters at " +
        "every position and checks a set: O(n · 26 · L²), which is fine for lowercase words.)\n\n" +
        "The BFS itself: if endWord isn't in the list, return 0 straight away. Start the queue with (beginWord, " +
        "1) and mark it visited. Dequeue (word, length); if word is endWord, return length. Otherwise, for each " +
        "pattern of word, enqueue every unvisited word in that bucket with length + 1, marking it visited as it " +
        "is enqueued. A useful extra: once a bucket has been read, empty it. Every word in it is now visited, " +
        "so reading it again later would only find words to skip. If the queue runs out, return 0.\n\n" +
        "Faster still is bidirectional BFS: search from both ends at once, always expanding the smaller " +
        "frontier, and stop when the two meet. A related follow-up returns every shortest ladder, not just the " +
        "length, which needs the BFS to record each word's parents. The visualization runs the example above; " +
        "the label under each node is its word and its ladder length once BFS reaches it.";

    public List<string> RecognitionSignals =>
    [
        "\"Fewest steps\", \"minimum number of moves\" or \"shortest sequence\" where every move costs the same, but the states are words, combinations, or board positions instead of graph nodes.",
        "You can describe one move (change one letter, turn one dial, swap two tiles) but you are not given an edge list: the graph is implicit and you generate neighbours on the fly.",
        "A list of allowed or forbidden states that every intermediate step must respect.",
    ];

    public List<string> Gotchas =>
    [
        "Mark a word visited when you ENQUEUE it, not when you dequeue it. Otherwise the same word can sit in the queue many times and the search slows down badly.",
        "The answer counts words, not changes: hit -> hot is a ladder of 2. Start the length at 1 for beginWord.",
        "If endWord is not in wordList there is no valid ladder at all, even when it is one letter away from beginWord. Return 0.",
        "Comparing every pair of words to build edges is O(n² · L) and times out on large lists; generate neighbours through wildcard buckets (or by trying 26 letters per position) instead.",
    ];

    public List<string> ConfusableWith =>
    [
        "Grid BFS: Rotting Oranges (this track) is also BFS counting layers, but on a grid where the neighbours are given by geometry. Here working out who the neighbours are is half the problem.",
        "Dijkstra's Algorithm finds shortest paths when steps cost different amounts. Every change here costs 1, so plain BFS is enough and simpler.",
        "Backtracking: Word Search (this track) also builds words letter by letter, but it has to explore every path and undo choices. A shortest-path question wants BFS, which never revisits a word.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int LadderLength(string beginWord, string endWord, string[] wordList)\n" +
            "    {\n" +
            "        // TODO: if endWord isn't in wordList, return 0. Build buckets: for each\n" +
            "        // word and each position i, add the word to the bucket for the pattern\n" +
            "        // word[..i] + \"*\" + word[(i + 1)..]. BFS from (beginWord, 1), marking\n" +
            "        // words visited as you enqueue them. When you dequeue endWord, return\n" +
            "        // its length; otherwise enqueue every unvisited word in each of its\n" +
            "        // patterns' buckets with length + 1. Queue empty: return 0.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def ladder_length(begin_word, end_word, word_list):\n" +
            "    # TODO: if end_word isn't in word_list, return 0. Build buckets: for each\n" +
            "    # word and each position i, add the word to the bucket for the pattern\n" +
            "    # word[:i] + \"*\" + word[i + 1:]. BFS from (begin_word, 1), marking words\n" +
            "    # visited as you enqueue them. When you dequeue end_word, return its\n" +
            "    # length; otherwise enqueue every unvisited word in each of its patterns'\n" +
            "    # buckets with length + 1. Queue empty: return 0.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.LadderLength",
        ["python"] = "ladder_length",
    };

    private static string Words(params string[] words) => "[" + string.Join(", ", words.Select(Lit.Str)) + "]";
    private static string Case(string begin, string end, params string[] words) => Lit.Args(Lit.Str(begin), Lit.Str(end), Words(words));

    public List<TestCase> TestCases =>
    [
        new TestCase(Case("hit", "cog", "hot", "dot", "dog", "lot", "log", "cog"), "5"),
        new TestCase(Case("hit", "cog", "hot", "dot", "dog", "lot", "log"), "0"),
        new TestCase(Case("a", "c", "a", "b", "c"), "2"),
        new TestCase(Case("hot", "dog", "hot", "dog"), "0"),
        new TestCase(Case("hot", "dog", "hot", "dot", "dog"), "3"),
        new TestCase(Case("hit", "hot"), "0"),
        new TestCase(Case("red", "tax", "ted", "tex", "red", "tax", "tad", "den", "rex", "pee"), "4"),
        new TestCase(Case("cold", "warm", "cord", "card", "ward", "warm", "worm", "word", "wore", "core", "cold"), "5"),
    ];

    public string CSharpCallTemplate => "Solution.LadderLength({input})";
    public string PythonCallTemplate => "ladder_length({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        string[] words = ["hit", "hot", "dot", "lot", "dog", "log", "cog"];
        const string end = "cog";
        var positions = new Dictionary<string, object>
        {
            ["0"] = new { x = 50, y = 100 },
            ["1"] = new { x = 150, y = 100 },
            ["2"] = new { x = 260, y = 50 },
            ["3"] = new { x = 260, y = 150 },
            ["4"] = new { x = 390, y = 50 },
            ["5"] = new { x = 390, y = 150 },
            ["6"] = new { x = 510, y = 100 },
        };
        var n = words.Length;

        // Every pair one letter apart is an edge of the implicit graph.
        var edges = new List<int[]>();
        for (var i = 0; i < n; i++)
            for (var j = i + 1; j < n; j++)
                if (words[i].Zip(words[j]).Count(p => p.First != p.Second) == 1) edges.Add([i, j]);
        var edgeArray = edges.ToArray();
        int EdgeIndex(int a, int b) => Array.FindIndex(edgeArray, e => (e[0] == a && e[1] == b) || (e[0] == b && e[1] == a));

        // Buckets come from the word list only (beginWord "hit" is not in it).
        var buckets = new Dictionary<string, List<int>>();
        for (var i = 1; i < n; i++)
            for (var k = 0; k < 3; k++)
            {
                var pattern = words[i][..k] + "*" + words[i][(k + 1)..];
                if (!buckets.TryGetValue(pattern, out var list)) buckets[pattern] = list = [];
                list.Add(i);
            }

        var length = new int?[n];
        var parent = new int[n];
        Array.Fill(parent, -1);
        var done = new List<int>();
        var queue = new Queue<int>();
        var treeEdges = new List<int>();
        var steps = new List<VisualizationStep>();

        Dictionary<string, object> Snapshot(int? current, IEnumerable<int> chosen) => new()
        {
            ["positions"] = positions,
            ["edges"] = edgeArray,
            ["visited"] = done.ToArray(),
            ["frontier"] = queue.ToArray(),
            ["current"] = current,
            ["distances"] = Enumerable.Range(0, n).ToDictionary(i => i.ToString(), i => length[i] is { } l ? $"{words[i]} ({l})" : words[i]),
            ["chosenEdges"] = chosen.ToArray(),
        };

        steps.Add(new VisualizationStep(
            Snapshot(null, []),
            [],
            "Words one letter apart are joined. The graph isn't given: BFS discovers it through buckets like \"*ot\" = [hot, dot, lot], \"do*\" = [dot, dog] and \"*og\" = [dog, log, cog], built once from the word list."
        ));

        length[0] = 1;
        queue.Enqueue(0);
        steps.Add(new VisualizationStep(
            Snapshot(null, []),
            [0],
            "Start the queue with hit at ladder length 1 and mark it visited."
        ));

        while (queue.Count > 0)
        {
            var u = queue.Dequeue();
            if (words[u] == end)
            {
                done.Add(u);
                var path = new List<int>();
                for (var w = u; w != -1; w = parent[w]) path.Add(w);
                path.Reverse();
                var pathEdges = path.Zip(path.Skip(1)).Select(p => EdgeIndex(p.First, p.Second));
                steps.Add(new VisualizationStep(
                    Snapshot(u, pathEdges),
                    path.ToArray(),
                    $"Dequeue {end} at length {length[u]}: that is the answer. Following parents back gives {string.Join(" -> ", path.Select(i => words[i]))}. BFS reached it in the first layer it could, so no shorter ladder exists."
                ));
                return steps;
            }

            var found = new List<string>();
            var patternsRead = new List<string>();
            for (var k = 0; k < words[u].Length; k++)
            {
                var pattern = words[u][..k] + "*" + words[u][(k + 1)..];
                if (!buckets.TryGetValue(pattern, out var bucket) || bucket.Count == 0) continue;
                patternsRead.Add(pattern);
                foreach (var v in bucket)
                {
                    if (length[v] != null) continue;
                    length[v] = length[u] + 1;
                    parent[v] = u;
                    queue.Enqueue(v);
                    treeEdges.Add(EdgeIndex(u, v));
                    found.Add(words[v]);
                }
                bucket.Clear(); // everything in it is visited now
            }
            done.Add(u);
            var read = patternsRead.Count > 0 ? $"Its non-empty buckets: {string.Join(", ", patternsRead.Select(p => $"\"{p}\""))}. " : "All of its buckets were already emptied. ";
            steps.Add(new VisualizationStep(
                Snapshot(u, treeEdges),
                [u],
                $"Dequeue {words[u]} (length {length[u]}). {read}" +
                (found.Count > 0
                    ? $"Enqueue the unvisited {(found.Count == 1 ? "word" : "words")} {string.Join(" and ", found)} at length {length[u] + 1}, then empty {(patternsRead.Count == 1 ? "that bucket" : "those buckets")}."
                    : $"Every word in {(patternsRead.Count == 1 ? "it" : "them")} is already visited, so nothing new is enqueued.")
            ));
        }

        return steps;
    }
}
