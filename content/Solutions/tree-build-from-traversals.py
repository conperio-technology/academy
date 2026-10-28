def build_tree(preorder, inorder):
    index_of = {v: i for i, v in enumerate(inorder)}  # O(1) splits
    next_pre = 0

    def build(lo, hi):
        nonlocal next_pre
        if lo > hi:
            return None
        node = TreeNode(preorder[next_pre])
        next_pre += 1
        m = index_of[node.val]
        node.left = build(lo, m - 1)  # left first: preorder lists the left subtree next
        node.right = build(m + 1, hi)
        return node

    return build(0, len(inorder) - 1)
