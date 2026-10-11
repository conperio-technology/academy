def min_spanning_tree_cost(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    total = taken = 0
    for u, v, w in sorted(edges, key=lambda e: e[2]):  # cheapest first
        root_u, root_v = find(u), find(v)
        if root_u == root_v:  # already connected: this edge would close a loop
            continue
        parent[root_u] = root_v
        total += w
        taken += 1
    return total if taken == n - 1 else -1
