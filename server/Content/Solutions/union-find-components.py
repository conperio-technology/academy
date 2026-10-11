def count_components(n, edges):
    parent = list(range(n))
    size = [1] * n

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]  # path compression (halving)
            x = parent[x]
        return x

    components = n
    for a, b in edges:
        root_a, root_b = find(a), find(b)
        if root_a != root_b:
            if size[root_a] < size[root_b]:  # union by size: hang the smaller tree under the larger
                root_a, root_b = root_b, root_a
            parent[root_b] = root_a
            size[root_a] += size[root_b]
            components -= 1
    return components
