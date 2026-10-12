namespace DsaAcademy.Content.Concepts;

public class DesignLruCache : IConcept
{
    public string Id => "design-lru-cache";
    public string Track => "patterns";
    public string Title => "Design: LRU Cache";
    public string OneLiner => "A fixed-size cache that throws out the least recently used entry when it's full -- with get and put both in O(1).";
    public string KeyTakeaway =>
        "Two structures, each covering the other's weakness: a hash map finds a key's node in O(1), and a " +
        "doubly linked list keeps entries in recency order so moving a node to the front or cutting the " +
        "oldest one off the back is O(1) pointer surgery. The map stores pointers INTO the list.";
    public VisualizerKind VisualizerKind => VisualizerKind.LinkedList;

    public string Explanation =>
        "A cache with room for capacity entries supports get(key), which returns the value or -1 if the key " +
        "isn't there, and put(key, value), which inserts or updates. When a put would overflow, the entry " +
        "that was used least recently gets evicted. \"Used\" means both get and put: reading a key makes it " +
        "the most recent one. The interview requirement is that both operations run in O(1).\n\n" +
        "A hash map alone gives O(1) lookup but has no idea which key is oldest; finding it means scanning " +
        "every entry. A list ordered by recency knows the oldest (it's at the end) but finding a key inside " +
        "it is O(n). Combine them: keep the entries in a doubly linked list, most recent at the front, and " +
        "keep a map from key to that key's list node. get looks up the node in the map, unlinks it and " +
        "re-inserts it at the front. put either updates an existing node (and moves it to the front) or " +
        "creates a new one at the front; if that pushes the size past capacity, the node just before the " +
        "tail is the least recently used, so unlink it and delete its key from the map.\n\n" +
        "The list must be DOUBLY linked: to unlink a node in O(1) you need its predecessor, and a singly " +
        "linked list would make you walk to find it. Two sentinel nodes, a dummy head and a dummy tail that " +
        "are never removed, mean every real node always has a neighbor on both sides, so remove and " +
        "add-to-front are four pointer assignments each with no null checks. Each node stores its key as " +
        "well as its value, because when you evict the tail node you need its key to delete it from the map.\n\n" +
        "Most languages ship a shortcut: Python's collections.OrderedDict (move_to_end and popitem(last=False)) " +
        "and Java's LinkedHashMap with access order are exactly this structure. Mention them in an interview, " +
        "but expect to be asked to build it by hand, which is what this lesson does. Follow-ups you may hear: " +
        "make it thread-safe (one lock around both structures, since they must change together), or evict by " +
        "least FREQUENTLY used instead (LFU, which adds a map from use count to a list of keys).\n\n" +
        "The harness creates your cache with the given capacity, runs each operation in order with its " +
        "arguments ([key, value] for put, [key] for get) and returns the list of values your get calls " +
        "returned. The visualization shows the list from most recent (head) to least recent, with the get " +
        "results collected underneath.";

    public List<string> RecognitionSignals =>
    [
        "\"Design a class\" where several operations must ALL be O(1), and one of them needs an ordering (oldest, most recent) that a hash map can't give you.",
        "Bounded memory with an eviction rule based on recency: caches, \"recently viewed\" lists, browser history with a cap.",
    ];

    public List<string> Gotchas =>
    [
        "get must also move the key to the front -- forgetting that turns LRU into \"least recently inserted\" and fails as soon as an old key is read.",
        "put on an EXISTING key updates its value and refreshes it, but must not count as a new entry or trigger an eviction.",
        "Store the key inside each node: when you evict the tail node you have to delete its key from the map, and the node is all you have.",
    ];

    public List<string> ConfusableWith =>
    [
        "Hash Maps: Two Sum (Fundamentals) uses a map on its own; here the map is only half the design, and its values are list nodes rather than plain data.",
        "Top-K with a Heap (this track): a min-heap keyed by last-used time also finds the oldest entry, but every access costs O(log n) and updating a key's time inside a heap is awkward. The linked list gets the same ordering for O(1).",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class CacheNode\n" +
            "{\n" +
            "    public int Key;\n" +
            "    public int Value;\n" +
            "    public CacheNode? Prev;\n" +
            "    public CacheNode? Next;\n" +
            "    public CacheNode(int key, int value) { Key = key; Value = value; }\n" +
            "}\n\n" +
            "public class LRUCache\n" +
            "{\n" +
            "    // TODO: a Dictionary<int, CacheNode> from key to node, plus a doubly\n" +
            "    // linked list between two sentinel nodes (head and tail), most recent\n" +
            "    // right after head. Write two helpers: Remove(node) unlinks a node,\n" +
            "    // AddFront(node) inserts it right after head.\n" +
            "\n" +
            "    public LRUCache(int capacity)\n" +
            "    {\n" +
            "        // TODO: remember capacity; link head.Next = tail and tail.Prev = head.\n" +
            "    }\n" +
            "\n" +
            "    public int Get(int key)\n" +
            "    {\n" +
            "        // TODO: missing -> -1. Otherwise move the node to the front and\n" +
            "        // return its value.\n" +
            "        return -1;\n" +
            "    }\n" +
            "\n" +
            "    public void Put(int key, int value)\n" +
            "    {\n" +
            "        // TODO: existing key -> update value, move to front. New key -> if\n" +
            "        // the map is full, evict tail.Prev (remove from list AND map), then\n" +
            "        // add a new node at the front and to the map.\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "class Node:\n" +
            "    def __init__(self, key, value):\n" +
            "        self.key = key\n" +
            "        self.value = value\n" +
            "        self.prev = None\n" +
            "        self.next = None\n\n\n" +
            "class LRUCache:\n" +
            "    # TODO: build it by hand (no OrderedDict): a dict from key to Node,\n" +
            "    # plus a doubly linked list between two sentinel nodes, most recent\n" +
            "    # right after head. Write _remove(node) and _add_front(node) helpers.\n" +
            "\n" +
            "    def __init__(self, capacity):\n" +
            "        # TODO: remember capacity; link head.next = tail, tail.prev = head.\n" +
            "        pass\n" +
            "\n" +
            "    def get(self, key):\n" +
            "        # TODO: missing -> -1. Otherwise move the node to the front and\n" +
            "        # return its value.\n" +
            "        return -1\n" +
            "\n" +
            "    def put(self, key, value):\n" +
            "        # TODO: existing key -> update value, move to front. New key -> if\n" +
            "        # full, evict tail.prev (remove from list AND dict), then add a new\n" +
            "        # node at the front and to the dict.\n" +
            "        pass\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "LRUCache",
        ["python"] = "LRUCache",
    };

    public string? CSharpHarnessPreamble =>
        "public static class LruHarness\n" +
        "{\n" +
        "    public static List<int> Run(int capacity, string[] ops, int[][] args)\n" +
        "    {\n" +
        "        var cache = new LRUCache(capacity);\n" +
        "        var results = new List<int>();\n" +
        "        for (var i = 0; i < ops.Length; i++)\n" +
        "        {\n" +
        "            if (ops[i] == \"put\") cache.Put(args[i][0], args[i][1]);\n" +
        "            else if (ops[i] == \"get\") results.Add(cache.Get(args[i][0]));\n" +
        "        }\n" +
        "        return results;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def run_lru_ops(capacity, ops, args):\n" +
        "    cache = LRUCache(capacity)\n" +
        "    results = []\n" +
        "    for op, a in zip(ops, args):\n" +
        "        if op == \"put\":\n" +
        "            cache.put(a[0], a[1])\n" +
        "        elif op == \"get\":\n" +
        "            results.append(cache.get(a[0]))\n" +
        "    return results\n";

    private static string Ops(params string[] ops) => "[" + string.Join(", ", ops.Select(Lit.Str)) + "]";
    private static string Rows(params int[][] rows) => "[" + string.Join(", ", rows.Select(r => Lit.IntArray(r))) + "]";

    public List<TestCase> TestCases =>
    [
        new TestCase(
            Lit.Args(Lit.Int(2),
                Ops("put", "put", "get", "put", "get", "put", "get", "get", "get"),
                Rows([1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4])),
            "[1,-1,-1,3,4]"),
        new TestCase(
            Lit.Args(Lit.Int(1),
                Ops("put", "get", "put", "get", "get"),
                Rows([2, 1], [2], [3, 2], [2], [3])),
            "[1,-1,2]"),
        new TestCase(
            Lit.Args(Lit.Int(2),
                Ops("put", "put", "put", "put", "get", "get", "get"),
                Rows([1, 1], [2, 2], [1, 10], [3, 3], [1], [2], [3])),
            "[10,-1,3]"),
        new TestCase(
            Lit.Args(Lit.Int(2),
                Ops("get"),
                Rows([1])),
            "[-1]"),
        new TestCase(
            Lit.Args(Lit.Int(2),
                Ops("put", "put", "get", "put", "get", "get", "get"),
                Rows([1, 1], [2, 2], [1], [3, 3], [1], [2], [3])),
            "[1,1,-1,3]"),
        new TestCase(
            Lit.Args(Lit.Int(3),
                Ops("put", "put", "put", "get", "put", "get", "get", "put", "get", "get", "get"),
                Rows([1, 100], [2, 200], [3, 300], [2], [4, 400], [1], [3], [5, 500], [2], [4], [5])),
            "[200,-1,300,-1,400,500]"),
    ];

    public string CSharpCallTemplate => "LruHarness.Run({input})";
    public string PythonCallTemplate => "run_lru_ops({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int capacity = 2;
        // Most recent first, exactly like the real list between head and tail.
        var order = new List<(int Key, int Value)>();
        var gets = new List<int>();
        var steps = new List<VisualizationStep>();

        VisualizationStep Step(int highlight, string message) => new(
            State: new Dictionary<string, object>
            {
                ["nodes"] = order.Select(e => (object)$"{e.Key}={e.Value}").ToArray(),
                ["collected"] = gets.ToArray(),
            },
            HighlightIndices: highlight >= 0 ? [highlight] : [],
            Message: message
        );

        steps.Add(Step(-1, $"Capacity {capacity}. The list runs from most recent (head) to least recent (just before null). \"collected\" holds what each get returned."));

        void Put(int key, int value)
        {
            var at = order.FindIndex(e => e.Key == key);
            if (at >= 0)
            {
                order.RemoveAt(at);
                order.Insert(0, (key, value));
                steps.Add(Step(0, $"put({key}, {value}): key {key} exists, so update its value and move it to the front. No eviction."));
                return;
            }
            string evicted = "";
            if (order.Count == capacity)
            {
                var lru = order[^1];
                order.RemoveAt(order.Count - 1);
                evicted = $" The cache was full, so the least recent entry, key {lru.Key} (the node before tail), is unlinked and deleted from the map.";
            }
            order.Insert(0, (key, value));
            steps.Add(Step(0, $"put({key}, {value}): new key, added at the front and to the map.{evicted}"));
        }

        void Get(int key)
        {
            var at = order.FindIndex(e => e.Key == key);
            if (at < 0)
            {
                gets.Add(-1);
                steps.Add(Step(-1, $"get({key}): the map has no key {key}, so return -1. Nothing moves."));
                return;
            }
            var entry = order[at];
            order.RemoveAt(at);
            order.Insert(0, entry);
            gets.Add(entry.Value);
            steps.Add(Step(0, at == 0
                ? $"get({key}): the map points straight at its node, already at the front. Return {entry.Value}."
                : $"get({key}): the map points straight at its node; unlink it and re-insert it at the front, so it's now the most recent. Return {entry.Value}."));
        }

        Put(1, 1);
        Put(2, 2);
        Get(1);
        Put(3, 3);
        Get(2);
        Put(1, 10);
        Put(4, 4);
        Get(3);
        Get(1);

        steps.Add(Step(-1, $"Done. Every operation was one map lookup plus a few pointer changes: O(1). get results: [{string.Join(", ", gets)}]."));
        return steps;
    }
}
