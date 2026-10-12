public class Solution
{
    public static long CountInversions(int[] nums)
    {
        // Coordinate compression: each distinct value -> its rank 1..k in sorted order.
        var sorted = nums.Distinct().ToArray();
        Array.Sort(sorted);
        var rank = new Dictionary<int, int>();
        for (var i = 0; i < sorted.Length; i++) rank[sorted[i]] = i + 1;

        var tree = new int[sorted.Length + 1]; // Fenwick tree: how many of each rank seen so far
        long total = 0;
        for (var j = 0; j < nums.Length; j++)
        {
            var r = rank[nums[j]];
            var atMost = 0;
            for (var i = r; i > 0; i -= i & -i) atMost += tree[i]; // prefix(r): seen values <= nums[j]
            total += j - atMost;                                    // the rest are bigger and earlier
            for (var i = r; i < tree.Length; i += i & -i) tree[i]++; // add(r, 1)
        }
        return total;
    }
}
