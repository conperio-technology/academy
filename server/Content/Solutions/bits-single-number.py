def single_number(nums):
    acc = 0  # XOR identity
    for x in nums:
        acc ^= x  # x ^ x == 0, so every pair cancels
    return acc
