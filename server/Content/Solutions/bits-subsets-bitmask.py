def subsets_by_mask(nums):
    n = len(nums)
    result = []
    for mask in range(1 << n):  # 0 .. 2^n - 1
        result.append([nums[i] for i in range(n) if (mask >> i) & 1])  # bit i set: take nums[i]
    return result
