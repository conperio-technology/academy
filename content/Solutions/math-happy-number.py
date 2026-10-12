def is_happy(n):
    def nxt(k):
        total = 0
        while k > 0:
            k, d = divmod(k, 10)
            total += d * d
        return total

    seen = set()
    while n != 1 and n not in seen:
        seen.add(n)
        n = nxt(n)
    return n == 1
