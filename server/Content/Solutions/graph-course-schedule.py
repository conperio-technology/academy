def can_finish(num_courses, prerequisites):
    # Edge b -> a for each pair [a, b]: taking b unlocks a.
    nxt = [[] for _ in range(num_courses)]
    for a, b in prerequisites:
        nxt[b].append(a)

    state = [0] * num_courses  # 0 = unvisited, 1 = on the current path, 2 = done

    def has_cycle(u):
        state[u] = 1
        for v in nxt[u]:
            if state[v] == 1:  # back to a node on the path: a loop
                return True
            if state[v] == 0 and has_cycle(v):
                return True
        state[u] = 2
        return False

    for course in range(num_courses):
        if state[course] == 0 and has_cycle(course):
            return False
    return True
