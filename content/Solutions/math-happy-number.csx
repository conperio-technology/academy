public class Solution
{
    private static int Next(int n)
    {
        var sum = 0;
        for (; n > 0; n /= 10)
        {
            var d = n % 10;
            sum += d * d;
        }
        return sum;
    }

    public static bool IsHappy(int n)
    {
        // Floyd's cycle detection: 1 maps to itself, so both cases end with slow == fast.
        int slow = n, fast = Next(n);
        while (slow != fast)
        {
            slow = Next(slow);
            fast = Next(Next(fast));
        }
        return slow == 1;
    }
}
