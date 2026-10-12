public class Solution
{
    public static int[] ReverseArray(int[] nums)
    {
        int left = 0, right = nums.Length - 1;
        while (left < right)
        {
            (nums[left], nums[right]) = (nums[right], nums[left]);
            left++;
            right--;
        }
        return nums;
    }
}
