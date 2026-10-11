_memo = {}

def fibonacci(n):
    if n <= 1:
        return n
    if n in _memo:
        return _memo[n]
    value = fibonacci(n - 1) + fibonacci(n - 2)
    _memo[n] = value
    return value
