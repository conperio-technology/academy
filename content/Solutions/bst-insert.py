def build_bst(values):
    root = None
    for v in values:
        root = insert(root, v)
    return root

def insert(node, val):
    if node is None:
        return TreeNode(val)
    if val < node.val:
        node.left = insert(node.left, val)
    else:
        node.right = insert(node.right, val)
    return node
