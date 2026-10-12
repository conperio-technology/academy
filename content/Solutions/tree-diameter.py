def diameter_of_binary_tree(root):
    best = 0

    def height(node):
        nonlocal best
        if node is None:
            return 0
        left = height(node.left)
        right = height(node.right)
        # The longest path that bends at this node uses left + right edges.
        best = max(best, left + right)
        return 1 + max(left, right)

    height(root)
    return best
