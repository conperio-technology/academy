public class Solution
{
    public static int[][] InsertInterval(int[][] intervals, int[] newInterval)
    {
        var result = new List<int[]>();
        int start = newInterval[0], end = newInterval[1];
        var i = 0;
        while (i < intervals.Length && intervals[i][1] < start) // ends before the new one starts
            result.Add(intervals[i++]);
        while (i < intervals.Length && intervals[i][0] <= end) // overlaps: absorb it
        {
            start = Math.Min(start, intervals[i][0]);
            end = Math.Max(end, intervals[i][1]);
            i++;
        }
        result.Add(new[] { start, end });
        while (i < intervals.Length) // everything left starts after the merged one ends
            result.Add(intervals[i++]);
        return result.ToArray();
    }
}
