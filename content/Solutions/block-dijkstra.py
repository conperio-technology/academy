import heapq


def shortest_paths(n, edges, src):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))

    inf = float("inf")
    dist = [inf] * n
    dist[src] = 0
    heap = [(0, src)]
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist[node]:
            continue
        for nxt, w in adj[node]:
            if d + w < dist[nxt]:
                dist[nxt] = d + w
                heapq.heappush(heap, (dist[nxt], nxt))
    return [-1 if d == inf else d for d in dist]
