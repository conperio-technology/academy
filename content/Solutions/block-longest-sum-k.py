def longest_subarray_sum_k(nums, k):
    first_index = {0: -1}
    total = best = 0
    for i, value in enumerate(nums):
        total += value
        if total - k in first_index:
            best = max(best, i - first_index[total - k])
        if total not in first_index:
            first_index[total] = i
    return best
