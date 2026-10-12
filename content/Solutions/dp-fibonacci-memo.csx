public class Solution
{
    private static readonly Dictionary<int, int> Memo = new();

    public static int Fibonacci(int n)
    {
        if (n <= 1) return n;
        if (Memo.TryGetValue(n, out var cached)) return cached;
        var value = Fibonacci(n - 1) + Fibonacci(n - 2);
        Memo[n] = value;
        return value;
    }
}
