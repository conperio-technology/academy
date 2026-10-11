# Given: same helpers from earlier lessons.
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

def inorder_traversal(root):
    result = []
    def walk(n):
        if n is None:
            return
        walk(n.left)
        result.append(n.val)
        walk(n.right)
    walk(root)
    return result

def delete_and_verify(values, key):
    root = build_bst(values)
    root = delete_node(root, key)
    return inorder_traversal(root)

def delete_node(root, key):
    if root is None:
        return None  # key isn't in the tree
    if key < root.val:
        root.left = delete_node(root.left, key)
        return root
    if key > root.val:
        root.right = delete_node(root.right, key)
        return root

    # Found it.
    if root.left is None:
        return root.right  # no children, or only a right child
    if root.right is None:
        return root.left   # only a left child

    # Two children: borrow the inorder successor's value, then delete the successor.
    successor = root.right
    while successor.left is not None:
        successor = successor.left
    root.val = successor.val
    root.right = delete_node(root.right, successor.val)
    return root
