def find_max(nums):
    # Start from the first element, not 0 -- an all-negative list has no 0 in it.
    best = nums[0]
    for n in nums[1:]:
        if n > best:
            best = n
    return best
