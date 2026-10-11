public class Solution
{
    public static int Reverse(int x)
    {
        var result = 0;
        while (x != 0)
        {
            var digit = x % 10; // keeps x's sign in C#: -123 % 10 == -3
            x /= 10;            // truncates toward zero
            // Guard BEFORE result * 10 + digit, which would wrap silently.
            if (result > int.MaxValue / 10 || (result == int.MaxValue / 10 && digit > 7)) return 0;
            if (result < int.MinValue / 10 || (result == int.MinValue / 10 && digit < -8)) return 0;
            result = result * 10 + digit;
        }
        return result;
    }
}
