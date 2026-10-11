public class Solution
{
    public static List<int> InBoth(int[] a, int[] b)
    {
        var inB = new HashSet<int>(b);  // built once: O(m)
        var added = new HashSet<int>();
        var result = new List<int>();
        foreach (int x in a)
        {
            if (inB.Contains(x) && added.Add(x))
                result.Add(x);
        }
        return result;
    }
}
