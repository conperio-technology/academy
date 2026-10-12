def first_index(nums, target):
    for i, n in enumerate(nums):
        if n == target:
            return i  # first match: stop right here
    return -1  # only reached when nothing matched
