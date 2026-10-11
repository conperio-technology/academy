public class Solution
{
    public static int NumIslands(int[][] grid)
    {
        var rows = grid.Length;
        var islands = 0;
        for (var r = 0; r < rows; r++)
        {
            for (var c = 0; c < grid[r].Length; c++)
            {
                if (grid[r][c] != 1) continue;
                islands++;

                // Flood fill with an explicit stack, sinking land (1 -> 0) as it's reached.
                var stack = new Stack<(int R, int C)>();
                grid[r][c] = 0;
                stack.Push((r, c));
                while (stack.Count > 0)
                {
                    var (cr, cc) = stack.Pop();
                    foreach (var (dr, dc) in new[] { (1, 0), (-1, 0), (0, 1), (0, -1) })
                    {
                        int nr = cr + dr, nc = cc + dc;
                        if (nr < 0 || nr >= rows || nc < 0 || nc >= grid[nr].Length || grid[nr][nc] != 1) continue;
                        grid[nr][nc] = 0;
                        stack.Push((nr, nc));
                    }
                }
            }
        }
        return islands;
    }
}
