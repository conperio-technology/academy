def insert_interval(intervals, new_interval):
    result = []
    start, end = new_interval
    i, n = 0, len(intervals)
    while i < n and intervals[i][1] < start:  # ends before the new one starts
        result.append(intervals[i])
        i += 1
    while i < n and intervals[i][0] <= end:  # overlaps: absorb it
        start = min(start, intervals[i][0])
        end = max(end, intervals[i][1])
        i += 1
    result.append([start, end])
    result.extend(intervals[i:])  # everything left starts after the merged one ends
    return result
