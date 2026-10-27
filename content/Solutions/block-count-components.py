def count_components(n, edges):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)

    visited = [False] * n

    def dfs(node):
        visited[node] = True
        for nxt in adj[node]:
            if not visited[nxt]:
                dfs(nxt)

    components = 0
    for i in range(n):
        if not visited[i]:
            components += 1
            dfs(i)
    return components
