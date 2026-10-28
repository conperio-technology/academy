public class Solution
{
    public static int LongestConsecutive(int[] nums)
    {
        var set = new HashSet<int>(nums);
        var best = 0;
        foreach (var x in set)
        {
            if (set.Contains(x - 1)) continue; // not the start of a run
            var y = x;
            while (set.Contains(y + 1)) y++; // each run is walked once, from its start
            best = Math.Max(best, y - x + 1);
        }
        return best;
    }
}
