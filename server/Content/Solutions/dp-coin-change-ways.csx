public class Solution
{
    public static int CoinChangeWays(int[] coins, int amount)
    {
        var ways = new int[amount + 1];
        ways[0] = 1; // the empty combination
        foreach (var c in coins)              // coins outside: each combination in one coin order
            for (var x = c; x <= amount; x++) // upward: the same coin may be used again
                ways[x] += ways[x - c];
        return ways[amount];
    }
}
