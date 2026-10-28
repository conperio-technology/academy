def eval_rpn(tokens):
    stack = []
    for t in tokens:
        if t in ("+", "-", "*", "/"):  # "-3" is a number, "-" is an operator
            b = stack.pop()  # the right operand comes off first
            a = stack.pop()
            if t == "+":
                stack.append(a + b)
            elif t == "-":
                stack.append(a - b)
            elif t == "*":
                stack.append(a * b)
            else:
                stack.append(int(a / b))  # truncate toward zero; // would floor
        else:
            stack.append(int(t))
    return stack.pop()
