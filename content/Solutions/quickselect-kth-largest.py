def find_kth_largest(nums, k):
    a = list(nums)
    target, lo, hi = len(a) - k, 0, len(a) - 1  # k-th largest sits at n - k when sorted
    while True:
        mid = (lo + hi) // 2
        a[mid], a[hi] = a[hi], a[mid]
        pivot = a[hi]
        i = lo
        for j in range(lo, hi):
            if a[j] < pivot:
                a[i], a[j] = a[j], a[i]
                i += 1
        a[i], a[hi] = a[hi], a[i]
        if i == target:
            return a[i]
        if i < target:
            lo = i + 1
        else:
            hi = i - 1
