def counting_sort(nums):
    if not nums:
        return []
    lo, hi = min(nums), max(nums)
    counts = [0] * (hi - lo + 1)  # index x - lo holds how many times x appears
    for x in nums:
        counts[x - lo] += 1
    result = []
    for i, c in enumerate(counts):
        result.extend([i + lo] * c)
    return result
