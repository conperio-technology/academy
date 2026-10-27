def index_of_max(nums):
    if not nums:
        return -1
    best = 0
    for i in range(1, len(nums)):
        if nums[i] > nums[best]:
            best = i
    return best
