from collections import deque


def right_side_view(root):
    result = []
    if root is None:
        return result
    queue = deque([root])
    while queue:
        for _ in range(len(queue)):  # exactly the nodes on this level
            node = queue.popleft()
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(node.val)  # the last node of the level
    return result
