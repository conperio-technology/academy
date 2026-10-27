from collections import deque


def bfs_distances(adj, start):
    dist = [-1] * len(adj)
    dist[start] = 0
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for nxt in adj[node]:
            if dist[nxt] == -1:
                dist[nxt] = dist[node] + 1
                queue.append(nxt)
    return dist
