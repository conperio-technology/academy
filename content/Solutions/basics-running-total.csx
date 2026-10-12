public class Solution
{
    public static int[] RunningTotal(int[] nums)
    {
        var result = new int[nums.Length];
        int total = 0;
        for (int i = 0; i < nums.Length; i++)
        {
            total += nums[i];
            result[i] = total;
        }
        return result;
    }
}
