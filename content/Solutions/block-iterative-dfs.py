def dfs_order(adj, start):
    visited = set()
    order = []
    stack = [start]
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        order.append(node)
        for nxt in reversed(adj[node]):
            if nxt not in visited:
                stack.append(nxt)
    return order
