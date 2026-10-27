def min_capacity(weights, days):
    def can_ship(capacity):
        used, load = 1, 0
        for w in weights:
            if load + w > capacity:
                used += 1
                load = 0
            load += w
        return used <= days

    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if can_ship(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo
