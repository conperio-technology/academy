public class Solution
{
    public static int[][] MergeIntervals(int[][] intervals)
    {
        var sorted = intervals.OrderBy(iv => iv[0]).ToList();
        var merged = new List<int[]>();
        foreach (var iv in sorted)
        {
            if (merged.Count > 0 && iv[0] <= merged[^1][1])
                merged[^1][1] = Math.Max(merged[^1][1], iv[1]); // overlaps -- extend
            else
                merged.Add(new[] { iv[0], iv[1] });
        }
        return merged.ToArray();
    }
}
