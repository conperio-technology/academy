from collections import deque

def find_deadlocked(n, waits_for):
    # waiting_on[a] = how many threads a still waits for; waiters[b] = who waits for b.
    waiting_on = [0] * n
    waiters = [[] for _ in range(n)]
    for a, b in waits_for:
        waiting_on[a] += 1
        waiters[b].append(a)

    ready = deque(i for i in range(n) if waiting_on[i] == 0)

    # Finish every thread that can finish; each one unblocks its waiters.
    finished = [False] * n
    while ready:
        t = ready.popleft()
        finished[t] = True
        for w in waiters[t]:
            waiting_on[w] -= 1
            if waiting_on[w] == 0:
                ready.append(w)

    # Whatever never finished is in a cycle or waiting behind one.
    return [i for i in range(n) if not finished[i]]
