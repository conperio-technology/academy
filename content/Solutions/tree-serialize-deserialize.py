def serialize(root):
    tokens = []

    def walk(node):
        if node is None:
            tokens.append("#")  # record the empty child so the shape is unambiguous
            return
        tokens.append(str(node.val))
        walk(node.left)
        walk(node.right)

    walk(root)
    return ",".join(tokens)


def deserialize(data):
    tokens = iter(data.split(","))

    def read():
        token = next(tokens)
        if token == "#":
            return None
        node = TreeNode(int(token))
        node.left = read()
        node.right = read()
        return node

    return read()
