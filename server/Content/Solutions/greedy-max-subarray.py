def max_sub_array(nums):
    current = best = nums[0]
    for x in nums[1:]:
        # Extend the run ending at the previous element, or start fresh if that run is a drag.
        current = max(x, current + x)
        best = max(best, current)
    return best
