def partition_labels(s):
    last = {ch: i for i, ch in enumerate(s)}  # later indexes overwrite earlier ones
    parts = []
    start = end = 0
    for i, ch in enumerate(s):
        end = max(end, last[ch])  # this part must reach every letter's last copy
        if i == end:
            parts.append(end - start + 1)  # nothing in this part appears later: cut
            start = i + 1
    return parts
