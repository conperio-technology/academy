import heapq

def dijkstra(adjacency_list, source):
    dist = [float("inf")] * len(adjacency_list)
    dist[source] = 0
    heap = [(0, source)]
    while heap:
        d, node = heapq.heappop(heap)
        if d != dist[node]:
            continue  # stale entry -- a shorter path already won
        for neighbor, weight in adjacency_list[node]:
            if d + weight < dist[neighbor]:
                dist[neighbor] = d + weight
                heapq.heappush(heap, (dist[neighbor], neighbor))
    return [-1 if x == float("inf") else x for x in dist]
