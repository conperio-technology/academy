public class Solution
{
    public static int[][] Rotate(int[][] matrix)
    {
        var n = matrix.Length;
        for (var r = 0; r < n; r++)
            for (var c = r + 1; c < n; c++) // above the diagonal only, or each pair swaps back
                (matrix[r][c], matrix[c][r]) = (matrix[c][r], matrix[r][c]);
        foreach (var row in matrix) Array.Reverse(row);
        return matrix;
    }
}
