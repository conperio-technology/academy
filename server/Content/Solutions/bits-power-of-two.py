def is_power_of_two(n):
    # One set bit means clearing the lowest set bit leaves 0; n > 0 rules out 0 and negatives.
    return n > 0 and (n & (n - 1)) == 0
