def count_paths(rows, cols):
    memo = {}

    def ways(r, c):
        if r == 0 or c == 0:
            return 1
        if (r, c) in memo:
            return memo[(r, c)]
        memo[(r, c)] = ways(r - 1, c) + ways(r, c - 1)
        return memo[(r, c)]

    return ways(rows - 1, cols - 1)
