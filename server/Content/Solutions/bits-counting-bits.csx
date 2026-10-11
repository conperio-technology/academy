public class Solution
{
    public static int[] CountBits(int n)
    {
        var ans = new int[n + 1];
        // i >> 1 drops the lowest bit and is already done; add that bit back with i & 1.
        for (var i = 1; i <= n; i++) ans[i] = ans[i >> 1] + (i & 1);
        return ans;
    }
}
