public class Solution
{
    public static int[][] DistanceToZero(int[][] grid)
    {
        int rows = grid.Length, cols = grid[0].Length;
        var dist = new int[rows][];
        var queue = new Queue<(int R, int C)>();
        for (var r = 0; r < rows; r++)
        {
            dist[r] = new int[cols];
            for (var c = 0; c < cols; c++)
            {
                dist[r][c] = -1;
                if (grid[r][c] == 0)
                {
                    dist[r][c] = 0;
                    queue.Enqueue((r, c));
                }
            }
        }

        int[][] directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        while (queue.Count > 0)
        {
            var (r, c) = queue.Dequeue();
            foreach (var d in directions)
            {
                int nr = r + d[0], nc = c + d[1];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || dist[nr][nc] != -1) continue;
                dist[nr][nc] = dist[r][c] + 1;
                queue.Enqueue((nr, nc));
            }
        }
        return dist;
    }
}
