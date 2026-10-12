import functools
from collections.abc import Callable


def memoize(func: Callable[[int], int]) -> Callable[[int], int]:
    cache: dict[int, int] = {}

    @functools.wraps(func)
    def wrapper(n: int) -> int:
        if n not in cache:
            cache[n] = func(n)
        return cache[n]

    return wrapper
