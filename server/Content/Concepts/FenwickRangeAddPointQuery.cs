namespace DsaAcademy.Content.Concepts;

public class FenwickRangeAddPointQuery : IConcept
{
    public string Id => "fenwick-range-add-point-query";
    public string Track => "range queries";
    public int Order => 142;
    public string Title => "Fenwick Tree: Range Add, Point Query";
    public string OneLiner => "Design a RangeAdder with addRange(left, right, delta) and get(index), both O(log n), by keeping a difference array inside a Fenwick tree.";
    public string KeyTakeaway =>
        "Turn a range update into two point updates with a difference array: add delta at left and -delta at " +
        "right + 1, and the current value at i is the original nums[i] plus the prefix sum of the differences up " +
        "to i. A Fenwick tree does both of those in O(log n): add climbs with i += i & -i, prefix descends with " +
        "i -= i & -i.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Build a class RangeAdder over an int array with addRange(left, right, delta), which adds delta to every " +
        "element from left to right inclusive, and get(index), which returns the current value of nums[index]. " +
        "Looping over the range makes addRange O(n); the goal is O(log n) for both.\n\n" +
        "Step 1, the difference array. Keep diff where diff[i] is how much element i has changed relative to " +
        "element i - 1 since the start. Adding delta to [left, right] only changes two differences: diff[left] " +
        "+= delta (from here on, everything is delta higher) and diff[right + 1] -= delta (from here on, it " +
        "isn't). The total change at i is then diff[0] + ... + diff[i], a prefix sum. So a range update became " +
        "two point updates, and a point query became a prefix sum.\n\n" +
        "Step 2, a Fenwick tree for \"point update, prefix sum\". A Fenwick tree, or binary indexed tree (BIT), is " +
        "an array tree[1..n], indexed from 1, where tree[i] holds the sum of the last lowbit(i) entries ending at " +
        "i. lowbit(i) = i & -i is the value of i's lowest set bit (the lowest 1 bit): lowbit(6) = lowbit(110) = 2, " +
        "so tree[6] covers positions 5 and 6; lowbit(8) = 8, so tree[8] covers 1 to 8.\n\n" +
        "add(i, delta): for (; i <= n; i += i & -i) tree[i] += delta. Adding the lowest set bit jumps to the next " +
        "cell whose range also contains i: 3 -> 4 -> 8 -> 16.\n\n" +
        "prefix(i): for (; i > 0; i -= i & -i) sum += tree[i]. Clearing the lowest set bit jumps to the cell just " +
        "before this one's range: 7 -> 6 -> 4 -> 0, adding the ranges [7], [5..6] and [1..4].\n\n" +
        "Each loop runs at most once per bit of i, so both are O(log n). Two details. The tree is 1-indexed " +
        "because lowbit(0) = 0 and i += 0 would loop forever, so shift array index i to tree index i + 1. And " +
        "right + 1 can be past the end; skip that add (nothing after the array needs cancelling), or size the " +
        "tree n + 1.\n\n" +
        "get(index) = nums[index] + prefix(index + 1). Keep the original nums; the tree only stores changes.\n\n" +
        "The harness builds new RangeAdder(nums), then runs \"addRange\" with [left, right, delta] and \"get\" with " +
        "[index] in order, returning the get results. The visualization shows the tree array (cell 0 unused) " +
        "during two range adds and a few gets.";

    public List<string> RecognitionSignals =>
    [
        "Many \"add x to every element in [l, r]\" operations, mixed with reads of single elements.",
        "A range update you could do with a difference array, except that queries come in between the updates.",
        "Counting how many intervals cover a point, as the intervals arrive one by one.",
    ];

    public List<string> Gotchas =>
    [
        "Fenwick trees are 1-indexed: i & -i is 0 for i = 0, so add(0, ...) never terminates. Use tree index = array index + 1.",
        "The cancelling -delta goes at right + 1, not right; when right is the last index there is nothing to cancel.",
        "get returns the original value plus the accumulated change, so keep a copy of nums.",
        "If every update came before every query, a plain difference array and one prefix pass would be O(n + q) with no tree at all.",
    ];

    public List<string> ConfusableWith =>
    [
        "Segment Tree: Range Sum Query, Mutable (this track) is the opposite pairing: point update, range query. A Fenwick tree does that one directly with add and prefix(r) - prefix(l - 1).",
        "Range add AND range sum together need either lazy propagation in a segment tree or two Fenwick trees (see Lazy Propagation in this track).",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class RangeAdder\n" +
            "{\n" +
            "    // TODO: int[] original; int[] tree = new int[n + 2] (1-indexed, room for right + 2).\n" +
            "\n" +
            "    public RangeAdder(int[] nums)\n" +
            "    {\n" +
            "        // TODO: keep a copy of nums; the tree starts as all zeros.\n" +
            "    }\n" +
            "\n" +
            "    public void AddRange(int left, int right, int delta)\n" +
            "    {\n" +
            "        // TODO: Add(left + 1, delta); Add(right + 2, -delta).\n" +
            "        // Add(i, d): while (i < tree.Length) { tree[i] += d; i += i & -i; }\n" +
            "    }\n" +
            "\n" +
            "    public int Get(int index)\n" +
            "    {\n" +
            "        // TODO: original[index] + Prefix(index + 1).\n" +
            "        // Prefix(i): while (i > 0) { sum += tree[i]; i -= i & -i; }\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "class RangeAdder:\n" +
            "    def __init__(self, nums):\n" +
            "        # TODO: self.original = list(nums); self.tree = [0] * (len(nums) + 2)\n" +
            "        pass\n" +
            "\n" +
            "    def add_range(self, left, right, delta):\n" +
            "        # TODO: self._add(left + 1, delta); self._add(right + 2, -delta)\n" +
            "        # _add(i, d): while i < len(tree): tree[i] += d; i += i & -i\n" +
            "        pass\n" +
            "\n" +
            "    def get(self, index):\n" +
            "        # TODO: self.original[index] + prefix(index + 1)\n" +
            "        # prefix(i): while i > 0: s += tree[i]; i -= i & -i\n" +
            "        return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "RangeAdder",
        ["python"] = "RangeAdder",
    };

    public string? CSharpHarnessPreamble =>
        "public static class RangeAdderHarness\n" +
        "{\n" +
        "    public static List<int> Run(int[] nums, string[] ops, int[][] args)\n" +
        "    {\n" +
        "        var obj = new RangeAdder(nums);\n" +
        "        var results = new List<int>();\n" +
        "        for (var i = 0; i < ops.Length; i++)\n" +
        "        {\n" +
        "            if (ops[i] == \"addRange\") obj.AddRange(args[i][0], args[i][1], args[i][2]);\n" +
        "            else if (ops[i] == \"get\") results.Add(obj.Get(args[i][0]));\n" +
        "        }\n" +
        "        return results;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def run_range_adder(nums, ops, args):\n" +
        "    obj = RangeAdder(list(nums))\n" +
        "    results = []\n" +
        "    for op, a in zip(ops, args):\n" +
        "        if op == \"addRange\":\n" +
        "            obj.add_range(a[0], a[1], a[2])\n" +
        "        elif op == \"get\":\n" +
        "            results.append(obj.get(a[0]))\n" +
        "    return results\n";

    private static string Ops(params string[] ops) => "[" + string.Join(", ", ops.Select(Lit.Str)) + "]";
    private static string Rows(params int[][] rows) => "[" + string.Join(", ", rows.Select(r => Lit.IntArray(r))) + "]";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4, 5]),
            Ops("addRange", "get", "get", "get", "get"),
            Rows([1, 3, 10], [0], [1], [3], [4])), "[1, 12, 14, 5]"),
        new TestCase(Lit.Args(Lit.IntArray([0, 0, 0, 0, 0, 0, 0, 0]),
            Ops("addRange", "addRange", "get", "get", "addRange", "get", "get"),
            Rows([2, 5, 3], [0, 7, -1], [2], [6], [4, 4, 5], [4], [5])), "[2, -1, 7, 2]"),
        new TestCase(Lit.Args(Lit.IntArray([7]),
            Ops("get", "addRange", "get"),
            Rows([0], [0, 0, -7], [0])), "[7, 0]"),
        new TestCase(Lit.Args(Lit.IntArray([5, -2, 4, 0, 3, 1]),
            Ops("addRange", "addRange", "addRange", "get", "get", "get", "addRange", "get", "get"),
            Rows([0, 5, 2], [0, 0, 1], [5, 5, -4], [0], [3], [5], [1, 4, -3], [1], [4])), "[8, 2, -1, -3, 2]"),
        new TestCase(Lit.Args(Lit.IntArray([10, 20, 30]),
            Ops("get", "get", "addRange", "addRange", "get", "get", "get"),
            Rows([2], [1], [0, 1, 5], [1, 2, 5], [0], [1], [2])), "[30, 20, 15, 30, 35]"),
    ];

    public string CSharpCallTemplate => "RangeAdderHarness.Run({input})";
    public string PythonCallTemplate => "run_range_adder({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [0, 0, 0, 0, 0, 0, 0, 0];
        var viz = new FenwickViz(nums.Length + 1, "last result");
        viz.Note("nums = [0, 0, 0, 0, 0, 0, 0, 0]. The array below is the Fenwick tree over the difference array, cells 1 to 9 (cell 0 is unused). tree[i] covers the lowbit(i) = i & -i positions ending at i.");
        viz.Add(3, 5, "addRange(2, 6, +5) becomes two point updates on the differences. First, at tree index 2 + 1 = 3:", 0);
        viz.Add(8, -5, "Then the cancelling -5 at tree index 6 + 2 = 8:", 0);
        long last = viz.Prefix(5, "get(4) = nums[4] +", 0);
        viz.Note($"get(4) = 0 + {last} = {last}: index 4 is inside [2, 6].", last);
        last = viz.Prefix(8, "get(7) = nums[7] +", last);
        viz.Note($"get(7) = 0 + {last} = {last}: the +5 and -5 cancel after the range ends.", last);
        viz.Add(1, 2, "addRange(0, 3, +2): +2 at tree index 1,", last);
        viz.Add(5, -2, "and -2 at tree index 3 + 2 = 5:", last);
        last = viz.Prefix(3, "get(2) = nums[2] +", last);
        viz.Note($"get(2) = 0 + {last} = {last}: inside both ranges, 5 + 2. Every add and every get touched at most 4 cells, about log2(9).", last);
        return viz.Steps;
    }
}
