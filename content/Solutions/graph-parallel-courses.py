def minimum_semesters(n, prerequisites):
    adj = [[] for _ in range(n)]
    indegree = [0] * n
    for a, b in prerequisites:
        adj[a].append(b)
        indegree[b] += 1

    layer = [i for i in range(n) if indegree[i] == 0]
    semesters = 0
    taken = 0
    while layer:
        semesters += 1
        taken += len(layer)
        next_layer = []
        for course in layer:
            for after in adj[course]:
                indegree[after] -= 1
                if indegree[after] == 0:
                    next_layer.append(after)
        layer = next_layer
    return semesters if taken == n else -1  # courses left over sit on a cycle
