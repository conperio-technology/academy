def count_windows(nums, k, target):
    if k > len(nums):
        return 0
    window = sum(nums[:k])
    count = 1 if window >= target else 0
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]
        if window >= target:
            count += 1
    return count
