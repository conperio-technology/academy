def count_coast_cells(grid):
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    count = 0
    for r in range(len(grid)):
        for c in range(len(grid[r])):
            if grid[r][c] == 0:
                continue
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if nr < 0 or nr >= len(grid) or nc < 0 or nc >= len(grid[nr]):
                    continue
                if grid[nr][nc] == 0:
                    count += 1
                    break
    return count
