public class Solution
{
    public static bool Exist(string[] board, string word)
    {
        var grid = board.Select(row => row.ToCharArray()).ToArray();

        bool Dfs(int r, int c, int i)
        {
            if (r < 0 || r >= grid.Length || c < 0 || c >= grid[r].Length || grid[r][c] != word[i]) return false;
            if (i == word.Length - 1) return true;

            grid[r][c] = '#'; // on the current path
            var found = Dfs(r + 1, c, i + 1) || Dfs(r - 1, c, i + 1) || Dfs(r, c + 1, i + 1) || Dfs(r, c - 1, i + 1);
            grid[r][c] = word[i]; // undo, so other paths can use this cell
            return found;
        }

        for (var r = 0; r < grid.Length; r++)
            for (var c = 0; c < grid[r].Length; c++)
                if (Dfs(r, c, 0)) return true;
        return false;
    }
}
