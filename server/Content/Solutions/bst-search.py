# Given: same insertion helper from the previous lesson.
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

def search_bst(values, target):
    node = build_bst(values)
    while node is not None:
        if target == node.val:
            return True
        node = node.left if target < node.val else node.right
    return False
