class MinStack:
    def __init__(self):
        self.stack = []  # (value, smallest value at or below this entry)

    def push(self, val):
        m = val if not self.stack else min(val, self.stack[-1][1])
        self.stack.append((val, m))

    def pop(self):
        self.stack.pop()

    def top(self):
        return self.stack[-1][0]

    def get_min(self):
        return self.stack[-1][1]
