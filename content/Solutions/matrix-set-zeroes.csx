public class Solution
{
    public static int[][] SetZeroes(int[][] matrix)
    {
        int rows = matrix.Length, cols = rows == 0 ? 0 : matrix[0].Length;
        var firstColZero = false; // matrix[0][0] marks row 0, so column 0 needs its own flag
        for (var r = 0; r < rows; r++)
        {
            if (matrix[r][0] == 0) firstColZero = true;
            for (var c = 1; c < cols; c++)
            {
                if (matrix[r][c] == 0)
                {
                    matrix[r][0] = 0;
                    matrix[0][c] = 0;
                }
            }
        }
        for (var r = 1; r < rows; r++)
            for (var c = 1; c < cols; c++)
                if (matrix[r][0] == 0 || matrix[0][c] == 0) matrix[r][c] = 0;
        if (rows > 0 && matrix[0][0] == 0)
            for (var c = 0; c < cols; c++) matrix[0][c] = 0;
        if (firstColZero)
            for (var r = 0; r < rows; r++) matrix[r][0] = 0;
        return matrix;
    }
}
