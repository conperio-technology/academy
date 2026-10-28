def is_match(s, p):
    n, m = len(s), len(p)
    dp = [[False] * (m + 1) for _ in range(n + 1)]   # dp[i][j]: s[:i] matches p[:j]
    dp[0][0] = True
    for j in range(2, m + 1):
        if p[j - 1] == "*":
            dp[0][j] = dp[0][j - 2]   # x* can match nothing
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if p[j - 1] == "*":
                repeat_ok = p[j - 2] in (s[i - 1], ".")
                dp[i][j] = dp[i][j - 2] or (repeat_ok and dp[i - 1][j])   # zero copies, or one more
            else:
                dp[i][j] = p[j - 1] in (s[i - 1], ".") and dp[i - 1][j - 1]
    return dp[n][m]
