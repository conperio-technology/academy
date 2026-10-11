class RangeAdder:
    def __init__(self, nums):
        self.original = list(nums)
        self.tree = [0] * (len(nums) + 2)  # Fenwick tree over the differences, 1-indexed

    def _add(self, i, delta):
        while i < len(self.tree):
            self.tree[i] += delta
            i += i & -i

    def _prefix(self, i):
        s = 0
        while i > 0:
            s += self.tree[i]
            i -= i & -i
        return s

    def add_range(self, left, right, delta):
        self._add(left + 1, delta)  # from left on, everything is delta higher
        self._add(right + 2, -delta)  # and after right, it isn't

    def get(self, index):
        return self.original[index] + self._prefix(index + 1)
