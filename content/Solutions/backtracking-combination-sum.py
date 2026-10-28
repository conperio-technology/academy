def combination_sum(candidates, target):
    candidates = sorted(candidates)  # sorted, so a too-big candidate ends the loop
    result = []
    path = []

    def backtrack(start, remaining):
        if remaining == 0:
            result.append(path[:])
            return
        for i in range(start, len(candidates)):  # never an earlier index: no duplicate orders
            if candidates[i] > remaining:
                break
            path.append(candidates[i])
            backtrack(i, remaining - candidates[i])  # i, not i + 1: reuse allowed
            path.pop()

    backtrack(0, target)
    return result
