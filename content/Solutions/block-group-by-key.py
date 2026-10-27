def group_by_first_letter(words):
    groups = {}
    for word in words:
        groups.setdefault(word[0].lower(), []).append(word)
    return list(groups.values())
