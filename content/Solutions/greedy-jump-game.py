def can_jump(nums):
    farthest = 0  # right edge of the block of reachable indexes
    for i, step in enumerate(nums):
        if i > farthest:
            return False  # nothing reaches i, so nothing reaches the end
        farthest = max(farthest, i + step)
        if farthest >= len(nums) - 1:
            return True
    return True
