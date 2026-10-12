public class Solution
{
    public static uint ReverseBits(uint n)
    {
        uint result = 0;
        // Exactly 32 rounds: leading zeros of n must become trailing zeros of result.
        for (var i = 0; i < 32; i++)
        {
            result = (result << 1) | (n & 1); // push n's lowest bit onto result
            n >>= 1;                          // uint, so this shifts in zeros
        }
        return result;
    }
}
