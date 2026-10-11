namespace DsaAcademy.Content.Concepts;

// Shared step builders for the range-query lessons (segment trees and Fenwick trees), so
// each concept file only picks its sample data. Segment trees are drawn by the Tree
// visualizer as a level-order array (node k's children are 2k + 1 and 2k + 2), which is
// exactly a segment tree over 8 elements: 15 nodes, 4 levels.
internal sealed class SegmentTreeViz
{
    private readonly int[] nums;
    private readonly object[] tree;
    private readonly int[] value;
    private readonly Func<int, int, int> combine;
    private readonly int identity;
    private readonly string what;
    public readonly List<VisualizationStep> Steps = [];

    public SegmentTreeViz(int[] nums, Func<int, int, int> combine, int identity, string what)
    {
        this.nums = (int[])nums.Clone();
        this.combine = combine;
        this.identity = identity;
        this.what = what;
        tree = Enumerable.Repeat((object)"?", 2 * nums.Length - 1).ToArray();
        value = new int[2 * nums.Length - 1];
    }

    private void Add(IEnumerable<int> highlight, string message) =>
        Steps.Add(new VisualizationStep(
            new Dictionary<string, object> { ["tree"] = tree.ToArray() },
            highlight.ToArray(),
            message));

    private static string R(int lo, int hi) => lo == hi ? $"[{lo}]" : $"[{lo}..{hi}]";

    private string Show(int v) => v == identity && identity == int.MaxValue ? "+inf" : v.ToString();

    public void Build()
    {
        Add([], $"nums = [{string.Join(", ", nums)}]. Every node will hold the {what} of a range of indices; the root covers [0..{nums.Length - 1}] and each leaf covers one index.");
        // Bottom-up, one level per step: leaves first, then each parent from its two children.
        var levels = new List<List<(int Node, int Lo, int Hi)>>();
        void Collect(int node, int lo, int hi, int depth)
        {
            while (levels.Count <= depth) levels.Add([]);
            levels[depth].Add((node, lo, hi));
            if (lo == hi) return;
            var mid = (lo + hi) / 2;
            Collect(2 * node + 1, lo, mid, depth + 1);
            Collect(2 * node + 2, mid + 1, hi, depth + 1);
        }
        Collect(0, 0, nums.Length - 1, 0);
        for (var d = levels.Count - 1; d >= 0; d--)
        {
            var parts = new List<string>();
            foreach (var (node, lo, hi) in levels[d])
            {
                value[node] = lo == hi ? nums[lo] : combine(value[2 * node + 1], value[2 * node + 2]);
                tree[node] = value[node];
                parts.Add($"{R(lo, hi)} = {value[node]}");
            }
            var msg = d == levels.Count - 1
                ? $"Build, leaves: each leaf is just its element. {string.Join(", ", parts)}."
                : d == 0
                    ? $"Build, root: {what} of its two children, {string.Join(", ", parts)}. Every node was computed once from its children: O(n) build."
                    : $"Build, next level up: each node is the {what} of its two children. {string.Join(", ", parts)}.";
            Add(levels[d].Select(x => x.Node), msg);
        }
    }

    public void Update(int index, int newValue)
    {
        var path = new List<(int Node, int Lo, int Hi)>();
        int node = 0, lo = 0, hi = nums.Length - 1;
        while (true)
        {
            path.Add((node, lo, hi));
            if (lo == hi) break;
            var mid = (lo + hi) / 2;
            if (index <= mid) { node = 2 * node + 1; hi = mid; }
            else { node = 2 * node + 2; lo = mid + 1; }
        }
        nums[index] = newValue;
        var touched = new List<int>();
        for (var k = path.Count - 1; k >= 0; k--)
        {
            var (nd, l, h) = path[k];
            value[nd] = l == h ? newValue : combine(value[2 * nd + 1], value[2 * nd + 2]);
            tree[nd] = value[nd];
            touched.Add(nd);
            Add(touched.ToArray(), k == path.Count - 1
                ? $"update({index}, {newValue}): walk down to the leaf for index {index} and set it to {newValue}."
                : k == 0
                    ? $"Recompute the root {R(l, h)} = {value[nd]}. Only {path.Count} nodes changed, one per level: O(log n)."
                    : $"Recompute its ancestor {R(l, h)} from its two children: {value[nd]}.");
        }
    }

    public int Query(int ql, int qr, string name)
    {
        var used = new List<int>();
        var visited = 0;
        int Go(int node, int lo, int hi)
        {
            visited++;
            if (qr < lo || hi < ql)
            {
                Add(used.Append(node), $"{name}({ql}, {qr}): node {R(lo, hi)} is completely outside the query, so it returns {Show(identity)} without looking further.");
                return identity;
            }
            if (ql <= lo && hi <= qr)
            {
                used.Add(node);
                Add(used.ToArray(), $"{name}({ql}, {qr}): node {R(lo, hi)} lies completely inside the query, so use its stored {value[node]} and stop here.");
                return value[node];
            }
            Add(used.Append(node), $"{name}({ql}, {qr}): node {R(lo, hi)} only partly overlaps, so ask both children and combine their answers.");
            var mid = (lo + hi) / 2;
            return combine(Go(2 * node + 1, lo, mid), Go(2 * node + 2, mid + 1, hi));
        }
        var result = Go(0, 0, nums.Length - 1);
        Add(used.ToArray(), $"{name}({ql}, {qr}) = {result}, combined from {used.Count} fully covered nodes after visiting {visited} nodes. A query never visits more than about 4 nodes per level: O(log n).");
        return result;
    }

    public void Note(string message) => Add([], message);
}

// Fenwick (binary indexed) tree steps for the Array visualizer: the array shown is tree[1..n]
// (index 0 is unused and shown as "-"), and the highlighted cells are the ones a jump touches.
internal sealed class FenwickViz
{
    private readonly long[] tree;
    public readonly List<VisualizationStep> Steps = [];
    private readonly string label;

    public FenwickViz(int n, string label)
    {
        tree = new long[n + 1];
        this.label = label;
    }

    public int Size => tree.Length - 1;

    private Dictionary<string, object> State(long tracker) => new()
    {
        ["array"] = tree.Select((v, i) => i == 0 ? (object)"-" : v).ToArray(),
        ["tracker"] = tracker,
        ["trackerLabel"] = label,
    };

    public void Note(string message, long tracker = 0, IEnumerable<int>? highlight = null) =>
        Steps.Add(new VisualizationStep(State(tracker), (highlight ?? []).ToArray(), message));

    private static string Bin(int i) => Convert.ToString(i, 2);

    // add(i, delta) with i 1-based: climb by i += i & -i.
    public void Add(int i, long delta, string intro, long tracker)
    {
        var touched = new List<int>();
        var hops = new List<string>();
        for (var j = i; j <= Size; j += j & -j)
        {
            tree[j] += delta;
            touched.Add(j);
            hops.Add($"{j} ({Bin(j)})");
        }
        Steps.Add(new VisualizationStep(State(tracker), touched.ToArray(),
            $"{intro} add({i}, {delta:+#;-#;0}): touch {string.Join(" -> ", hops)}, each time jumping i += i & -i to the next cell whose range covers {i}."));
    }

    // prefix(i), 1-based: descend by i -= i & -i.
    public long Prefix(int i, string intro, long tracker)
    {
        long sum = 0;
        var touched = new List<int>();
        var hops = new List<string>();
        for (var j = i; j > 0; j -= j & -j)
        {
            sum += tree[j];
            touched.Add(j);
            hops.Add($"tree[{j}]={tree[j]}");
        }
        Steps.Add(new VisualizationStep(State(tracker), touched.ToArray(),
            i == 0
                ? $"{intro} prefix(0) is the empty sum, 0: no cells."
                : $"{intro} prefix({i}) = {string.Join(" + ", hops)} = {sum}, jumping i -= i & -i (clear the lowest set bit) until i is 0."));
        return sum;
    }
}
