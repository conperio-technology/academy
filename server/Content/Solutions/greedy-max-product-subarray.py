def max_product(nums):
    hi = lo = best = nums[0]
    for x in nums[1:]:
        a, b = hi * x, lo * x  # both from the OLD hi and lo
        hi = max(x, a, b)
        lo = min(x, a, b)
        best = max(best, hi)
    return best
