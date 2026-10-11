def reverse_bits(n):
    result = 0
    # Exactly 32 rounds: Python ints have no width, so the loop count is what fixes it at 32 bits.
    for _ in range(32):
        result = (result << 1) | (n & 1)  # push n's lowest bit onto result
        n >>= 1
    return result
