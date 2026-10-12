def num_islands(grid):
    rows = len(grid)
    islands = 0
    for r in range(rows):
        for c in range(len(grid[r])):
            if grid[r][c] != 1:
                continue
            islands += 1

            # Flood fill with an explicit stack, sinking land (1 -> 0) as it's reached.
            grid[r][c] = 0
            stack = [(r, c)]
            while stack:
                cr, cc = stack.pop()
                for nr, nc in ((cr + 1, cc), (cr - 1, cc), (cr, cc + 1), (cr, cc - 1)):
                    if 0 <= nr < rows and 0 <= nc < len(grid[nr]) and grid[nr][nc] == 1:
                        grid[nr][nc] = 0
                        stack.append((nr, nc))
    return islands
