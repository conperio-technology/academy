public class Solution
{
    public static int FindMax(int[] nums)
    {
        // Start from the first element, not 0 -- an all-negative array has no 0 in it.
        var max = nums[0];
        for (var i = 1; i < nums.Length; i++)
            if (nums[i] > max) max = nums[i];
        return max;
    }
}
