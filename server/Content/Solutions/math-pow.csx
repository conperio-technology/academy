public class Solution
{
    public static double MyPow(double x, int n)
    {
        long exp = n; // long: -int.MinValue doesn't fit in an int
        if (exp < 0)
        {
            x = 1 / x;
            exp = -exp;
        }
        var result = 1.0;
        while (exp > 0)
        {
            if ((exp & 1) == 1) result *= x; // this bit of the exponent is set
            x *= x;                          // x, x^2, x^4, x^8, ...
            exp >>= 1;
        }
        return result;
    }
}
