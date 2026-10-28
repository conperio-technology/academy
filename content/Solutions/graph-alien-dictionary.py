import heapq


def alien_order(words):
    nxt = {c: set() for w in words for c in w}
    indegree = {c: 0 for c in nxt}
    for a, b in zip(words, words[1:]):
        for x, y in zip(a, b):
            if x != y:
                if y not in nxt[x]:  # only the first difference is a rule
                    nxt[x].add(y)
                    indegree[y] += 1
                break
        else:
            if len(a) > len(b):
                return ""  # a word before its own prefix: no alphabet sorts that way
    ready = [c for c, d in indegree.items() if d == 0]
    heapq.heapify(ready)
    order = []
    while ready:
        c = heapq.heappop(ready)
        order.append(c)
        for d in nxt[c]:
            indegree[d] -= 1
            if indegree[d] == 0:
                heapq.heappush(ready, d)
    return "".join(order) if len(order) == len(indegree) else ""  # leftovers mean a cycle
