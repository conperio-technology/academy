public class Solution
{
    public static int CountWindows(int[] nums, int k, int target)
    {
        if (k > nums.Length) return 0;
        var sum = 0;
        for (var i = 0; i < k; i++) sum += nums[i];
        var count = sum >= target ? 1 : 0;
        for (var i = k; i < nums.Length; i++)
        {
            sum += nums[i] - nums[i - k];
            if (sum >= target) count++;
        }
        return count;
    }
}
