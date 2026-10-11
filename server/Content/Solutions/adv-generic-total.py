from collections.abc import Iterable
from decimal import Decimal


def total[T: (int, float, Decimal)](items: Iterable[T]) -> T:
    result = 0
    for item in items:
        result = result + item
    return result
