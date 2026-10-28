def heap_sort(nums):
    a = list(nums)

    def sift_down(i, size):
        while True:
            left, right, big = 2 * i + 1, 2 * i + 2, i
            if left < size and a[left] > a[big]:
                big = left
            if right < size and a[right] > a[big]:
                big = right
            if big == i:
                return
            a[i], a[big] = a[big], a[i]
            i = big

    for i in range(len(a) // 2 - 1, -1, -1):
        sift_down(i, len(a))
    for end in range(len(a) - 1, 0, -1):
        a[0], a[end] = a[end], a[0]  # the max goes to its final place
        sift_down(0, end)
    return a
