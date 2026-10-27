def first_repeat_index(nums):
    seen = set()
    for i, value in enumerate(nums):
        if value in seen:
            return i
        seen.add(value)
    return -1
