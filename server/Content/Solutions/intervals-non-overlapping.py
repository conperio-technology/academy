def erase_overlap_intervals(intervals):
    removed = 0
    last_end = None
    for start, end in sorted(intervals, key=lambda iv: iv[1]):  # earliest finish first
        if last_end is None or start >= last_end:
            last_end = end  # fits after the last kept interval: keep it
        else:
            removed += 1  # overlaps the last kept one, which ends sooner: drop this one
    return removed
