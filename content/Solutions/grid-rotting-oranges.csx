public class Solution
{
    public static int OrangesRotting(int[][] grid)
    {
        var queue = new Queue<(int R, int C)>();
        var fresh = 0;
        for (var r = 0; r < grid.Length; r++)
        {
            for (var c = 0; c < grid[r].Length; c++)
            {
                if (grid[r][c] == 2) queue.Enqueue((r, c));
                else if (grid[r][c] == 1) fresh++;
            }
        }

        var minutes = 0;
        while (queue.Count > 0 && fresh > 0)
        {
            // One layer of the BFS = one minute.
            for (var size = queue.Count; size > 0; size--)
            {
                var (r, c) = queue.Dequeue();
                foreach (var (dr, dc) in new[] { (1, 0), (-1, 0), (0, 1), (0, -1) })
                {
                    int nr = r + dr, nc = c + dc;
                    if (nr < 0 || nr >= grid.Length || nc < 0 || nc >= grid[nr].Length || grid[nr][nc] != 1) continue;
                    grid[nr][nc] = 2; // rot on push so it's never enqueued twice
                    fresh--;
                    queue.Enqueue((nr, nc));
                }
            }
            minutes++;
        }
        return fresh == 0 ? minutes : -1;
    }
}
