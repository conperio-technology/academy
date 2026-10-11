public class Solution
{
    public static int[][] IntervalIntersection(int[][] a, int[][] b)
    {
        var result = new List<int[]>();
        int i = 0, j = 0;
        while (i < a.Length && j < b.Length)
        {
            var lo = Math.Max(a[i][0], b[j][0]);
            var hi = Math.Min(a[i][1], b[j][1]);
            if (lo <= hi) result.Add([lo, hi]);

            // The interval that ends first can't meet anything later in the other list.
            if (a[i][1] < b[j][1]) i++;
            else j++;
        }
        return result.ToArray();
    }
}
