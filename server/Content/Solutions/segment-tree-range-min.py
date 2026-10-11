class RangeMinTree:
    def __init__(self, nums):
        self.n = len(nums)
        self.tree = [0] * (4 * max(self.n, 1))  # root at 1; node k's children are 2k and 2k + 1
        if self.n:
            self._build(nums, 1, 0, self.n - 1)

    def _build(self, nums, node, lo, hi):
        if lo == hi:
            self.tree[node] = nums[lo]
            return
        mid = (lo + hi) // 2
        self._build(nums, 2 * node, lo, mid)
        self._build(nums, 2 * node + 1, mid + 1, hi)
        self.tree[node] = min(self.tree[2 * node], self.tree[2 * node + 1])

    def update(self, index, val):
        def go(node, lo, hi):
            if lo == hi:
                self.tree[node] = val
                return
            mid = (lo + hi) // 2
            if index <= mid:
                go(2 * node, lo, mid)
            else:
                go(2 * node + 1, mid + 1, hi)
            self.tree[node] = min(self.tree[2 * node], self.tree[2 * node + 1])

        go(1, 0, self.n - 1)

    def query_min(self, left, right):
        def query(node, lo, hi):
            if right < lo or hi < left:
                return float("inf")  # identity for min
            if left <= lo and hi <= right:
                return self.tree[node]
            mid = (lo + hi) // 2
            return min(query(2 * node, lo, mid), query(2 * node + 1, mid + 1, hi))

        return query(1, 0, self.n - 1)
