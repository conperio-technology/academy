public class Solution
{
    public static int[][] WithCell(int[][] grid, int row, int col, int value)
    {
        // Copy every row, not just the outer array, so the caller's rows stay untouched.
        var copy = grid.Select(r => r.ToArray()).ToArray();
        copy[row][col] = value;
        return copy;
    }
}
