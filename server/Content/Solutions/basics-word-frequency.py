def word_frequency(text):
    counts = {}
    for word in text.lower().split():
        counts[word] = counts.get(word, 0) + 1
    return counts
    # Or: from collections import Counter; return dict(Counter(text.lower().split()))
