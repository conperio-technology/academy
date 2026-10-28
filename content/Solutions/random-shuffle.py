def shuffle(nums, picks):
    a = list(nums)
    for i in range(len(a) - 1, 0, -1):
        j = picks[len(a) - 1 - i]  # real code: random.randint(0, i), a slot from 0 to i
        a[i], a[j] = a[j], a[i]  # position i is now final
    return a
