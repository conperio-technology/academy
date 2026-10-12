def find_content_children(g, s):
    g.sort()
    s.sort()
    child = 0
    # Smallest cookie first: give it to the least greedy child still waiting if it's big
    # enough, otherwise it's too small for everyone left and is skipped.
    for size in s:
        if child == len(g):
            break
        if size >= g[child]:
            child += 1
    return child
