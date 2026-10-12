public class Solution
{
    public static int MaxAreaOfIsland(int[][] grid)
    {
        var best = 0;
        for (var r = 0; r < grid.Length; r++)
        {
            for (var c = 0; c < grid[r].Length; c++)
            {
                if (grid[r][c] != 1) continue;

                // Flood fill that counts: sink each cell as it is pushed, count it as it is popped.
                var area = 0;
                var stack = new Stack<(int R, int C)>();
                grid[r][c] = 0;
                stack.Push((r, c));
                while (stack.Count > 0)
                {
                    var (cr, cc) = stack.Pop();
                    area++;
                    foreach (var (dr, dc) in new[] { (1, 0), (-1, 0), (0, 1), (0, -1) })
                    {
                        int nr = cr + dr, nc = cc + dc;
                        if (nr >= 0 && nr < grid.Length && nc >= 0 && nc < grid[nr].Length && grid[nr][nc] == 1)
                        {
                            grid[nr][nc] = 0;
                            stack.Push((nr, nc));
                        }
                    }
                }
                best = Math.Max(best, area);
            }
        }
        return best;
    }
}
