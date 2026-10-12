import heapq


def merge_k_sorted(lists):
    heap = []  # (value, list index, position in that list)
    for li, lst in enumerate(lists):
        if lst:
            heapq.heappush(heap, (lst[0], li, 0))
    result = []
    while heap:
        value, li, pos = heapq.heappop(heap)  # smallest head across all lists
        result.append(value)
        if pos + 1 < len(lists[li]):
            heapq.heappush(heap, (lists[li][pos + 1], li, pos + 1))  # that list's next value
    return result
