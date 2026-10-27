public class Solution
{
    public static int FirstRepeatIndex(int[] nums)
    {
        var seen = new HashSet<int>();
        for (var i = 0; i < nums.Length; i++)
        {
            if (seen.Contains(nums[i]))
                return i;
            seen.Add(nums[i]);
        }
        return -1;
    }
}
