public class Solution
{
    public static int SubarraySum(int[] nums, int k)
    {
        var counts = new Dictionary<int, int> { [0] = 1 }; // the empty prefix
        var running = 0;
        var found = 0;
        foreach (var n in nums)
        {
            running += n;
            // Runs ending here that sum to k start after a prefix equal to running - k.
            found += counts.GetValueOrDefault(running - k);
            counts[running] = counts.GetValueOrDefault(running) + 1;
        }
        return found;
    }
}
