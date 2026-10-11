def merge_intervals(intervals):
    merged = []
    for start, end in sorted(intervals, key=lambda iv: iv[0]):
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)  # overlaps -- extend
        else:
            merged.append([start, end])
    return merged
