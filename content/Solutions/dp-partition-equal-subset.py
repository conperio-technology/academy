def can_partition(nums):
    total = sum(nums)
    if total % 2:  # two equal halves need an even total
        return False
    target = total // 2
    reachable = [True] + [False] * target
    for x in nums:
        for s in range(target, x - 1, -1):  # downwards: each number is used at most once
            if reachable[s - x]:
                reachable[s] = True
    return reachable[target]
