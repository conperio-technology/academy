def count_primes(n):
    if n < 3:
        return 0
    is_prime = bytearray([1]) * n  # one byte per number, much leaner than a list of bools
    is_prime[0] = is_prime[1] = 0
    p = 2
    while p * p < n:
        if is_prime[p]:
            # Cross out p*p, p*p + p, ... in one slice assignment.
            is_prime[p * p::p] = bytes(len(range(p * p, n, p)))
        p += 1
    return sum(is_prime)
