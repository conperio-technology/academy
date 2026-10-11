from collections import deque


def is_bipartite(graph):
    colour = [0] * len(graph)  # 0 = uncoloured, 1 = group A, -1 = group B

    # Every component needs its own start; the clash may not be reachable from node 0.
    for start in range(len(graph)):
        if colour[start] != 0:
            continue
        colour[start] = 1
        queue = deque([start])
        while queue:
            u = queue.popleft()
            for v in graph[u]:
                if colour[v] == 0:
                    colour[v] = -colour[u]
                    queue.append(v)
                elif colour[v] == colour[u]:
                    return False  # both ends of u-v in the same group
    return True
