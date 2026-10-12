def my_pow(x, n):
    if n < 0:  # Python ints are unbounded, so -n is always exact
        x = 1 / x
        n = -n
    result = 1.0
    while n > 0:
        if n & 1:  # this bit of the exponent is set
            result *= x
        x *= x  # x, x^2, x^4, x^8, ...
        n >>= 1
    return result
