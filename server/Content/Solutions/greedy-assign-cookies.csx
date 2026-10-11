public class Solution
{
    public static int FindContentChildren(int[] g, int[] s)
    {
        Array.Sort(g);
        Array.Sort(s);
        var child = 0;
        // Smallest cookie first: give it to the least greedy child still waiting if it's big
        // enough, otherwise it's too small for everyone left and is skipped.
        for (var cookie = 0; cookie < s.Length && child < g.Length; cookie++)
        {
            if (s[cookie] >= g[child]) child++;
        }
        return child;
    }
}
