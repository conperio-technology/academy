def permute(nums):
    result = []
    current = []
    used = [False] * len(nums)

    def backtrack():
        if len(current) == len(nums):
            result.append(current[:])  # a COPY -- current keeps changing
            return
        for i in range(len(nums)):  # index order keeps the output lexicographic
            if used[i]:
                continue
            used[i] = True
            current.append(nums[i])
            backtrack()
            current.pop()  # undo the choice
            used[i] = False

    backtrack()
    return result
