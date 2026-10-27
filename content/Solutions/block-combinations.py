def combinations(n, k):
    result = []
    path = []

    def backtrack(start):
        if len(path) == k:
            result.append(path[:])
            return
        for number in range(start, n + 1):
            path.append(number)
            backtrack(number + 1)
            path.pop()

    backtrack(1)
    return result
