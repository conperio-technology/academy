def most_common_char(s):
    counts = {}
    for c in s:
        counts[c] = counts.get(c, 0) + 1

    best, best_count = "", 0
    for c in s:
        if counts[c] > best_count:
            best, best_count = c, counts[c]
    return best
