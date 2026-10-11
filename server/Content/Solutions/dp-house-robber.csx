public class Solution
{
    public static int Rob(int[] nums)
    {
        int prev2 = 0, prev1 = 0; // best up to two houses back, best up to the previous house
        foreach (var house in nums)
        {
            var cur = Math.Max(prev1, prev2 + house); // skip it, or rob it
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
}
