import heapq

def topological_order(n, prerequisites):
    in_degree = [0] * n
    nxt = [[] for _ in range(n)]
    for before, after in prerequisites:
        nxt[before].append(after)
        in_degree[after] += 1

    # A min-heap, so ties always go to the smallest-numbered task.
    ready = [i for i in range(n) if in_degree[i] == 0]
    heapq.heapify(ready)

    order = []
    while ready:
        task = heapq.heappop(ready)
        order.append(task)
        for after in nxt[task]:
            in_degree[after] -= 1
            if in_degree[after] == 0:
                heapq.heappush(ready, after)
    return order if len(order) == n else []  # leftovers mean a cycle
