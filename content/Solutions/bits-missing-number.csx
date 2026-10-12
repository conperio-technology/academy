public class Solution
{
    public static int MissingNumber(int[] nums)
    {
        var acc = nums.Length; // the value n, which no index covers
        for (var i = 0; i < nums.Length; i++) acc ^= i ^ nums[i]; // present values cancel in pairs
        return acc;
    }
}
