import heapq


def network_delay_time(times, n, k):
    adj = [[] for _ in range(n)]
    for u, v, w in times:
        adj[u].append((v, w))  # one way only

    dist = [float("inf")] * n
    dist[k] = 0
    heap = [(0, k)]
    while heap:
        d, node = heapq.heappop(heap)
        if d != dist[node]:
            continue  # stale entry
        for to, w in adj[node]:
            if d + w < dist[to]:
                dist[to] = d + w
                heapq.heappush(heap, (dist[to], to))

    latest = max(dist)  # everyone has the signal once the slowest arrival happens
    return -1 if latest == float("inf") else latest
