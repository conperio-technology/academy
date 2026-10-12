def subarray_sum(nums, k):
    counts = {0: 1}  # the empty prefix
    running = 0
    found = 0
    for n in nums:
        running += n
        # Runs ending here that sum to k start after a prefix equal to running - k.
        found += counts.get(running - k, 0)
        counts[running] = counts.get(running, 0) + 1
    return found
