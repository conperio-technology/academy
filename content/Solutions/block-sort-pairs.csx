public class Solution
{
    public static int[][] SortPairs(int[][] pairs)
    {
        return pairs.OrderBy(p => p[1]).ThenByDescending(p => p[0]).ToArray();
    }
}
