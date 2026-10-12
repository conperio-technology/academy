def dfs_traversal(adjacency_list, start):
    order = []
    visited = set()
    def visit(node):
        visited.add(node)
        order.append(node)
        for nxt in adjacency_list[node]:
            if nxt not in visited:
                visit(nxt)
    visit(start)
    return order
