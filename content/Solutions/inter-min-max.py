def min_max[T](items: list[T]) -> tuple[T, T]:
    lo = hi = items[0]
    for item in items:
        if item < lo:
            lo = item
        if item > hi:
            hi = item
    return lo, hi
