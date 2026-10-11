def min_window(s, t):
    need = {}
    for c in t:
        need[c] = need.get(c, 0) + 1
    missing = len(t)  # characters of t (with multiplicity) not yet covered
    best_start, best_len = 0, len(s) + 1
    left = 0
    for right, c in enumerate(s):
        if need.get(c, 0) > 0:
            missing -= 1
        need[c] = need.get(c, 0) - 1  # negative means a surplus inside the window
        while missing == 0:
            if right - left + 1 < best_len:
                best_start, best_len = left, right - left + 1
            out = s[left]
            need[out] += 1
            if need[out] > 0:
                missing += 1  # dropping it uncovered a needed character
            left += 1
    return "" if best_len > len(s) else s[best_start:best_start + best_len]
