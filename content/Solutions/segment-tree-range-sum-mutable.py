class NumArray:
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
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def update(self, index, val):
        node, lo, hi = 1, 0, self.n - 1
        path = []
        while lo < hi:  # walk down to the leaf, remembering the path
            path.append(node)
            mid = (lo + hi) // 2
            if index <= mid:
                node, hi = 2 * node, mid
            else:
                node, lo = 2 * node + 1, mid + 1
        self.tree[node] = val
        for p in reversed(path):  # recompute every ancestor
            self.tree[p] = self.tree[2 * p] + self.tree[2 * p + 1]

    def sum_range(self, left, right):
        def query(node, lo, hi):
            if right < lo or hi < left:
                return 0  # completely outside
            if left <= lo and hi <= right:
                return self.tree[node]  # completely inside
            mid = (lo + hi) // 2
            return query(2 * node, lo, mid) + query(2 * node + 1, mid + 1, hi)

        return query(1, 0, self.n - 1)
