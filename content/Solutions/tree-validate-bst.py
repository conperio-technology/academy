def is_valid_bst(root):
    def check(node, low, high):
        if node is None:
            return True
        # Every node must sit strictly inside the range its ancestors allow.
        if (low is not None and node.val <= low) or (high is not None and node.val >= high):
            return False
        return check(node.left, low, node.val) and check(node.right, node.val, high)

    return check(root, None, None)
