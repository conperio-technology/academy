def find_min(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1  # the drop, and the minimum, are right of mid
        else:
            hi = mid  # mid..hi is sorted, so the minimum is mid or left of it
    return nums[lo]
