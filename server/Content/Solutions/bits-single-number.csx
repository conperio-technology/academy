public class Solution
{
    public static int SingleNumber(int[] nums)
    {
        var acc = 0; // XOR identity
        foreach (var x in nums) acc ^= x; // x ^ x == 0, so every pair cancels
        return acc;
    }
}
