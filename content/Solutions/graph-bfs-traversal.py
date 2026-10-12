from collections import deque

def bfs_traversal(adjacency_list, start):
    order = []
    visited = {start}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in adjacency_list[node]:
            if nxt in visited:
                continue
            visited.add(nxt)  # mark on enqueue, not on dequeue
            queue.append(nxt)
    return order
