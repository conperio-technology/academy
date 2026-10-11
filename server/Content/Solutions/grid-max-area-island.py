def max_area_of_island(grid):
    rows = len(grid)
    best = 0
    for r in range(rows):
        for c in range(len(grid[r])):
            if grid[r][c] != 1:
                continue

            # Flood fill that counts: sink each cell as it is pushed, count it as it is popped.
            area = 0
            grid[r][c] = 0
            stack = [(r, c)]
            while stack:
                cr, cc = stack.pop()
                area += 1
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nr, nc = cr + dr, cc + dc
                    if 0 <= nr < rows and 0 <= nc < len(grid[nr]) and grid[nr][nc] == 1:
                        grid[nr][nc] = 0
                        stack.append((nr, nc))
            best = max(best, area)
    return best
