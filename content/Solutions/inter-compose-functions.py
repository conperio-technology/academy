def compose(steps):
    def composed(x):
        for step in steps:
            x = step(x)
        return x

    return composed
    # Or: from functools import reduce; return lambda x: reduce(lambda acc, f: f(acc), steps, x)
