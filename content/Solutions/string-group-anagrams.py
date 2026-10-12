def group_anagrams(words):
    groups = {}
    for word in words:
        key = "".join(sorted(word))  # every anagram sorts to the same key
        groups.setdefault(key, []).append(word)
    return list(groups.values())
