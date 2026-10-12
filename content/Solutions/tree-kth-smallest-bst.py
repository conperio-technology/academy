def kth_smallest(root, k):
    stack = []
    current = root
    count = 0
    while current is not None or stack:
        while current is not None:  # everything smaller is down the left spine
            stack.append(current)
            current = current.left
        node = stack.pop()  # the next value in sorted order
        count += 1
        if count == k:
            return node.val
        current = node.right
    return -1  # k is larger than the tree
