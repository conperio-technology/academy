public class RangeAdder
{
    private readonly int[] original;
    private readonly int[] tree; // Fenwick tree over the difference array, 1-indexed

    public RangeAdder(int[] nums)
    {
        original = (int[])nums.Clone();
        tree = new int[nums.Length + 2]; // room for the cancelling add at right + 2
    }

    private void Add(int i, int delta)
    {
        for (; i < tree.Length; i += i & -i) tree[i] += delta;
    }

    private int Prefix(int i)
    {
        var sum = 0;
        for (; i > 0; i -= i & -i) sum += tree[i];
        return sum;
    }

    public void AddRange(int left, int right, int delta)
    {
        Add(left + 1, delta);   // from left on, everything is delta higher
        Add(right + 2, -delta); // and after right, it isn't
    }

    public int Get(int index) => original[index] + Prefix(index + 1);
}
