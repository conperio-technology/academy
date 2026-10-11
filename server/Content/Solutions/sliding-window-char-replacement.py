def character_replacement(s, k):
    counts = {}
    left = 0
    max_count = 0
    best = 0
    for right, ch in enumerate(s):
        counts[ch] = counts.get(ch, 0) + 1
        max_count = max(max_count, counts[ch])
        # Too many letters differ from the most common one: shrink from the left.
        while (right - left + 1) - max_count > k:
            counts[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best
