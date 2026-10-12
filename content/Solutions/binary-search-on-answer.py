def min_eating_speed(piles, h):
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if hours_needed(piles, mid) <= h:
            hi = mid      # fast enough -- try slower
        else:
            lo = mid + 1  # too slow
    return lo

def hours_needed(piles, k):
    return sum((pile + k - 1) // k for pile in piles)  # ceil(pile / k)
