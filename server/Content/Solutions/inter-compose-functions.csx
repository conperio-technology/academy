public class Solution
{
    public static Func<int, int> Compose(List<Func<int, int>> steps)
    {
        // The returned lambda captures steps (a closure) and runs them in order on each call.
        return x =>
        {
            foreach (var step in steps)
                x = step(x);
            return x;
        };
    }
}
