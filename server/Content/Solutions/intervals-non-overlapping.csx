public class Solution
{
    public static int EraseOverlapIntervals(int[][] intervals)
    {
        var removed = 0;
        int? lastEnd = null;
        foreach (var iv in intervals.OrderBy(iv => iv[1])) // earliest finish first
        {
            if (lastEnd is null || iv[0] >= lastEnd) lastEnd = iv[1]; // fits: keep it
            else removed++; // overlaps the last kept one, which ends sooner: drop this one
        }
        return removed;
    }
}
