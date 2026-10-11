from dataclasses import dataclass


@dataclass(frozen=True)   # frozen: equal points hash equally, so they work in a set
class Point:
    x: int
    y: int


def distinct(points):
    seen = set()
    result = []
    for p in points:
        if p not in seen:
            seen.add(p)
            result.append(p)
    return result
