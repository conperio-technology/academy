def total_n_queens(n):
    cols = set()
    diags = set()       # r - c is constant along a "\" diagonal
    anti_diags = set()  # r + c is constant along a "/" diagonal
    count = 0

    def place(r):
        nonlocal count
        if r == n:
            count += 1
            return
        for c in range(n):
            if c in cols or r - c in diags or r + c in anti_diags:
                continue
            cols.add(c)
            diags.add(r - c)
            anti_diags.add(r + c)
            place(r + 1)
            cols.remove(c)
            diags.remove(r - c)
            anti_diags.remove(r + c)

    place(0)
    return count
