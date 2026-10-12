def get_sum(a, b):
    mask = 0xFFFFFFFF  # Python ints are unbounded: keep everything to 32 bits by hand
    while b != 0:
        a, b = (a ^ b) & mask, ((a & b) << 1) & mask
    # a is now a 32-bit pattern. Bit 31 set means negative: sign-extend it.
    return a if a <= 0x7FFFFFFF else ~(a ^ mask)
