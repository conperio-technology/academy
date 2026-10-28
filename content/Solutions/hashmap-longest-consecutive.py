def longest_consecutive(nums):
    values = set(nums)
    best = 0
    for x in values:
        if x - 1 in values:  # not the start of a run
            continue
        y = x
        while y + 1 in values:  # each run is walked once, from its start
            y += 1
        best = max(best, y - x + 1)
    return best
