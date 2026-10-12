public class Solution
{
    public static int GetSum(int a, int b)
    {
        while (b != 0)
        {
            var carry = (a & b) << 1; // columns where both bits are 1 carry into the next column
            a ^= b;                   // sum of each column, ignoring carries
            b = carry;
        }
        return a; // int is 32-bit two's complement, so negatives and wraparound just work
    }
}
