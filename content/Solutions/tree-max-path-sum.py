def max_path_sum(root):
    best = float("-inf")  # not 0: an all-negative tree's answer is negative

    def gain(node):
        nonlocal best
        if node is None:
            return 0
        left = max(0, gain(node.left))  # a negative branch is better left out
        right = max(0, gain(node.right))
        best = max(best, node.val + left + right)  # the path that bends here
        return node.val + max(left, right)  # the parent can extend only one side

    gain(root)
    return best
