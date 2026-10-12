public class Solution
{
    public static Func<int, long> Memoize(Func<int, long> f)
    {
        var cache = new Dictionary<int, long>();
        return n =>
        {
            if (!cache.TryGetValue(n, out long result))
            {
                result = f(n);
                cache[n] = result;
            }
            return result;
        };
    }
}
