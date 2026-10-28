def invert_tree(root):
    if root is None:
        return None
    # Both sides are evaluated before assigning, so neither child is lost.
    root.left, root.right = invert_tree(root.right), invert_tree(root.left)
    return root
