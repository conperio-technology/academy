def split_array(nums, k):
    lo, hi = max(nums), sum(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if parts_needed(nums, mid) <= k:
            hi = mid      # cap is big enough, try a smaller one
        else:
            lo = mid + 1  # needs too many parts, the cap must grow
    return lo

def parts_needed(nums, cap):
    # Greedy: keep adding to the current part until the next number would push it over cap.
    parts, current = 1, 0
    for x in nums:
        if current + x > cap:
            parts += 1
            current = 0
        current += x
    return parts
