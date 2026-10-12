public class Solution
{
    public static int[] Partition(int[] nums)
    {
        var last = nums.Length - 1;
        var pivot = nums[last];
        var i = -1;
        for (var j = 0; j < last; j++)
        {
            if (nums[j] > pivot) continue;
            i++;
            (nums[i], nums[j]) = (nums[j], nums[i]);
        }
        (nums[i + 1], nums[last]) = (nums[last], nums[i + 1]);
        return nums;
    }
}
