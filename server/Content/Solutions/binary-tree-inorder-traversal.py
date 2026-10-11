def inorder_traversal(root):
    result = []
    def walk(node):
        if node is None:
            return
        walk(node.left)
        result.append(node.val)
        walk(node.right)
    walk(root)
    return result
