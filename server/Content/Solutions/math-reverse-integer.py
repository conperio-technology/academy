def reverse(x):
    # Python's % and // round toward negative infinity (-123 % 10 == 7), so strip the sign first.
    sign = -1 if x < 0 else 1
    x = abs(x)
    result = 0
    while x:
        x, digit = divmod(x, 10)
        result = result * 10 + digit
    result *= sign
    # Python ints never overflow, so the 32-bit limits have to be checked by hand.
    if result < -2**31 or result > 2**31 - 1:
        return 0
    return result
