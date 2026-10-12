def range_sum(nums, left, right):
    prefix = [0] * (len(nums) + 1)
    for i, n in enumerate(nums):
        prefix[i + 1] = prefix[i] + n
    return prefix[right + 1] - prefix[left]
