public class Solution
{
    public static int LongestSubarraySumK(int[] nums, int k)
    {
        var firstIndex = new Dictionary<int, int> { [0] = -1 };
        int sum = 0, best = 0;
        for (var i = 0; i < nums.Length; i++)
        {
            sum += nums[i];
            if (firstIndex.TryGetValue(sum - k, out var j))
                best = Math.Max(best, i - j);
            firstIndex.TryAdd(sum, i);
        }
        return best;
    }
}
