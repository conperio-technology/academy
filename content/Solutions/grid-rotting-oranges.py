from collections import deque


def oranges_rotting(grid):
    queue = deque()
    fresh = 0
    for r in range(len(grid)):
        for c in range(len(grid[r])):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1

    minutes = 0
    while queue and fresh > 0:
        # One layer of the BFS = one minute.
        for _ in range(len(queue)):
            r, c = queue.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < len(grid) and 0 <= nc < len(grid[nr]) and grid[nr][nc] == 1:
                    grid[nr][nc] = 2  # rot on push so it's never enqueued twice
                    fresh -= 1
                    queue.append((nr, nc))
        minutes += 1
    return minutes if fresh == 0 else -1
