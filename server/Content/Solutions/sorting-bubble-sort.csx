public class Solution
{
    public static int[] BubbleSort(int[] nums)
    {
        for (var end = nums.Length - 1; end > 0; end--)
        {
            var swapped = false;
            for (var i = 0; i < end; i++)
            {
                if (nums[i] <= nums[i + 1]) continue;
                (nums[i], nums[i + 1]) = (nums[i + 1], nums[i]);
                swapped = true;
            }
            if (!swapped) break; // already sorted
        }
        return nums;
    }
}
