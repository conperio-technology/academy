def subsets(nums):
    result = []
    current = []

    def backtrack(start):
        result.append(current[:])  # a COPY -- current keeps changing
        for i in range(start, len(nums)):
            current.append(nums[i])
            backtrack(i + 1)
            current.pop()  # undo the choice

    backtrack(0)
    return result
