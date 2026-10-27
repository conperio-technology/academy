def dedupe_sorted(nums):
    if not nums:
        return nums
    slow = 0
    for fast in range(1, len(nums)):
        if nums[fast] != nums[slow]:
            slow += 1
            nums[slow] = nums[fast]
    return nums[:slow + 1]
