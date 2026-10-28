public class Solution
{
    public static List<int> SpiralOrder(int[][] matrix)
    {
        var result = new List<int>();
        if (matrix.Length == 0) return result;
        int top = 0, bottom = matrix.Length - 1, left = 0, right = matrix[0].Length - 1;
        while (top <= bottom && left <= right)
        {
            for (var c = left; c <= right; c++) result.Add(matrix[top][c]);
            top++;
            for (var r = top; r <= bottom; r++) result.Add(matrix[r][right]);
            right--;
            if (top <= bottom) // a single leftover row was already read
            {
                for (var c = right; c >= left; c--) result.Add(matrix[bottom][c]);
                bottom--;
            }
            if (left <= right) // a single leftover column was already read
            {
                for (var r = bottom; r >= top; r--) result.Add(matrix[r][left]);
                left++;
            }
        }
        return result;
    }
}
