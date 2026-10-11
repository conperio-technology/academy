def in_both(a, b):
    in_b = set(b)  # built once: O(m)
    added = set()
    result = []
    for x in a:
        if x in in_b and x not in added:
            added.add(x)
            result.append(x)
    return result
