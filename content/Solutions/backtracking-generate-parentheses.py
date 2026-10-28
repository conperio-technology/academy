def generate_parenthesis(n):
    result = []

    def build(current, open_count, close_count):
        if len(current) == 2 * n:
            result.append(current)
            return
        if open_count < n:
            build(current + "(", open_count + 1, close_count)
        if close_count < open_count:  # only close an open one
            build(current + ")", open_count, close_count + 1)

    build("", 0, 0)
    return result
