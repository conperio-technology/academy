public class Solution
{
    public static List<int> CountSmaller(int[] nums)
    {
        // Coordinate compression: each distinct value -> its rank 1..k in sorted order.
        var sorted = nums.Distinct().ToArray();
        Array.Sort(sorted);
        var rank = new Dictionary<int, int>();
        for (var i = 0; i < sorted.Length; i++) rank[sorted[i]] = i + 1;

        var tree = new int[sorted.Length + 1]; // Fenwick tree: how many of each rank seen so far
        var counts = new int[nums.Length];
        for (var i = nums.Length - 1; i >= 0; i--)
        {
            var r = rank[nums[i]];
            var smaller = 0;
            for (var j = r - 1; j > 0; j -= j & -j) smaller += tree[j]; // prefix(r - 1): strictly smaller
            counts[i] = smaller;
            for (var j = r; j < tree.Length; j += j & -j) tree[j]++;   // add(r, 1)
        }
        return counts.ToList();
    }
}
