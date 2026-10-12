public class Solution
{
    public static bool IsPowerOfTwo(int n)
    {
        // One set bit means clearing the lowest set bit leaves 0. n > 0 rules out
        // 0 and int.MinValue, which also pass the AND test.
        return n > 0 && (n & (n - 1)) == 0;
    }
}
