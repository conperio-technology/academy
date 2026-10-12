def is_valid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for c in s:
        if c not in pairs:
            stack.append(c)
            continue
        if not stack or stack.pop() != pairs[c]:
            return False
    return not stack
