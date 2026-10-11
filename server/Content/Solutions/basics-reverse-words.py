def reverse_words(text):
    words = text.split()  # no argument: splits on runs of whitespace, no empty pieces
    return " ".join(reversed(words))
