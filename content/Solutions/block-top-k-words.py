import heapq


def top_k_words(words, k):
    counts = {}
    for w in words:
        counts[w] = counts.get(w, 0) + 1

    heap = []
    for word, count in counts.items():
        heapq.heappush(heap, (-count, word))
    return [heapq.heappop(heap)[1] for _ in range(k)]
