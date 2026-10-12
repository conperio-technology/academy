def count_smaller(nums):
    # Coordinate compression: each distinct value -> its rank 1..k in sorted order.
    rank = {v: i + 1 for i, v in enumerate(sorted(set(nums)))}
    tree = [0] * (len(rank) + 1)  # Fenwick tree: how many of each rank seen so far
    counts = [0] * len(nums)
    for i in range(len(nums) - 1, -1, -1):
        r = rank[nums[i]]
        j, smaller = r - 1, 0
        while j > 0:  # prefix(r - 1): strictly smaller values already seen
            smaller += tree[j]
            j -= j & -j
        counts[i] = smaller
        j = r
        while j < len(tree):  # add(r, 1)
            tree[j] += 1
            j += j & -j
    return counts
