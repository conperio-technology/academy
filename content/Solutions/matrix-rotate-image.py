def rotate(matrix):
    n = len(matrix)
    for r in range(n):
        for c in range(r + 1, n):  # above the diagonal only, or each pair swaps back
            matrix[r][c], matrix[c][r] = matrix[c][r], matrix[r][c]
    for row in matrix:
        row.reverse()
    return matrix
