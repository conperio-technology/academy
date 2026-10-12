import heapq

def top_k_largest(nums, k):
    heap = []  # min-heap: smallest value on top
    for n in nums:
        heapq.heappush(heap, n)
        if len(heap) > k:
            heapq.heappop(heap)  # drop the smallest -- it can't be top-k
    return sorted(heap)
