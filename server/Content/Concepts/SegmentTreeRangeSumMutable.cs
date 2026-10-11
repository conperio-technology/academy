namespace DsaAcademy.Content.Concepts;

public class SegmentTreeRangeSumMutable : IConcept
{
    public string Id => "segment-tree-range-sum-mutable";
    public string Track => "range queries";
    public int Order => 142;
    public string Title => "Segment Tree: Range Sum Query, Mutable";
    public string OneLiner => "Design a NumArray that supports update(index, val) and sumRange(left, right) on a changing array, both in O(log n).";
    public string KeyTakeaway =>
        "Prefix sums make queries O(1) but every update O(n); a segment tree makes both O(log n). Each node " +
        "stores the sum of a range, an update rewrites one leaf and its log n ancestors, and a query adds up the " +
        "few nodes that sit completely inside [left, right]. Store it in an array of size 4n with node k's " +
        "children at 2k and 2k + 1 (or 2k + 1 and 2k + 2 when the root is 0).";
    public VisualizerKind VisualizerKind => VisualizerKind.Tree;

    public string Explanation =>
        "Build a class NumArray over an int array with two operations: update(index, val) sets nums[index] = val, " +
        "and sumRange(left, right) returns nums[left] + ... + nums[right], inclusive. Updates and queries are mixed " +
        "in any order, up to tens of thousands of each, so both must be fast. This is LeetCode 307 and a classic " +
        "follow-up to the Prefix Sums lesson: a prefix array answers sumRange in O(1), but changing one element " +
        "shifts every prefix after it, an O(n) repair per update.\n\n" +
        "A segment tree is a binary tree where every node stores the sum of a contiguous range of indices. The " +
        "root covers [0, n - 1]. A node covering [lo, hi] splits at mid = (lo + hi) / 2: its left child covers " +
        "[lo, mid] and its right child [mid + 1, hi]. Leaves cover a single index. It is stored in a plain array " +
        "the same way a heap is: with the root at 1, node k has children 2k and 2k + 1, and an array of 4n slots " +
        "is always big enough.\n\n" +
        "Build (O(n)): recurse to the leaves, set each leaf to its element, and on the way back up set each node " +
        "to left + right.\n\n" +
        "Update (O(log n)): walk from the root towards the leaf for index, choosing the left child when index <= " +
        "mid. Set the leaf, then recompute every node on the way back up. That is one node per level, and the tree " +
        "has about log2(n) levels.\n\n" +
        "Query (O(log n)): ask the root for [left, right]. A node whose range is completely outside the query " +
        "returns 0, the identity for sums (the value that changes nothing when added). A node completely inside " +
        "returns its stored sum without going deeper. A node that partly overlaps asks both children and adds " +
        "the answers. The query range is split into at most about 2 log n fully covered nodes, so very little is " +
        "visited.\n\n" +
        "A Fenwick tree (see the Range Queries tool) also solves this in O(log n) with less code: keep a copy of " +
        "nums, and turn update into add(index + 1, val - nums[index]). Either is a full-marks answer; say which you " +
        "chose and why.\n\n" +
        "The harness builds new NumArray(nums), then runs each operation in order: \"update\" with [index, val] and " +
        "\"sumRange\" with [left, right]. It returns the results of the sumRange calls. Indices are always valid. " +
        "The visualization builds a tree over 8 numbers, updates one, and runs a query.";

    public List<string> RecognitionSignals =>
    [
        "Range sums (or counts) on an array that also CHANGES between queries.",
        "\"Design a class\" with update(i, val) and a range query, each to be faster than O(n).",
        "Prefix sums would work if the array were static, but updates would force a rebuild.",
    ];

    public List<string> Gotchas =>
    [
        "Size the array 4n, not 2n: with the recursive split, a tree over n elements that is not a power of two can use indices past 2n.",
        "Outside a query a node must return the identity (0 for a sum), not skip silently; and the inside check is left <= lo && hi <= right, both ends inclusive.",
        "An update has to recompute every ancestor on the way back up, not just the leaf.",
        "With a Fenwick tree, update sets a value, so add the difference val - nums[index] and remember the new value.",
    ];

    public List<string> ConfusableWith =>
    [
        "Prefix Sums: Answer Range-Sum Queries in O(1) (Patterns) is the static version: no updates, O(1) queries.",
        "Segment Tree: Range Minimum Query with Updates (this track) is the same tree with min instead of +, which a Fenwick tree cannot do.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class NumArray\n" +
            "{\n" +
            "    // TODO: int n; int[] tree = new int[4 * n]; root at index 1,\n" +
            "    // node k's children at 2k and 2k + 1.\n" +
            "\n" +
            "    public NumArray(int[] nums)\n" +
            "    {\n" +
            "        // TODO: build recursively: leaf = nums[lo], node = left + right.\n" +
            "    }\n" +
            "\n" +
            "    public void Update(int index, int val)\n" +
            "    {\n" +
            "        // TODO: go down to the leaf for index, set it, recompute ancestors.\n" +
            "    }\n" +
            "\n" +
            "    public int SumRange(int left, int right)\n" +
            "    {\n" +
            "        // TODO: outside -> 0, fully inside -> tree[node], else both children.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "class NumArray:\n" +
            "    def __init__(self, nums):\n" +
            "        # TODO: self.n = len(nums); self.tree = [0] * (4 * self.n);\n" +
            "        # root at 1, node k's children at 2k and 2k + 1. Build recursively.\n" +
            "        pass\n" +
            "\n" +
            "    def update(self, index, val):\n" +
            "        # TODO: go down to the leaf for index, set it, recompute ancestors.\n" +
            "        pass\n" +
            "\n" +
            "    def sum_range(self, left, right):\n" +
            "        # TODO: outside -> 0, fully inside -> tree[node], else both children.\n" +
            "        return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "NumArray",
        ["python"] = "NumArray",
    };

    public string? CSharpHarnessPreamble =>
        "public static class NumArrayHarness\n" +
        "{\n" +
        "    public static List<int> Run(int[] nums, string[] ops, int[][] args)\n" +
        "    {\n" +
        "        var obj = new NumArray(nums);\n" +
        "        var results = new List<int>();\n" +
        "        for (var i = 0; i < ops.Length; i++)\n" +
        "        {\n" +
        "            if (ops[i] == \"update\") obj.Update(args[i][0], args[i][1]);\n" +
        "            else if (ops[i] == \"sumRange\") results.Add(obj.SumRange(args[i][0], args[i][1]));\n" +
        "        }\n" +
        "        return results;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def run_num_array(nums, ops, args):\n" +
        "    obj = NumArray(list(nums))\n" +
        "    results = []\n" +
        "    for op, a in zip(ops, args):\n" +
        "        if op == \"update\":\n" +
        "            obj.update(a[0], a[1])\n" +
        "        elif op == \"sumRange\":\n" +
        "            results.append(obj.sum_range(a[0], a[1]))\n" +
        "    return results\n";

    private static string Ops(params string[] ops) => "[" + string.Join(", ", ops.Select(Lit.Str)) + "]";
    private static string Rows(params int[][] rows) => "[" + string.Join(", ", rows.Select(r => Lit.IntArray(r))) + "]";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([1, 3, 5]),
            Ops("sumRange", "update", "sumRange"),
            Rows([0, 2], [1, 2], [0, 2])), "[9, 8]"),
        new TestCase(Lit.Args(Lit.IntArray([2, 1, 5, 3, 4, 2, 6, 1]),
            Ops("sumRange", "update", "sumRange", "sumRange", "sumRange"),
            Rows([1, 5], [2, 0], [1, 5], [0, 7], [2, 2])), "[15, 10, 19, 0]"),
        new TestCase(Lit.Args(Lit.IntArray([7]),
            Ops("sumRange", "update", "sumRange"),
            Rows([0, 0], [0, -4], [0, 0])), "[7, -4]"),
        new TestCase(Lit.Args(Lit.IntArray([-2, 0, 3, -5, 2, -1, 4]),
            Ops("sumRange", "sumRange", "update", "sumRange", "update", "sumRange", "sumRange"),
            Rows([0, 2], [2, 5], [3, 5], [0, 6], [6, -10], [4, 6], [3, 3])), "[1, -1, 11, -9, 5]"),
        new TestCase(Lit.Args(Lit.IntArray([0, 0, 0, 0, 0]),
            Ops("update", "update", "update", "sumRange", "sumRange", "update", "sumRange", "update", "sumRange"),
            Rows([0, 1], [4, 2], [2, 3], [0, 4], [1, 3], [2, 3], [2, 4], [0, 0], [0, 1])), "[6, 3, 5, 0]"),
        new TestCase(Lit.Args(Lit.IntArray([5, -3, 8, 1, 9, -6, 2, 7, 4, -1, 3, 0]),
            Ops("sumRange", "sumRange", "update", "update", "sumRange", "sumRange", "sumRange"),
            Rows([0, 11], [5, 9], [11, 10], [0, -5], [0, 11], [10, 11], [1, 1])), "[29, 6, 29, 13, -3]"),
    ];

    public string CSharpCallTemplate => "NumArrayHarness.Run({input})";
    public string PythonCallTemplate => "run_num_array({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        var viz = new SegmentTreeViz([2, 1, 5, 3, 4, 2, 6, 1], (a, b) => a + b, 0, "sum");
        viz.Build();
        viz.Query(1, 5, "sumRange");
        viz.Update(2, 0);
        viz.Query(1, 5, "sumRange");
        viz.Note("Done. Build O(n), and every update and query O(log n). With a prefix array the update would have rewritten 6 prefixes; here it rewrote 4 nodes, and for n = 100,000 it would still be only about 18.");
        return viz.Steps;
    }
}
