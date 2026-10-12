class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False  # a root ends at this node


def replace_words(dictionary, sentence):
    root = TrieNode()
    for word in dictionary:
        node = root
        for c in word:
            node = node.children.setdefault(c, TrieNode())
        node.is_end = True

    result = []
    for word in sentence.split(" "):
        node = root
        replacement = word
        for j, c in enumerate(word):
            node = node.children.get(c)
            if node is None:
                break  # no root fits
            if node.is_end:
                replacement = word[: j + 1]  # the first end mark is the shortest root
                break
        result.append(replacement)
    return " ".join(result)
