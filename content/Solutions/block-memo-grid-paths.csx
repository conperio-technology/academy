public class Solution
{
    public static int CountPaths(int rows, int cols)
    {
        var memo = new Dictionary<(int, int), int>();

        int Ways(int r, int c)
        {
            if (r == 0 || c == 0) return 1;
            if (memo.TryGetValue((r, c), out var known)) return known;
            var total = Ways(r - 1, c) + Ways(r, c - 1);
            memo[(r, c)] = total;
            return total;
        }

        return Ways(rows - 1, cols - 1);
    }
}
