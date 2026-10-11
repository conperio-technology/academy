import heapq

def k_closest(points, k):
    # heapq is a min-heap, so push the negated key: the farthest point kept is on top.
    heap = []
    for x, y in points:
        heapq.heappush(heap, (-(x * x + y * y), -x, -y))
        if len(heap) > k:
            heapq.heappop(heap)  # drop the farthest of the k + 1

    kept = sorted((-d, -nx, -ny) for d, nx, ny in heap)
    return [[x, y] for _, x, y in kept]
