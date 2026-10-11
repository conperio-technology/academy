def two_sum(nums, target):
    seen = {}  # value -> index
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i  # added AFTER the check, so an element never pairs with itself
    return []
