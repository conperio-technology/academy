def exist(board, word):
    grid = [list(row) for row in board]

    def dfs(r, c, i):
        if r < 0 or r >= len(grid) or c < 0 or c >= len(grid[r]) or grid[r][c] != word[i]:
            return False
        if i == len(word) - 1:
            return True

        grid[r][c] = "#"  # on the current path
        found = dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1) or dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1)
        grid[r][c] = word[i]  # undo, so other paths can use this cell
        return found

    return any(dfs(r, c, 0) for r in range(len(grid)) for c in range(len(grid[r])))
