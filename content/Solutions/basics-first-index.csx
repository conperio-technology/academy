public class Solution
{
    public static int FirstIndex(int[] nums, int target)
    {
        for (int i = 0; i < nums.Length; i++)
        {
            if (nums[i] == target) return i;  // first match: stop right here
        }
        return -1;  // only reached when nothing matched
    }
}
