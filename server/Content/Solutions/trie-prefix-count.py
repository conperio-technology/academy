class TrieNode:
    def __init__(self):
        self.children = {}
        self.count = 0  # how many inserted words pass through this node


def count_prefixes(words, prefixes):
    root = TrieNode()
    for word in words:
        node = root
        node.count += 1
        for c in word:
            node = node.children.setdefault(c, TrieNode())
            node.count += 1

    result = []
    for prefix in prefixes:
        node = root
        for c in prefix:
            node = node.children.get(c)
            if node is None:  # fell off: no word has this prefix
                break
        result.append(node.count if node else 0)
    return result
