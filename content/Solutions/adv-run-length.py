from collections.abc import Iterable
from itertools import groupby


def run_length(statuses: Iterable[str]) -> list[str]:
    return [f"{status} x{sum(1 for _ in group)}" for status, group in groupby(statuses)]
