def jump(nums):
    jumps = current_end = farthest = 0
    # Never jump FROM the last index, so stop at len(nums) - 2.
    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])  # edge of the next BFS level
        if i == current_end:
            jumps += 1  # finished scanning this level: one more jump
            current_end = farthest
    return jumps
