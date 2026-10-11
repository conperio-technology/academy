def sort_words(words):
    # Tuples compare item by item: length first, then the word for ties.
    return sorted(words, key=lambda w: (len(w), w))
