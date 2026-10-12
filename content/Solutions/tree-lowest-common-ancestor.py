def lowest_common_ancestor(root, p, q):
    def find(node):
        if node is None or node.val == p or node.val == q:
            return node
        left = find(node.left)
        right = find(node.right)
        if left is not None and right is not None:
            return node  # p and q are on different sides: this is the split point
        return left if left is not None else right

    return find(root).val
