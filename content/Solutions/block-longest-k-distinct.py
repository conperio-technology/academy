def longest_k_distinct(s, k):
    counts = {}
    left = best = 0
    for right, c in enumerate(s):
        counts[c] = counts.get(c, 0) + 1
        while len(counts) > k:
            out = s[left]
            counts[out] -= 1
            if counts[out] == 0:
                del counts[out]
            left += 1
        best = max(best, right - left + 1)
    return best
