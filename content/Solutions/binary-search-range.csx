public class Solution
{
    public static int[] SearchRange(int[] nums, int target)
    {
        return new[] { FindEdge(nums, target, first: true), FindEdge(nums, target, first: false) };
    }

    private static int FindEdge(int[] nums, int target, bool first)
    {
        int left = 0, right = nums.Length - 1, found = -1;
        while (left <= right)
        {
            var mid = left + (right - left) / 2;
            if (nums[mid] == target)
            {
                found = mid;                     // remember it, but keep looking
                if (first) right = mid - 1;
                else left = mid + 1;
            }
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return found;
    }
}
