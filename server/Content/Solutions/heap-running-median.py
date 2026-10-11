import heapq


def running_median(stream):
    low = []   # max-heap of the smaller half, stored negated
    high = []  # min-heap of the larger half
    result = []
    for x in stream:
        heapq.heappush(low, -x)
        heapq.heappush(high, -heapq.heappop(low))  # low's largest moves up
        if len(high) > len(low):
            heapq.heappush(low, -heapq.heappop(high))  # keep low the same size or one bigger
        if len(low) > len(high):
            result.append(float(-low[0]))
        else:
            result.append((-low[0] + high[0]) / 2)
    return result
