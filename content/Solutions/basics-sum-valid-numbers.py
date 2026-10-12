def sum_valid(items):
    total = 0
    for item in items:
        try:
            total += int(item)
        except ValueError:
            pass  # not a whole number: skip it on purpose
    return total
