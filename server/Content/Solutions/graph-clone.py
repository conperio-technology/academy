from collections import deque


def clone_graph(node):
    if node is None:
        return None

    # Original -> copy. Doubles as the visited set: a node is in here once it's copied.
    copies = {node: Node(node.val)}
    queue = deque([node])
    while queue:
        u = queue.popleft()
        for v in u.neighbors:
            if v not in copies:
                copies[v] = Node(v.val)
                queue.append(v)
            copies[u].neighbors.append(copies[v])
    return copies[node]
