def find_occurrences(text, pattern):
    lps = build_lps(pattern)
    result = []
    j = 0  # how many characters of pattern currently match
    for i, c in enumerate(text):
        while j > 0 and c != pattern[j]:
            j = lps[j - 1]  # fall back to the longest border, text pointer stays put
        if c == pattern[j]:
            j += 1
        if j == len(pattern):
            result.append(i - j + 1)
            j = lps[j - 1]  # keep going so overlapping matches are found
    return result

def build_lps(pattern):
    # lps[i] = length of the longest proper prefix of pattern[:i + 1] that is also a suffix of it.
    lps = [0] * len(pattern)
    length = 0
    for i in range(1, len(pattern)):
        while length > 0 and pattern[i] != pattern[length]:
            length = lps[length - 1]
        if pattern[i] == pattern[length]:
            length += 1
        lps[i] = length
    return lps
