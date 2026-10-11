public class Solution
{
    public static int SumArray(int[] nums)
    {
        var total = 0;
        foreach (var n in nums) total += n;
        return total;
    }
}
