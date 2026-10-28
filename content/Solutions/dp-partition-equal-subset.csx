public class Solution
{
    public static bool CanPartition(int[] nums)
    {
        var total = nums.Sum();
        if (total % 2 != 0) return false; // two equal halves need an even total
        var target = total / 2;
        var reachable = new bool[target + 1];
        reachable[0] = true;
        foreach (var x in nums)
            for (var s = target; s >= x; s--) // downwards: each number is used at most once
                if (reachable[s - x]) reachable[s] = true;
        return reachable[target];
    }
}
