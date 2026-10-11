public class Solution
{
    public static IEnumerable<long> Fibonacci()
    {
        long a = 0, b = 1;
        while (true)
        {
            yield return a;
            (a, b) = (b, a + b);
        }
    }
}
