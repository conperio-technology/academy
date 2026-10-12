public class Solution
{
    public static int FindMin(int[] nums)
    {
        int lo = 0, hi = nums.Length - 1;
        while (lo < hi)
        {
            var mid = lo + (hi - lo) / 2;
            if (nums[mid] > nums[hi])
                lo = mid + 1; // the drop, and the minimum, are right of mid
            else
                hi = mid;     // mid..hi is sorted, so the minimum is mid or left of it
        }
        return nums[lo];
    }
}
