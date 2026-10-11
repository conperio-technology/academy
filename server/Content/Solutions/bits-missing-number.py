def missing_number(nums):
    acc = len(nums)  # the value n, which no index covers
    for i, x in enumerate(nums):
        acc ^= i ^ x  # present values cancel in pairs
    return acc
