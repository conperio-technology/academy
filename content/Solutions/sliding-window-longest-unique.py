def length_of_longest_substring(s):
    window = set()
    left = best = 0
    for right, c in enumerate(s):
        while c in window:  # shrink until the repeat is gone
            window.remove(s[left])
            left += 1
        window.add(c)
        best = max(best, right - left + 1)
    return best
