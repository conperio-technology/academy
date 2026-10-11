def longest_palindrome_length(s):
    n = len(s)
    if n == 0:
        return 0
    dp = [[False] * n for _ in range(n)]
    best = 1
    for length in range(1, n + 1):  # shortest ranges first
        for i in range(n - length + 1):
            j = i + length - 1
            if length == 1:
                dp[i][j] = True
            elif length == 2:
                dp[i][j] = s[i] == s[j]
            else:
                dp[i][j] = s[i] == s[j] and dp[i + 1][j - 1]
            if dp[i][j]:
                best = max(best, length)
    return best
