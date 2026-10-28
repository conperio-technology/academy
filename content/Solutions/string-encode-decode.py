def encode(strs):
    return "".join(f"{len(s)}#{s}" for s in strs)  # length first: no escaping needed


def decode(s):
    result = []
    i = 0
    while i < len(s):
        j = s.index("#", i)  # the first # after i always ends a length
        length = int(s[i:j])
        result.append(s[j + 1:j + 1 + length])  # copy, never search, the content
        i = j + 1 + length
    return result
