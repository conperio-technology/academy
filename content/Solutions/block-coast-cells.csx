public class Solution
{
    public static int CountCoastCells(int[][] grid)
    {
        int[][] directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        var count = 0;
        for (var r = 0; r < grid.Length; r++)
        {
            for (var c = 0; c < grid[r].Length; c++)
            {
                if (grid[r][c] == 0) continue;
                foreach (var d in directions)
                {
                    int nr = r + d[0], nc = c + d[1];
                    if (nr < 0 || nr >= grid.Length || nc < 0 || nc >= grid[nr].Length) continue;
                    if (grid[nr][nc] == 0)
                    {
                        count++;
                        break;
                    }
                }
            }
        }
        return count;
    }
}
