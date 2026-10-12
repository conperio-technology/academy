public class Solution
{
    public static int RangeSum(int[] nums, int left, int right)
    {
        var prefix = new int[nums.Length + 1];
        for (var i = 0; i < nums.Length; i++)
            prefix[i + 1] = prefix[i] + nums[i];
        return prefix[right + 1] - prefix[left];
    }
}
