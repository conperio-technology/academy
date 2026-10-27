from collections import deque


def course_order(n, prereqs):
    adj = [[] for _ in range(n)]
    indegree = [0] * n
    for course, before in prereqs:
        adj[before].append(course)
        indegree[course] += 1

    queue = deque(i for i in range(n) if indegree[i] == 0)
    order = []
    while queue:
        course = queue.popleft()
        order.append(course)
        for nxt in adj[course]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)
    return order if len(order) == n else []
