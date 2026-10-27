public class Solution
{
    public static int IndexOfMax(int[] nums)
    {
        if (nums.Length == 0) return -1;
        var best = 0;
        for (var i = 1; i < nums.Length; i++)
        {
            if (nums[i] > nums[best])
                best = i;
        }
        return best;
    }
}
