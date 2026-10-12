def _parse(version: str) -> tuple[list[int], list[str]]:
    version = version.split("+", 1)[0]                    # build metadata is ignored
    core, _, pre = version.partition("-")
    numbers = [int(part) for part in core.split(".")]
    return numbers, pre.split(".") if pre else []


def _compare_identifiers(a: str, b: str) -> int:
    a_num, b_num = a.isdigit(), b.isdigit()
    if a_num and b_num:
        x, y = int(a), int(b)
    elif a_num != b_num:
        return -1 if a_num else 1                         # numeric < alphanumeric
    else:
        x, y = a, b
    return (x > y) - (x < y)


def compare_versions(a: str, b: str) -> int:
    (core_a, pre_a), (core_b, pre_b) = _parse(a), _parse(b)
    if core_a != core_b:
        return -1 if core_a < core_b else 1
    if not pre_a or not pre_b:                            # a pre-release comes before the release
        return (len(pre_b) > 0) - (len(pre_a) > 0)
    for x, y in zip(pre_a, pre_b):
        if (c := _compare_identifiers(x, y)) != 0:
            return c
    return (len(pre_a) > len(pre_b)) - (len(pre_a) < len(pre_b))
