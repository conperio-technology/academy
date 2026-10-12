from collections import defaultdict


def group_by_length(words):
    groups = defaultdict(list)      # a missing key starts as an empty list
    for word in words:
        groups[len(word)].append(word)
    return dict(groups)
