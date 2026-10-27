public class Solution
{
    public static int FirstAtLeast(int[] nums, int x)
    {
        int lo = 0, hi = nums.Length;
        while (lo < hi)
        {
            var mid = lo + (hi - lo) / 2;
            if (nums[mid] < x)
                lo = mid + 1;
            else
                hi = mid;
        }
        return lo;
    }
}
