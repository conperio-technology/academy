public class RangeMinTree
{
    private readonly int n;
    private readonly int[] tree; // root at 1; node k's children are 2k and 2k + 1

    public RangeMinTree(int[] nums)
    {
        n = nums.Length;
        tree = new int[4 * Math.Max(n, 1)];
        if (n > 0) Build(nums, 1, 0, n - 1);
    }

    private void Build(int[] nums, int node, int lo, int hi)
    {
        if (lo == hi) { tree[node] = nums[lo]; return; }
        var mid = (lo + hi) / 2;
        Build(nums, 2 * node, lo, mid);
        Build(nums, 2 * node + 1, mid + 1, hi);
        tree[node] = Math.Min(tree[2 * node], tree[2 * node + 1]);
    }

    public void Update(int index, int val) => Update(1, 0, n - 1, index, val);

    private void Update(int node, int lo, int hi, int index, int val)
    {
        if (lo == hi) { tree[node] = val; return; }
        var mid = (lo + hi) / 2;
        if (index <= mid) Update(2 * node, lo, mid, index, val);
        else Update(2 * node + 1, mid + 1, hi, index, val);
        tree[node] = Math.Min(tree[2 * node], tree[2 * node + 1]);
    }

    public int QueryMin(int left, int right) => Query(1, 0, n - 1, left, right);

    private int Query(int node, int lo, int hi, int left, int right)
    {
        if (right < lo || hi < left) return int.MaxValue;   // identity for min
        if (left <= lo && hi <= right) return tree[node];
        var mid = (lo + hi) / 2;
        return Math.Min(Query(2 * node, lo, mid, left, right), Query(2 * node + 1, mid + 1, hi, left, right));
    }
}
