from collections import deque


def recent_counts(times):
    window = deque()
    result = []
    for t in times:
        window.append(t)
        while window[0] < t - 3000:
            window.popleft()
        result.append(len(window))
    return result
