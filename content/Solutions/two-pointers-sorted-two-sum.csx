public class Solution
{
    public static int[] TwoSumSorted(int[] nums, int target)
    {
        int left = 0, right = nums.Length - 1;
        while (left < right)
        {
            var sum = nums[left] + nums[right];
            if (sum == target) return new[] { left, right };
            if (sum < target) left++;
            else right--;
        }
        return new int[0];
    }
}
