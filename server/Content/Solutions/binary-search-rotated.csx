public class Solution
{
    public static int SearchRotated(int[] nums, int target)
    {
        int lo = 0, hi = nums.Length - 1;
        while (lo <= hi)
        {
            var mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid])
            {
                // Left half [lo, mid] is sorted.
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
                else lo = mid + 1;
            }
            else
            {
                // Right half [mid, hi] is sorted.
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        return -1;
    }
}
