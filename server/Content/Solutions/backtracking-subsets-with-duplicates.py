def subsets_with_dup(nums):
    nums = sorted(nums)
    result = []
    current = []

    def backtrack(start):
        result.append(current[:])
        for i in range(start, len(nums)):
            # An equal value already tried at this level would grow the same subtree.
            if i > start and nums[i] == nums[i - 1]:
                continue
            current.append(nums[i])
            backtrack(i + 1)
            current.pop()

    backtrack(0)
    return result
