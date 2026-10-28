def spiral_order(matrix):
    result = []
    if not matrix:
        return result
    top, bottom, left, right = 0, len(matrix) - 1, 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            result.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):
            result.append(matrix[r][right])
        right -= 1
        if top <= bottom:  # a single leftover row was already read
            for c in range(right, left - 1, -1):
                result.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:  # a single leftover column was already read
            for r in range(bottom, top - 1, -1):
                result.append(matrix[r][left])
            left += 1
    return result
