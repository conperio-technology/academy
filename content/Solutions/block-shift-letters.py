def shift_letters(s, k):
    out = []
    for c in s:
        if "a" <= c <= "z":
            out.append(chr(ord("a") + (ord(c) - ord("a") + k) % 26))
        else:
            out.append(c)
    return "".join(out)
