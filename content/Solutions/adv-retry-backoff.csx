public class Solution
{
    public static int Retry(Func<int> action, int maxAttempts, int baseDelayMs, int maxDelayMs, Action<int> sleep)
    {
        long delay = baseDelayMs;
        for (int attempt = 1; ; attempt++)
        {
            try
            {
                return action();
            }
            catch (TimeoutException) when (attempt < maxAttempts)
            {
                sleep((int)Math.Min(delay, maxDelayMs));
                delay = Math.Min(delay * 2, maxDelayMs);
            }
        }
    }
}
