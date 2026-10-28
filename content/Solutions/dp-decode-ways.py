def num_decodings(s):
    if not s:
        return 0
    prev2, prev1 = 1, (1 if s[0] != "0" else 0)  # ways of the first i - 2 and i - 1 digits
    for i in range(1, len(s)):
        cur = 0
        if s[i] != "0":  # the last digit alone
            cur += prev1
        if 10 <= int(s[i - 1:i + 1]) <= 26:  # the last two digits together
            cur += prev2
        prev2, prev1 = prev1, cur
    return prev1
