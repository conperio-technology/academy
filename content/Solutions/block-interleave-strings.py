def interleave(a, b):
    parts = []
    for i in range(max(len(a), len(b))):
        if i < len(a):
            parts.append(a[i])
        if i < len(b):
            parts.append(b[i])
    return "".join(parts)
