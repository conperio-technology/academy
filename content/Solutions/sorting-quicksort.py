def quick_sort(nums):
    a = list(nums)

    def sort(lo, hi):
        if lo >= hi:
            return
        mid = (lo + hi) // 2
        a[mid], a[hi] = a[hi], a[mid]  # middle pivot: sorted input still splits evenly
        pivot = a[hi]
        i = lo
        for j in range(lo, hi):
            if a[j] < pivot:
                a[i], a[j] = a[j], a[i]
                i += 1
        a[i], a[hi] = a[hi], a[i]
        sort(lo, i - 1)
        sort(i + 1, hi)

    sort(0, len(a) - 1)
    return a
