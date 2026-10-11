namespace DsaAcademy.Content.Concepts;

public class SegmentTreeRangeMin : IConcept
{
    public string Id => "segment-tree-range-min";
    public string Track => "range queries";
    public int Order => 142;
    public string Title => "Segment Tree: Range Minimum Query with Updates";
    public string OneLiner => "Design a RangeMinTree with update(index, val) and queryMin(left, right), both O(log n): the case a Fenwick tree can't handle.";
    public string KeyTakeaway =>
        "A segment tree works for any associative combine, not just +: swap the sum for Math.Min and the " +
        "identity 0 for int.MaxValue (infinity), and the same build, update and query give range minimums. A " +
        "Fenwick tree can't, because its range query is prefix(r) - prefix(l - 1), and there is no way to " +
        "\"subtract out\" a minimum.";
    public VisualizerKind VisualizerKind => VisualizerKind.Tree;

    public string Explanation =>
        "Build a class RangeMinTree over an int array with update(index, val), which sets nums[index] = val, and " +
        "queryMin(left, right), which returns the smallest of nums[left..right], inclusive. Range minimum query, " +
        "or RMQ, shows up directly (lowest price in a time window, closest free slot) and inside other algorithms " +
        "(lowest common ancestor via an Euler tour, longest common prefix of suffixes).\n\n" +
        "The segment tree from Range Sum Query, Mutable works unchanged once you swap two things. The combine " +
        "becomes min(left, right) instead of left + right. The value returned for a node completely outside the " +
        "query becomes the identity for min, the value that never wins: int.MaxValue in C#, float('inf') or a " +
        "large sentinel in Python. Each node then stores the minimum of its range, an update recomputes the " +
        "log n ancestors of a leaf with min, and a query takes the min of the nodes that lie completely inside " +
        "[left, right].\n\n" +
        "Why it works: min is associative, meaning min(min(a, b), c) = min(a, min(b, c)). The tree groups elements " +
        "in its own fixed way, and associativity says the grouping can't change the answer. So the same code " +
        "works for max, gcd, bitwise AND / OR / XOR, or a product modulo m.\n\n" +
        "Why a Fenwick tree doesn't: a Fenwick tree only answers prefixes, and gets a range as prefix(r) minus " +
        "prefix(l - 1). That needs an inverse operation. Knowing min(nums[0..r]) = 1 and min(nums[0..l - 1]) = 1 " +
        "tells you nothing about min(nums[l..r]).\n\n" +
        "If the array never changed, a sparse table would answer each query in O(1) after an O(n log n) build " +
        "(it precomputes the minimum of every window whose length is a power of two, and covers [l, r] with two " +
        "overlapping windows). Updates break it, which is why this problem wants a segment tree.\n\n" +
        "The harness builds new RangeMinTree(nums), then runs each operation in order: \"update\" with [index, val] " +
        "and \"queryMin\" with [left, right], and returns the queryMin results. One test has int.MaxValue in the " +
        "array, so a sentinel must not collide with real data in a way that breaks the answer.";

    public List<string> RecognitionSignals =>
    [
        "Minimum or maximum over a sliding or arbitrary range, with point updates in between.",
        "Any associative \"combine\" (min, max, gcd, AND, OR) over ranges that change: a segment tree, not a Fenwick tree.",
        "The array is static and only queried: a sparse table gives O(1) queries instead.",
    ];

    public List<string> Gotchas =>
    [
        "The outside-the-range value must be the identity for min (int.MaxValue or infinity), not 0, or every range containing a positive minimum returns 0.",
        "Don't add to the leaf: update replaces the value, then recomputes each ancestor as the min of its two children.",
        "Allocate 4n slots, and handle a 1-element array (the root is the leaf).",
    ];

    public List<string> ConfusableWith =>
    [
        "Segment Tree: Range Sum Query, Mutable (this track) is the same structure with + and identity 0.",
        "Monotonic Deque: Sliding Window Maximum (Patterns) also needs range extremes, but only for windows that slide one step at a time, so a monotonic deque does it in O(n) total.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class RangeMinTree\n" +
            "{\n" +
            "    // TODO: int n; int[] tree = new int[4 * n]; root at 1, children 2k and 2k + 1.\n" +
            "\n" +
            "    public RangeMinTree(int[] nums)\n" +
            "    {\n" +
            "        // TODO: build: leaf = nums[lo], node = Math.Min(left child, right child).\n" +
            "    }\n" +
            "\n" +
            "    public void Update(int index, int val)\n" +
            "    {\n" +
            "        // TODO: set the leaf, recompute each ancestor with Math.Min.\n" +
            "    }\n" +
            "\n" +
            "    public int QueryMin(int left, int right)\n" +
            "    {\n" +
            "        // TODO: outside -> int.MaxValue, inside -> tree[node], else min of both children.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "class RangeMinTree:\n" +
            "    def __init__(self, nums):\n" +
            "        # TODO: self.n = len(nums); self.tree = [0] * (4 * self.n); build with min.\n" +
            "        pass\n" +
            "\n" +
            "    def update(self, index, val):\n" +
            "        # TODO: set the leaf, recompute each ancestor with min.\n" +
            "        pass\n" +
            "\n" +
            "    def query_min(self, left, right):\n" +
            "        # TODO: outside -> float('inf'), inside -> tree[node], else min of both children.\n" +
            "        return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "RangeMinTree",
        ["python"] = "RangeMinTree",
    };

    public string? CSharpHarnessPreamble =>
        "public static class RangeMinHarness\n" +
        "{\n" +
        "    public static List<int> Run(int[] nums, string[] ops, int[][] args)\n" +
        "    {\n" +
        "        var obj = new RangeMinTree(nums);\n" +
        "        var results = new List<int>();\n" +
        "        for (var i = 0; i < ops.Length; i++)\n" +
        "        {\n" +
        "            if (ops[i] == \"update\") obj.Update(args[i][0], args[i][1]);\n" +
        "            else if (ops[i] == \"queryMin\") results.Add(obj.QueryMin(args[i][0], args[i][1]));\n" +
        "        }\n" +
        "        return results;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def run_range_min(nums, ops, args):\n" +
        "    obj = RangeMinTree(list(nums))\n" +
        "    results = []\n" +
        "    for op, a in zip(ops, args):\n" +
        "        if op == \"update\":\n" +
        "            obj.update(a[0], a[1])\n" +
        "        elif op == \"queryMin\":\n" +
        "            results.append(obj.query_min(a[0], a[1]))\n" +
        "    return results\n";

    private static string Ops(params string[] ops) => "[" + string.Join(", ", ops.Select(Lit.Str)) + "]";
    private static string Rows(params int[][] rows) => "[" + string.Join(", ", rows.Select(r => Lit.IntArray(r))) + "]";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([2, 1, 5, 3, 4, 2, 6, 1]),
            Ops("queryMin", "update", "queryMin", "queryMin", "queryMin"),
            Rows([2, 6], [5, 7], [2, 6], [0, 7], [4, 4])), "[2, 3, 1, 4]"),
        new TestCase(Lit.Args(Lit.IntArray([4]),
            Ops("queryMin", "update", "queryMin"),
            Rows([0, 0], [0, -3], [0, 0])), "[4, -3]"),
        new TestCase(Lit.Args(Lit.IntArray([9, 8, 7, 6, 5]),
            Ops("queryMin", "update", "queryMin", "update", "queryMin", "queryMin"),
            Rows([0, 2], [4, 10], [3, 4], [3, 11], [3, 4], [0, 4])), "[7, 6, 10, 7]"),
        new TestCase(Lit.Args(Lit.IntArray([3, -1, 4, 1, -5, 9, 2]),
            Ops("queryMin", "queryMin", "update", "queryMin", "queryMin", "update", "queryMin"),
            Rows([0, 6], [0, 3], [4, 6], [0, 6], [4, 6], [1, 8], [0, 2])), "[-5, -1, -1, 2, 3]"),
        new TestCase(Lit.Args(Lit.IntArray([2147483647, 5, 2147483647]),
            Ops("queryMin", "queryMin", "update", "queryMin", "queryMin"),
            Rows([0, 0], [0, 2], [1, 2147483647], [0, 2], [2, 2])), "[2147483647, 5, 2147483647, 2147483647]"),
        new TestCase(Lit.Args(Lit.IntArray([1, 1, 1, 1, 1, 1]),
            Ops("queryMin", "update", "queryMin", "queryMin", "update", "queryMin"),
            Rows([1, 4], [3, 0], [1, 4], [4, 5], [3, 1], [0, 5])), "[1, 0, 1, 1]"),
    ];

    public string CSharpCallTemplate => "RangeMinHarness.Run({input})";
    public string PythonCallTemplate => "run_range_min({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        var viz = new SegmentTreeViz([2, 1, 5, 3, 4, 2, 6, 1], Math.Min, int.MaxValue, "minimum");
        viz.Build();
        viz.Query(2, 6, "queryMin");
        viz.Update(5, 7);
        viz.Query(2, 6, "queryMin");
        viz.Note("Done. Same shape and same O(log n) costs as the sum tree; only the combine (min) and the identity (+infinity) changed.");
        return viz.Steps;
    }
}
