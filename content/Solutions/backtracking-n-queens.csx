public class Solution
{
    public static int TotalNQueens(int n)
    {
        var cols = new HashSet<int>();
        var diags = new HashSet<int>();     // r - c is constant along a "\" diagonal
        var antiDiags = new HashSet<int>(); // r + c is constant along a "/" diagonal
        var count = 0;

        void Place(int r)
        {
            if (r == n)
            {
                count++;
                return;
            }
            for (var c = 0; c < n; c++)
            {
                if (cols.Contains(c) || diags.Contains(r - c) || antiDiags.Contains(r + c)) continue;
                cols.Add(c);
                diags.Add(r - c);
                antiDiags.Add(r + c);
                Place(r + 1);
                cols.Remove(c);
                diags.Remove(r - c);
                antiDiags.Remove(r + c);
            }
        }

        Place(0);
        return count;
    }
}
