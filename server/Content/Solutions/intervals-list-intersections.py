def interval_intersection(a, b):
    result = []
    i = j = 0
    while i < len(a) and j < len(b):
        lo = max(a[i][0], b[j][0])
        hi = min(a[i][1], b[j][1])
        if lo <= hi:
            result.append([lo, hi])

        # The interval that ends first can't meet anything later in the other list.
        if a[i][1] < b[j][1]:
            i += 1
        else:
            j += 1
    return result
