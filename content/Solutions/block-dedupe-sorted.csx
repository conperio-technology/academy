public class Solution
{
    public static int[] DedupeSorted(int[] nums)
    {
        if (nums.Length == 0) return nums;
        var slow = 0;
        for (var fast = 1; fast < nums.Length; fast++)
        {
            if (nums[fast] != nums[slow])
            {
                slow++;
                nums[slow] = nums[fast];
            }
        }
        return nums.Take(slow + 1).ToArray();
    }
}
