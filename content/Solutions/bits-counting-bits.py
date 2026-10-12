def count_bits(n):
    ans = [0] * (n + 1)
    # i >> 1 drops the lowest bit and is already done; add that bit back with i & 1.
    for i in range(1, n + 1):
        ans[i] = ans[i >> 1] + (i & 1)
    return ans
