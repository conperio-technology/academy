def set_zeroes(matrix):
    rows = len(matrix)
    cols = len(matrix[0]) if rows else 0
    first_col_zero = False  # matrix[0][0] marks row 0, so column 0 needs its own flag
    for r in range(rows):
        if matrix[r][0] == 0:
            first_col_zero = True
        for c in range(1, cols):
            if matrix[r][c] == 0:
                matrix[r][0] = 0
                matrix[0][c] = 0
    for r in range(1, rows):
        for c in range(1, cols):
            if matrix[r][0] == 0 or matrix[0][c] == 0:
                matrix[r][c] = 0
    if rows and matrix[0][0] == 0:
        for c in range(cols):
            matrix[0][c] = 0
    if first_col_zero:
        for r in range(rows):
            matrix[r][0] = 0
    return matrix
