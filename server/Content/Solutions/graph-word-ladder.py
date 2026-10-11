from collections import defaultdict, deque


def ladder_length(begin_word, end_word, word_list):
    if end_word not in word_list:
        return 0

    # "h*t" -> every listed word that matches it. Words sharing a bucket are one change apart.
    buckets = defaultdict(list)
    for word in set(word_list):
        for i in range(len(word)):
            buckets[word[:i] + "*" + word[i + 1:]].append(word)

    visited = {begin_word}
    queue = deque([(begin_word, 1)])
    while queue:
        word, length = queue.popleft()
        if word == end_word:
            return length
        for i in range(len(word)):
            pattern = word[:i] + "*" + word[i + 1:]
            for nxt in buckets.get(pattern, []):
                if nxt not in visited:
                    visited.add(nxt)
                    queue.append((nxt, length + 1))
            buckets[pattern] = []  # every word in it is visited now, so never read it again
    return 0
