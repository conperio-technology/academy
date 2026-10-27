def sort_pairs(pairs):
    return sorted(pairs, key=lambda p: (p[1], -p[0]))
