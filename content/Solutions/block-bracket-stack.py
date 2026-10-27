def is_balanced(s):
    opener_for = {")": "(", "]": "[", "}": "{"}
    stack = []
    for c in s:
        if c in "([{":
            stack.append(c)
        elif c in opener_for:
            if not stack or stack[-1] != opener_for[c]:
                return False
            stack.pop()
    return not stack
