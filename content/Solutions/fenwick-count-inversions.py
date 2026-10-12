def count_inversions(nums):
    # Coordinate compression: each distinct value -> its rank 1..k in sorted order.
    rank = {v: i + 1 for i, v in enumerate(sorted(set(nums)))}
    tree = [0] * (len(rank) + 1)  # Fenwick tree: how many of each rank seen so far
    total = 0
    for j, v in enumerate(nums):
        r = rank[v]
        i, at_most = r, 0
        while i > 0:  # prefix(r): seen values <= v
            at_most += tree[i]
            i -= i & -i
        total += j - at_most  # the rest are bigger and came earlier
        i = r
        while i < len(tree):  # add(r, 1)
            tree[i] += 1
            i += i & -i
    return total
