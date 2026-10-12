def with_cell(grid, row, col, value):
    copy = [r.copy() for r in grid]   # copy the rows too, not just the outer list
    copy[row][col] = value
    return copy
