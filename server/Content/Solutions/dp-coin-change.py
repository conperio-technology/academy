def coin_change(coins, amount):
    dp = [0] + [float("inf")] * amount
    for x in range(1, amount + 1):
        for c in coins:  # ascending x: dp[x - c] may already use coin c again
            if c <= x:
                dp[x] = min(dp[x], dp[x - c] + 1)
    return -1 if dp[amount] == float("inf") else dp[amount]
